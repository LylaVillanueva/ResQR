import React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen({ route, navigation }) {
  const resident = route.params?.resident;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
      <Image source={require('../assets/profile.png')} style={styles.photo} />
      <Text style={styles.name}>{resident?.name || 'Maria Santos'}</Text>
      <Text style={styles.meta}>{resident?.id || 'BRC-SC-2026-0001'}</Text>
      <Text>hindi pa to na-eedit mwehehe</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#245490', marginBottom: 16 },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#c4c4c4',
    marginBottom: 16,
  },
  name: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  meta: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888' },
});