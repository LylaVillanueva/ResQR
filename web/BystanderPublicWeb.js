import { typography, spacing } from '../theme';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import Text from "../component/AppText";
import TextInput from "../component/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { api } from '../lib/api';
import ScreenState from "../component/ScreenState";

export default function BystanderPublicWeb({ route, navigation }) {
  const token = route.params?.token;
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setResident(null); setError(null); setSubmitted(false); setNote('');
    if (!token) { setError('Please scan a current QR card issued by your barangay.'); setLoading(false); return; }
    api.getPublicQrView(token).then((data) => { if (active) setResident(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function submitAlert() {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      let coordinates = {};
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.granted) {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coordinates = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        }
      } catch { /* A bystander can request assistance without location permission. */ }
      await api.recordQrScan(token, { ...coordinates, bystanderNotes: note.trim() });
      setSubmitted(true);
    } catch (err) { Alert.alert('Could not send alert', err.message); }
    finally { setSubmitting(false); }
  }

  async function call(number) {
    try { await Linking.openURL(`tel:${number.replace(/[^+\d]/g, '')}`); }
    catch { Alert.alert('Unable to call', `Please dial ${number} on your phone.`); }
  }

  if (loading || error || !resident) return <ScreenState loading={loading} error={error} onBack={navigation?.canGoBack() ? navigation.goBack : undefined} />;
  return <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      {navigation?.canGoBack() && <Text style={[styles.link, { paddingVertical: 4, minHeight: 44 }]} onPress={() => navigation.goBack()}>‹ Back</Text>}
      <Text style={styles.title}>QRAlalay</Text>
      <Text style={styles.subtitle}>Emergency assistance for {resident.firstName}</Text>
      <TouchableOpacity style={styles.button} onPress={() => call(resident.emergencyDialNumber || '911')}><Text style={styles.buttonText}>Call 911</Text></TouchableOpacity>
      {(resident.emergencyContacts || []).map((contact, index) => <TouchableOpacity key={index} style={styles.contact} onPress={() => call(contact.phone)}>
        <Text style={styles.body}>{contact.name} · {contact.relation}</Text><Text style={styles.link}>Call {contact.phone}</Text>
      </TouchableOpacity>)}
      {submitted ? <Text style={styles.subtitle}>Your alert has been sent. The response team can now review it.</Text> : <View>
        <Text style={styles.subtitle}>Request assistance</Text>
        <Text style={styles.body}>Describe what you observed. You can allow location access to help the response team find the resident.</Text>
        <TextInput style={styles.input} multiline maxLength={1000} value={note} onChangeText={setNote} placeholder="Optional note" />
        <TouchableOpacity style={styles.button} disabled={submitting} onPress={submitAlert}><Text style={styles.buttonText}>{submitting ? 'Sending…' : 'Send Emergency Alert'}</Text></TouchableOpacity>
      </View>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingTop: 4, gap: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
  title: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', color: '#a83232' , marginBottom: 8 }, subtitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginVertical: 12 },
  button: { padding: 16, backgroundColor: '#a83232', borderRadius: 12, alignItems: 'center', marginVertical: 12 , minHeight: spacing.control, justifyContent: 'center' }, buttonText: { fontSize: typography.body, color: '#fff', fontFamily: 'Poppins_600SemiBold' },
  contact: { padding: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 12 }, body: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', lineHeight: 27 }, link: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', paddingVertical: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 16, minHeight: 120, marginTop: 16, textAlignVertical: 'top' , fontSize: typography.body, backgroundColor: '#f2f2f2' },
});
