import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, applyTokens, getDeviceId } from '../lib/api';

export default function LoginPortal({ setSession, onBack }) {
  const [method, setMethod] = useState('email'); // 'email' | 'phone' — matches backend: either can authenticate
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // local digits only, e.g. "9171234567" — +63 is prefixed for you
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const identifier = method === 'email' ? email.trim() : `+63${phone.trim()}`;

  function isValidIdentifier() {
    if (method === 'email') return email.includes('@');
    // PH mobile number: 10 digits, starts with 9 (the +63 prefix is added separately).
    return /^9\d{9}$/.test(phone.trim());
  }

  // 1. Send 6-Digit OTP via Email or Phone
  async function handleSendOtp() {
    if (!identifier || !isValidIdentifier()) {
      Alert.alert(
        method === 'email' ? 'Invalid Email' : 'Invalid Phone Number',
        method === 'email'
          ? 'Please enter a valid email address.'
          : 'Please enter a valid 10-digit mobile number, e.g. 9171234567.'
      );
      return;
    }

    setLoading(true);
    try {
      await api.sendOtp({ channel: method, identifier });
      setOtpSent(true);
      Alert.alert(
        'Code Sent!',
        method === 'email'
          ? 'Check your email inbox for your 6-digit login code.'
          : 'Check your SMS messages for your 6-digit login code.'
      );
    } catch (err) {
      Alert.alert('Error sending code', err.message);
    } finally {
      setLoading(false);
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

  // 2. Verify OTP — email or SMS, depending on which method was used to request it.
  // No signup path here: accounts are provisioned by a barangay office, not
  // self-served in the app, so an unregistered identifier is a dead end.
  async function handleVerifyOtp() {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete code', 'Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const result = await api.verifyOtp({
        channel: method,
        identifier,
        otp: code,
        device: { deviceId, platform: Platform.OS === 'ios' ? 'ios' : 'android' },
      });

      await applyTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      setSession({ user: result.user });
    } catch (err) {
      if (err.code === 'ACCOUNT_NOT_FOUND') {
        setOtpSent(false);
        setOtp(['', '', '', '', '', '']);
        Alert.alert(
          'Not registered',
          'This email or phone number is not registered with ResQR. Contact your barangay office to get an account set up.'
        );
      } else {
        Alert.alert('Verification Failed', err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMethod(newMethod) {
    setMethod(newMethod);
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text
          style={styles.back}
          onPress={() => (!otpSent ? onBack?.() : setOtpSent(false))}
        >
          ‹ Back
        </Text>
        <Text style={styles.heading}>Sign In</Text>

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
          method === 'email' ? (
            <>
              <Text style={styles.label}>Enter Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter Phone Number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+63</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="9XX-XXX-XXXX"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(value) => setPhone(value.replace(/[^0-9]/g, ''))}
                />
              </View>
            </>
          )
        ) : (
          <>
            <Text style={styles.label}>Enter the 6-digit verification code sent to {identifier}</Text>
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
          style={[styles.button, styles.shadow]}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  back: { fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#a83232', marginBottom: 12 },
  heading: { fontFamily: 'Poppins_600SemiBold', fontSize: 26, marginBottom: 16 },
  label: { fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#666', marginBottom: 8 },

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
  methodButtonText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#888' },
  methodButtonTextActive: { color: '#a83232', fontFamily: 'Poppins_600SemiBold' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    marginBottom: 16,
  },

  phoneRow: { flexDirection: 'row', marginBottom: 16 },
  countryCode: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#f2f2f2',
  },
  countryCodeText: { fontSize: 16, fontWeight: '600' },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
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
  resend: { fontFamily: 'Poppins_500Medium', marginTop: 16, textAlign: 'center', color: '#a83232', fontSize: 13 },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 10,
    backgroundColor: '#ffdcdc',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#666',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#a83232', fontSize: 16, fontFamily: 'Poppins_500Medium' },
});
