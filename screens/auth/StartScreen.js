import { typography, spacing, colors } from "../../constants/theme";
import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginPortal from './LogIn';
import PermissionScreen, { PERMISSIONS_ACCEPTED_KEY } from './PermissionScreen';
import { useAccessibilitySettings } from "../../contexts/AccessibilitySettingsContext";

export default function StartScreen({ setSession, navigation }) {
  const { t } = useAccessibilitySettings();
  const [view, setView] = useState('start'); // 'start' | 'login' | 'permission'
  const [permissionsAccepted, setPermissionsAccepted] = useState(false);
  const [pendingSession, setPendingSession] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(PERMISSIONS_ACCEPTED_KEY).then((value) => {
      setPermissionsAccepted(value === 'true');
    });
  }, []);

  function handleLogInPress() {
    setView('login');
  }

  // Called by LoginPortal once the OTP is verified. Permissions are only
  // asked for once, on first login — after that, sessions go straight in.
  function handleLoginSuccess(result) {
    if (permissionsAccepted) {
      setSession(result);
      return;
    }
    setPendingSession(result);
    setView('permission');
  }

  function handlePermissionsAgreed() {
    setPermissionsAccepted(true);
    setSession(pendingSession);
  }

  if (view === 'permission') {
    return <PermissionScreen onAgree={handlePermissionsAgreed} onBack={() => setView('login')} />;
  }

  if (view === 'login') {
    return <LoginPortal setSession={handleLoginSuccess} onBack={() => setView('start')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.title}>QRAlalay</Text>
        <Text style={styles.description}>
          {t('tagline')}
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.startButton} onPress={handleLogInPress}>
        <Text style={styles.startButtonText}>{t('logIn')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.emergencyButton} onPress={() => navigation.navigate('PublicEmergencyHelp')} accessibilityRole="button">
        <Text style={styles.emergencyButtonText}>Emergency help · Call Barangay / 911</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24, paddingBottom: 40, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingVertical: 24, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 250, height: 250, marginBottom: 24, borderRadius: 24 },
  title: { fontSize: typography.title, fontFamily: 'Poppins_600SemiBold', marginBottom: 8, textAlign: 'center' },
  description: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 16 },
  
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
   minHeight: spacing.control },
  startButtonText: { color: colors.onPrimary, fontSize: typography.body, fontFamily: 'Poppins_500Medium', fontWeight: '600' },
  emergencyButton: { minHeight: spacing.control, justifyContent: 'center', alignItems: 'center', paddingVertical: 12, marginTop: 10 },
  emergencyButtonText: { color: colors.alertInk, fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold', textAlign: 'center' },
});
