import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { useAdminData } from '../../AdminDataContext';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'closed', label: 'Closed' },
  { key: 'unassigned', label: 'Unassigned' },
];

function getSubtitle(alert) {
  if (alert.status === 'escalated') return alert.escalationReason || 'Further response required';
  if (alert.status === 'closed') return 'Both confirmations are completed';
  if (alert.status === 'open') return 'No responder assigned';
  if (alert.guardianStatus === 'Safe') return 'Guardian marked Safe • Waiting for responder';
  if (alert.responderStatus === 'Safe') return 'Responder marked Safe • Waiting for guardian';
  return 'Waiting for confirmation';
}

export default function AlertScreen({ route, navigation }) {
  const { alerts } = useAdminData();
  const requestedFilter = route.params?.filter || 'all';

  const visibleAlerts = useMemo(() => alerts.filter((alert) => {
    if (requestedFilter === 'all') return true;
    if (requestedFilter === 'active') return alert.status !== 'closed';
    if (requestedFilter === 'unassigned') return alert.status === 'open';
    return alert.status === requestedFilter;
  }), [alerts, requestedFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View><Text style={styles.heading}>Alerts</Text><Text style={styles.subheading}>{requestedFilter === 'unassigned' ? 'Alerts waiting for responder assignment' : 'Monitor emergency alert status'}</Text></View>
          <TouchableOpacity style={styles.auditButton} onPress={() => navigation.navigate('AuditLogScreen')}><FontAwesome5 name="bars" size={24} color="#666" /><Text style={styles.auditText}>Audit</Text></TouchableOpacity>
        </View>
        <View style={styles.filterScrollWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterWrap}>
            {filters.map((f) => (
              <TouchableOpacity key={f.key} style={[styles.filterButton, requestedFilter === f.key && styles.filterActive]} onPress={() => navigation.setParams({ filter: f.key })}>
                <Text style={[styles.filterLabel, requestedFilter === f.key && styles.filterLabelActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {visibleAlerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, alert.status === 'escalated' && styles.escalatedCard]}>
            <View style={styles.topRow}>
              <Text style={[styles.statusPill, styles[`status_${alert.status}`]]}>{alert.status === 'open' ? 'Open Alert' : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</Text>
              <Text style={styles.time}>{alert.scannedAt}</Text>
            </View>
            <Text style={styles.name}>{alert.residentName}</Text>
            <Text style={styles.type}>{alert.residentType}</Text>
            <Text style={styles.location}>📍 {alert.location}</Text>
            <Text style={styles.sub}>{getSubtitle(alert)}</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, alert.guardianStatus === 'Not Safe' ? styles.notSafe : alert.guardianStatus === 'Safe' ? styles.safe : styles.waiting]}>Guardian: {alert.guardianStatus}</Text>
              <Text style={[styles.statusText, alert.responderStatus === 'Not Safe' ? styles.notSafe : alert.responderStatus === 'Safe' ? styles.safe : styles.waiting]}>Responder: {alert.responderName ? (alert.responderStatus === 'Pending' ? 'Assigned' : alert.responderStatus) : 'Waiting'}</Text>
            </View>
            {alert.status === 'open' ? (
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AssignResponder', { alertId: alert.id })}><Text style={styles.actionText}>Assign Responder</Text><FontAwesome5 name="chevron-right" size={12} color="#245490" /></TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}><Text style={styles.actionText}>Tap for Full Details</Text><FontAwesome5 name="chevron-right" size={12} color="#245490" /></TouchableOpacity>
            )}
          </View>
        ))}
        {visibleAlerts.length === 0 && <View style={styles.empty}><FontAwesome5 name="bell-slash" size={28} color="#aaa" /><Text style={styles.emptyTitle}>No alerts found</Text><Text style={styles.emptyText}>There are no alerts matching this filter.</Text></View>}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, scrollView: { flex: 1 }, scrollContent: { padding: 20, paddingTop: 12 }, headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, heading: { fontSize: 28, fontFamily: 'Poppins_700Bold' }, subheading: { fontSize: 13, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, auditButton: { alignItems: 'center', padding: 5 }, auditText: { fontSize: 11, color: '#666', fontFamily: 'Poppins_500Medium', marginTop: 2 }, filterScrollWrap: { marginTop: 12 }, filterWrap: { paddingRight: 10 }, filterButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, backgroundColor: '#fff' }, filterActive: { borderColor: '#a83232', backgroundColor: '#ffdcdc' }, filterLabel: { fontSize: 11, color: '#666', fontFamily: 'Poppins_500Medium' }, filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_600SemiBold' }, divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 10 }, alertCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, marginBottom: 12, backgroundColor: '#fff', shadowColor: '#777', shadowOffset: { width: 3, height: 5 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 3 }, escalatedCard: { borderColor: '#a83232' }, topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, statusPill: { borderRadius: 10, paddingHorizontal: 11, paddingVertical: 3, fontSize: 12, fontFamily: 'Poppins_600SemiBold' }, status_open: { color: '#a83232', backgroundColor: '#fbd1d1' }, status_pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, status_escalated: { color: '#a83232', backgroundColor: '#fbd1d1' }, status_closed: { color: '#288928', backgroundColor: '#a1fbaa' }, time: { fontSize: 11, color: '#777', fontFamily: 'Poppins_400Regular' }, name: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', marginTop: 8 }, type: { fontSize: 12, color: '#555', fontFamily: 'Poppins_400Regular' }, location: { fontSize: 12, color: '#555', fontFamily: 'Poppins_400Regular', marginTop: 4 }, sub: { fontSize: 12, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 5 }, statusRow: { flexDirection: 'row', gap: 6, marginTop: 10, marginBottom: 10 }, statusText: { flex: 1, textAlign: 'center', fontSize: 10, fontFamily: 'Poppins_500Medium', borderRadius: 9, paddingVertical: 5, borderWidth: 1 }, waiting: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1' }, safe: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa' }, notSafe: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1' }, actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#245490', backgroundColor: '#d3e5f8', borderRadius: 9, paddingVertical: 8, paddingHorizontal: 12 }, actionText: { color: '#245490', fontFamily: 'Poppins_500Medium', fontSize: 12 }, empty: { alignItems: 'center', padding: 50 }, emptyTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', marginTop: 8 }, emptyText: { fontSize: 12, color: '#888', fontFamily: 'Poppins_400Regular', marginTop: 3 },
});
