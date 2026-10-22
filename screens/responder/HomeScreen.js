import { alertLayout } from '../../theme';
import { typography, spacing, colors } from '../../theme';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar from "../../component/ResponderTabButtons";
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppData } from "../../lib/AppDataContext";

export default function HomeScreen({ navigation }) {
  const { alerts, account } = useAppData();

  const myAssignments = useMemo(
    () => alerts.filter((alert) => alert.responderId === account.id && alert.status !== 'closed'),
    [alerts, account.id]
  );

const recentIncidents = useMemo(
  () => alerts
    .filter((alert) => alert.responderId === account.id)
    .slice(0, 3),
  [alerts, account.id]
);

  const currentAssignment = myAssignments[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
          <Image source={require("../../assets/profile.png")} style={styles.photo} accessible={false} />
          <View style={{ flex: 1, marginTop: 3 }}>
            <Text style={styles.subheading}>Welcome, {account.fullName}</Text>
            <Text style={styles.roleLine}>{'Barangay Responder'} • {account.barangayName}</Text>
          </View>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {!currentAssignment ? (
          <View style={styles.emptyCard}>
            <FontAwesome5 name="check-circle" size={24} color="#288928" />
            <Text style={styles.emptyTitle}>No active alerts</Text>
            <Text style={styles.emptyText}>You currently have no emergency task assigned.</Text>
            <Text style={styles.emptyText}>You may scan a resident's QR code, if needed.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, styles.overviewTitle]}>Current Assignment</Text>
            </View>            
            <View style={[styles.alertCard, styles.alertCardActive]}>
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, statusStyle(currentAssignment.status)]}>
                  {currentAssignment.status === 'escalated' ? 'Alert Escalated'
                    : currentAssignment.status === 'closed' ? 'Alert Closed'
                    : currentAssignment.status === 'pending' ? 'Alert Pending'
                    : 'Open Alert'}
                </Text>
                <Text style={styles.alertTime}>{currentAssignment.scannedAt}</Text>
              </View>

              <Text style={styles.heading1}>{currentAssignment.residentName}</Text>
              <Text style={styles.typeText}>{currentAssignment.residentType}</Text>
              <Text style={styles.alertSubtitle}>Scanned by {currentAssignment.scannedBy || 'a Bystander'}</Text>

              {currentAssignment.location ? (
                <View style={styles.locationBox}>
                  <FontAwesome5 name="map-marker-alt" size={14} color="#a83232" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationLabel}>QR scanned at</Text>
                    <Text style={styles.locationText}>{currentAssignment.location}</Text>
                  </View>
                </View>
              ) : null}

              {currentAssignment.bystanderNote ? (
                <Text style={styles.alertSubtitle}>Note: {currentAssignment.bystanderNote}</Text>
              ) : null}

              <View style={styles.statusRow}>
                <Text style={[styles.statusText, currentAssignment.guardianStatus === 'Not Safe' ? styles.notSafe : currentAssignment.guardianStatus === 'Safe' ? styles.safe : styles.waiting]}>Guardian: {'\n'}{currentAssignment.guardianStatus}</Text>
                <Text style={[styles.statusText, currentAssignment.responderStatus === 'Not Safe' ? styles.notSafe : currentAssignment.responderStatus === 'Safe' ? styles.safe : styles.waiting]}>Responder: {'\n'}{currentAssignment.responderStatus !== 'Pending' ? currentAssignment.responderStatus: currentAssignment.responderName ? 'Assigned': 'Waiting'}</Text>
              </View>

              {currentAssignment.status !== 'closed' && (
                <View style={styles.buttonWrap}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonSafe,
                      currentAssignment.responderStatus === 'Safe' && styles.buttonDisabled,
                    ]}
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
                    style={[
                      styles.button,
                      styles.buttonNotSafe,
                      currentAssignment.responderStatus === 'Not Safe' && styles.buttonDisabled,
                    ]}
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
          <Text style={styles.sectionTitle}>Recent Incidents</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AuditLogScreen')}><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity>
        </View>

        {recentIncidents.length === 0 ? (
          <Text style={styles.emptyListText}>No recent incidents yet.</Text>
        ) : (
          <View style={[styles.headCard, styles.shadow]}>
            {recentIncidents.map((incident, index) => (
              <React.Fragment key={incident.id}>
                <TouchableOpacity
                  style={styles.activityRow}
                  onPress={() => navigation.navigate('AlertDetails', { alertId: incident.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.activityIcon, { backgroundColor: statusBg(incident.status) }]}>
                    <FontAwesome5
                      name={
                        incident.status === 'closed' ? 'check'
                        : incident.status === 'escalated' ? 'exclamation-triangle'
                        : incident.status === 'pending' ? 'clock'
                        : 'bell'
                      }
                      size={13}
                      color={statusColor(incident.status)}
                    />
                  </View>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <Text style={styles.activityTitle}>{incident.residentName}</Text>
                    <Text style={styles.activityDetail}>
                      {incident.residentType} • {incident.location}
                    </Text>
                    <Text style={styles.activityDetail}>
                      {incident.status === 'closed' ? 'Resolved'
                        : incident.status === 'escalated' ? 'Escalated'
                        : incident.status === 'pending' ? 'Pending confirmation'
                        : 'Awaiting responder'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {index < recentIncidents.length - 1 && <View style={styles.activityDivider} />}
              </React.Fragment>
            ))}
          </View>
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

function statusBg(status) {
  if (status === 'closed') return '#a1fbaa';
  if (status === 'escalated') return '#fbd1d1';
  if (status === 'pending') return '#fbf1a1';
  return '#fbd1d1';
}

function statusColor(status) {
  if (status === 'closed') return '#288928';
  if (status === 'escalated') return '#a83232';
  if (status === 'pending') return '#8a6d1d';
  return '#a83232';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, 
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 }, 
  scrollView: { flex: 1 }, scrollContent: { padding: spacing.screen, paddingTop: 0 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 10 },
  photo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.8, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 13 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4, marginBottom: 0 }, 
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginLeft: 0, marginTop: 8, marginBottom: 6},
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666' }, 
  roleLine: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#a83232', marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 8 }, 

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#222', marginTop: 12, marginBottom: 10 },
  overviewTitle: { marginTop: 10, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 }, 
  viewAll: { color: '#666', fontFamily: 'Poppins_500Medium', fontSize: typography.caption }, 

  confirmations: { flexDirection: 'row', gap: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 12 },
  confirmationColumn: { flex: 1, borderRadius: 8, borderWidth: 1, padding: 8, alignItems: 'center' },
  confirmationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },
  confirmationValue: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', color: '#333', marginTop: 2 },
  actionLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 8 },
  confirmButton: { flex: 1, minHeight: 48, padding: 10, borderWidth: 1, borderColor: '#a83232', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  safeButton: { backgroundColor: '#a1fbaa', borderColor: '#288928' },
  notSafeButton: { backgroundColor: '#fbd1d1', borderColor: '#a83232' },
  recordedButton: { opacity: 0.5 },
  confirmButtonText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#333', textAlign: 'center' },

  heading1Dark: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#222', marginBottom: 6 },
  heading2: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 15, marginBottom: 4 },
  shadow: { shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

  emptyWrap: { alignItems: 'center', paddingVertical: 55, paddingHorizontal: 20 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#e8f8ea', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: '#288928', textAlign: 'center', marginBottom: 12 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', lineHeight: Math.ceil(typography.detail * 1.5), marginBottom: 8 },
  headCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: '#fff' , ...alertLayout.card }, 
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginTop: -10, marginBottom: -10 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: '#eee', marginVertical: 8 },
  activityIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ffdcdc', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, 
  activityTitle: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' }, 
  activityDetail: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular' }, 
  activityTime: { fontSize: typography.caption, color: '#888', fontFamily: 'Poppins_400Regular' },
  emptyListText: { fontSize: typography.body, color: '#888', fontFamily: 'Poppins_400Regular', marginBottom: 10, textAlign: 'center' },

  alertCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, ...alertLayout.card },
  alertCardActive: { borderColor: '#a83232', shadowColor: '#a83232', shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  alertCardTextWrap: { flexWrap: 'wrap', gap: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, ...alertLayout.headerRow },
  alertCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' },  alertOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  alertEscalated: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  alertTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', marginBottom: 9 },
  time: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  typeText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#245490', marginLeft: 0, marginBottom: 4},
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7f7', borderWidth: 1, borderColor: '#f0cccc', borderRadius: 10, padding: 10, marginBottom: 8, ...alertLayout.location },
  locationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#888', marginLeft: 10 },
  locationText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#333', marginLeft: 10, marginTop: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 8},
  statusText: { flex: 1, textAlign: 'center', fontSize: typography.caption, fontFamily: 'Poppins_500Medium', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginHorizontal: 4, borderWidth: 1 },
  waiting: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1' }, 
  safe: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa' }, 
  notSafe: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 10 , minHeight: spacing.control, justifyContent: 'center' },
  buttonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa', marginRight: 6 },
  buttonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1', marginLeft: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },
  detailsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#245490', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#d3e5f8' , minHeight: spacing.control , ...alertLayout.details },
  detailsText: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#245490' },
});