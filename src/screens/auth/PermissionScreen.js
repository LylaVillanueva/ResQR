import { typography, spacing } from '../../theme';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationPermissions } from '../../lib/notifications';
import { registerDeviceForPush } from '../../lib/pushRegistration';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccessibilitySettings } from '../../context/AccessibilitySettingsContext';

export const PERMISSIONS_ACCEPTED_KEY = notificationPermissions.supported
  ? 'resqr.permissionsAccepted' : 'resqr.permissionsAccepted.preview';

export default function PermissionScreen({ onAgree, onBack }) {
  const { t } = useAccessibilitySettings();
  const [pushChecked, setPushChecked] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const allChecked = (!notificationPermissions.supported || pushChecked) && locationChecked && privacyChecked;

  async function handleContinue() {
    if (!allChecked || requesting) return;
    setRequesting(true);
    try {
      const notifResult = await notificationPermissions.request();
      if (notifResult.supported && !notifResult.granted) {
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
      if (notifResult.granted) {
        registerDeviceForPush(); // fire-and-forget — see pushRegistration.js
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
    } catch (err) {
      Alert.alert('Could not update permissions', err.message || 'Please try again.');
    } finally {
      setRequesting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.back} onPress={onBack}>
          {t('back')}
        </Text>
        <Text style={styles.heading}>{t('permission')}</Text>
        <Text style={styles.subheading}>{t('requireBeforeContinuing')}</Text>

        {notificationPermissions.supported ? <CheckboxRow
          checked={pushChecked}
          onPress={() => setPushChecked((v) => !v)}
          label="Allow push notification for emergency alerts and scan activity"
        /> : <Text style={styles.footnote}>Remote push notifications are unavailable in this preview. You can continue and view alerts inside the app.</Text>}
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
          <Text style={styles.buttonText}>{requesting ? t('requesting') : t('agreeContinue')}</Text>
        </TouchableOpacity>
        <Text style={styles.footnote}>{notificationPermissions.supported ? 'Enable notifications to receive emergency alerts.' : 'Remote push notifications require an installed development or production build.'}</Text>
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
  scrollContent: { padding: spacing.screen, paddingBottom: 40 , paddingTop: 4 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#245490', marginBottom: 4, minHeight: 44, paddingVertical: 4, marginTop: 0 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#888', marginBottom: 28 },

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
  checkboxMark: { color: '#fff', fontSize: typography.body, fontWeight: '700' },
  rowLabel: { flex: 1, fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#1a1a1a', lineHeight: Math.ceil(typography.body * 1.5), paddingTop: 4 },

  bottomBar: {
    paddingHorizontal: spacing.screen,
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
   minHeight: spacing.control, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#245490', fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  footnote: { textAlign: 'center', color: '#999', fontSize: typography.caption, fontFamily: 'Poppins_400Regular', marginTop: 10 },
});
