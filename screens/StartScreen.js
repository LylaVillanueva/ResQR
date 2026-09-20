import { typography, spacing } from "../theme";
import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from "../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginPortal from './LogIn';
import PermissionScreen, { PERMISSIONS_ACCEPTED_KEY } from './PermissionScreen';
import { useAccessibilitySettings } from "../lib/AccessibilitySettingsContext";

export default function StartScreen({ setSession }) {
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
          source={require("../assets/logo.png")}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24, paddingBottom: 40, backgroundColor: '#fff' },
  content: { flexGrow: 1, paddingVertical: 24, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 250, height: 250, marginBottom: 24, borderRadius: 24 },
  title: { fontSize: typography.title, fontFamily: 'Poppins_600SemiBold', marginBottom: 8, textAlign: 'center' },
  description: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', paddingHorizontal: 16 },
  
  startButton: {
    backgroundColor: '#c12b2b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
   minHeight: spacing.control },
  startButtonText: { color: '#fff', fontSize: typography.body, fontFamily: 'Poppins_500Medium', fontWeight: '600' },
});
