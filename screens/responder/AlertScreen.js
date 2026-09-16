import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/ResponderTabButtons';
import { useAdminData } from '../../AdminDataContext';

const RESPONDER_NAME = 'Rowendo Carpino';
const filters = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'closed', label: 'Closed' },
];

export default function AlertScreen({ navigation }) {
  const { alerts } = useAdminData();
  const [activeFilter, setActiveFilter] = useState('all');

  const myAlerts = useMemo(
    () => alerts.filter((alert) => alert.responderName === RESPONDER_NAME),
    [alerts]
  );

  const filteredAlerts = useMemo(
    () => activeFilter === 'all' ? myAlerts : myAlerts.filter((alert) => alert.status === activeFilter),
    [myAlerts, activeFilter]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Alert</Text>
            <Text style={styles.subheading}>Tap an alert to confirm status</Text>
          </View>
          <TouchableOpacity style={styles.auditButton} onPress={() => navigation.navigate('AuditLogScreen')}>
            <FontAwesome5 name="bars" size={25} color="#666" />
            <Text style={styles.auditButtonText}>Audit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterWrap}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterButton, activeFilter === filter.key && styles.filterButtonActive]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text style={[styles.filterLabel, activeFilter === filter.key && styles.filterLabelActive]}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <FontAwesome5 name="clipboard-check" size={40} color="#288928" />
            <Text style={styles.emptyTitle}>NO ACTIVE ASSIGNMENT</Text>
            <Text style={styles.emptyText}>You currently have no{`\n`}emergency task assigned.</Text>
          </View>
        ) : filteredAlerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, alert.status === 'escalated' && styles.alertCardEscalated]}>
            <View style={styles.alertCardTextWrap}>
              <Text style={[styles.alertCardTitle, statusStyle(alert.status), styles.shadow]}>
                {alert.status === 'escalated' ? 'Alert Escalated'
                  : alert.status === 'closed' ? 'Alert Closed'
                  : alert.status === 'pending' ? 'Alert Pending'
                  : 'Alert Open'}
              </Text>
              <Text style={styles.alertTime}>{alert.scannedAt}</Text>
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

            {alert.bystanderNote ? <Text style={styles.alertSubtitle}>Note: {alert.bystanderNote}</Text> : null}

            <View style={styles.statusRow}>
              <Text style={[styles.statusText, confirmationStyle(alert.guardianStatus), styles.shadow]}>Guardian: {alert.guardianStatus}</Text>
              <Text style={[styles.statusText, confirmationStyle(alert.responderStatus), styles.shadow]}>Responder: {alert.responderStatus}</Text>
            </View>

            {alert.status !== 'closed' && (
              <View style={styles.buttonWrap}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSafe, alert.responderStatus === 'Safe' && styles.buttonDisabled]}
                  disabled={alert.responderStatus === 'Safe'}
                  onPress={() => navigation.navigate('ConfirmationScreen', { status: 'Safe', alertId: alert.id, resident: { name: alert.residentName, id: alert.residentId } })}
                >
                  <Text style={[styles.buttonText, styles.safeText]}>Mark Safe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonNotSafe, alert.responderStatus === 'Not Safe' && styles.buttonDisabled]}
                  disabled={alert.responderStatus === 'Not Safe'}
                  onPress={() => navigation.navigate('ConfirmationScreen', { status: 'Not Safe', alertId: alert.id, resident: { name: alert.residentName, id: alert.residentId } })}
                >
                  <Text style={[styles.buttonText, styles.notSafeText]}>Mark Not Safe</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
              <Text style={styles.detailsText}>Tap for Full Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function statusStyle(status) {
  if (status === 'escalated') return styles.alertEscalated;
  if (status === 'closed') return styles.alertClosed;
  if (status === 'pending') return styles.alertPending;
  return styles.alertOpen;
}
function confirmationStyle(status) {
  if (status === 'Safe') return styles.statusClosed;
  if (status === 'Not Safe') return styles.statusEscalated;
  return styles.statusPending;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 20, paddingBottom: 20 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginLeft: 8, marginBottom: 2 },
  typeText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#245490', marginLeft: 8, marginBottom: 6 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  auditButton: { alignItems: 'center', padding: 6, marginTop: 8 },
  auditButtonText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 2 },
  filterBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, marginTop: -10, marginBottom: 6 },
  filterWrap: { alignItems: 'center', paddingRight: 4 },
  filterButton: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 5, marginHorizontal: 2, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  filterButtonActive: { backgroundColor: '#ffdcdc', borderColor: '#a83232', paddingVertical: 4, paddingHorizontal: 7 },
  filterLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 2 },
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },
  shadow: { shadowColor: '#aaa', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 8 },
  alertCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
  alertCardEscalated: { borderColor: '#a83232' },
  alertCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  alertCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
  alertOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  alertEscalated: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  alertTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginLeft: 8, marginBottom: 10 },
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7f7', borderWidth: 1, borderColor: '#f0cccc', borderRadius: 10, padding: 11, marginBottom: 10 },
  locationLabel: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: '#888', marginLeft: 10 },
  locationText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#333', marginLeft: 10, marginTop: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 },
  statusText: { flex: 1, textAlign: 'center', fontSize: 12, fontFamily: 'Poppins_500Medium', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginHorizontal: 4, borderWidth: 1 },
  statusPending: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1' },
  statusClosed: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa' },
  statusEscalated: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 10 },
  buttonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa', marginRight: 6 },
  buttonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1', marginLeft: 6 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 14, fontFamily: 'Poppins_500Medium' },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },

  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#245490',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#d3e5f8',
    marginTop: 4,
  },
  detailsText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#245490',
  },

  emptyWrap: { alignItems: 'center', paddingVertical: 65 },
  emptyTitle: { fontSize: 19, fontFamily: 'Poppins_700Bold', color: '#288928', marginTop: 14 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 22 },
});