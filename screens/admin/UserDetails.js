import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useAdminData } from '../../AdminDataContext';
import TabBar from '../../component/TabButtons';

const roles = ['Guardian', 'Barangay Responder', 'Barangay Official'];
const positions = ['Barangay Captain', 'Barangay Secretary', 'Barangay Kagawad'];

export default function UserDetails({ route, navigation }) {
  const { users, residents, updateUser, changeUserRole, deactivateUser, activateUser } = useAdminData();
  const user = users.find((item) => item.id === route.params?.userId) || users[0];
  const [editing, setEditing] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [draft, setDraft] = useState(user);

  if (!user) return null;

  const wardNames = (user.wardIds || []).map((wardId) => residents.find((resident) => resident.id === wardId)?.name).filter(Boolean);

  function saveEdit() {
    updateUser({ ...draft, role: draft.role, position: draft.role === 'Barangay Official' ? draft.position : '' });
    setEditing(false);
    Alert.alert('User updated', 'The user information has been saved.');
  }

  function saveRole() {
    changeUserRole(user.id, draft.role, draft.role === 'Barangay Official' ? draft.position : '');
    setChangingRole(false);
    Alert.alert('Role updated', `This account is now a ${draft.role}.`);
  }

  function toggleStatus() {
    if (user.status === 'Active') {
      Alert.alert('Deactivate Account?', `${user.name} will no longer be able to access ResQR using this account.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => deactivateUser(user.id) },
      ]);
    } else {
      activateUser(user.id);
    }
  }

  if (editing) return <EditView draft={draft} setDraft={setDraft} onSave={saveEdit} onCancel={() => setEditing(false)} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}><Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileBar}>
          <Image source={require('../../assets/profile.png')} style={styles.photo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>{user.role}</Text>
            <View style={[styles.statusPill, user.status === 'Active' ? styles.active : styles.inactive]}><Text style={styles.statusText}>{user.status}</Text></View>
          </View>
        </View>

        <Text style={styles.section}>Account Information</Text>
        <View style={styles.infoCard}>
          <Info label="Mobile Number" value={user.phone} />
          <Info label="Role" value={user.role} />
          {user.position ? <Info label="Position" value={user.position} /> : null}
          <Info label="Barangay" value={user.barangay} />
          {user.role === 'Guardian' ? <Info label="Ward(s)" value={wardNames.length ? wardNames.join(', ') : 'No ward linked'} /> : null}
        </View>

        {changingRole ? (
          <View style={styles.roleCard}>
            <Text style={styles.sectionSmall}>Change User Role</Text>
            <Text style={styles.warning}>Changing the role updates this account's access and permissions.</Text>
            <View style={styles.pickerWrap}><Picker selectedValue={draft.role} onValueChange={(v) => setDraft((p) => ({ ...p, role: v }))}>{roles.map((r) => <Picker.Item key={r} label={r} value={r} />)}</Picker></View>
            {draft.role === 'Barangay Official' && <View style={[styles.pickerWrap, { marginTop: 10 }]}><Picker selectedValue={draft.position || positions[1]} onValueChange={(v) => setDraft((p) => ({ ...p, position: v }))}>{positions.map((p) => <Picker.Item key={p} label={p} value={p} />)}</Picker></View>}
            <TouchableOpacity style={styles.primaryButton} onPress={saveRole}><Text style={styles.primaryText}>Change Role</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setChangingRole(false)}><Text style={styles.secondaryText}>Cancel</Text></TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.section}>Account Actions</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => { setDraft(user); setEditing(true); }}><Text style={styles.actionText}>Edit User</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => { setDraft(user); setChangingRole(true); }}><Text style={styles.actionText}>Change Role</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={toggleStatus}><Text style={styles.dangerText}>{user.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}</Text></TouchableOpacity>
          </>
        )}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function EditView({ draft, setDraft, onSave, onCancel }) {
  return <SafeAreaView style={styles.container}><View style={styles.content}><Text style={styles.back} onPress={onCancel}>‹ Back</Text><Text style={styles.heading}>Edit User</Text></View><ScrollView contentContainerStyle={styles.scrollContent}>
    <Text style={styles.label}>Full Name</Text><View style={styles.input}><Text>{draft.name}</Text></View>
    <Text style={styles.label}>Mobile Number</Text><View style={styles.input}><Text>{draft.phone}</Text></View>
    <Text style={styles.label}>Role</Text><View style={styles.pickerWrap}><Picker selectedValue={draft.role} onValueChange={(v) => setDraft((p) => ({ ...p, role: v }))}>{roles.map((r) => <Picker.Item key={r} label={r} value={r} />)}</Picker></View>
    {draft.role === 'Barangay Official' && <><Text style={styles.label}>Position</Text><View style={styles.pickerWrap}><Picker selectedValue={draft.position || positions[1]} onValueChange={(v) => setDraft((p) => ({ ...p, position: v }))}>{positions.map((p) => <Picker.Item key={p} label={p} value={p} />)}</Picker></View></>}
    <TouchableOpacity style={styles.primaryButton} onPress={onSave}><Text style={styles.primaryText}>Save Changes</Text></TouchableOpacity><TouchableOpacity style={styles.secondaryButton} onPress={onCancel}><Text style={styles.secondaryText}>Cancel</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}

function Info({ label, value }) { return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || '—'}</Text></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, scrollContent: { padding: 20, paddingTop: 4, paddingBottom: 30 }, back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 10, marginTop: -12 }, heading: { fontSize: 28, fontFamily: 'Poppins_700Bold' }, profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 }, photo: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#ddd', marginRight: 14 }, name: { fontSize: 22, fontFamily: 'Poppins_600SemiBold' }, role: { fontSize: 14, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, statusPill: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3, marginTop: 7 }, active: { backgroundColor: '#a1fbaa' }, inactive: { backgroundColor: '#eee' }, statusText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: '#288928' }, section: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', marginTop: 8, marginBottom: 8 }, sectionSmall: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }, infoCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 6, marginBottom: 18, backgroundColor: '#fff' }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }, infoLabel: { fontSize: 13, color: '#777', fontFamily: 'Poppins_400Regular' }, infoValue: { fontSize: 13, fontFamily: 'Poppins_500Medium', maxWidth: '58%', textAlign: 'right' }, actionButton: { borderWidth: 1, borderColor: '#245490', backgroundColor: '#d3e5f8', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginBottom: 9 }, actionText: { color: '#245490', fontFamily: 'Poppins_600SemiBold', fontSize: 14 }, dangerButton: { borderColor: '#a83232', backgroundColor: '#ffdcdc' }, dangerText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: 14 }, roleCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, marginTop: 8 }, warning: { fontSize: 12, color: '#8a6d1d', backgroundColor: '#fbf1a1', borderRadius: 8, padding: 9, fontFamily: 'Poppins_400Regular', marginBottom: 10 }, pickerWrap: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, overflow: 'hidden' }, primaryButton: { backgroundColor: '#a83232', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 18 }, primaryText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' }, secondaryButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 9 }, secondaryText: { color: '#a83232', fontFamily: 'Poppins_500Medium' }, label: { fontSize: 14, fontFamily: 'Poppins_500Medium', marginTop: 12, marginBottom: 6 }, input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12 },
});
