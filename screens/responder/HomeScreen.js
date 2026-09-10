import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import TabBar from '../../component/TabButtons';
import { FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../lib/api';

const ACTION_LABELS = {
  'incident.responder_assigned': 'You were assigned a task',
  'incident.confirmation_submitted': 'You submitted a confirmation',
  'incident.resolved': 'You resolved an alert',
};

export default function HomeScreen({ navigation, session }) {
  const firstName = session?.user?.fullName?.split(' ')[0] ?? '';

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      Promise.all([api.listActiveIncidents(), api.listAuditLogs({ limit: 2 })])
        .then(([incidentData, logs]) => {
          if (cancelled) return;
          setIncidents(incidentData);
          setRecentLogs(logs);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const myIncidents = incidents.filter((i) => i.assigned_responder_id === session?.user?.id);
  const needsMyConfirmation = myIncidents.filter((i) => i.responder_decision == null);
  const otherTasks = myIncidents.filter((i) => i.responder_decision != null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, {firstName}</Text>

        <View style={[styles.divider, { marginTop: 0 }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator style={{ marginVertical: 40 }} color="#a83232" />
        ) : needsMyConfirmation.length === 0 ? (
          <View style={{ paddingVertical: 45, marginBottom: 4 }}>
            <Text style={[styles.heading1, { textAlign: 'center' }]}>No Active Task</Text>
            <Text style={[styles.subheading, { textAlign: 'center', marginBottom: 0 }]}>
              You'll see it here as soon as you're assigned an alert
            </Text>
          </View>
        ) : (
          needsMyConfirmation.map((incident) => (
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
                <Text style={[styles.statusText, styles.statusPending, styles.shadow]}>Responder: Pending</Text>
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
        )}

        <View style={styles.divider} />
        <Text style={styles.heading1}>My Tasks</Text>

        {otherTasks.length === 0 ? (
          <Text style={styles.emptyText}>No other assigned tasks right now.</Text>
        ) : (
          otherTasks.map((incident) => (
            <TouchableOpacity
              key={incident.id}
              style={styles.alertCard}
              onPress={() => navigation.navigate('AlertDetails', { incidentId: incident.id })}
            >
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, styles.alertPending, styles.shadow]}>Alert Pending</Text>
                <Text style={styles.alertTime}>
                  {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <Text style={styles.headCardTitle}>{incident.resident_name}</Text>
              <Text style={styles.alertSubtitle}>Your confirmation submitted — investigation in progress</Text>
              <Text style={styles.tapHint}>
                Tap for full details <FontAwesome5 name="caret-right" size={12} color="#245490" />
              </Text>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.heading1}>Recent Incidents</Text>
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
  tapHint: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#245490', marginTop: 4 },
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
