import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
<<<<<<< HEAD
import { supabase } from '../lib/supabase'; // Adjust path if needed
=======
import Entypo from '@expo/vector-icons/Entypo';
>>>>>>> refs/remotes/origin/main

export default function LoginPortal({ setSession, onBack }) {
  const [method, setMethod] = useState('email'); // 'email' | 'phone' — matches backend: either can authenticate
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const [showAgreements, setShowAgreements] = useState(false);
  const [checked, setChecked] = useState({ notifications: false, location: false, privacy: false });

<<<<<<< HEAD
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

=======
  function handleSendOtp() {
    if (phone.length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      Alert.alert('OTP sent', 'Enter the 6-digit code.');
    }, 500);
  }

>>>>>>> refs/remotes/origin/main
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

<<<<<<< HEAD
  // 2. Verify OTP — email or SMS, depending on which method was used to request it
  async function handleVerifyOtp() {
=======
  function handleVerifyOtp() {
>>>>>>> refs/remotes/origin/main
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete code', 'Please enter all 6 digits.');
      return;
    }

    setLoading(true);
<<<<<<< HEAD

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
=======
    setTimeout(() => {
      setLoading(false);
      if (code === '123456') {
        setShowAgreements(true);
      } else {
        Alert.alert('Incorrect code', 'That code is invalid.');
      }
    }, 500);
>>>>>>> refs/remotes/origin/main
  }

  function toggleCheck(key) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleContinue() {
    setSession({ user: { phone } });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={styles.back}
<<<<<<< HEAD
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
=======
          onPress={() => {
            if (showAgreements) setShowAgreements(false);
            else if (otpSent) setOtpSent(false);
            else onBack();
          }}
        >
          ‹ Back
        </Text>

        {showAgreements ? (
          <>
            <Text style={styles.heading}>Permission</Text>
            <Text style={styles.subheading}>Require before continuing</Text>

            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => toggleCheck('notifications')}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, checked.notifications && styles.checkboxChecked]}>
                {checked.notifications && <Entypo name="check" size={20} color="white" />}
              </View>
              <Text style={styles.checkLabel}>Allow push notification for emergency alerts and scan activity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => toggleCheck('location')}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, checked.location && styles.checkboxChecked]}>
                {checked.location && <Entypo name="check" size={20} color="white" />}
              </View>
              <Text style={styles.checkLabel}>Allow location access when scanning QR codes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => toggleCheck('privacy')}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, checked.privacy && styles.checkboxChecked]}>
                {checked.privacy && <Entypo name="check" size={20} color="white" />}
              </View>
              <Text style={styles.checkLabel}>I agree to privacy policy and personal data collection terms</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.heading}>Sign In</Text>

            {!otpSent ? (
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
            ) : (
              <>
                <Text style={styles.label}>Enter 6-digit code</Text>
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
>>>>>>> refs/remotes/origin/main
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {showAgreements ? (
          <>
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>I agree - Continue</Text>
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Notifications are required for this app to function</Text>
          </>
        ) : (
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
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
<<<<<<< HEAD
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
=======
  back: { fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#245490', marginBottom: 12 },
  heading: { fontFamily: 'Poppins_600SemiBold', fontSize: 26, marginBottom: -8 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 20 },

  label: { fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#666', marginBottom: 8 },
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
  countryCodeText: { fontFamily: 'Poppins_400Regular', fontSize: 16, fontWeight: '600' },
  phoneInput: {
>>>>>>> refs/remotes/origin/main
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
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
<<<<<<< HEAD
    marginBottom: 16,
=======
>>>>>>> refs/remotes/origin/main
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
  resend: { fontFamily: 'Poppins_500Medium', marginTop: 16, textAlign: 'center', color: '#000' },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  checkbox: {
    width: 35,
    height: 35,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 6,
    marginRight: 12,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#245490',
    borderColor: '#245490',
  },
  checkLabel: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#d3e5f8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
<<<<<<< HEAD
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resend: { marginTop: 16, textAlign: 'center', color: '#000' },
});
=======
  buttonText: { color: '#245490', fontFamily: 'Poppins_500Medium', fontSize: 16, fontWeight: '600' },
  buttonLabel: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12, fontFamily: 'Poppins_400Regular',},
});
>>>>>>> refs/remotes/origin/main
