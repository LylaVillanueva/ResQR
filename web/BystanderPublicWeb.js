import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function BystanderPublicWeb({ route }) {
  const residentId = route.params?.residentId;

  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchResident() {
      if (!residentId) {
        setLoading(false);
        return;
      }
      setTimeout(() => {
        setResident({
          name: 'Apple David',
          id: residentId,
          role: 'Senior Citizen',
          barangay: '206',
        });
        setLoading(false);
      }, 500);
    }
    fetchResident();
  }, [residentId]);

  if (!resident) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Resident not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.heading, { color: '#fff' }]}>[ResQR Logo Name]</Text>
        <Text style={styles.subheading}>ResQR's public landing page</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={[styles.button, styles.red]}>
        <Text style={styles.buttonText}>
            <FontAwesome5 name="phone-alt" size={23} color="#af4545" />  Call 911</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.yellow]}>
        <Text style={styles.buttonText}>
            <FontAwesome5 name="user-tie" size={23} color="#8a6d1d" />  Notify Guardian</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.green, {marginBottom: 22}]}>
        <Text style={styles.buttonText}>
            <FontAwesome5 name="user-shield" size={23} color="#288928" />  Notify Barangay</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        <Text style={styles.heading}>Resident Information</Text>
          <View style={styles.infoCard}>
            <Text style={[styles.heading1, { color: '#a83232' }]}>{resident.name}</Text>
            <Text style={styles.heading2}>Type: {resident.role}</Text>
            <Text style={styles.heading2}>Barangay: {resident.barangay}</Text>
            <Text style={styles.heading2}>Guardian: Chad Gammod</Text>
          </View>

        <View style={styles.divider} />

        <Text style={[styles.heading1, { color: '#245490' }]}>Add a note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="e.g. Found near the market, seems disoriented"
          multiline
          value={note}
          onChangeText={setNote}
        />
        <TouchableOpacity style={[styles.button, styles.blue, {marginBottom: 10}]}>
        <Text style={styles.buttonText}>
            <FontAwesome5 name="comment-dots" size={23} color="#245490" />  Submit Note</Text>
        </TouchableOpacity>
        <Text style={styles.note}>Your optional note will be recorded in the incident report. No account required.</Text>


        <View style={styles.divider} />
        <Text style={styles.note}>ResQR 2026. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0, backgroundColor: '#a83232' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, marginTop: 0 },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },
  heading: { fontSize: 28, fontFamily: 'Poppins_600SemiBold', marginBottom: 5, marginTop: -10 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#fff', marginBottom: 15, marginLeft: 15 },
  heading1: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  heading2: { fontSize: 20, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 5 },
  note: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 15, textAlign: 'center' },

  divider: {
    borderTopWidth: 1,
    borderTopColor: '#a3a3a3',
    marginBottom: 20,
  },

  button: {
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#625350',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: { color: '#333', fontSize: 20, fontFamily: 'Poppins_600SemiBold' },
  red: { borderColor: '#a83232', backgroundColor: '#fbd1d1', },
  yellow: { borderColor: '#8a6d1d', backgroundColor: '#fbf1a1', },
  green: { borderColor: '#288928', backgroundColor: '#a1fbaa', },
  blue: { borderColor: '#245490', backgroundColor: '#d3e5f8', },

  infoCard: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#625350',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  infoCardTitle: { 
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold', 
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#fbdcdc',
  },

  noteInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    marginBottom: 20,
  },
  errorText: { textAlign: 'center', marginTop: 60, fontFamily: 'Poppins_400Regular', color: '#666' },
});