import { sortAlertsByPriority } from '../../lib/models';
import { alertLayout } from '../../theme';
import { typography, spacing } from '../../theme';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../component/TabButtons";
import { useAppData } from "../../lib/AppDataContext";

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
  if (alert.officialReviewRequired && alert.status !== 'closed') return alert.readyForReview ? 'Awaiting official review' : 'Responder confirmation and report required';
  if (alert.status === 'escalated') return alert.escalationReason || 'Further response required';
  if (alert.status === 'closed') return 'This incident is closed';
  if (alert.status === 'open') return 'No responder assigned';
  if (alert.guardianStatus === 'Safe') return 'Guardian marked Safe • Waiting for responder';
  if (alert.responderStatus === 'Safe') return 'Responder marked Safe • Waiting for guardian';
  return 'Waiting for confirmation';
}

export default function AlertScreen({ route, navigation }) {
  const { alerts, account } = useAppData();
  const requestedFilter = route.params?.filter || 'all';

  const visibleAlerts = useMemo(() => sortAlertsByPriority(alerts.filter((alert) => {
    if (requestedFilter === 'all') return true;
    if (requestedFilter === 'active') return alert.status !== 'closed';
    if (requestedFilter === 'unassigned') return alert.status === 'open';
    return alert.status === requestedFilter;
  })), [alerts, requestedFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}><Text style={styles.heading}>Alerts</Text><Text style={styles.subheading}>{requestedFilter === 'unassigned' ? 'Alerts waiting for responder assignment' : 'Monitor emergency alert status'}</Text></View>
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
            <View style={styles.alertCardTextWrap}>
              <Text style={[styles.statusPill, styles[`status_${alert.status}`]]}>{alert.status === 'open' ? 'Open Alert' : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</Text>
              <Text style={styles.time}>{alert.scannedAt}</Text>
            </View>

            <Text style={styles.heading1}>{alert.residentName}</Text>
            <Text style={styles.typeText}>{alert.residentType}</Text>
            <Text style={styles.alertSubtitle}>Scanned by {alert.scannedBy || 'A Bystander'}</Text>

            <View style={styles.locationBox}>
              <FontAwesome5 name="map-marker-alt" size={14} color="#a83232" />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>QR scanned at</Text>
                <Text style={styles.locationText}>{alert.location}</Text>
              </View>
            </View>

            <Text style={styles.alertSubtitle}>{getSubtitle(alert)}</Text>
            {alert.bystanderNote ? <Text style={styles.alertSubtitle}>Note: {alert.bystanderNote}</Text> : null}

            <View style={styles.statusRow}>
              <Text style={[styles.statusText, alert.guardianStatus === 'Not Safe' ? styles.notSafe : alert.guardianStatus === 'Safe' ? styles.safe : styles.waiting]}>Guardian: {'\n'}{alert.guardianStatus}</Text>
              <Text style={[styles.statusText, alert.responderStatus === 'Not Safe' ? styles.notSafe : alert.responderStatus === 'Safe' ? styles.safe : styles.waiting]}>Responder: {'\n'}{alert.responderStatus !== 'Pending' ? alert.responderStatus : alert.responderName ? 'Assigned' : 'Waiting'}</Text>
            </View>

            {alert.status === 'open' ? (
              <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AssignResponder', { alertId: alert.id })}>
                <Text style={styles.detailsText}>Assign Responder</Text>
                <FontAwesome5 name="caret-right" size={18} color="#245490" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
                <Text style={styles.detailsText}>Tap for Full Details</Text>
                <FontAwesome5 name="caret-right" size={18} color="#245490" />
              </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 12 }, scrollView: { flex: 1 }, scrollContent: { padding: spacing.screen, paddingTop: 12 , paddingBottom: 32 }, headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 }, heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 }, subheading: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, auditButton: { alignItems: 'center', padding: 5 }, auditText: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_500Medium', marginTop: 2 }, filterScrollWrap: { marginTop: 12 }, filterWrap: { paddingRight: 10 }, filterButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, backgroundColor: '#fff' }, filterActive: { borderColor: '#a83232', backgroundColor: '#ffdcdc' }, filterLabel: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_500Medium' }, filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_600SemiBold' }, divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 10 },
  alertCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card },
  escalatedCard: { borderColor: '#a83232' },
  alertCardTextWrap: { flexWrap: 'wrap', gap: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 , ...alertLayout.headerRow },
  statusPill: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' },
  status_open: { color: '#a83232', backgroundColor: '#fbd1d1' }, status_pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, status_escalated: { color: '#a83232', backgroundColor: '#fbd1d1' }, status_closed: { color: '#288928', backgroundColor: '#a1fbaa' },
  time: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginLeft: 0, marginTop: 8, marginBottom: 6},
  typeText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#245490', marginLeft: 0, marginBottom: 4},
  alertSubtitle: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', marginLeft: 0, marginBottom: 6},
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7f7', borderWidth: 1, borderColor: '#f0cccc', borderRadius: 10, padding: 10, marginBottom: 8, ...alertLayout.location },
  locationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#888', marginLeft: 10 },
  locationText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#333', marginLeft: 10, marginTop: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 8},
  statusText: { flex: 1, textAlign: 'center', fontSize: typography.caption, fontFamily: 'Poppins_500Medium', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginHorizontal: 4, borderWidth: 1 },
  waiting: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1' }, safe: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa' }, notSafe: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  detailsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#245490', paddingVertical: 10, paddingHorizontal: 18, backgroundColor: '#d3e5f8' , minHeight: 48, ...alertLayout.details },
  detailsText: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#245490' },
  empty: { alignItems: 'center', padding: 50 }, emptyTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 8 }, emptyText: { fontSize: typography.body, color: '#888', fontFamily: 'Poppins_400Regular', marginTop: 3 },
});
