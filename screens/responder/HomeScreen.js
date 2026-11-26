import { alertLayout, colors, typography, spacing } from '../../constants/theme';
import { alertStageLabel } from '../../utils/models';
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Avatar from "../../components/Avatar";
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar from "../../components/tabs/ResponderTabButtons";
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppData } from "../../contexts/AppDataContext";
import ReasonPromptModal from "../../components/modals/ReasonPromptModal";

export default function HomeScreen({ navigation }) {
  const { alerts, account, respondToAssignment, myPhotoUrl } = useAppData();
  const [responding, setResponding] = useState(false);
  const [declinePrompt, setDeclinePrompt] = useState(false);

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

  async function respond(decision, reason = null) {
    if (responding || !respondToAssignment) return;
    setResponding(true);
    try {
      await respondToAssignment(currentAssignment.id, decision, reason);
      setDeclinePrompt(false);
    } catch (error) {
      Alert.alert('Could not update assignment', error.message);
    } finally {
      setResponding(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
          <Avatar uri={myPhotoUrl} name={account.fullName} style={styles.photo} />
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
            <FontAwesome5 name="check-circle" size={24} color={colors.successInk} />
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
                  <FontAwesome5 name="map-marker-alt" size={14} color={colors.primary} />
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

              {currentAssignment.assignment_status === 'pending_acceptance' && respondToAssignment ? (
                <>
                  <Text style={styles.actionLabel}>Accept the assignment before recording safety observations or submitting a report.</Text>
                  <View style={styles.buttonWrap}>
                    <TouchableOpacity style={[styles.button, styles.buttonSafe, responding && styles.buttonDisabled]} disabled={responding}
                      accessibilityRole="button" onPress={() => respond('accepted')}>
                      <Text style={[styles.buttonText, styles.safeText]}>{responding ? 'Saving…' : 'Accept'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.buttonNotSafe, responding && styles.buttonDisabled]} disabled={responding}
                      accessibilityRole="button" onPress={() => setDeclinePrompt(true)}>
                      <Text style={[styles.buttonText, styles.notSafeText]}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : currentAssignment.status !== 'closed' && (
                <View style={styles.buttonWrap}>
                  {['Safe', 'Not Safe'].map((decision) => {
                    const recorded = currentAssignment.responderStatus === decision;
                    return (
                      <TouchableOpacity key={decision}
                        style={[styles.button, decision === 'Safe' ? styles.buttonSafe : styles.buttonNotSafe, recorded && styles.buttonDisabled]}
                        disabled={recorded} accessibilityRole="button" accessibilityState={{ disabled: recorded }}
                        onPress={() => navigation.navigate('ConfirmationScreen', {
                          status: decision,
                          alertId: currentAssignment.id,
                          resident: { name: currentAssignment.residentName, id: currentAssignment.residentId },
                        })}
                      >
                        <Text style={[styles.buttonText, decision === 'Safe' ? styles.safeText : styles.notSafeText]}>{recorded ? `${decision} recorded` : `Mark ${decision}`}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              <ReasonPromptModal visible={declinePrompt} title="Why are you declining this assignment?"
                placeholder="Record why you cannot take this case" confirmLabel="Decline Assignment" submitting={responding}
                onCancel={() => setDeclinePrompt(false)} onSubmit={(reason) => respond('declined', reason)} />

              <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AlertDetails', { alertId: currentAssignment.id })}>
                <Text style={styles.detailsText}>Tap for Full Details</Text>
                <FontAwesome5 name="caret-right" size={18} color={colors.primary} />
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
  if (status === 'closed') return colors.successSoft;
  if (status === 'escalated') return colors.alertSoft;
  if (status === 'pending') return colors.warningSoft;
  return colors.primarySoft;
}

function statusColor(status) {
  if (status === 'closed') return colors.successInk;
  if (status === 'escalated') return colors.alertInk;
  if (status === 'pending') return colors.warningInk;
  return colors.primary;
}

const styles = StyleSheet.create({
  emptyCard: { alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 22 },
  container: { flex: 1, backgroundColor: colors.background }, 
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 }, 
  scrollView: { flex: 1 }, scrollContent: { padding: spacing.screen, paddingTop: 0 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 10 },
  photo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.8, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 13 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4, marginBottom: 0 }, 
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginLeft: 0, marginTop: 8, marginBottom: 6},
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textSecondary }, 
  roleLine: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: colors.primary, marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 }, 

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary, marginTop: 12, marginBottom: 10 },
  overviewTitle: { marginTop: 10, marginBottom: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 }, 
  viewAll: { color: colors.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: typography.caption }, 

  confirmations: { flexDirection: 'row', gap: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 12 },
  confirmationColumn: { flex: 1, borderRadius: 8, borderWidth: 1, padding: 8, alignItems: 'center' },
  confirmationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  confirmationValue: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary, marginTop: 2 },
  actionLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, marginBottom: 8 },
  confirmButton: { flex: 1, minHeight: 48, padding: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  safeButton: { backgroundColor: colors.successSoft, borderColor: colors.successInk },
  notSafeButton: { backgroundColor: colors.alertSoft, borderColor: colors.alertInk },
  recordedButton: { opacity: 0.5 },
  confirmButtonText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textPrimary, textAlign: 'center' },

  heading1Dark: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary, marginBottom: 6 },
  heading2: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, marginTop: 15, marginBottom: 4 },
  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

  emptyWrap: { alignItems: 'center', paddingVertical: 55, paddingHorizontal: 20 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: colors.successInk, textAlign: 'center', marginBottom: 12 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, textAlign: 'center', lineHeight: Math.ceil(typography.detail * 1.5), marginBottom: 8 },
  headCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: colors.surface , ...alertLayout.card }, 
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginTop: -10, marginBottom: -10 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: colors.border, marginVertical: 8 },
  activityIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, 
  activityTitle: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' }, 
  activityDetail: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }, 
  activityTime: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  emptyListText: { fontSize: typography.body, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginBottom: 10, textAlign: 'center' },

  alertCard: { flexDirection: 'column', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, ...alertLayout.card },
  alertCardActive: { borderColor: colors.alert, shadowColor: colors.alert, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  alertCardTextWrap: { flexWrap: 'wrap', gap: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, ...alertLayout.headerRow },
  alertCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' },  alertOpen: { color: colors.alertInk, backgroundColor: colors.alertSoft },
  alertPending: { color: colors.warningInk, backgroundColor: colors.warningSoft },
  alertEscalated: { color: colors.alertInk, backgroundColor: colors.alertSoft },
  alertClosed: { color: colors.successInk, backgroundColor: colors.successSoft },
  alertTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: colors.textSecondary },
  alertSubtitle: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', marginBottom: 9 },
  time: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: colors.textSecondary },
  typeText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.primary, marginLeft: 0, marginBottom: 4},
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: 10, padding: 10, marginBottom: 8, ...alertLayout.location },
  locationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, marginLeft: 10 },
  locationText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textPrimary, marginLeft: 10, marginTop: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 8},
  statusText: { flex: 1, textAlign: 'center', fontSize: typography.caption, fontFamily: 'Poppins_500Medium', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginHorizontal: 4, borderWidth: 1 },
  waiting: { color: colors.warningInk, borderColor: colors.warningInk, backgroundColor: colors.warningSoft }, 
  safe: { color: colors.successInk, borderColor: colors.successInk, backgroundColor: colors.successSoft }, 
  notSafe: { color: colors.alertInk, borderColor: colors.alertInk, backgroundColor: colors.alertSoft },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 10 , minHeight: spacing.control, justifyContent: 'center' },
  buttonSafe: { borderColor: colors.successInk, backgroundColor: colors.successSoft, marginRight: 6 },
  buttonNotSafe: { borderColor: colors.alertInk, backgroundColor: colors.alertSoft, marginLeft: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  safeText: { color: colors.successInk },
  notSafeText: { color: colors.alertInk },
  detailsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.primary, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: colors.primarySoft , minHeight: spacing.control , ...alertLayout.details },
  detailsText: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: colors.primary },
});