import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TabBar from '../../component/TabButtons';
import { FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../lib/api';

const ACTION_LABELS = {
  'resident.enrolled': 'New Resident Enrolled',
  'incident.created': 'Alert Raised',
  'incident.confirmation_submitted': 'Safety Confirmation Submitted',
  'incident.responder_assigned': 'Responder Assigned',
  'incident.resolved': 'Alert Resolved',
  'incident.closed': 'Alert Closed',
};

export default function HomeScreen({ navigation, session }) {
  const firstName = session?.user?.fullName?.split(' ')[0] ?? '';

  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoadingWards(true);
      api
        .listResidents()
        .then((data) => {
          if (!cancelled) setWards(data);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoadingWards(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const loadIncidents = useCallback(() => {
    let cancelled = false;
    setLoadingIncidents(true);
    Promise.all([api.listActiveIncidents(), api.listAuditLogs({ limit: 2 })])
      .then(([incidentData, logs]) => {
        if (cancelled) return;
        setIncidents(incidentData);
        setRecentLogs(logs);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingIncidents(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useFocusEffect(loadIncidents);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, {firstName}</Text>

        <View style={[styles.divider, { marginTop: 0 }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loadingIncidents ? (
          <ActivityIndicator style={{ marginVertical: 40 }} color="#a83232" />
        ) : incidents.length > 0 ? (
          incidents.map((incident) => (
            <View key={incident.id} style={[styles.alertCard, styles.alertCardActive]}>
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, styles.statusOpen, styles.shadow]}>Alert Open</Text>
                <Text style={styles.alertTime}>
                  {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <Text style={styles.heading1}>{incident.resident_name}</Text>
              <Text style={styles.alertSubtitle}>Scanned by a bystander</Text>
              {!!incident.bystander_notes && (
                <Text style={styles.alertSubtitle}>Note: {incident.bystander_notes}</Text>
              )}

              <View style={styles.statusRow}>
                <Text style={[styles.statusText, styles.statusPending, styles.shadow]}>
                  Guardian: {incident.guardian_decision === 'safe' ? 'Safe' : incident.guardian_decision === 'not_safe' ? 'Not Safe' : 'Pending'}
                </Text>
                <Text style={[styles.statusText, styles.statusPending, styles.shadow]}>
                  Responder: {incident.responder_decision === 'safe' ? 'Safe' : incident.responder_decision === 'not_safe' ? 'Not Safe' : 'Pending'}
                </Text>
              </View>

              <View style={styles.buttonWrap}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSafe]}
                  onPress={() =>
                    navigation.navigate('ConfirmationScreen', {
                      incidentId: incident.id,
                      decision: 'safe',
                      residentName: incident.resident_name,
                    })
                  }
                >
                  <Text style={[styles.buttonText, styles.statusClosed]}>Mark Safe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonNotSafe]}
                  onPress={() =>
                    navigation.navigate('ConfirmationScreen', {
                      incidentId: incident.id,
                      decision: 'not_safe',
                      residentName: incident.resident_name,
                    })
                  }
                >
                  <Text style={[styles.buttonText, styles.statusOpen]}>Mark Not Safe</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <>
            <View style={{ paddingVertical: 45, marginBottom: 4 }}>
              <Text style={[styles.heading1, { textAlign: 'center' }]}>No Active Alert</Text>
              <Text style={[styles.subheading, { textAlign: 'center', marginBottom: 0 }]}>
                Always remember to keep your ward safe and healthy
              </Text>
            </View>

            <Text style={styles.heading1}>My Wards</Text>
            {loadingWards ? (
              <ActivityIndicator style={{ marginVertical: 20 }} color="#a83232" />
            ) : wards.length === 0 ? (
              <Text style={styles.emptyText}>No wards are linked to your account yet.</Text>
            ) : (
              wards.map((ward) => (
                <TouchableOpacity
                  key={ward.id}
                  style={styles.residentCard}
                  onPress={() => navigation.navigate('ProfileScreen', { residentId: ward.id })}
                >
                  <Image source={require('../../assets/profile.png')} style={styles.residentPhoto} />
                  <View style={styles.residentTextWrap}>
                    <Text style={styles.residentName}>{ward.full_name}</Text>
                    <Text style={styles.residentMeta}>
                      {ward.date_of_birth ? `Born ${ward.date_of_birth.slice(0, 10)}` : 'No birthdate on file'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.heading1}>Recent Alerts</Text>
          <Text style={styles.heading2} onPress={() => navigation.navigate('AuditLogScreen')}>
            View All <FontAwesome5 name="caret-right" size={14} color="#666" />
          </Text>
        </View>

        {recentLogs.length === 0 ? (
          <View style={[styles.headCard, styles.shadow]}>
            <Text style={styles.headCardSubtitle}>No recent activity.</Text>
          </View>
        ) : (
          recentLogs.map((log) => (
            <View key={log.id} style={[styles.headCard, styles.shadow]}>
              <View style={styles.headCardTextWrap}>
                <Text style={styles.headCardTitle}>{ACTION_LABELS[log.action] || log.action}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 10 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#a83232', marginTop: 12, marginBottom: 4 },
  heading2: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 15, marginBottom: 4, marginRight: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888', marginBottom: 12 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },

  shadow: {
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  alertCard: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  alertCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  alertCardTitle: {
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#245490',
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#d3e5f8',
  },
  buttonWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSafe: {
    flex: 1,
    justifyContent: 'center',
    borderColor: '#288928',
    backgroundColor: '#a1fbaa',
    marginRight: 6,
  },
  buttonNotSafe: {
    flex: 1,
    justifyContent: 'center',
    borderColor: '#a83232',
    backgroundColor: '#fbd1d1',
    marginLeft: 6,
  },
  buttonText: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: '#245490' },
  alertCardActive: {
    borderColor: '#a83232',
    backgroundColor: '#fff',
    shadowColor: '#a83232',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  alertClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  alertTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginLeft: 8, marginBottom: 10 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  statusText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#666',
  },
  statusOpen: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  statusPending: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1' },
  statusClosed: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa' },

  residentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  residentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#c4c4c4',
    marginRight: 14,
  },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentMeta: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' },

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
  },
  headCardTextWrap: { flex: 1 },
  headCardTitle: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2, marginLeft: 8 },
  headCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666', marginLeft: 8 },
});
