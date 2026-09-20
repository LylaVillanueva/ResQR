import { sortAlertsByPriority } from '../../lib/models';
import { alertLayout } from '../../theme';
import { typography, spacing } from '../../theme';
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../component/GuardianTabButtons";
import { useAppData } from "../../lib/AppDataContext";

const filters = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'closed', label: 'Closed' },
];

export default function AlertScreen({ navigation }) {
  const { alerts, users, account } = useAppData();
  const [activeFilter, setActiveFilter] = useState('all');

  const guardianAccount = useMemo(() => users.find((user) => user.id === account.id), [users, account.id]);
  const wardIds = guardianAccount?.wardIds || [];

  const myAlerts = useMemo(
    () => alerts.filter((alert) => wardIds.includes(alert.residentId)),
    [alerts, wardIds]
  );

  const filteredAlerts = useMemo(
    () => sortAlertsByPriority(activeFilter === 'all' ? myAlerts : myAlerts.filter((alert) => alert.status === activeFilter)),
    [myAlerts, activeFilter]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Alerts</Text>
            <Text style={styles.subheading}>Emergency alerts involving your wards</Text>
          </View>
        </View>

        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterWrap}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterButton, activeFilter === f.key && styles.filterButtonActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>{f.label}</Text>
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
            <Text style={styles.emptyTitle}>NO ALERTS FOUND</Text>
            <Text style={styles.emptyText}>There are no alerts matching{`\n`}this filter for your wards.</Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, alert.status === 'escalated' && styles.alertCardEscalated]}>
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, statusStyle(alert.status)]}>
                  {alert.status === 'escalated' ? 'Alert Escalated'
                    : alert.status === 'closed' ? 'Alert Closed'
                    : alert.status === 'pending' ? 'Pending Confirmation'
                    : 'Open Alert'}
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

              {alert.bystanderNote ? (
                <Text style={styles.alertSubtitle}>Note: {alert.bystanderNote}</Text>
              ) : null}

              <View style={styles.statusRow}>
                <Text style={[styles.statusText, confirmationStyle(alert.guardianStatus)]}>
                  Guardian: {'\n'}{alert.guardianStatus}
                </Text>
                <Text style={[styles.statusText, confirmationStyle(alert.responderStatus)]}>
                  Responder: {'\n'}{alert.responderStatus}
                </Text>
              </View>

              {alert.status !== 'closed' && (
                <View style={styles.buttonWrap}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSafe, alert.guardianStatus === 'Safe' && styles.buttonDisabled]}
                    disabled={alert.guardianStatus === 'Safe'}
                    onPress={() => navigation.navigate('ConfirmationScreen', {
                      status: 'Safe',
                      alertId: alert.id,
                      resident: { name: alert.residentName, id: alert.residentId },
                    })}
                  >
                    <Text style={[styles.buttonText, styles.safeText]}>✓ Mark Safe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonNotSafe, alert.guardianStatus === 'Not Safe' && styles.buttonDisabled]}
                    disabled={alert.guardianStatus === 'Not Safe'}
                    onPress={() => navigation.navigate('ConfirmationScreen', {
                      status: 'Not Safe',
                      alertId: alert.id,
                      resident: { name: alert.residentName, id: alert.residentId },
                    })}
                  >
                    <Text style={[styles.buttonText, styles.notSafeText]}>✕ Mark Not Safe</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
                <Text style={styles.detailsText}>Tap for Full Details</Text>
                <FontAwesome5 name="caret-right" size={18} color="#245490" />
              </TouchableOpacity>
            </View>
          ))
        )}
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
  content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 12 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, marginTop: 20, paddingBottom: 32},
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginLeft: 0, marginTop: 8, marginBottom: 6},
  typeText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#245490', marginLeft: 0, marginBottom: 4},
  subheading: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2, marginBottom: 10 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  filterBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, marginTop: 2, marginBottom: 6 },
  filterWrap: { alignItems: 'center', paddingRight: 4 },
  filterButton: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 5, marginHorizontal: 2, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  filterButtonActive: { backgroundColor: '#ffdcdc', borderColor: '#a83232' },
  filterLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 2 },
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },
  alertCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card },
  alertCardEscalated: { borderColor: '#a83232' },
  alertCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 , ...alertLayout.headerRow },
  alertCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' },
  alertOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  alertEscalated: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  alertTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', marginLeft: 0, marginBottom: 6},
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7f7', borderWidth: 1, borderColor: '#f0cccc', borderRadius: 10, padding: 10, marginBottom: 8, ...alertLayout.location },
  locationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#888', marginLeft: 10 },
  locationText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#333', marginLeft: 10, marginTop: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 8},
  statusText: { flex: 1, textAlign: 'center', fontSize: typography.caption, fontFamily: 'Poppins_500Medium', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginHorizontal: 4, borderWidth: 1 },
  statusPending: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1' },
  statusClosed: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa' },
  statusEscalated: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 16 , minHeight: spacing.control, justifyContent: 'center' },
  buttonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa', marginRight: 6 },
  buttonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1', marginLeft: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },
  detailsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#245490', paddingVertical: 10, paddingHorizontal: 18, backgroundColor: '#d3e5f8' , minHeight: 48, ...alertLayout.details },
  detailsText: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#245490' },
  emptyWrap: { alignItems: 'center', paddingVertical: 65 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: '#288928', marginTop: 14 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', marginTop: 8, lineHeight: Math.ceil(typography.detail * 1.5) },
});