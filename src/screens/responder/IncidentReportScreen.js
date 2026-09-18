import { typography, spacing } from '../../theme';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import Text from '../../components/AppText';
import TextInput from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppData } from '../../context/AppDataContext';

// NEW SCREEN: Incident Summary Notes / Report
const EMERGENCY_OPTIONS = ['Fall', 'Disorientation', 'Seizure', 'Medical emergency', 'Injury', 'Other'];
const CONDITION_OPTIONS = ['Normal', 'Stable', 'Critical', 'Unresponsive', 'Other'];

export default function IncidentReportScreen({ route, navigation }) {
  const resident = route.params?.resident || { name: 'Resident', id: '' };
  const alertId = route.params?.alertId;
  const { alerts, addIncidentReport, account } = useAppData();
  const linkedAlert = alerts.find((item) => item.id === alertId);

  const [natureOfEmergency, setNatureOfEmergency] = useState(null);
  const [natureOtherText, setNatureOtherText] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [residentCondition, setResidentCondition] = useState(null);
  const [conditionOtherText, setConditionOtherText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const natureFinal = natureOfEmergency === 'Other' ? natureOtherText.trim() : natureOfEmergency;
  const conditionFinal = residentCondition === 'Other' ? conditionOtherText.trim() : residentCondition;

  const canSubmit = !!natureFinal && actionsTaken.trim() && !!conditionFinal;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    if (!alertId || !linkedAlert) { Alert.alert('Missing incident', 'Choose an assigned incident first.'); return; }
    if (linkedAlert.responderId !== account.id) { Alert.alert('Not assigned', 'Only the assigned responder can submit this report.'); return; }
    const report = { natureOfEmergency: natureFinal, actionsTaken: actionsTaken.trim(), conditionOfResident: conditionFinal };
    if (Object.values(report).join(' ').length > 1900) { Alert.alert('Report too long', 'Shorten the report to fewer than 1,900 characters.'); return; }
    setSubmitting(true);
    try { await addIncidentReport(alertId, report); setSubmitted(true); }
    catch (err) { Alert.alert('Could not submit report', err.message); }
    finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.resultIconWrap}>
            <FontAwesome5 name="check" size={55} color="#fff" />
          </View>

          <Text style={styles.subheading}>Report Submitted</Text>
          <Text style={styles.subheading2}>Your report has been saved. Alerts without a guardian remain open until a barangay official reviews and closes them.</Text>

          <View style={styles.residentCard}>
            <Image source={require('../../../assets/profile.png')} style={styles.residentPhoto} />
            <View style={styles.residentTextWrap}>
              <Text style={styles.residentName}>{resident.name}</Text>
              <Text style={styles.residentMeta}>ID: {resident.id}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.blueButton, { marginBottom: 8 }]}
            onPress={() => navigation.navigate('AlertDetails', { alertId })}
          >
            <Text style={[styles.buttonText, styles.blueText]}>View Report</Text>
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
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>

        <View style={styles.profileBar}>
          <Image source={require('../../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{resident.name}</Text>
            <Text style={styles.meta}>ID: {resident.id}</Text>
          </View>
        </View>

        <Text style={styles.heading1}>Incident Summary Notes</Text>
        <Text style={styles.subheadingSmall}>Reports do not replace safety confirmations. Without a registered guardian, a barangay official must review and close the alert.</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {linkedAlert?.incidentReport ? <Text style={styles.fieldLabel}>Previous summary: {linkedAlert.incidentReport}</Text> : null}
        <Text style={styles.fieldLabel}>Nature of Emergency</Text>
        <View style={styles.chipWrap}>
          {EMERGENCY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, natureOfEmergency === opt && styles.chipActive]}
              onPress={() => setNatureOfEmergency(opt)}
            >
              <Text style={[styles.chipLabel, natureOfEmergency === opt && styles.chipLabelActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {natureOfEmergency === 'Other' && (
          <TextInput
            style={[styles.fieldInput, { marginTop: 8 }]}
            placeholder="Describe the nature of the emergency"
            placeholderTextColor="#999"
            value={natureOtherText}
            onChangeText={setNatureOtherText}
          />
        )}

        <Text style={styles.fieldLabel}>Actions Taken</Text>
        <TextInput
          style={[styles.fieldInput, styles.fieldTextArea]}
          placeholder="Describe what you did on-site"
          placeholderTextColor="#999"
          value={actionsTaken}
          onChangeText={setActionsTaken}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.fieldLabel}>Condition of Resident</Text>
        <View style={styles.chipWrap}>
          {CONDITION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, residentCondition === opt && styles.chipActive]}
              onPress={() => setResidentCondition(opt)}
            >
              <Text style={[styles.chipLabel, residentCondition === opt && styles.chipLabelActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {residentCondition === 'Other' && (
          <TextInput
            style={[styles.fieldInput, { marginTop: 8 }]}
            placeholder="Describe the resident's condition"
            placeholderTextColor="#999"
            value={conditionOtherText}
            onChangeText={setConditionOtherText}
          />
        )}

        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4},
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginTop: spacing.section, marginBottom: 12 },
  subheadingSmall: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 14 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },

  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: -12,
    marginBottom: -8,
  },
  profilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 90,
    borderWidth: 1.8,
    borderColor: '#a83232',
    backgroundColor: '#c4c4c4',
    marginRight: 14,
  },
  profileTextWrap: { flex: 1 },
  name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginBottom: 2 },
  meta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },

  fieldLabel: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginTop: 14, marginBottom: 10 },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: typography.body,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    backgroundColor: '#f2f2f2',
   minHeight: spacing.control },
  fieldTextArea: { minHeight: 90, textAlignVertical: 'top' },

  // ADDED: chip-style selectable options, matching the existing filterButton
  // / filterButtonActive pattern used on AlertScreen/ResidentScreen/etc for
  // visual consistency across the app.
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: -2 },
  chip: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipActive: { backgroundColor: '#ffdcdc', borderColor: '#a83232' },
  chipLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#666' },
  chipLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },

  submitButton: {
    backgroundColor: '#a83232',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#625350',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
   minHeight: spacing.control, justifyContent: 'center' },
  submitButtonDisabled: { backgroundColor: '#e0b3b3' },
  submitButtonText: { color: '#fff', fontFamily: 'Poppins_500Medium', fontSize: typography.body },

  // Result screen (mirrors ConfirmationScreen.js result styling for consistency)
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#288928',
  },
  subheading: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', textAlign: 'center', marginBottom: 4 },
  subheading2: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', marginBottom: 24, marginTop: 6 },

  residentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: spacing.card,
    marginBottom: 40,
    backgroundColor: '#fff',
    shadowColor: '#625350',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  residentPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c4c4c4', marginRight: 14 },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },

  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#625350',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
   minHeight: spacing.control, justifyContent: 'center' },
  blueButton: { borderColor: '#245490', backgroundColor: '#d3e5f8' },
  buttonText: { color: '#333', fontFamily: 'Poppins_500Medium', fontSize: typography.body },
  blueText: { color: '#245490' },
});