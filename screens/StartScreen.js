import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginPortal from './LogIn';

export default function StartScreen({ setSession }) {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <LoginPortal setSession={setSession} onBack={() => setShowLogin(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.title}>ResQR</Text>
        <Text style={styles.description}>
          Short Description of the App.
        </Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={() => setShowLogin(true)}>
        <Text style={styles.startButtonText}>Log In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24, paddingBottom: 40, backgroundColor: '#e0e0e0' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 250, height: 250, marginBottom: 24, borderRadius: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  description: { fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 16 },
  startButton: {
    backgroundColor: '#e02f2f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});