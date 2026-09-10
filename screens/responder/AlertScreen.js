import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { api } from '../../lib/api';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'closed', label: 'Closed' },
];

const STATUS_LABELS = {
  active: 'Alert Open',
  confirmed_safe: 'Alert Closed',
  confirmed_not_safe: 'Alert Pending',
  escalated: 'Escalated',
  assigned: 'Alert Pending',
  resolved: 'Alert Closed',
  closed: 'Alert Closed',
};

function statusStyleKey(status) {
  if (status === 'active') return 'alertOpen';
  if (['confirmed_safe', 'resolved', 'closed'].includes(status)) return 'alertClosed';
  return 'alertPending';
}

function decisionLabel(decision) {
  if (decision === 'safe') return 'Safe';
  if (decision === 'not_safe') return 'Not Safe';
  return 'Pending';
}

export default function AlertScreen({ navigation, session }) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      api
        .listActiveIncidents({ includeClosed: true })
        .then((data) => {
          if (!cancelled) setIncidents(data);
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
    }, [])
  );

  const filteredIncidents = incidents.filter((incident) => {
    if (!activeFilter || activeFilter === 'all') return true;
    if (activeFilter === 'open') return incident.status === 'active';
    if (activeFilter === 'closed') return ['confirmed_safe', 'resolved', 'closed'].includes(incident.status);
    return !['active', 'confirmed_safe', 'resolved', 'closed'].includes(incident.status);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Alert</Text>
            <Text style={styles.subheading}>Tap an alert to confirm status</Text>
          </View>

          <TouchableOpacity
            style={styles.auditButton}
            onPress={() => navigation.navigate('AuditLogScreen')}
          >
            <FontAwesome5 name="bars" size={25} color="#666" />
            <Text style={styles.auditButtonText}>Audit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <View style={styles.filterWrap}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterButton, activeFilter === f.key && styles.filterButtonActive]}
                onPress={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
              >
                <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} color="#a83232" />
        ) : error ? (
          <Text style={styles.emptyText}>Couldn't load alerts: {error}</Text>
        ) : filteredIncidents.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeFilter === 'closed' ? 'No closed alerts yet.' : 'No alerts match this filter right now.'}
          </Text>
        ) : (
          filteredIncidents.map((incident) => {
            const isActive = incident.status === 'active';
            const isClosed = ['confirmed_safe', 'resolved', 'closed'].includes(incident.status);
            // Only the responder this incident is actually assigned to
            // can confirm it — everyone else (unassigned or someone
            // else's task) just gets a view-only card.
            const needsMyConfirmation =
              !isClosed && incident.assigned_responder_id === session?.user?.id && incident.responder_decision == null;

            const cardContent = (
              <>
                <View style={styles.alertCardTextWrap}>
                  <Text style={[styles.alertCardTitle, styles[statusStyleKey(incident.status)], styles.shadow]}>
                    {STATUS_LABELS[incident.status] || incident.status}
                  </Text>
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
                  <Text style={[styles.statusText, styles[statusStyleKey(incident.guardian_decision ? 'closed' : 'active')], styles.shadow]}>
                    Guardian: {decisionLabel(incident.guardian_decision)}
                  </Text>
                  <Text style={[styles.statusText, styles[statusStyleKey(incident.responder_decision ? 'closed' : 'active')], styles.shadow]}>
                    Responder: {decisionLabel(incident.responder_decision)}
                  </Text>
                </View>
              </>
            );

            if (needsMyConfirmation) {
              return (
                <View key={incident.id} style={[styles.alertCard, isActive && styles.alertCardActive]}>
                  {cardContent}
                  <View style={styles.buttonWrap}>
                    <TouchableOpacity
                      style={[styles.decisionButton, styles.buttonSafe]}
                      onPress={() =>
                        navigation.navigate('ConfirmationScreen', {
                          incidentId: incident.id,
                          decision: 'safe',
                          residentName: incident.resident_name,
                        })
                      }
                    >
                      <Text style={[styles.decisionButtonText, styles.statusClosed]}>Mark Safe</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.decisionButton, styles.buttonNotSafe]}
                      onPress={() =>
                        navigation.navigate('ConfirmationScreen', {
                          incidentId: incident.id,
                          decision: 'not_safe',
                          residentName: incident.resident_name,
                        })
                      }
                    >
                      <Text style={[styles.decisionButtonText, styles.statusOpen]}>Mark Not Safe</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={incident.id}
                activeOpacity={0.7}
                style={[styles.alertCard, isActive && styles.alertCardActive]}
                onPress={() => navigation.navigate('AlertDetails', { incidentId: incident.id })}
              >
                {cardContent}
                <Text style={styles.tapHint}>
                  Tap for full details <FontAwesome5 name="caret-right" size={12} color="#245490" />
                </Text>
              </TouchableOpacity>
            );
          })
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
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 20 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginLeft: 8 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888', textAlign: 'center', marginTop: 20 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  auditButton: { alignItems: 'center', padding: 6, marginTop: 8 },
  auditButtonText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 2 },

  shadow: {
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginTop: -10,
    marginBottom: 6,
  },
  filterWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: { backgroundColor: '#ffdcdc', borderWidth: 1, borderColor: '#a83232', paddingVertical: 4, paddingHorizontal: 7 },
  filterLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 2 },
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },

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
  tapHint: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#245490', marginTop: 4, marginLeft: 8 },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between' },
  decisionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
  },
  decisionButtonText: { fontSize: 15, fontFamily: 'Poppins_500Medium' },
  buttonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa', marginRight: 6 },
  buttonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1', marginLeft: 6 },
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
});
