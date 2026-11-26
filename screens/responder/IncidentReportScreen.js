import { typography, spacing, colors } from '../../constants/theme';
import Avatar from "../../components/Avatar";
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import Text from "../../components/AppText";
import TextInput from "../../components/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppData } from "../../contexts/AppDataContext";

const EMERGENCY_OPTIONS = ['Fall', 'Disorientation', 'Seizure', 'Medical emergency', 'Injury', 'Other'];
const CONDITION_OPTIONS = ['Normal', 'Stable', 'Critical', 'Unresponsive', 'Other'];
const OUTCOME_OPTIONS = [
  ['reunited', 'Reunited'],
  ['assisted_independently', 'Assisted independently'],
  ['referred', 'Referred'],
  ['transferred', 'Transferred'],
];

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
  const [outcome, setOutcome] = useState(null);
  const [handoverDetails, setHandoverDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const natureFinal = natureOfEmergency === 'Other' ? natureOtherText.trim() : natureOfEmergency;
  const conditionFinal = residentCondition === 'Other' ? conditionOtherText.trim() : residentCondition;

  const readOnly = !linkedAlert || linkedAlert.responderId !== account.id || ['closed', 'resolved', 'cancelled'].includes(linkedAlert.backendStatus);
  const needsHandover = ['reunited', 'referred', 'transferred'].includes(outcome);
  const canSubmit = !readOnly && !!natureFinal && actionsTaken.trim() && !!conditionFinal && !!outcome
    && (!needsHandover || handoverDetails.trim().length >= 3);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    if (!alertId || !linkedAlert) { Alert.alert('Missing incident', 'Choose an assigned incident first.'); return; }
    if (linkedAlert.responderId !== account.id) { Alert.alert('Not assigned', 'Only the assigned responder can submit this report.'); return; }
    const report = { natureOfEmergency: natureFinal, actionsTaken: actionsTaken.trim(), conditionOfResident: conditionFinal,
      outcome, handoverDetails: handoverDetails.trim() || null };
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
            <FontAwesome5 name="check" size={55} color={colors.onPrimary} />
          </View>

          <Text style={styles.resultHeading}>Report Submitted</Text>
          <Text style={styles.resultSubheading}>Your report has been saved. Alerts without a guardian remain open until a barangay official reviews and closes them.</Text>

          <View style={[styles.residentCard, { marginBottom: 48 }]}>
            <Avatar uri={resident.photoUrl} name={resident.name} style={styles.residentPhoto} />
            <View style={styles.residentTextWrap}>
              <Text style={styles.residentName}>{resident.name}</Text>
              <Text style={styles.residentMeta}>ID: {resident.id}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.blueButton, { marginBottom: 8 }]} 
            onPress={() => navigation.navigate('AlertDetails', { alertId })}
          >
            <Text style={[styles.backButtonText, styles.blueText]}>View Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>INCIDENT SUMMARY NOTES</Text>
        <Text style={styles.subheading}>Report Details</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.residentCard, { marginBottom: 16 }]}>
          <Avatar uri={resident.photoUrl} name={resident.name} style={styles.residentPhoto} />
          <View style={styles.residentTextWrap}>
            <Text style={styles.residentName}>{resident.name}</Text>
            <Text style={styles.residentMeta}>ID: {resident.id}</Text>
          </View>
        </View>

        {linkedAlert?.incidentReport ? (
          <Text style={styles.previousNote}>Previous summary: {linkedAlert.incidentReport}</Text> 
        ) : null}

        {readOnly && <Text style={styles.previousNote}>This report is read-only. Only the assigned responder can update an incident that still accepts reports.</Text>}
        <Text style={styles.fieldLabel}>Nature of Emergency <Text style={styles.required}>*</Text></Text>
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
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Describe the nature of the emergency"
            placeholderTextColor={colors.textMuted}
            value={natureOtherText}
            onChangeText={setNatureOtherText}
          />
        )}

        <Text style={styles.fieldLabel}>Actions Taken <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what you did on-site"
          placeholderTextColor={colors.textMuted}
          value={actionsTaken}
          onChangeText={setActionsTaken}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.fieldLabel}>Condition of Resident <Text style={styles.required}>*</Text></Text>
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
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Describe the resident's condition"
            placeholderTextColor={colors.textMuted}
            value={conditionOtherText}
            onChangeText={setConditionOtherText}
          />
        )}

        <Text style={styles.fieldLabel}>Assistance Outcome <Text style={styles.required}>*</Text></Text>
        <View style={styles.chipWrap}>
          {OUTCOME_OPTIONS.map(([value, label]) => (
            <TouchableOpacity key={value} style={[styles.chip, outcome === value && styles.chipActive]} onPress={() => setOutcome(value)}>
              <Text style={[styles.chipLabel, outcome === value && styles.chipLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {needsHandover && <>
          <Text style={styles.fieldLabel}>Handover Details <Text style={styles.required}>*</Text></Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Who received the resident or referral, and when?"
            placeholderTextColor={colors.textMuted} value={handoverDetails} onChangeText={setHandoverDetails} multiline numberOfLines={3} />
        </>}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.submitButton, !canSubmit && styles.buttonDisabled]} 
          onPress={handleSubmit} 
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, paddingBottom: 0, paddingTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 20 },
  
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.primary, marginBottom: 4, minHeight: 44, paddingVertical: 4, marginTop: 0 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 8 },
  
  progressRow: { flexDirection: 'row', marginBottom: 24 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, marginRight: 6 },
  progressBarActive: { backgroundColor: colors.primary },

  residentCard: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: -16, padding: spacing.card, marginBottom: 16, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  residentPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.textMuted, marginRight: 14 },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  
  previousNote: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 12, fontStyle: 'italic' },

  fieldLabel: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 10, marginTop: 12 },
  required: { color: colors.alertInk },
  
  input: { 
    borderWidth: 1, 
    borderColor: colors.borderStrong, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    backgroundColor: colors.surfaceSunken, 
    fontFamily: 'Poppins_400Regular', 
    fontSize: typography.body, 
    minHeight: spacing.control 
  },
  textArea: { 
    minHeight: 100, 
    textAlignVertical: 'top', 
    paddingTop: 12,
    paddingBottom: 12 
  },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: -2, marginBottom: 8 },
  chip: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textSecondary },
  chipLabelActive: { color: colors.primary, fontFamily: 'Poppins_700Bold' },

  bottomBar: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  submitButton: { borderRadius: 10, backgroundColor: colors.primarySoft, paddingVertical: 16, alignItems: 'center', marginBottom: 8, minHeight: spacing.control, justifyContent: 'center' },
  buttonDisabled: { backgroundColor: colors.primarySoft },
  submitButtonText: { color: colors.primary, fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  pageLabel: { textAlign: 'center', color: colors.textMuted, marginTop: 8, fontSize: typography.caption, fontFamily: 'Poppins_400Regular' },

  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultIconWrap: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: colors.successInk },
  resultHeading: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', textAlign: 'center', marginBottom: 4 },
  resultSubheading: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, textAlign: 'center', marginBottom: 24, marginTop: 6 },
    
  button: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, borderRadius: 10, paddingVertical: 16, alignItems: 'center', width: '100%', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, minHeight: spacing.control, justifyContent: 'center' },
  blueButton: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  backButtonText: { color: colors.textPrimary, fontFamily: 'Poppins_500Medium', fontSize: typography.body },
  blueText: { color: colors.primary },
});
