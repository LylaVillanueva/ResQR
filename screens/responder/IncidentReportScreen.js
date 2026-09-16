import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAdminData } from '../../AdminDataContext';

// NEW SCREEN: Incident Summary Notes / Report
const EMERGENCY_OPTIONS = ['Fall', 'Disorientation', 'Seizure', 'Medical emergency', 'Injury', 'Other'];
const CONDITION_OPTIONS = ['Normal', 'Stable', 'Critical', 'Unresponsive', 'Other'];

export default function IncidentReportScreen({ route, navigation }) {
  const resident = route.params?.resident || { name: 'Maria Santos', id: 'BRG-SC-2026-0001' };
  const alertId = route.params?.alertId;
  const { alerts, addIncidentReport } = useAdminData();
  const linkedAlert = alerts.find((item) => item.id === alertId);

  const [natureOfEmergency, setNatureOfEmergency] = useState(null);
  const [natureOtherText, setNatureOtherText] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [residentCondition, setResidentCondition] = useState(null);
  const [conditionOtherText, setConditionOtherText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const natureFinal = natureOfEmergency === 'Other' ? natureOtherText.trim() : natureOfEmergency;
  const conditionFinal = residentCondition === 'Other' ? conditionOtherText.trim() : residentCondition;

  const canSubmit = !!natureFinal && actionsTaken.trim() && !!conditionFinal;

  function handleSubmit() {
    if (!canSubmit) return;
    if (alertId) {
      addIncidentReport(alertId, {
        natureOfEmergency: natureFinal,
        actionsTaken: actionsTaken.trim(),
        conditionOfResident: conditionFinal,
      }, 'Rowendo Carpino');
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.resultIconWrap}>
            <FontAwesome5 name="check" size={55} color="#fff" />
          </View>

          <Text style={styles.subheading}>Report Submitted</Text>
          <Text style={styles.subheading2}>Your incident summary has been logged to the audit trail.</Text>

          <View style={styles.residentCard}>
            <Image source={require('../../assets/profile.png')} style={styles.residentPhoto} />
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
          <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{resident.name}</Text>
            <Text style={styles.meta}>ID: {resident.id}</Text>
          </View>
        </View>

        <Text style={styles.heading1}>Incident Summary Notes</Text>
        <Text style={styles.subheadingSmall}>Required before closing this incident.</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
          disabled={!canSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 16, marginTop: -16 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginTop: 6, marginBottom: 2 },
  subheadingSmall: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 14 },
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
  name: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', marginBottom: 2 },
  meta: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' },

  fieldLabel: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginTop: 14, marginBottom: 6 },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    backgroundColor: '#fff',
  },
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
  chipLabel: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#666' },
  chipLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },

  submitButton: {
    backgroundColor: '#a83232',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: { backgroundColor: '#e0b3b3' },
  submitButtonText: { color: '#fff', fontFamily: 'Poppins_500Medium', fontSize: 16 },

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
  subheading: { fontSize: 20, fontFamily: 'Poppins_700Bold', textAlign: 'center', marginBottom: -4 },
  subheading2: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', marginBottom: 24, marginTop: 6 },

  residentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    backgroundColor: '#fff',
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  residentPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c4c4c4', marginRight: 14 },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentMeta: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' },

  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  blueButton: { borderColor: '#245490', backgroundColor: '#d3e5f8' },
  buttonText: { color: '#333', fontFamily: 'Poppins_500Medium', fontSize: 16 },
  blueText: { color: '#245490' },
});