import { typography, spacing, colors } from '../../constants/theme';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import Text from "../../components/AppText";
import TextInput from "../../components/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { api } from '../../services/api';
import ScreenState from "../../components/ScreenState";

export default function BystanderPublicWeb({ route, navigation }) {
  const token = route.params?.token;
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setResident(null); setError(null); setSubmitted(false); setNote('');
    setResult(null); setCancelled(false); setSecondsLeft(0);
    if (!token) { setError('Please scan a current QR card issued by your barangay.'); setLoading(false); return; }
    api.getPublicQrView(token).then((data) => { if (active) setResident(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!result?.cancelToken || cancelled) { setSecondsLeft(0); return; }
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((new Date(result.cancellableUntil).getTime() - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [result, cancelled]);

  async function cancelAlert() {
    if (cancelling || !result?.cancelToken) return;
    setCancelling(true);
    try {
      const response = await api.cancelQrScan(result.cancelToken);
      if (response?.cancelled) setCancelled(true);
      else {
        setResult((current) => ({ ...current, cancelToken: null }));
        Alert.alert('Cannot cancel', 'This alert can no longer be cancelled. Contact the barangay if it was a mistake.');
      }
    } catch (err) { Alert.alert('Could not cancel alert', err.message); }
    finally { setCancelling(false); }
  }

  async function submitAlert() {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      let coordinates = {};
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.granted) {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
          coordinates = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        }
      } catch { /* A bystander can request assistance without location permission. */ }
      setResult(await api.recordQrScan(token, { ...coordinates, bystanderNotes: note.trim() }));
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
      <Text style={styles.subtitle}>Community assistance and resident reunification</Text>
      {resident.barangayName ? <Text style={styles.body}>Barangay: {resident.barangayName}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={() => call('911')}><Text style={styles.buttonText}>Call 911</Text></TouchableOpacity>
      {submitted ? <View>
        <Text style={styles.subtitle}>{cancelled ? 'Your alert was cancelled. Notifications may already have been sent.' : 'Your alert has been sent. The response team can now review it.'}</Text>
        {!cancelled && secondsLeft > 0 && <TouchableOpacity style={styles.button} disabled={cancelling} onPress={cancelAlert}>
          <Text style={styles.buttonText}>{cancelling ? 'Cancelling…' : `Cancel mistaken alert (${secondsLeft}s)`}</Text>
        </TouchableOpacity>}
      </View> : <View>
        <Text style={styles.subtitle}>Request assistance</Text>
        <Text style={styles.body}>Describe what you observed. You can allow location access to help the response team find the resident.</Text>
        <TextInput style={styles.input} multiline maxLength={1000} value={note} onChangeText={setNote} placeholder="Optional note" />
        <TouchableOpacity style={styles.button} disabled={submitting} onPress={submitAlert}><Text style={styles.buttonText}>{submitting ? 'Sending…' : 'Send Emergency Alert'}</Text></TouchableOpacity>
      </View>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.screen, paddingTop: 4, gap: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
  title: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', color: colors.primary , marginBottom: 8 }, subtitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginVertical: 12 },
  button: { padding: 16, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center', marginVertical: 12 , minHeight: spacing.control, justifyContent: 'center' }, buttonText: { fontSize: typography.body, color: colors.surface, fontFamily: 'Poppins_600SemiBold' },
  body: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', lineHeight: 27 },
  input: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 16, minHeight: 120, marginTop: 16, textAlignVertical: 'top' , fontSize: typography.body, backgroundColor: colors.surfaceSunken },
});
