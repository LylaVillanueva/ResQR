import React, { useState, useCallback } from 'react';
import { Text, View, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TabBar from '../../component/TabButtons';
import { api } from '../../lib/api';

const STATUS_LABELS = {
  active: 'Alert Open',
  confirmed_safe: 'Confirmed Safe',
  confirmed_not_safe: 'Not Safe — Escalated',
  escalated: 'Escalated',
  assigned: 'Responder Assigned',
  resolved: 'Resolved',
  closed: 'Closed',
};

function decisionStyleKey(decision) {
  if (decision === 'safe') return 'statusClosed';
  if (decision === 'not_safe') return 'statusOpen';
  return 'statusPending';
}

function decisionLabel(decision) {
  if (decision === 'safe') return 'Marked Safe';
  if (decision === 'not_safe') return 'Marked Not Safe';
  return 'Pending';
}

export default function AlertDetails({ route, navigation }) {
  const incidentId = route.params?.incidentId;
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      api
        .getIncident(incidentId)
        .then((data) => {
          if (!cancelled) setIncident(data);
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
            <Text style={styles.meta}>{STATUS_LABELS[incident.status] || incident.status}</Text>
            {!!incident.blood_type && <Text style={styles.meta}>Blood type: {incident.blood_type}</Text>}
          </View>
        </View>

        <Text style={styles.heading1}>Alert Details</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subheading, { fontFamily: 'Poppins_500Medium' }]}>Scanned By</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Image source={require('../../assets/profile.png')} style={styles.responderPhoto} />
          <Text style={styles.headCardTitle}>A Bystander</Text>
        </View>

        <Text style={[styles.subheading, { fontFamily: 'Poppins_500Medium' }]}>Optional Note</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Text style={styles.scanCardSubtitle}>
            {incident.bystander_notes || 'No note was submitted with this alert.'}
          </Text>
        </View>

        <Text style={[styles.subheading, { fontFamily: 'Poppins_500Medium' }]}>Responder Assigned</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Image source={require('../../assets/profile.png')} style={styles.responderPhoto} />
          <Text style={styles.headCardTitle}>{incident.assigned_responder_name || 'Unassigned'}</Text>
        </View>

        <Text style={[styles.subheading, { fontFamily: 'Poppins_500Medium' }]}>Confirmation Status</Text>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles[decisionStyleKey(incident.guardian_decision)]]}>
              {decisionLabel(incident.guardian_decision)}
            </Text>
          </View>
          <Text style={styles.scanCardSubtitle}>Guardian's confirmation</Text>
        </View>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles[decisionStyleKey(incident.responder_decision)]]}>
              {decisionLabel(incident.responder_decision)}
            </Text>
          </View>
          <Text style={styles.scanCardSubtitle}>Responder's confirmation</Text>
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0 },
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

  scanCard: {
    flexDirection: 'column',
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
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  statusOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  statusPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  statusClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
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
  headCardTitle: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2, marginLeft: 4 },
});
