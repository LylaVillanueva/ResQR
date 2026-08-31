import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PERMISSIONS_ACCEPTED_KEY = 'resqr.permissionsAccepted';

export default function PermissionScreen({ onAgree, onBack }) {
  const [pushChecked, setPushChecked] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const allChecked = pushChecked && locationChecked && privacyChecked;

  async function handleContinue() {
    if (!allChecked || requesting) return;
    setRequesting(true);
    try {
      const notifResult = await Notifications.requestPermissionsAsync();
      if (!notifResult.granted) {
        Alert.alert(
          'Notifications required',
          'Notifications are required for this app to function — you need them to receive emergency alerts. Please enable them in your device settings to continue.',
          [
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // Location is only used at the moment a QR code is scanned — a
      // denial here doesn't block the app, unlike notifications above.
      const locationResult = await Location.requestForegroundPermissionsAsync();
      if (!locationResult.granted) {
        Alert.alert(
          'Location not enabled',
          "You can still use the app, but the resident's location won't be recorded when a QR code is scanned. You can enable this later in your device settings."
        );
      }

      await AsyncStorage.setItem(PERMISSIONS_ACCEPTED_KEY, 'true');
      onAgree?.();
    } finally {
      setRequesting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.back} onPress={onBack}>
          ‹ Back
        </Text>
        <Text style={styles.heading}>Permission</Text>
        <Text style={styles.subheading}>Require before continuing</Text>

        <CheckboxRow
          checked={pushChecked}
          onPress={() => setPushChecked((v) => !v)}
          label="Allow push notification for emergency alerts and scan activity"
        />
        <CheckboxRow
          checked={locationChecked}
          onPress={() => setLocationChecked((v) => !v)}
          label="Allow location access when scanning QR codes"
        />
        <CheckboxRow
          checked={privacyChecked}
          onPress={() => setPrivacyChecked((v) => !v)}
          label="I agree to privacy policy and personal data collection terms"
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.button, !allChecked && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!allChecked || requesting}
        >
          <Text style={styles.buttonText}>{requesting ? 'Requesting...' : 'I agree - Continue'}</Text>
        </TouchableOpacity>
        <Text style={styles.footnote}>Notifications are required for this app to function</Text>
      </View>
    </SafeAreaView>
  );
}

function CheckboxRow({ checked, onPress, label }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkboxMark}>✓</Text>}
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#245490', marginBottom: 20 },
  heading: { fontSize: 30, fontFamily: 'Poppins_700Bold', marginBottom: 6 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#888', marginBottom: 28 },

  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 28 },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#bbb',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: '#245490', borderColor: '#245490' },
  checkboxMark: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rowLabel: { flex: 1, fontSize: 17, fontFamily: 'Poppins_400Regular', color: '#1a1a1a', lineHeight: 24, paddingTop: 4 },

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
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#245490', fontSize: 17, fontFamily: 'Poppins_500Medium' },
  footnote: { textAlign: 'center', color: '#999', fontSize: 12, fontFamily: 'Poppins_400Regular', marginTop: 10 },
});
