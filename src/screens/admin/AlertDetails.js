import { alertLayout } from '../../theme';
import { typography, spacing } from '../../theme';
import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../components/TabButtons';
import ReasonPromptModal from '../../components/ReasonPromptModal';
import { useAppData } from '../../context/AppDataContext';

export default function AlertDetails({ route, navigation }) {
  const { alerts, account, closeIncident, markGuardianUnreachable } = useAppData();
  const [closing, setClosing] = useState(false);
  const [showUnreachableModal, setShowUnreachableModal] = useState(false);
  const [markingUnreachable, setMarkingUnreachable] = useState(false);
  const alert = alerts.find((item) => item.id === (route.params?.alertId || route.params?.incidentId));
  if (!alert) return <SafeAreaView style={styles.container}><Text onPress={() => navigation.goBack()}>‹ Back</Text><Text>Alert not found. Return to the alert list and refresh.</Text></SafeAreaView>;

  const guardianPending = alert.status !== 'closed' && !alert.officialReviewRequired && alert.guardianStatus === 'Pending';

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

  const statusLabel = alert.status === 'open' ? 'Open Alert' : alert.status === 'pending' ? 'Pending Confirmation' : alert.status === 'escalated' ? 'Escalated' : 'Closed';
  const statusStyle = alert.status === 'closed' ? styles.closed : alert.status === 'pending' ? styles.pending : styles.danger;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}><Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileBar}>
          <Image source={require('../../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{alert.residentName}</Text>
            <Text style={styles.meta}>{alert.residentType}</Text>
            {alert.residentCode ? <Text style={styles.meta}>Card: {alert.residentCode}</Text> : null}
          </View>
        </View>

        <View style={styles.statusHeader}><Text style={[styles.statusPill, statusStyle]}>{statusLabel}</Text><Text style={styles.time}>{alert.scannedAt}</Text></View>

        <Text style={styles.section}>Incident Location</Text>
        <View style={styles.card}>
          <View style={styles.iconRow}><FontAwesome5 name="map-marker-alt" size={18} color="#a83232" /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{alert.location}</Text><Text style={styles.small}>Location where the QR code was scanned</Text></View></View>
          {alert.scan_latitude != null && alert.scan_longitude != null && <TouchableOpacity style={styles.mapButton} onPress={async () => { if (alert.scan_latitude == null || alert.scan_longitude == null) { Alert.alert('Location unavailable', 'No coordinates were recorded for this incident.'); return; } try { await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${alert.scan_latitude},${alert.scan_longitude}`); } catch { Alert.alert('Could not open map'); } }}><Text style={styles.mapText}>View Location</Text></TouchableOpacity>}
        </View>

        <Text style={styles.section}>Scanned By</Text>
        <View style={styles.card}><View style={styles.iconRow}><Image source={require('../../../assets/profile.png')} style={styles.smallPhoto} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{alert.scannedBy}</Text><Text style={styles.small}>QR scan initiated the alert</Text></View></View></View>

        <Text style={styles.section}>Bystander Note</Text>
        <View style={styles.card}><Text style={styles.note}>{alert.bystanderNote || 'No note was submitted by the bystander.'}</Text></View>

        <Text style={styles.section}>Responder Assignment</Text>
        <View style={styles.card}>
          {alert.responderName ? (
            <View style={styles.iconRow}><Image source={require('../../../assets/profile.png')} style={styles.smallPhoto} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{alert.responderName}</Text><Text style={styles.small}>Barangay Responder</Text><Text style={styles.assigned}>Assigned</Text></View></View>
          ) : (
            <><Text style={styles.cardTitle}>No responder assigned</Text><Text style={styles.small}>This open alert is waiting for assignment.</Text><TouchableOpacity style={styles.assignButton} onPress={() => navigation.navigate('AssignResponder', { alertId: alert.id })}><Text style={styles.assignText}>Assign Responder</Text></TouchableOpacity></>
          )}
        </View>

        <Text style={styles.section}>Confirmation Status</Text>
        {alert.hasDiscrepancy && (
          <View style={styles.discrepancyCard}>
            <FontAwesome5 name="exclamation-triangle" size={16} color="#a83232" />
            <View style={{ flex: 1, marginLeft: 9 }}>
              <Text style={styles.escalationTitle}>Guardian and Responder Disagree</Text>
              <Text style={styles.small}>One says Safe, the other says Not Safe. Verify directly before this alert closes.</Text>
            </View>
          </View>
        )}
        <View style={styles.confirmCard}>
          <Confirmation label="Guardian" value={alert.guardianStatus} />
          <Confirmation label="Responder" value={alert.responderName ? alert.responderStatus : 'Waiting'} />
          {alert.guardianUnreachableReason ? <Text style={[styles.small, { marginTop: 8 }]}>Guardian unreachable{alert.guardianUnreachableBySystem ? ' (auto-flagged after grace period)' : ''}: {alert.guardianUnreachableReason}</Text> : null}
          {alert.responderUnreachableReason ? <Text style={[styles.small, { marginTop: 6 }]}>Responder reported unable to reach location: {alert.responderUnreachableReason}</Text> : null}
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

        {alert.incidentReport && <><Text style={styles.section}>Responder Report</Text><View style={styles.card}><Text style={styles.note}>{alert.incidentReport}</Text></View></>}
        {alert.officialReviewRequired && <>
          <Text style={styles.section}>Official Review</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{alert.status === 'closed' ? 'Approved' : 'Pending review'}</Text>
            <Text style={styles.small}>{alert.status === 'closed' ? 'This incident has been closed.' : alert.readyForReview ? 'Review the responder’s report and Safe confirmation before closing.' : 'Waiting for the assigned responder’s Safe confirmation and report. Not Safe concerns must be resolved.'}</Text>
            {alert.status !== 'closed' && <TouchableOpacity accessibilityRole="button" disabled={!alert.readyForReview || closing} style={[styles.mapButton, (!alert.readyForReview || closing) && { opacity: 0.5 }]} onPress={() => Alert.alert('Close this alert?', 'Confirm that you reviewed the responder’s report and safety confirmation.', [
              { text: 'Cancel', style: 'cancel' }, { text: 'Review & Close', onPress: async () => {
                setClosing(true);
                try { await closeIncident(alert.id); } catch (error) { Alert.alert('Could not close alert', error.message); }
                finally { setClosing(false); }
              } },
            ])}><Text style={styles.mapText}>{closing ? 'Closing…' : 'Review & Close'}</Text></TouchableOpacity>}
          </View>
        </>}

        {alert.status === 'escalated' && <View style={styles.escalationCard}><FontAwesome5 name="exclamation-triangle" size={20} color="#a83232" /><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.escalationTitle}>Alert Escalated</Text><Text style={styles.small}>{alert.escalationReason || 'Further response is required.'}</Text></View></View>}
        {alert.status === 'closed' && <View style={styles.closedCard}><FontAwesome5 name="check-circle" size={20} color="#288928" /><Text style={styles.closedText}>{alert.cancelledReason ? 'Cancelled by the bystander who raised it — likely a false alarm.' : 'This incident is no longer active.'}</Text></View>}
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
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 4 }, scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 30 }, back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4},
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, profilePhoto: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 13 }, profileTextWrap: { flex: 1 }, name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' }, meta: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, statusHeader: { flexWrap: 'wrap', gap: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 , ...alertLayout.headerRow }, statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, danger: { color: '#a83232', backgroundColor: '#fbd1d1' }, pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, closed: { color: '#288928', backgroundColor: '#a1fbaa' }, time: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular' }, section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 }, card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card }, iconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, smallPhoto: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#ddd' }, cardTitle: { fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' }, small: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular', marginTop: 2 }, note: { fontSize: typography.caption, color: '#555', fontFamily: 'Poppins_400Regular', lineHeight: Math.ceil(typography.caption * 1.5) }, mapButton: { borderWidth: 1, borderColor: '#245490', backgroundColor: '#d3e5f8', borderRadius: 8, paddingVertical: 7, alignItems: 'center', marginTop: 10 }, mapText: { color: '#245490', fontFamily: 'Poppins_500Medium', fontSize: typography.caption }, assigned: { color: '#288928', fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', marginTop: 3 }, assignButton: { borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ffdcdc', borderRadius: 9, paddingVertical: 9, alignItems: 'center', marginTop: 10 }, assignText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption }, confirmCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card }, confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }, confirmLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium' }, confirmPill: { minWidth: 90, textAlign: 'center', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, waiting: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, safe: { color: '#288928', backgroundColor: '#a1fbaa' }, notSafe: { color: '#a83232', backgroundColor: '#fbd1d1' }, escalationCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a83232', backgroundColor: '#fff5f5', borderRadius: 12, padding: 13, marginTop: 15 }, escalationTitle: { fontSize: typography.detail, color: '#a83232', fontFamily: 'Poppins_600SemiBold' }, discrepancyCard: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: '#e3b1b1', backgroundColor: '#fff1f1', borderRadius: 12, padding: 12, marginBottom: 8 }, unreachableButton: { borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ffdcdc', borderRadius: 9, paddingVertical: 9, alignItems: 'center', marginTop: 12 }, unreachableText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption }, closedCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#288928', backgroundColor: '#f2fff2', borderRadius: 12, padding: 13, marginTop: 15 }, closedText: { flex: 1, marginLeft: 10, color: '#288928', fontFamily: 'Poppins_500Medium', fontSize: typography.caption },
});
