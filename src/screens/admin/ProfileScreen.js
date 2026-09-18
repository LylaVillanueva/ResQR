import { typography, spacing } from '../../theme';
import QRCode from 'react-native-qrcode-svg';
import useResidentProfile from '../../hooks/useResidentProfile';
import ScreenState from '../../components/ScreenState';
import { api } from '../../lib/api';
import { mapResident } from '../../lib/models';
import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Text from '../../components/AppText';
import TextInput from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../../context/AppDataContext';
import TabBar from '../../components/TabButtons';
import { Section, InfoRow, StatusBadge, BackLink } from '../../components/ui';
import { colors, font, radius, shadow } from '../../theme';

const relationships = ['Parent', 'Grandparent', 'Child', 'Grandchild', 'Sibling', 'Spouse', 'Guardian', 'Other'];

export default function ProfileScreen({ route, navigation }) {
  const { resident, setResident, alerts, loading, error, refresh } = useResidentProfile(route);
  const [showQR, setShowQR] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(resident);
  const residentAlerts = alerts;

  const [qrData, setQrData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Stands in for a real QR scan until the public bystander web page is
  // deployed — creates a real incident the same way a scan would, so the
  // guardian/responder/official notification flow can be tested end to end.
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
  async function saveResident() {
    if (saving) return;
    if (!draft.name?.trim()) { Alert.alert('Full name required'); return; }
    if (draft.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate)) {
      Alert.alert('Invalid date', 'Use YYYY-MM-DD for the date of birth.'); return;
    }
    setSaving(true);
    try {
      const row = await api.updateResident(resident.id, { fullName: draft.name.trim(),
        homeAddress: draft.address, ...(draft.birthDate ? { dateOfBirth: draft.birthDate } : {}) });
      setResident({ ...resident, ...mapResident(row), guardianName: resident.guardianName, guardianContact: resident.guardianContact });
      setEditing(false);
      Alert.alert('Resident updated', 'The resident information has been saved.');
    } catch (err) { Alert.alert('Could not save resident', err.message); }
    finally { setSaving(false); }
  }
  if (loading || error || !resident) return <ScreenState loading={loading} error={error} onBack={() => navigation.goBack()} />;

  if (showQR) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}><Text style={styles.back} onPress={() => setShowQR(false)}>‹ Back</Text><Text style={styles.heading}>QR Card</Text></View>
        <View style={styles.qrBox}><QRCode value={qrData.publicScanUrl} size={240} /><Text style={styles.qrName}>{resident.name}</Text><Text style={styles.qrDetail}>{resident.code || resident.id}</Text><Text style={styles.qrDetail}>{resident.type}</Text><Text style={styles.qrDetail}>{resident.guardianName || 'Guardian: Not registered'}</Text><Text style={styles.qrDetail}>{resident.guardianContact || 'No guardian contact'}</Text><Text style={styles.qrDetail}>{resident.address}</Text></View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert('QR Card', 'You can scan this official QR code from the screen. File download is not available yet.')}><Text style={styles.primaryButtonText}>Download / Print QR</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (editing) {
    return <EditResident resident={resident} draft={draft} setDraft={setDraft} onCancel={() => { setDraft(resident); setEditing(false); }} onSave={saveResident} saving={saving} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <View style={styles.profileBar}>
          <Image source={require('../../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}><Text style={styles.name}>{resident.name}</Text><Text style={styles.meta}>{resident.code || resident.id}</Text><Text style={styles.meta}>{resident.type}</Text></View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editButton} onPress={() => { setDraft(resident); setEditing(true); }}><Text style={styles.editButtonText}>Edit Information</Text></TouchableOpacity>
          <TouchableOpacity style={styles.qrButton} disabled={qrLoading} onPress={() => qrData ? setShowQR(true) : Alert.alert('Issue QR card?', 'Issuing a new QR card replaces any previously issued card for this resident.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Issue Card', onPress: viewQR }])}><Text style={styles.qrButtonText}>Issue QR Card</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section title="Personal Information"><InfoRow label="Full Name" value={resident.name} /><InfoRow label="Date of Birth" value={resident.birthDate} /><InfoRow label="Address" value={resident.address} /></Section>
        <Section title="Guardian Information"><InfoRow label="Guardian Name" value={resident.guardianName} /><InfoRow label="Relationship" value={resident.relationship} /><InfoRow label="Contact Number" value={resident.guardianContact} /></Section>
        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Debug tool</Text>
          <Text style={styles.debugText}>No public scan page is deployed yet. Use this to raise a real test alert for this resident and check that guardians, officials, and responders get notified.</Text>
          <TouchableOpacity style={styles.debugButton} disabled={simulating} onPress={() => Alert.alert('Simulate alert?', `Raise a test alert for ${resident.name} as if their QR code was scanned?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Simulate', onPress: simulateAlert }])}>
            <Text style={styles.debugButtonText}>{simulating ? 'Creating...' : 'Simulate Alert (Debug)'}</Text>
          </TouchableOpacity>
        </View>

        <Section title="Scan History">{residentAlerts.length ? residentAlerts.map((alert) => <View key={alert.id} style={styles.historyCard}><View style={styles.historyTop}><StatusBadge status={alert.status} label={alert.status === 'open' ? 'Open Alert' : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)} /><Text style={styles.time}>{alert.scannedAt}</Text></View><Text style={styles.historyText}>QR scanned by {alert.scannedBy}</Text><Text style={styles.location}>📍 {alert.location}</Text></View>) : <Empty text="No scan history available." />}</Section>
        <Section title="Alert History">{residentAlerts.length ? residentAlerts.map((alert) => <View key={alert.id + '-alert'} style={styles.historyCard}><View style={styles.historyTop}><StatusBadge status={alert.status} label={alert.status === 'open' ? 'Open Alert' : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)} /><Text style={styles.time}>{alert.scannedAt}</Text></View><Text style={styles.historyText}>{alert.status === 'escalated' ? alert.escalationReason : alert.status === 'closed' ? 'Both confirmations completed' : alert.status === 'open' ? 'Waiting for responder assignment' : 'Waiting for confirmation'}</Text><TouchableOpacity onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}><Text style={styles.detailLink}>View Alert Details ›</Text></TouchableOpacity></View>) : <Empty text="No alert history available." />}</Section>
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function EditResident({ resident, draft, setDraft, onCancel, onSave, saving }) {
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}><Text style={styles.back} onPress={onCancel}>‹ Back</Text><Text style={styles.heading}>Edit Resident Information</Text><Text style={styles.meta}>{resident.type}</Text></View>
      <ScrollView contentContainerStyle={styles.editScroll}>
        <Field label="Full Name" value={draft.name} onChangeText={(v) => set('name', v)} />
        <Field label="Date of Birth" value={draft.birthDate} onChangeText={(v) => set('birthDate', v)} placeholder="YYYY-MM-DD" />
        <Field label="Address" value={draft.address} onChangeText={(v) => set('address', v)} />
        <Text style={styles.sectionLabel}>Guardian Information</Text>
        <InfoRow label="Guardian" value={resident.guardianName} />
        <InfoRow label="Contact" value={resident.guardianContact} />
        <TouchableOpacity style={styles.primaryButton} disabled={saving} onPress={onSave}><Text style={styles.primaryButtonText}>Save Changes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType }) { return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} value={value || ''} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#999" keyboardType={keyboardType} /></View>; }
function Empty({ text }) { return <Text style={styles.empty}>{text}</Text>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingTop: 4, paddingBottom: 0 }, scrollContent: { padding: spacing.screen, paddingTop: 4, paddingBottom: 30 }, editScroll: { padding: 20, paddingTop: 4, paddingBottom: 30 }, back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4}, heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 }, profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 }, profilePhoto: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 13 }, profileTextWrap: { flex: 1 }, name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' }, meta: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, actionRow: { flexDirection: 'row', gap: 8, marginBottom: 4 }, editButton: { flex: 1, backgroundColor: '#d3e5f8', borderColor: '#245490', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' , minHeight: 44 }, editButtonText: { color: '#245490', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption }, qrButton: { flex: 1, backgroundColor: '#ffdcdc', borderColor: '#a83232', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' }, qrButtonText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption }, section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 14, marginBottom: 7 }, card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, backgroundColor: '#fff', shadowColor: '#777', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }, infoLabel: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular' }, infoValue: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', maxWidth: '58%', textAlign: 'right' }, historyCard: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 9 }, historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, statusPill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, danger: { color: '#a83232', backgroundColor: '#fbd1d1' }, pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, closed: { color: '#288928', backgroundColor: '#a1fbaa' }, time: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular' }, historyText: { fontSize: typography.caption, color: '#555', fontFamily: 'Poppins_400Regular', marginTop: 5 }, location: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, detailLink: { fontSize: typography.caption, color: '#245490', fontFamily: 'Poppins_500Medium', marginTop: 5 }, empty: { padding: 14, textAlign: 'center', color: '#888', fontFamily: 'Poppins_400Regular', fontSize: typography.caption }, qrBox: { margin: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 20, alignItems: 'center' }, qrPlaceholder: { width: 260, height: 260, backgroundColor: '#f3f3f3', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, qrPlaceholderText: { color: '#999', textAlign: 'center', fontFamily: 'Poppins_500Medium' }, qrName: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginTop: 15 }, qrDetail: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#555', marginTop: 3 }, primaryButton: { marginTop: 18, backgroundColor: '#a83232', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginHorizontal: 20 , minHeight: spacing.control, justifyContent: 'center' }, primaryButtonText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' }, fieldWrap: { marginBottom: spacing.field }, label: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#444', marginBottom: 10 }, input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, fontFamily: 'Poppins_400Regular', fontSize: typography.body, backgroundColor: '#f2f2f2' , minHeight: spacing.control }, sectionLabel: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 5, marginBottom: 3 }, pickerLike: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }, relationshipOption: { borderWidth: 1, borderColor: '#ddd', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7, marginRight: 6, marginBottom: 6 }, relationshipActive: { borderColor: '#a83232', backgroundColor: '#ffdcdc' }, relationshipText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' }, relationshipTextActive: { color: '#a83232', fontFamily: 'Poppins_600SemiBold' }, cancelButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginHorizontal: 20, marginTop: 9 }, cancelText: { color: '#a83232', fontFamily: 'Poppins_500Medium' },
  debugCard: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#999', borderRadius: 12, padding: 12, marginTop: 16 }, debugTitle: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', color: '#555', marginBottom: 4 }, debugText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777', lineHeight: Math.ceil(typography.caption * 1.5), marginBottom: 10 }, debugButton: { borderWidth: 1, borderColor: '#666', borderRadius: 9, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f2f2f2' }, debugButtonText: { color: '#333', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },
});
