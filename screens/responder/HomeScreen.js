import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar from '../../component/ResponderTabButtons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAdminData } from '../../AdminDataContext';

const RESPONDER_NAME = 'Rowendo Carpino';

export default function HomeScreen({ navigation }) {
  const { alerts } = useAdminData();

  const myAssignments = useMemo(
    () => alerts.filter((alert) => alert.responderName === RESPONDER_NAME && alert.status !== 'closed'),
    [alerts]
  );

  const currentAssignment = myAssignments[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, {RESPONDER_NAME}</Text>
        <Text style={styles.roleLine}>Barangay Responder • Barangay 206</Text>
        <View style={[styles.divider, { marginTop: 4 }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {!currentAssignment ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <FontAwesome5 name="clipboard-check" size={38} color="#288928" />
            </View>
            <Text style={styles.emptyTitle}>✓ NO ACTIVE ASSIGNMENT</Text>
            <Text style={styles.emptyText}>You currently have no{`\n`}emergency task assigned.</Text>
            <Text style={styles.emptyText}>You may scan a resident QR{`\n`}if needed.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.heading1}>My Current Assignment</Text>
            <View style={[styles.alertCard, styles.alertCardActive]}>
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, statusStyle(currentAssignment.status)]}>
                  {currentAssignment.status === 'escalated' ? 'Alert Escalated'
                    : currentAssignment.status === 'pending' ? 'Alert Pending'
                    : 'Alert Open'}
                </Text>
                <Text style={styles.alertTime}>{currentAssignment.scannedAt}</Text>
              </View>

              <Text style={styles.heading1Dark}>{currentAssignment.residentName}</Text>
              <Text style={styles.alertSubtitle}>{currentAssignment.residentType}</Text>
              <Text style={styles.alertSubtitle}>Scanned by {currentAssignment.scannedBy || 'a Bystander'}</Text>

              <View style={styles.locationBox}>
                <FontAwesome5 name="map-marker-alt" size={14} color="#a83232" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationLabel}>QR scanned at</Text>
                  <Text style={styles.locationText}>{currentAssignment.location}</Text>
                </View>
              </View>

              {currentAssignment.bystanderNote ? (
                <Text style={styles.alertSubtitle}>Note: {currentAssignment.bystanderNote}</Text>
              ) : null}

              <View style={styles.statusRow}>
                <Text style={[styles.statusText, confirmationStyle(currentAssignment.guardianStatus)]}>
                  Guardian: {currentAssignment.guardianStatus}
                </Text>
                <Text style={[styles.statusText, confirmationStyle(currentAssignment.responderStatus)]}>
                  Responder: {currentAssignment.responderStatus}
                </Text>
              </View>

              {currentAssignment.status !== 'closed' && (
                <View style={styles.buttonWrap}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSafe, currentAssignment.responderStatus === 'Safe' && styles.buttonDisabled]}
                    disabled={currentAssignment.responderStatus === 'Safe'}
                    onPress={() => navigation.navigate('ConfirmationScreen', {
                      status: 'Safe',
                      alertId: currentAssignment.id,
                      resident: { name: currentAssignment.residentName, id: currentAssignment.residentId },
                    })}
                  >
                    <Text style={[styles.buttonText, styles.safeText]}>Mark Safe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonNotSafe, currentAssignment.responderStatus === 'Not Safe' && styles.buttonDisabled]}
                    disabled={currentAssignment.responderStatus === 'Not Safe'}
                    onPress={() => navigation.navigate('ConfirmationScreen', {
                      status: 'Not Safe',
                      alertId: currentAssignment.id,
                      resident: { name: currentAssignment.residentName, id: currentAssignment.residentId },
                    })}
                  >
                    <Text style={[styles.buttonText, styles.notSafeText]}>Mark Not Safe</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AlertDetails', { alertId: currentAssignment.id })}>
                <Text style={styles.detailsText}>Tap for Full Details</Text>
                <FontAwesome5 name="caret-right" size={18} color="#245490" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.heading1}>Recent Incidents</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AuditLogScreen')}>
            <Text style={styles.heading2}>View All <FontAwesome5 name="caret-right" size={14} color="#666" /></Text>
          </TouchableOpacity>
        </View>

        {alerts.slice(0, 2).map((alert) => (
          <TouchableOpacity key={alert.id} style={[styles.headCard, styles.shadow]} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
            <View style={styles.headCardTextWrap}>
              <Text style={styles.headCardTitle}>{alert.residentName}</Text>
              <Text style={styles.headCardSubtitle}>{alert.residentType} • {alert.location}</Text>
            </View>
          </TouchableOpacity>
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
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 10, paddingBottom: 25 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 2 },
  roleLine: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#a83232', marginBottom: 14 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 14 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#a83232', marginTop: 12, marginBottom: 8 },
  heading1Dark: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#111', marginBottom: 3 },
  heading2: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 15, marginBottom: 4 },
  shadow: { shadowColor: '#625350', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 8 },

  emptyWrap: { alignItems: 'center', paddingVertical: 55, paddingHorizontal: 20 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#e8f8ea', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 19, fontFamily: 'Poppins_700Bold', color: '#288928', textAlign: 'center', marginBottom: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', lineHeight: 23, marginBottom: 8 },

  alertCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 8 },
  alertCardActive: { borderColor: '#a83232', shadowColor: '#a83232', shadowRadius: 8 },
  alertCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  alertCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
  alertOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  alertEscalated: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  alertTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginLeft: 8, marginBottom: 9 },
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7f7', borderWidth: 1, borderColor: '#f0cccc', borderRadius: 10, padding: 11, marginBottom: 10 },
  locationLabel: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: '#888', marginLeft: 10 },
  locationText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#333', marginLeft: 10, marginTop: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 },
  statusText: { flex: 1, textAlign: 'center', fontSize: 11, fontFamily: 'Poppins_500Medium', borderRadius: 10, paddingVertical: 5, paddingHorizontal: 6, marginHorizontal: 3, borderWidth: 1 },
  statusPending: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1' },
  statusClosed: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa' },
  statusEscalated: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 10 },
  buttonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa', marginRight: 6 },
  buttonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1', marginLeft: 6 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 14, fontFamily: 'Poppins_500Medium' },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },
  detailsButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#245490', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#d3e5f8' },
  detailsText: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: '#245490' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 7, backgroundColor: '#fff' },
  headCardTextWrap: { flex: 1 },
  headCardTitle: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  headCardSubtitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#666' },
});