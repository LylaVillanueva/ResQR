import { typography, spacing } from "../theme";
// Shared by guardian and responder — the two role-specific files under
// src/screens/{guardian,responder}/ConfirmationScreen.js used to be an
// entire byte-for-byte duplicated screen (styles included), differing only
// in which role they report the confirmation as and the "Not Safe" bullet
// copy. This is the single implementation; each role's file just supplies
// those two things.
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import Text from "../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppData } from "../lib/AppDataContext";

const SAFE_BULLETS = [
  'This will be recorded as your confirmation.',
  'The server updates the alert after the required safety confirmations.',
  'You can still view the alert status in your alerts list.',
];

export default function ConfirmationScreen({ route, navigation, role, notSafeBullets }) {
  const status = route.params?.status || (route.params?.decision === 'safe' ? 'Safe' : route.params?.decision === 'not_safe' ? 'Not Safe' : null);
  const resident = route.params?.resident || { name: route.params?.residentName || 'Resident', id: '' };
  const alertId = route.params?.alertId || route.params?.incidentId;

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { alerts, updateAlertConfirmation } = useAppData();
  const alert = alerts.find((item) => item.id === alertId);
  const currentResident = alert ? { name: alert.residentName, id: alert.residentId } : resident;

  const isSafe = status === 'Safe';

  async function handleConfirm() {
    if (submitting) return;
    if (!alertId || !['Safe', 'Not Safe'].includes(status)) {
      Alert.alert('Missing alert', 'Return to the alert list and choose a safety action.');
      return;
    }
    setSubmitting(true);
    try {
      await updateAlertConfirmation(alertId, role, status);
      setConfirmed(true);
    } catch (err) { Alert.alert('Could not submit confirmation', err.message); }
    finally { setSubmitting(false); }
  }

  const bullets = isSafe ? SAFE_BULLETS : notSafeBullets;

  if (confirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={[styles.resultIconWrap, isSafe ? styles.resultIconSafe : styles.resultIconNotSafe]}>
            <FontAwesome5 name={isSafe ? 'check' : 'exclamation'} size={55} color="#fff" />
          </View>

          <Text style={styles.subheading}>{isSafe ? 'Marked as Safe' : 'Alert Escalated'}</Text>
          <Text style={styles.subheading2}>{isSafe ? (alert?.officialReviewRequired ? 'Safe confirmation saved. Submit your report next; a barangay official must review and close this alert.' : 'Your confirmation has been submitted.') : 'Barangay has been notified as high priority.'}</Text>

          <View style={styles.residentCard}>
            <Image source={require("../assets/profile.png")} style={styles.residentPhoto} />
            <View style={styles.residentTextWrap}>
              <Text style={styles.residentName}>{currentResident.name}</Text>
              <Text style={styles.residentMeta}>ID: {currentResident.id}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.button, styles.blueButton, { marginBottom: 8 }]} onPress={() => navigation.navigate('AlertDetails', { alertId })}>
            <Text style={[styles.buttonText, styles.blueText]}>View Alert Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading1}>Are you sure you want to mark this resident as {isSafe ? 'safe' : 'Not Safe'}?</Text>

        <Image source={require("../assets/profile.png")} style={styles.profilePhoto} />
        <Text style={styles.subheading}>{currentResident.name}</Text>
        <Text style={styles.subheading1}>ID: {currentResident.id}</Text>

        <View style={styles.bulletBox}>
          {bullets.map((line, i) => (
            <View key={i} style={styles.bulletRow}>
              <FontAwesome5 name="exclamation-circle" size={20} color={isSafe ? '#288928' : '#a83232'} style={styles.bulletIcon} />
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.confirmButton, isSafe ? styles.confirmButtonSafe : styles.confirmButtonNotSafe]} disabled={submitting} onPress={handleConfirm}>
          <Text style={[styles.confirmButtonText, isSafe ? styles.safeText : styles.notSafeText]}>{isSafe ? 'Confirm Safe' : 'Confirm Not Safe'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', padding: spacing.screen },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: spacing.section, marginBottom: 12, textAlign: 'center' },
  subheading: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', textAlign: 'center', marginBottom: 4 },
  subheading1: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20, textAlign: 'center' },
  subheading2: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', marginBottom: 24 },
  profilePhoto: { width: 140, height: 140, borderRadius: 70, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#c4c4c4', marginBottom: 20, shadowColor: '#625350', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bulletBox: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  bulletIcon: { marginRight: 14, marginTop: 12 },
  bulletText: { flex: 1, fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#333' },
  bottomBar: { paddingHorizontal: spacing.screen, paddingBottom: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  confirmButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 8, shadowColor: '#625350', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , minHeight: spacing.control, justifyContent: 'center' },
  confirmButtonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa' },
  confirmButtonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  confirmButtonText: { fontFamily: 'Poppins_500Medium', fontSize: typography.body },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },
  button: { borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 16, alignItems: 'center', width: '100%', shadowColor: '#625350', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , minHeight: spacing.control, justifyContent: 'center' },
  blueButton: { borderColor: '#245490', backgroundColor: '#d3e5f8' },
  buttonText: { color: '#333', fontFamily: 'Poppins_500Medium', fontSize: typography.body },
  blueText: { color: '#245490' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultIconWrap: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  resultIconSafe: { backgroundColor: '#288928' },
  resultIconNotSafe: { backgroundColor: '#a83232' },
  residentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 40, backgroundColor: '#fff', shadowColor: '#625350', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  residentPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c4c4c4', marginRight: 14 },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },
});
