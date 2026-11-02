import { typography, spacing } from '../../theme';
import QRCode from 'react-native-qrcode-svg';
import useResidentProfile from "../../lib/useResidentProfile";
import ScreenState from "../../component/ScreenState";
import { api } from '../../lib/api';
import { mapResident } from '../../lib/models';
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from "../../lib/AppDataContext";
import TabBar from "../../component/TabButtons";
import IssueCardModal from "../../component/IssueCardModal";
import { Divider } from "../../component/ui";
import { FontAwesome5 } from '@expo/vector-icons';

export default function ProfileScreen({ route, navigation }) {
  const { residents, alerts, loading: contextLoading } = useAppData();
  const residentId = route.params?.residentId || route.params?.resident?.id;
  
  const resident = useMemo(
    () => residents.find((r) => r.id === residentId),
    [residents, residentId]
  );

  const { setResident, alerts: hookAlerts, loading: alertLoading, error, refresh } = useResidentProfile({ 
    params: { residentId, resident } 
  });
  
  const currentAlerts = hookAlerts || alerts;
  const residentAlerts = useMemo(
    () => resident ? currentAlerts.filter((alert) => alert.residentId === resident.id) : [],
    [currentAlerts, resident]
  );

  const [showQR, setShowQR] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Action handlers
  async function simulateAlert() {
    if (simulating) return;
    setSimulating(true);
    try {
      await api.createIncident({ residentId: resident.id, notes: 'Simulated alert (debug trigger)' });
      await refresh();
      Alert.alert('Test alert created', "A simulated alert was raised for this resident, as if their QR code had been scanned.");
    } catch (err) {
      Alert.alert('Could not create test alert', err.message || 'Please try again.');
    } finally {
      setSimulating(false);
    }
  }

  async function viewQR() {
    if (qrLoading) return;
    setQrLoading(true);
    try { setQrData(await api.generateQr({ residentId: resident.id })); setShowQR(true); }
    catch (err) { Alert.alert('Could not generate QR code', err.message); }
    finally { setQrLoading(false); }
  }

  const statusLabel = (status) => {
    if (status === 'escalated') return 'Escalated';
    if (status === 'pending') return 'Pending';
    if (status === 'closed') return 'Closed';
    return 'Open';
  };

  // Handle save from EditResidentScreen
  const handleSaveResident = async (draft) => {
    const row = await api.updateResident(resident.id, { 
      fullName: draft.name.trim(),
      homeAddress: draft.address, 
      ...(draft.birthDate ? { dateOfBirth: draft.birthDate } : {}) 
    });
    setResident({ ...resident, ...mapResident(row), guardianName: resident.guardianName, guardianContact: resident.guardianContact });
  };

  if (contextLoading || alertLoading || error || !resident) {
    return <ScreenState loading={contextLoading || alertLoading} error={error || (!resident ? 'Resident not found' : null)} onBack={() => navigation.goBack()} />;
  }

  if (showQR) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => setShowQR(false)}>‹ Back</Text>
          <Text style={styles.heading}>QRAlalay Card</Text>
        </View>
        <View style={styles.qrBox}>
          <QRCode value={qrData.publicScanUrl} size={240} />
          <Text style={styles.qrName}>{resident.name}</Text>
          <InfoRow label="Id Number" value={resident.code || resident.id} />
          <InfoRow label="Type" value={resident.type} />
          <InfoRow label="Guardian Name" value={resident.guardianName || 'Guardian: Not registered'} />
          <InfoRow label="Guardian Contact" value={resident.guardianContact || 'No guardian contact'} />
          <InfoRow label="Address" value={resident.address} />
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert('QR Card', 'You can scan this official QR code from the screen. File download is not available yet.')}>
          <Text style={styles.primaryButtonText}>Download / Print QR</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        
        <View style={[styles.residentCard, styles.shadow]}>
          <Image source={require("../../assets/profile.png")} style={styles.residentPhoto} />
          <View style={{ flex: 1, margin: 0 }}>
            <Text style={styles.contextTitle}>{resident.name}</Text>
            <Text style={styles.small}>Role: {resident.type || 'Resident'}</Text>
            <Text style={styles.small}>ID Number: {resident.id}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditResidentInfo', {resident: resident, onSave: handleSaveResident })}>
            <Text style={styles.editButtonText}>Edit Information</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrButton} disabled={qrLoading} onPress={() => qrData ? setShowQR(true) : setShowIssue(true)}>
            <Text style={styles.qrButtonText}>Issue QR Card</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Personal Information</Text>
        <View style={styles.card}>
          <InfoRow label="Full Name" value={resident.name} />
          <Divider />
          <InfoRow label="Date of Birth" value={resident.birthDate} />
          <Divider />
          <InfoRow label="Address" value={resident.address} />
        </View>

        <Text style={styles.section}>Guardian Information</Text>
        <View style={styles.card}>
          <InfoRow label="Guardian Name" value={resident.guardianName} />
          <Divider />
          <InfoRow label="Relationship" value={resident.relationship} />
          <Divider />
          <InfoRow label="Contact Number" value={resident.guardianContact} />
        </View>        
        
        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Debug tool</Text>
          <Text style={styles.debugText}>No public scan page is deployed yet. Use this to raise a real test alert for this resident and check that guardians, officials, and responders get notified.</Text>
          <TouchableOpacity style={styles.debugButton} disabled={simulating} onPress={() => Alert.alert('Simulate alert?', `Raise a test alert for ${resident.name} as if their QR code was scanned?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Simulate', onPress: simulateAlert }])}>
            <Text style={styles.debugButtonText}>{simulating ? 'Creating...' : 'Simulate Alert (Debug)'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>Scan History</Text>
        <View style={styles.card}>
          {residentAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No scan history available.</Text>
          ) : residentAlerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              <View style={styles.historyRow}>
                <View style={styles.historyTextWrap}>
                  <View style={styles.historyTopRow}>
                    <Text style={[styles.statusPill, alert.status === 'closed' ? styles.closed : styles.danger]}>
                      {statusLabel(alert.status)}
                    </Text>
                    <Text style={styles.historyTime}>{alert.scannedAt}</Text>
                  </View>
                  <Text style={styles.historyMeta}>QR scanned by {alert.scannedBy || 'a Bystander'}</Text>
                  <Text style={styles.historyMeta}>{alert.location || 'Location unavailable'}</Text>
                </View>
              </View>
              {index < residentAlerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.section}>Alert History</Text>
        <View style={styles.card}>
          {residentAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No alert history available.</Text>
          ) : residentAlerts.map((alert, index) => (
            <React.Fragment key={alert.id + '-alert'}>
              <TouchableOpacity 
                style={styles.historyRow}
                onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}
                activeOpacity={0.8}
              >
                <View style={styles.historyTextWrap}>
                  <View style={styles.historyTopRow}>
                    <Text style={[styles.statusPill, alert.status === 'closed' ? styles.closed : styles.danger]}>
                      {statusLabel(alert.status)}
                    </Text>
                    <Text style={styles.historyTime}>{alert.scannedAt}</Text>
                  </View>
                  <Text style={styles.historyMeta}>
                    {alert.status === 'escalated' ? alert.escalationReason 
                     : alert.status === 'closed' ? 'Both confirmations completed' 
                     : alert.status === 'open' ? 'Waiting for responder assignment' 
                     : 'Waiting for confirmation'}
                  </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={11} color="#999" />
              </TouchableOpacity>
              {index < residentAlerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <IssueCardModal
        visible={showIssue}
        submitting={qrLoading}
        onCancel={() => setShowIssue(false)}
        onConfirm={async () => { setShowIssue(false); await viewQR(); }}
      />
      <TabBar />
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingTop: 4, paddingBottom: 0 },
  scrollContent: { padding: spacing.screen, paddingTop: 4, paddingBottom: 30 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },

  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a83232', borderRadius: 12, backgroundColor: '#ffdcdc', padding: spacing.card, marginBottom: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 11 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  small: { fontSize: typography.caption, color: '#555', fontFamily: 'Poppins_400Regular', marginTop: 2 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 8 }, 

  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  editButton: { flex: 1, backgroundColor: '#d3e5f8', borderColor: '#245490', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', minHeight: 44 },
  editButtonText: { color: '#245490', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },
  qrButton: { flex: 1, backgroundColor: '#ffdcdc', borderColor: '#a83232', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  qrButtonText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },

  section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, paddingVertical: 4, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777' },
  infoValue: { flex: 1, textAlign: 'right', marginLeft: 15, fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#333' },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  historyTextWrap: { flex: 1 },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  danger: { color: '#a83232', backgroundColor: '#fbd1d1' },
  closed: { color: '#288928', backgroundColor: '#a1fbaa' },
  historyTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888' },
  historyMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777', marginTop: 2 },
  emptyText: { textAlign: 'center', fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#999', padding: 14 },

  debugCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#999', borderRadius: 12, padding: 12, marginTop: 16 },
  debugTitle: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', color: '#555', marginBottom: 4 },
  debugText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777', lineHeight: Math.ceil(typography.caption * 1.5), marginBottom: 10 },
  debugButton: { borderWidth: 1, borderColor: '#666', borderRadius: 9, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f2f2f2' },
  debugButtonText: { color: '#333', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },

  qrBox: { margin: 20, marginTop: 10, borderWidth: 1, borderColor: '#a83232', borderRadius: 14, padding: 20, paddingTop: 30, paddingBottom: 10, alignItems: 'center', backgroundColor: '#fbd1d1' },
  qrName: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#a83232', marginTop: 20 },
  qrDetail: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#555' },
  primaryButton: { marginTop: 18, backgroundColor: '#a83232', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginHorizontal: 20, minHeight: spacing.control, justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' },

  shadow: { shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
});