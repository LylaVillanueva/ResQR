import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginPortal from './LogIn';
import PermissionScreen, { PERMISSIONS_ACCEPTED_KEY } from './PermissionScreen';

export default function StartScreen({ setSession }) {
  const [view, setView] = useState('start'); // 'start' | 'permission' | 'login'
  const [permissionsAccepted, setPermissionsAccepted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PERMISSIONS_ACCEPTED_KEY).then((value) => {
      setPermissionsAccepted(value === 'true');
    });
  }, []);

  function handleLogInPress() {
    setView(permissionsAccepted ? 'login' : 'permission');
  }

  function handlePermissionsAgreed() {
    setPermissionsAccepted(true);
    setView('login');
  }

  if (view === 'permission') {
    return <PermissionScreen onAgree={handlePermissionsAgreed} onBack={() => setView('start')} />;
  }

  if (view === 'login') {
    return <LoginPortal setSession={setSession} onBack={() => setView('start')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.title}>QRAlalay</Text>
        <Text style={styles.description}>
          Scan. Respond. Alalay
        </Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleLogInPress}>
        <Text style={styles.startButtonText}>Log In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24, paddingBottom: 40, backgroundColor: '#e0e0e0' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 250, height: 250, marginBottom: 24, borderRadius: 24 },
  title: { fontSize: 32, fontFamily: 'Poppins_600SemiBold', marginBottom: 12, textAlign: 'center' },
  description: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', paddingHorizontal: 16 },
  
  startButton: {
    backgroundColor: '#c12b2b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: { color: '#fff', fontSize: 17, fontFamily: 'Poppins_500Medium', fontWeight: '600' },
});
