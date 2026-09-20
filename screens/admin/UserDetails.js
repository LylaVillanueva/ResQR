import { typography, spacing } from '../../theme';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import Text from "../../component/AppText";
import TextInput from "../../component/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from "../../component/AppPicker";
import { useAppData } from "../../lib/AppDataContext";
import TabBar from "../../component/TabButtons";

const roles = ['Guardian', 'Barangay Responder', 'Barangay Official'];
const positions = ['Barangay Captain', 'Barangay Secretary', 'Barangay Kagawad'];

export default function UserDetails({ route, navigation }) {
  const { users, residents, account, updateUser, changeUserRole, deactivateUser, activateUser } = useAppData();
  const user = users.find((item) => item.id === route.params?.userId);
  const [editing, setEditing] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [draft, setDraft] = useState(user);
  const [saving, setSaving] = useState(false);

  if (!user) return <SafeAreaView><Text onPress={() => navigation.goBack()}>‹ Back</Text><Text>Account not found.</Text></SafeAreaView>;

  const wardNames = (user.wardIds || []).map((wardId) => residents.find((resident) => resident.id === wardId)?.name).filter(Boolean);

  async function run(action) {
    if (saving) return;
    setSaving(true);
    try {
      await action();
    } catch (err) {
      Alert.alert('Could not update account', err.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    await run(async () => { await updateUser(draft); setEditing(false); });
  }

  async function saveRole() {
    await run(async () => { await changeUserRole(user.id, draft.role, draft.position); setChangingRole(false); });
  }

  function toggleStatus() {
    if (user.status === 'Active') {
      Alert.alert('Deactivate account', `Deactivate ${user.name}'s account? They will no longer be able to sign in.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => run(() => deactivateUser(user.id)) },
      ]);
    } else {
      run(() => activateUser(user.id));
    }
  }

  if (editing) return <EditView draft={draft} setDraft={setDraft} onSave={saveEdit} onCancel={() => setEditing(false)} saving={saving} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}><Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileBar}>
          <Image source={require("../../assets/profile.png")} style={styles.photo} />
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
          <Info label="Home Address" value={user.address} />
          {user.role === 'Guardian' ? <Info label="Ward(s)" value={wardNames.length ? wardNames.join(', ') : 'No ward linked'} /> : null}
        </View>

        {changingRole ? (
          <View style={styles.roleCard}>
            <Text style={styles.sectionSmall}>Change User Role</Text>
            <Text style={styles.warning}>Changing the role updates this account's access and permissions.</Text>
            <View style={styles.pickerWrap}><Picker selectedValue={draft.role} onValueChange={(v) => setDraft((p) => ({ ...p, role: v }))}>{roles.map((r) => <Picker.Item key={r} label={r} value={r} />)}</Picker></View>
            {draft.role === 'Barangay Official' && <View style={[styles.pickerWrap, { marginTop: 10 }]}><Picker selectedValue={draft.position || positions[1]} onValueChange={(v) => setDraft((p) => ({ ...p, position: v }))}>{positions.map((p) => <Picker.Item key={p} label={p} value={p} />)}</Picker></View>}
            <TouchableOpacity style={styles.primaryButton} onPress={saveRole} disabled={saving}><Text style={styles.primaryText}>{saving ? 'Saving...' : 'Change Role'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setChangingRole(false)} disabled={saving}><Text style={styles.secondaryText}>Cancel</Text></TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.section}>Account Actions</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => { setDraft(user); setEditing(true); }}><Text style={styles.actionText}>Edit User</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => { setDraft(user); setChangingRole(true); }}><Text style={styles.actionText}>Change Role</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={toggleStatus} disabled={saving}><Text style={styles.dangerText}>{user.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}</Text></TouchableOpacity>
          </>
        )}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function EditView({ draft, setDraft, onSave, onCancel, saving }) {
  return <SafeAreaView style={styles.container}><View style={styles.content}><Text style={styles.back} onPress={onCancel}>‹ Back</Text><Text style={styles.heading}>Edit User</Text></View><ScrollView contentContainerStyle={styles.scrollContent}>
    <Text style={styles.label}>Full Name</Text>
    <TextInput style={styles.input} value={draft.name} onChangeText={(v) => setDraft((p) => ({ ...p, name: v }))} placeholder="Full name" />
    <Text style={styles.label}>Mobile Number</Text>
    <TextInput style={styles.input} value={draft.phone} onChangeText={(v) => setDraft((p) => ({ ...p, phone: v }))} placeholder="+639171234567" keyboardType="phone-pad" />
    <Text style={styles.label}>Email</Text>
    <TextInput style={styles.input} value={draft.email} onChangeText={(v) => setDraft((p) => ({ ...p, email: v }))} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
    <Text style={styles.label}>Home Address</Text>
    <TextInput style={styles.input} value={draft.address} onChangeText={(v) => setDraft((p) => ({ ...p, address: v }))} placeholder="House no., street, purok/subdivision" />
    {draft.role === 'Barangay Official' && <><Text style={styles.label}>Position</Text><View style={styles.pickerWrap}><Picker selectedValue={draft.position || positions[1]} onValueChange={(v) => setDraft((p) => ({ ...p, position: v }))}>{positions.map((p) => <Picker.Item key={p} label={p} value={p} />)}</Picker></View></>}
    <TouchableOpacity style={styles.primaryButton} onPress={onSave} disabled={saving}><Text style={styles.primaryText}>{saving ? 'Saving...' : 'Save Changes'}</Text></TouchableOpacity>
    <TouchableOpacity style={styles.secondaryButton} onPress={onCancel} disabled={saving}><Text style={styles.secondaryText}>Cancel</Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}

function Info({ label, value }) { return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value || '—'}</Text></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 4 }, scrollContent: { padding: spacing.screen, paddingTop: 4, paddingBottom: 30 }, back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4}, heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 }, profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 }, photo: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#ddd', marginRight: 14 }, name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' }, role: { fontSize: typography.detail, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, statusPill: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3, marginTop: 7 }, active: { backgroundColor: '#a1fbaa' }, inactive: { backgroundColor: '#eee' }, statusText: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', color: '#288928' }, section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 8, marginBottom: 8 }, sectionSmall: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 }, infoCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 6, marginBottom: 18, backgroundColor: '#fff' }, infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }, infoLabel: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular' }, infoValue: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', maxWidth: '58%', textAlign: 'right' }, actionButton: { borderWidth: 1, borderColor: '#245490', backgroundColor: '#d3e5f8', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 9 , minHeight: spacing.control, justifyContent: 'center' }, actionText: { color: '#245490', fontFamily: 'Poppins_600SemiBold', fontSize: typography.detail }, dangerButton: { borderColor: '#a83232', backgroundColor: '#ffdcdc' }, dangerText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: typography.detail }, roleCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, marginTop: 8 }, warning: { fontSize: typography.caption, color: '#8a6d1d', backgroundColor: '#fbf1a1', borderRadius: 8, padding: 9, fontFamily: 'Poppins_400Regular', marginBottom: 10 }, pickerWrap: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, overflow: 'hidden' , minHeight: spacing.control }, primaryButton: { backgroundColor: '#a83232', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 18 , minHeight: spacing.control, justifyContent: 'center' }, primaryText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' }, secondaryButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 9 , minHeight: spacing.control, justifyContent: 'center' }, secondaryText: { color: '#a83232', fontFamily: 'Poppins_500Medium' }, label: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginTop: 12, marginBottom: 10 }, input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12 , minHeight: spacing.control, fontSize: typography.body, backgroundColor: '#f2f2f2' },
});
