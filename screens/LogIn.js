import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase'; // Adjust path if needed

export default function LoginPortal({ setSession, onBack }) {
  const [method, setMethod] = useState('email'); // 'email' | 'phone' — matches backend: either can authenticate
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const identifier = method === 'email' ? email.trim() : phone.trim();

  function isValidIdentifier() {
    if (method === 'email') return email.includes('@');
    // Expect E.164 format, e.g. +639171234567
    return /^\+\d{8,15}$/.test(phone.trim());
  }

  // 1. Send 6-Digit OTP via Email or Phone
  async function handleSendOtp() {
    if (!identifier || !isValidIdentifier()) {
      Alert.alert(
        method === 'email' ? 'Invalid Email' : 'Invalid Phone Number',
        method === 'email'
          ? 'Please enter a valid email address.'
          : 'Please enter a valid phone number in international format, e.g. +639171234567.'
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp(
      method === 'email' ? { email: identifier } : { phone: identifier }
    );

    setLoading(false);

    if (error) {
      Alert.alert('Error sending code', error.message);
    } else {
      setOtpSent(true);
      Alert.alert(
        'Code Sent!',
        method === 'email'
          ? 'Check your email inbox for your 6-digit login code.'
          : 'Check your SMS messages for your 6-digit login code.'
      );
    }
  }

  function handleOtpChange(value, index) {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyPress(e, index) {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  // 2. Verify OTP — email or SMS, depending on which method was used to request it
  async function handleVerifyOtp() {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete code', 'Please enter all 6 digits.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp(
      method === 'email'
        ? { email: identifier, token: code, type: 'email' }
        : { phone: identifier, token: code, type: 'sms' }
    );

    setLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error.message);
    } else if (data.session) {
      setSession(data.session);
    }
  }

  function switchMethod(newMethod) {
    setMethod(newMethod);
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={styles.back}
          onPress={() => (!otpSent ? onBack?.() : setOtpSent(false))}
        >
          ‹ Back
        </Text>
        <Text style={styles.heading}>Log In</Text>

        {!otpSent && (
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[styles.methodButton, method === 'email' && styles.methodButtonActive]}
              onPress={() => switchMethod('email')}
            >
              <Text style={[styles.methodButtonText, method === 'email' && styles.methodButtonTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodButton, method === 'phone' && styles.methodButtonActive]}
              onPress={() => switchMethod('phone')}
            >
              <Text style={[styles.methodButtonText, method === 'phone' && styles.methodButtonTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!otpSent ? (
          <>
            <Text style={styles.label}>
              {method === 'email' ? 'Enter Email Address' : 'Enter Phone Number'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={method === 'email' ? 'name@example.com' : '+639171234567'}
              keyboardType={method === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              value={method === 'email' ? email : phone}
              onChangeText={method === 'email' ? setEmail : setPhone}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter 6-digit code sent to {identifier}</Text>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpRefs.current[index] = ref)}
                  style={styles.otpBox}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>
            <Text style={styles.resend} onPress={handleSendOtp}>
              Didn't get a code? Resend
            </Text>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.button}
          onPress={otpSent ? handleVerifyOtp : handleSendOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {otpSent
              ? loading
                ? 'Verifying...'
                : 'Verify'
              : loading
              ? 'Sending...'
              : 'Send Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  back: { fontSize: 16, color: '#e02f2f', marginBottom: 12 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  methodButtonText: { fontSize: 14, color: '#888', fontWeight: '500' },
  methodButtonTextActive: { color: '#e02f2f', fontWeight: '700' },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#e02f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resend: { marginTop: 16, textAlign: 'center', color: '#000' },
});
