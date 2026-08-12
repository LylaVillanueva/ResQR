import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginPortal({ setSession, onBack }) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  function handleSendOtp() {
    if (phone.length < 10) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    // Replace later with: await supabase.auth.signInWithOtp({ phone });
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      Alert.alert('OTP sent', 'Enter the 6-digit code.');
    }, 500);
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

    function handleVerifyOtp() {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete code', 'Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    // Replace supabase verify otp
    setTimeout(() => {
      setLoading(false);
      if (code === '123456') {
        setSession({ user: { phone } });
      } else {
        Alert.alert('Incorrect code', 'That code is invalid.');
      }
    }, 500);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.back} onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}>
        ‹ Back
      </Text>
      <Text style={styles.heading}>Log In</Text>

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

  label: { fontSize: 14, color: '#666', marginBottom: 8 },
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