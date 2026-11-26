import { alertLayout, colors, typography, spacing } from '../../constants/theme';
import Avatar from "../../components/Avatar";
import { alertStageLabel } from '../../utils/models';
import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/TabButtons";
import ReasonPromptModal from "../../components/modals/ReasonPromptModal";
import { Divider } from "../../components/ui";
import { useAppData } from "../../contexts/AppDataContext";
import LiveLocationMap from "../../components/LiveLocationMap";

export default function AlertDetails({ route, navigation }) {
  const { alerts, account, closeIncident, markGuardianUnreachable } = useAppData();
  const [closing, setClosing] = useState(false);
  const [showCloseReason, setShowCloseReason] = useState(false);
  const [showUnreachableModal, setShowUnreachableModal] = useState(false);
  const [markingUnreachable, setMarkingUnreachable] = useState(false);
  const alert = alerts.find((item) => item.id === (route.params?.alertId || route.params?.incidentId));
  if (!alert) return <SafeAreaView style={styles.container}><Text onPress={() => navigation.goBack()}>‹ Back</Text><Text>Alert not found. Return to the alert list and refresh.</Text></SafeAreaView>;

  const guardianPending = alert.status !== 'closed' && !alert.officialReviewRequired && alert.guardianStatus === 'Waiting';

  const submitGuardianUnreachable = async (reason) => {
    setMarkingUnreachable(true);
    try {
      await markGuardianUnreachable(alert.id, reason);
      setShowUnreachableModal(false);
    } catch (error) {
      Alert.alert('Could not mark guardian unreachable', error.message);
    } finally {
      setMarkingUnreachable(false);
    }
  };

  const submitClosure = async (reason) => {
    setClosing(true);
    try { await closeIncident(alert.id, reason); setShowCloseReason(false); }
    catch (error) { Alert.alert('Could not close alert', error.message); }
    finally { setClosing(false); }
  };

  const statusLabel = alertStageLabel(alert.status);
  const statusStyle = alert.status === 'closed' ? styles.closed : alert.status === 'pending' ? styles.pending : styles.danger;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        
        <View style={[styles.residentCard, styles.shadow]}>
          <Avatar uri={alert.residentPhotoUrl} name={alert.residentName} style={styles.residentPhoto} />
          <View style={{ flex: 1, margin: 0 }}>
            <Text style={styles.contextTitle}>{alert.residentName}</Text>
            <Text style={styles.small}>Type: {alert.residentType}</Text>
            <Text style={styles.small}>ID Number: {alert.residentId}</Text>
          </View>
        </View>

        <View style={styles.statusHeader}>
          <Text style={[styles.statusPill, statusStyle]}>{statusLabel}</Text>
          <Text style={styles.time}>{alert.scannedAt}</Text>
        </View>
        <View style={styles.divider} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.section}>Incident Location</Text>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <FontAwesome5 name="map-marker-alt" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{alert.location}</Text>
              {alert.liveLocationNote ? <Text style={styles.small}>{alert.liveLocationNote}</Text> : null}
                <Text style={styles.small}>Location where the QR code was scanned</Text>
              </View>
          </View>
          {alert.mapLatitude != null && alert.mapLongitude != null && <TouchableOpacity style={styles.mapButton} onPress={async () => { if (alert.mapLatitude == null || alert.mapLongitude == null) { Alert.alert('Location unavailable', 'No coordinates were recorded for this incident.'); return; } 
          try { await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${alert.mapLatitude},${alert.mapLongitude}`); } catch { Alert.alert('Could not open map'); } }}><Text style={styles.mapText}>View Location</Text></TouchableOpacity>}
          <LiveLocationMap alert={alert} />
        </View>
        
        <Text style={styles.section}>Scanned By</Text>
        <View style={styles.card}><View style={styles.iconRow}>
          <Image source={require("../../assets/profile.png")} style={styles.smallPhoto} />
          <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{alert.scannedBy}</Text>
            <Text style={styles.small}>QR scan initiated the alert</Text>
          </View>
        </View></View>
        
        <Text style={styles.section}>Bystander Note</Text>
        <View style={styles.card}><Text style={styles.note}>{alert.bystanderNote || 'No note was submitted by the bystander.'}</Text></View>
        
        <Text style={styles.section}>Responder Assignment</Text>
        <View style={styles.card}>
          {alert.responderName ? (
            <View style={styles.iconRow}><Avatar uri={alert.responderPhotoUrl} name={alert.responderName} style={styles.smallPhoto} />
            <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{alert.responderName}</Text>
              <Text style={styles.small}>Barangay Responder</Text>
              <Text style={styles.assigned}>Assigned</Text>
              {alert.status !== 'closed' && <TouchableOpacity style={styles.assignButton} onPress={() => navigation.navigate('AssignResponder', { alertId: alert.id })}>
                <Text style={styles.assignText}>Reassign Responder</Text>
              </TouchableOpacity>}
          </View></View>
          ) : (
            <><Text style={styles.cardTitle}>No responder assigned</Text>
              <Text style={styles.small}>This open alert is waiting for assignment.</Text>
              {alert.status !== 'closed' && <TouchableOpacity style={styles.assignButton} onPress={() => navigation.navigate('AssignResponder', { alertId: alert.id })}>
                <Text style={styles.assignText}>Assign Responder</Text>
              </TouchableOpacity>}
            </>
          )}
        </View>

        <Text style={styles.section}>Confirmation Status</Text>
        {alert.hasDiscrepancy && (
          <View style={styles.discrepancyCard}>
            <FontAwesome5 name="exclamation-triangle" size={16} color={colors.alertInk} />
            <View style={{ flex: 1, marginLeft: 9 }}>
              <Text style={styles.escalationTitle}>Guardian and Responder Disagree</Text>
              <Text style={styles.small}>One says Safe, the other says Not Safe. Verify directly before this alert closes.</Text>
            </View>
          </View>
        )}
        <View style={styles.confirmCard}>
          <Confirmation label="Guardian" value={alert.guardianStatus} />
          <Divider />
          <Confirmation label="Responder" value={alert.responderName ? alert.responderStatus : 'Waiting'} />
          {alert.guardianUnreachableReason ? <Text style={[styles.small, { marginTop: 10 }]}>Guardian unreachable{alert.guardianUnreachableBySystem ? ' (auto-flagged after grace period)' : ''}: {alert.guardianUnreachableReason}</Text> : null}
          {alert.responderUnreachableReason ? <Text style={[styles.small, { marginTop: 10 }]}>Responder reported unable to reach location: {alert.responderUnreachableReason}</Text> : null}
          {guardianPending && (
            <TouchableOpacity style={styles.unreachableButton} onPress={() => setShowUnreachableModal(true)}>
              <Text style={styles.unreachableText}>Mark Guardian Unreachable</Text>
            </TouchableOpacity>
          )}
        </View>

        <ReasonPromptModal
          visible={showUnreachableModal}
          title="Why is the guardian unreachable?"
          placeholder="e.g. called three times over 20 minutes, no answer"
          confirmLabel="Mark Unreachable"
          submitting={markingUnreachable}
          onCancel={() => setShowUnreachableModal(false)}
          onSubmit={submitGuardianUnreachable}
        />

        <ReasonPromptModal visible={showCloseReason} title="Why is this case being closed?"
          placeholder="Record the official's closure decision" confirmLabel="Review & Close" submitting={closing}
          onCancel={() => setShowCloseReason(false)} onSubmit={submitClosure} />

        {alert.incidentReport && <><Text style={styles.section}>Responder Report</Text><View style={styles.card}><Text style={styles.note}>{alert.incidentReport}</Text></View></>}
        {(alert.officialReviewRequired || account?.role === 'barangay_official') && <>
          <Text style={styles.section}>Official Review</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{alert.backendStatus === 'closed' ? 'Approved' : alert.status === 'closed' ? 'Inactive' : 'Pending review'}</Text>
            <Text style={styles.small}>{alert.status === 'closed' ? 'This incident has been closed.' : alert.readyForReview ? 'Review the responder’s report and Safe confirmation before closing.' : 'Waiting for the assigned responder’s Safe confirmation and report. Not Safe concerns must be resolved.'}</Text>
            {alert.status !== 'closed' && <TouchableOpacity accessibilityRole="button" disabled={!alert.readyForReview || closing} style={[styles.mapButton, (!alert.readyForReview || closing) && { opacity: 0.5 }]} onPress={() => setShowCloseReason(true)}><Text style={styles.mapText}>{closing ? 'Closing…' : 'Review & Close'}</Text></TouchableOpacity>}
          </View>
        </>}

        {alert.status === 'escalated' && <View style={styles.escalationCard}>
          <FontAwesome5 name="exclamation-triangle" size={20} color={colors.alertInk} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.escalationTitle}>Alert Escalated</Text>
            <Text style={styles.small}>{alert.escalationReason || 'Further response is required.'}</Text>
          </View></View>}
        
        {alert.status === 'closed' && <View style={styles.closedCard}>
          <FontAwesome5 name="check-circle" size={20} color={colors.successInk} />
          <Text style={styles.closedText}>{alert.cancelledReason ? 'Cancelled by the bystander who raised it — likely a false alarm.' : 'This incident is no longer active.'}</Text>
        </View>}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function Confirmation({ label, value }) {
  const safe = value === 'Safe'; const notSafe = value === 'Not Safe';
  return <View style={styles.confirmRow}><Text style={styles.confirmLabel}>{label}</Text><Text style={[styles.confirmPill, safe ? styles.safe : notSafe ? styles.notSafe : styles.waiting]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, 
  content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 4 }, 
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 30 }, 
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.primary, marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4},
  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 12, backgroundColor: colors.primarySoft, padding: spacing.card, marginBottom: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 11 },
  small: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 2 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 }, 

  statusHeader: { flexWrap: 'wrap', gap: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 , ...alertLayout.headerRow }, 
  statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, 
  danger: { color: colors.alertInk, backgroundColor: colors.alertSoft }, 
  pending: { color: colors.warningInk, backgroundColor: colors.warningSoft }, 
  closed: { color: colors.successInk, backgroundColor: colors.successSoft }, 
  time: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }, 
  section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 }, 
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card }, 
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, smallPhoto: { width: 45, height: 45, borderRadius: 23, backgroundColor: colors.border }, 
  cardTitle: { fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' }, 
  note: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', lineHeight: Math.ceil(typography.caption * 1.5) }, 
  mapButton: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 8, paddingVertical: 7, alignItems: 'center', marginTop: 10 }, 
  mapText: { color: colors.primary, fontFamily: 'Poppins_500Medium', fontSize: typography.caption },
  assigned: { color: colors.successInk, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', marginTop: 3 }, 
  assignButton: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 9, paddingVertical: 9, alignItems: 'center', marginTop: 10 }, 
  assignText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption }, 
  
  confirmCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, paddingVertical: 6, paddingBottom: 10, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card }, 
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }, 
  confirmLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium' }, 
  confirmPill: { minWidth: 90, textAlign: 'center', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, 
  waiting: { color: colors.warningInk, backgroundColor: colors.warningSoft }, 
  safe: { color: colors.successInk, backgroundColor: colors.successSoft }, 
  notSafe: { color: colors.alertInk, backgroundColor: colors.alertSoft }, 
  
  escalationCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.alertInk, backgroundColor: colors.alertSoft, borderRadius: 12, padding: 13, marginTop: 15 }, 
  escalationTitle: { fontSize: typography.detail, color: colors.alertInk, fontFamily: 'Poppins_600SemiBold' }, 
  discrepancyCard: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: colors.alertBorder, backgroundColor: colors.alertSoft, borderRadius: 12, padding: 12, marginBottom: 8 }, 
  unreachableButton: { borderWidth: 1, borderColor: colors.alertInk, backgroundColor: colors.alertSoft, borderRadius: 9, paddingVertical: 9, alignItems: 'center', marginTop: 12 }, 
  unreachableText: { color: colors.alertInk, fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption }, 
  closedCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.successInk, backgroundColor: colors.successSoft, borderRadius: 12, padding: 13, marginTop: 15 }, 
  closedText: { flex: 1, marginLeft: 10, color: colors.successInk, fontFamily: 'Poppins_500Medium', fontSize: typography.caption },
});
