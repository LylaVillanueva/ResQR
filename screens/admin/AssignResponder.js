import React, { useState, useCallback } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { api } from '../../lib/api';

export default function AssignResponder({ route, navigation }) {
  const incidentId = route.params?.incidentId;
  const [incident, setIncident] = useState(null);
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResponderId, setSelectedResponderId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!incidentId) {
        setLoading(false);
        setError('No alert specified.');
        return;
      }
      let cancelled = false;
      setLoading(true);
      setError(null);
      Promise.all([api.getIncident(incidentId), api.listResponders()])
        .then(([incidentData, responderData]) => {
          if (cancelled) return;
          setIncident(incidentData);
          setResponders(responderData);
          setSelectedResponderId(incidentData.assigned_responder_id ?? null);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [incidentId])
  );

  async function handleAssign() {
    if (!selectedResponderId) return;
    setAssigning(true);
    try {
      await api.assignResponder(incidentId, selectedResponderId);
      navigation.navigate('AlertDetails', { incidentId });
    } catch (err) {
      Alert.alert('Could not assign responder', err.message);
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
          <ActivityIndicator style={{ marginTop: 40 }} color="#a83232" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !incident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
          <Text style={styles.emptyText}>Couldn't load this alert{error ? `: ${error}` : '.'}</Text>
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
            <Text style={styles.name}>{incident.resident_name}</Text>
            {!!incident.blood_type && <Text style={styles.meta}>Blood type: {incident.blood_type}</Text>}
          </View>
        </View>

        <Text style={styles.heading1}>Assign Responder</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subheading, { fontFamily: 'Poppins_500Medium' }]}>Bystander Note</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Text style={styles.scanCardSubtitle}>
            {incident.bystander_notes || 'No note was submitted with this alert.'}
          </Text>
        </View>

        <Text style={[styles.subheading, { fontFamily: 'Poppins_500Medium' }]}>Available Responders</Text>
        {responders.length === 0 ? (
          <Text style={styles.emptyText}>No registered responder accounts in your barangay.</Text>
        ) : (
          responders.map((responder) => {
            const selected = selectedResponderId === responder.id;
            return (
              <TouchableOpacity
                key={responder.id}
                style={[styles.headCard, styles.shadow, selected && styles.headCardActive]}
                onPress={() => setSelectedResponderId(responder.id)}
              >
                <Image source={require('../../assets/profile.png')} style={styles.responderPhoto} />
                <View style={styles.headCardTextWrap}>
                  <Text style={styles.headCardTitle}>{responder.full_name}</Text>
                  <Text style={styles.scanCardSubtitle}>{responder.phone_number || responder.email || 'No contact on file'}</Text>
                </View>
                {selected && <FontAwesome5 name="check-circle" size={20} color="#a83232" />}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.buttonContent}>
        <TouchableOpacity
          style={[styles.assignButton, !selectedResponderId && styles.assignButtonDisabled]}
          onPress={handleAssign}
          disabled={!selectedResponderId || assigning}
        >
          <Text style={styles.assignButtonText}>{assigning ? 'Assigning…' : 'Assign Responder'}</Text>
        </TouchableOpacity>
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0 },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 16, marginTop: -16 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginTop: 10, marginBottom: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_400Regular', marginTop: 10, marginBottom: 6 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888', marginTop: 20 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },

  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: -12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 90,
    borderWidth: 1.8,
    borderColor: '#a83232',
    backgroundColor: '#c4c4c4',
    marginRight: 14,
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  profileTextWrap: { flex: 1 },
  name: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  meta: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666' },

  assignButton: {
    borderWidth: 1,
    borderColor: '#a83232',
    borderRadius: 10,
    backgroundColor: '#ffdcdc',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  assignButtonDisabled: { opacity: 0.5 },
  assignButtonText: { color: '#a83232', fontSize: 15, fontFamily: 'Poppins_500Medium' },

  scanCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', marginLeft: 8 },

  headCard: {
    flexDirection: 'row',
    justifyContent: 'left',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headCardActive: { borderColor: '#a83232', backgroundColor: '#ffdcdc' },
  responderPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#a83232',
    backgroundColor: '#c4c4c4',
    marginLeft: 4,
    marginRight: 12,
    shadowColor: '#625350',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headCardTextWrap: { flex: 1 },
  headCardTitle: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginLeft: 4 },
});
