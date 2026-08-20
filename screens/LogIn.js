import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import { FontAwesome5 } from '@expo/vector-icons';

export default function LoginPortal({ setSession, onBack }) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const [showAgreements, setShowAgreements] = useState(false);
  const [checked, setChecked] = useState({ notifications: false, location: false, privacy: false });

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
    setTimeout(() => {
      setLoading(false);
      if (code === '123456') {
        setShowAgreements(true);
      } else {
        Alert.alert('Incorrect code', 'That code is invalid.');
      }
    }, 500);
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
                <Text style={styles.label}>Enter the 6-digit verification code we sent to your email address.</Text>
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
  buttonText: { color: '#245490', fontFamily: 'Poppins_500Medium', fontSize: 16, fontWeight: '600' },
  buttonLabel: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12, fontFamily: 'Poppins_400Regular',},
});