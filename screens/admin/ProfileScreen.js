import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminData } from '../../AdminDataContext';
import TabBar from '../../component/TabButtons';

const relationships = ['Parent', 'Grandparent', 'Child', 'Grandchild', 'Sibling', 'Spouse', 'Guardian', 'Other'];

export default function ProfileScreen({ route, navigation }) {
  const { residents, alerts, updateResident } = useAdminData();
  const resident = residents.find((item) => item.id === route.params?.resident?.id) || route.params?.resident || residents[0];
  const [showQR, setShowQR] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(resident);
  const residentAlerts = alerts.filter((alert) => alert.residentId === resident.id);

  if (!resident) return null;

  if (showQR) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}><Text style={styles.back} onPress={() => setShowQR(false)}>‹ Back</Text><Text style={styles.heading}>QR Card</Text></View>
        <View style={styles.qrBox}><View style={styles.qrPlaceholder}><Text style={styles.qrPlaceholderText}>QR CODE{`\n`}PLACEHOLDER</Text></View><Text style={styles.qrName}>{resident.name}</Text><Text style={styles.qrDetail}>{resident.id}</Text><Text style={styles.qrDetail}>{resident.type}</Text><Text style={styles.qrDetail}>{resident.guardianName || 'Guardian: Not registered'}</Text><Text style={styles.qrDetail}>{resident.guardianContact || 'No guardian contact'}</Text><Text style={styles.qrDetail}>{resident.address}</Text></View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Alert.alert('QR Card', 'Download / Print QR will be connected to the QR module.')}><Text style={styles.primaryButtonText}>Download / Print QR</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (editing) {
    return <EditResident resident={resident} draft={draft} setDraft={setDraft} onCancel={() => { setDraft(resident); setEditing(false); }} onSave={() => { updateResident(draft); setEditing(false); Alert.alert('Resident updated', 'The resident information has been saved.'); }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <View style={styles.profileBar}>
          <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}><Text style={styles.name}>{resident.name}</Text><Text style={styles.meta}>{resident.id}</Text><Text style={styles.meta}>{resident.type}</Text></View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editButton} onPress={() => { setDraft(resident); setEditing(true); }}><Text style={styles.editButtonText}>Edit Information</Text></TouchableOpacity>
          <TouchableOpacity style={styles.qrButton} onPress={() => setShowQR(true)}><Text style={styles.qrButtonText}>View QR Code</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section title="Personal Information"><Info label="Full Name" value={resident.name} /><Info label="Date of Birth" value={resident.birthDate} /><Info label="Address" value={resident.address} /></Section>
        <Section title="Guardian Information"><Info label="Guardian Name" value={resident.guardianName} /><Info label="Relationship" value={resident.relationship} /><Info label="Contact Number" value={resident.guardianContact} /></Section>
        <Section title="Scan History">{residentAlerts.length ? residentAlerts.map((alert) => <View key={alert.id} style={styles.historyCard}><View style={styles.historyTop}><Text style={[styles.statusPill, alert.status === 'closed' ? styles.closed : alert.status === 'pending' ? styles.pending : styles.danger]}>{alert.status === 'open' ? 'Open Alert' : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</Text><Text style={styles.time}>{alert.scannedAt}</Text></View><Text style={styles.historyText}>QR scanned by {alert.scannedBy}</Text><Text style={styles.location}>📍 {alert.location}</Text></View>) : <Empty text="No scan history available." />}</Section>
        <Section title="Alert History">{residentAlerts.length ? residentAlerts.map((alert) => <View key={alert.id + '-alert'} style={styles.historyCard}><View style={styles.historyTop}><Text style={[styles.statusPill, alert.status === 'closed' ? styles.closed : alert.status === 'pending' ? styles.pending : styles.danger]}>{alert.status === 'open' ? 'Open Alert' : alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</Text><Text style={styles.time}>{alert.scannedAt}</Text></View><Text style={styles.historyText}>{alert.status === 'escalated' ? alert.escalationReason : alert.status === 'closed' ? 'Both confirmations completed' : alert.status === 'open' ? 'Waiting for responder assignment' : 'Waiting for confirmation'}</Text><TouchableOpacity onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}><Text style={styles.detailLink}>View Alert Details ›</Text></TouchableOpacity></View>) : <Empty text="No alert history available." />}</Section>
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function EditResident({ resident, draft, setDraft, onCancel, onSave }) {
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}><Text style={styles.back} onPress={onCancel}>‹ Back</Text><Text style={styles.heading}>Edit Resident Information</Text><Text style={styles.meta}>{resident.type}</Text></View>
      <ScrollView contentContainerStyle={styles.editScroll}>
        <Field label="Full Name" value={draft.name} onChangeText={(v) => set('name', v)} />
        <Field label="Date of Birth" value={draft.birthDate} onChangeText={(v) => set('birthDate', v)} placeholder="MM/DD/YYYY" />
        <Field label="Address" value={draft.address} onChangeText={(v) => set('address', v)} />
        <Text style={styles.sectionLabel}>Guardian Information</Text>
        <Field label="Guardian Name" value={draft.guardianName} onChangeText={(v) => set('guardianName', v)} />
        <Text style={styles.label}>Relationship</Text>
        <View style={styles.pickerLike}>{relationships.map((r) => <TouchableOpacity key={r} style={[styles.relationshipOption, draft.relationship === r && styles.relationshipActive]} onPress={() => set('relationship', r)}><Text style={[styles.relationshipText, draft.relationship === r && styles.relationshipTextActive]}>{r}</Text></TouchableOpacity>)}</View>
        <Field label="Contact Number" value={draft.guardianContact} onChangeText={(v) => set('guardianContact', v)} keyboardType="phone-pad" />
        <TouchableOpacity style={styles.primaryButton} onPress={onSave}><Text style={styles.primaryButtonText}>Save Changes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType }) { return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} value={value || ''} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#999" keyboardType={keyboardType} /></View>; }
function Section({ title, children }) { return <View><Text style={styles.section}>{title}</Text><View style={styles.card}>{children}</View></View>; }
function Info({ label, value }) { return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || '—'}</Text></View>; }
function Empty({ text }) { return <Text style={styles.empty}>{text}</Text>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, scrollContent: { padding: 20, paddingTop: 4, paddingBottom: 30 }, editScroll: { padding: 20, paddingTop: 4, paddingBottom: 30 }, back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 10, marginTop: -12 }, heading: { fontSize: 28, fontFamily: 'Poppins_700Bold' }, profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 }, profilePhoto: { width: 86, height: 86, borderRadius: 43, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 13 }, profileTextWrap: { flex: 1 }, name: { fontSize: 21, fontFamily: 'Poppins_600SemiBold' }, meta: { fontSize: 12, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, actionRow: { flexDirection: 'row', gap: 8, marginBottom: 4 }, editButton: { flex: 1, backgroundColor: '#d3e5f8', borderColor: '#245490', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' }, editButtonText: { color: '#245490', fontFamily: 'Poppins_600SemiBold', fontSize: 13 }, qrButton: { flex: 1, backgroundColor: '#ffdcdc', borderColor: '#a83232', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' }, qrButtonText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: 13 }, section: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', marginTop: 14, marginBottom: 7 }, card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 7, backgroundColor: '#fff', shadowColor: '#777', shadowOffset: { width: 3, height: 5 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 3 }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }, infoLabel: { fontSize: 12, color: '#777', fontFamily: 'Poppins_400Regular' }, infoValue: { fontSize: 12, fontFamily: 'Poppins_500Medium', maxWidth: '58%', textAlign: 'right' }, historyCard: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 9 }, historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, statusPill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, fontSize: 11, fontFamily: 'Poppins_600SemiBold' }, danger: { color: '#a83232', backgroundColor: '#fbd1d1' }, pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, closed: { color: '#288928', backgroundColor: '#a1fbaa' }, time: { fontSize: 10, color: '#777', fontFamily: 'Poppins_400Regular' }, historyText: { fontSize: 12, color: '#555', fontFamily: 'Poppins_400Regular', marginTop: 5 }, location: { fontSize: 11, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, detailLink: { fontSize: 11, color: '#245490', fontFamily: 'Poppins_500Medium', marginTop: 5 }, empty: { padding: 14, textAlign: 'center', color: '#888', fontFamily: 'Poppins_400Regular', fontSize: 12 }, qrBox: { margin: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 20, alignItems: 'center' }, qrPlaceholder: { width: 260, height: 260, backgroundColor: '#f3f3f3', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, qrPlaceholderText: { color: '#999', textAlign: 'center', fontFamily: 'Poppins_500Medium' }, qrName: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginTop: 15 }, qrDetail: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#555', marginTop: 3 }, primaryButton: { marginTop: 18, backgroundColor: '#a83232', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginHorizontal: 20 }, primaryButtonText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' }, fieldWrap: { marginBottom: 13 }, label: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#444', marginBottom: 6 }, input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, fontFamily: 'Poppins_400Regular', fontSize: 14, backgroundColor: '#fff' }, sectionLabel: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', marginTop: 5, marginBottom: 3 }, pickerLike: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }, relationshipOption: { borderWidth: 1, borderColor: '#ddd', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7, marginRight: 6, marginBottom: 6 }, relationshipActive: { borderColor: '#a83232', backgroundColor: '#ffdcdc' }, relationshipText: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#666' }, relationshipTextActive: { color: '#a83232', fontFamily: 'Poppins_600SemiBold' }, cancelButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginHorizontal: 20, marginTop: 9 }, cancelText: { color: '#a83232', fontFamily: 'Poppins_500Medium' },
});
