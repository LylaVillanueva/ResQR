import { typography, spacing, alertLayout, colors } from '../../constants/theme';
import { changePhoto } from '../../utils/photos';
import Avatar from "../../components/Avatar";
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import Text from "../../components/AppText";
import TextInput from "../../components/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { InfoRow, Divider } from "../../components/ui";
import { api } from '../../services/api';
import { useAppData } from "../../contexts/AppDataContext";
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/TabButtons";

const ROLES = [
  { label: 'Guardian', value: 'Guardian' },
  { label: 'Barangay Responder', value: 'Barangay Responder' },
  { label: 'Barangay Official', value: 'Barangay Official' },
];

const POSITIONS = [
  { label: 'Barangay Captain', value: 'Barangay Captain' },
  { label: 'Barangay Secretary', value: 'Barangay Secretary' },
  { label: 'Barangay Kagawad', value: 'Barangay Kagawad' },
];

// Strips a leading +63 (or 0) so the box only shows the 10 local digits.
function localPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  const withoutCountry = digits.startsWith('63') ? digits.slice(2) : digits;
  return withoutCountry.startsWith('0') ? withoutCountry.slice(1) : withoutCountry;
}

export default function UserDetails({ route, navigation }) {
  const { users, residents, account, updateUser, changeUserRole, deactivateUser, activateUser } = useAppData();
  const user = users.find((item) => item.id === route.params?.userId);
  const { setAccountPhoto } = useAppData();
  const changeUserPhoto = () => changePhoto({ title: `Photo of ${user.name}`, hasPhoto: !!user.photoUrl, save: (image) => setAccountPhoto(user.id, image) });
  const [editing, setEditing] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [draft, setDraft] = useState(user);
  const [saving, setSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null = unknown (backend update pending)

  useEffect(() => {
    let active = true;
    if (!user?.id || typeof api.listAccountStatus !== 'function') return undefined;
    api.listAccountStatus().then((map) => { if (active) setEmailStatus(map?.get(user.id) || null); }).catch(() => {});
    return () => { active = false; };
  }, [user?.id, user?.status]);

  if (!user) return <SafeAreaView><Text onPress={() => navigation.goBack()}>‹ Back</Text><Text>Account not found.</Text></SafeAreaView>;

  const wardNames = (user.wardIds || []).map((wardId) => residents.find((resident) => resident.id === wardId)?.name).filter(Boolean);

  async function run(action) {
    if (saving) return;
    setSaving(true);
    try { await action(); }
    catch (err) { Alert.alert('Could not update account', err.message || 'Please try again.'); }
    finally { setSaving(false); }
  }

  async function saveEdit() { await run(async () => { await updateUser(draft); setEditing(false); }); }
  async function saveRole() { await run(async () => { await changeUserRole(user.id, draft.role, draft.position); setChangingRole(false); }); }

  function toggleStatus() {
    if (user.status === 'Active') {
      Alert.alert('Deactivate account', `Deactivate ${user.name}'s account? They will no longer be able to sign in.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Deactivate', style: 'destructive', onPress: () => run(() => deactivateUser(user.id)) },
      ]);
    } else if (emailStatus && !emailStatus.emailConfirmed) {
      Alert.alert('Email not confirmed', `${user.name} hasn't opened the invitation email yet. Ask them to open the link in the email, then activate the account.`);
    } else {
      Alert.alert('Activate account', `Activate ${user.name}'s account so they can sign in? This does not verify any guardian relationship; verify relationships from the resident's information.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Activate', onPress: () => run(() => activateUser(user.id)) },
      ]);
    }
  }

  if (editing) return <EditView draft={draft} setDraft={setDraft} onSave={saveEdit} onCancel={() => setEditing(false)} saving={saving} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <View style={[styles.residentCard, styles.shadow]}>
          <Avatar uri={user.photoUrl} name={user.name} style={styles.residentPhoto} onChangePress={changeUserPhoto} />
          <View style={{ flex: 1, margin: 0 }}>
            <Text style={styles.contextTitle}>{user.name}</Text>
            <Text style={styles.small}>Role: {user.role}</Text>
            <Text style={styles.small}>ID Number: {user.id}</Text>
          </View>
        </View>

        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>Account Status: </Text>
          <View style={[styles.statusPill, user.status === 'Active' ? styles.active : styles.inactive]}>
            <Text style={[styles.statusText, user.status === 'Active' ? styles.activeText : styles.inactiveText]}>{user.status}</Text>
          </View>
          {emailStatus && (
            <View style={[styles.statusPill, emailStatus.emailConfirmed ? styles.active : styles.inactive]}>
              <Text style={[styles.statusText, emailStatus.emailConfirmed ? styles.activeText : styles.inactiveText]}>{emailStatus.emailConfirmed ? 'Email confirmed' : 'Email not confirmed'}</Text>
            </View>
          )}
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.section}>Profile Information</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Mobile Number" value={user.phone} />
          <Divider />
          <InfoRow label="Role" value={user.role} />
          {user.position ? (
            <>
              <Divider />
              <InfoRow label="Position" value={user.position} />
            </>
          ) : null}
          <Divider />
          <InfoRow label="Barangay" value={user.barangay} />
          <Divider />
          <InfoRow label="Home Address" value={user.address} />
          {user.role === 'Guardian' ? (
            <>
              <Divider />
              <InfoRow label="Ward(s)" value={wardNames.length ? wardNames.join(', ') : 'No ward linked'} />
            </>
          ) : null}
        </View>

        {changingRole ? (
          <View style={styles.roleCard}>
            <Text style={styles.sectionSmall}>Change User Role</Text>
            <Text style={styles.warning}>Changing the role updates this account's access and permissions.</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Role</Text>
              <Dropdown
                style={styles.pickerWrap}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownText}
                itemTextStyle={styles.dropdownText}
                fontFamily="Poppins_400Regular"
                data={ROLES}
                labelField="label"
                valueField="value"
                placeholder="Kindly select role"
                value={draft.role}
                onChange={(item) => setDraft((p) => ({ ...p, role: item.value }))}
                iconColor={colors.textSecondary}
              />
            </View>

            {draft.role === 'Barangay Official' && (
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Position</Text>
                <Dropdown
                  style={styles.pickerWrap}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownText}
                  itemTextStyle={styles.dropdownText}
                  fontFamily="Poppins_400Regular"
                  data={POSITIONS}
                  labelField="label"
                  valueField="value"
                  placeholder="Kindly select position"
                  value={draft.position || POSITIONS[1].value}
                  onChange={(item) => setDraft((p) => ({ ...p, position: item.value }))}
                  iconColor={colors.textSecondary}
                />
              </View>
            )}

            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={saveRole} disabled={saving}>
              <Text style={[styles.actionText, styles.dangerText]}>{saving ? 'Saving...' : 'Change Role'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.plainButton]} onPress={() => setChangingRole(false)} disabled={saving}>
              <Text style={[styles.actionText, styles.dangerText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.section}>Account Actions</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => { setDraft(user); setEditing(true); }}>
              <FontAwesome5 name="user-edit" size={14} color={colors.primary} style={{ marginTop: -4 }} />
              <Text style={styles.actionText}> Edit User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => { setDraft(user); setChangingRole(true); }}>
              <FontAwesome5 name="user-cog" size={14} color={colors.primary} style={{ marginTop: -4 }} />
              <Text style={styles.actionText}> Change Role</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={toggleStatus} disabled={saving}>
              <FontAwesome5 name="user-lock" size={14} color={colors.primary} style={{ marginTop: -4 }} />
              <Text style={styles.dangerText}> {user.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function EditView({ draft, setDraft, onSave, onCancel, saving }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={onCancel}>‹ Back</Text>
        <Text style={styles.editHeading}>EDIT USER</Text>
        <Text style={styles.subheading}>step 1 : Personal Information</Text>
        
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, styles.progressBarActive]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.editScroll}>
        <Field label="Full Name" required value={draft.name} onChangeText={(v) => setDraft((p) => ({ ...p, name: v }))} placeholder="Full name" />

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}><Text style={styles.countryCodeText}>+63</Text></View>
            <TextInput
              style={styles.phoneInput}
              placeholder="9XX-XXX-XXXX"
              keyboardType="number-pad"
              maxLength={10}
              value={localPhone(draft.phone)}
              onChangeText={(v) => setDraft((p) => ({ ...p, phone: `+63${v.replace(/[^0-9]/g, '')}` }))}
            />
          </View>
        </View>

        <Field label="Email" value={draft.email} onChangeText={(v) => setDraft((p) => ({ ...p, email: v }))} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Home Address" value={draft.address} onChangeText={(v) => setDraft((p) => ({ ...p, address: v }))} placeholder="House no., street, purok/subdivision" />

        {draft.role === 'Barangay Official' && (
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Position</Text>
            <Dropdown
              style={styles.pickerWrap}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={styles.dropdownText}
              fontFamily="Poppins_400Regular"
              data={POSITIONS}
              labelField="label"
              valueField="value"
              placeholder="Kindly select position"
              value={draft.position || POSITIONS[1].value}
              onChange={(item) => setDraft((p) => ({ ...p, position: item.value }))}
              iconColor={colors.textSecondary}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.button, styles.shadow]} onPress={onSave} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtnFull} onPress={onCancel} disabled={saving}>
          <Text style={styles.cancelTextFull}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.pageLabel}>page 1</Text>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, required }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.input} value={value || ''} onChangeText={onChangeText}
        placeholder={placeholder} placeholderTextColor={colors.textMuted} keyboardType={keyboardType} autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, paddingBottom: 0, paddingTop: 4 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 30 },
  editScroll: { padding: spacing.screen, paddingTop: 0, paddingBottom: 20 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.primary, marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
  editHeading: { fontSize: typography.title, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 8 },
  
  progressRow: { flexDirection: 'row', marginBottom: 24 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, marginRight: 6 },
  progressBarActive: { backgroundColor: colors.primary },

  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 12, backgroundColor: colors.primarySoft, padding: spacing.card, marginBottom: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 11 },
  small: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 2 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 },
  
  statusHeader: { flexWrap: 'wrap', gap: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, ...alertLayout.headerRow },
  statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  statusLabel: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  active: { backgroundColor: colors.successSoft },
  inactive: { backgroundColor: colors.border },
  activeText: { color: colors.successInk },
  inactiveText: { color: colors.textSecondary },
  statusText: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  
  section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 },
  sectionSmall: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginBottom: 8 },
  infoCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 6, marginBottom: 18, backgroundColor: colors.surface },
  
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 10, backgroundColor: colors.primarySoft, paddingVertical: 14, marginBottom: 8 },
  actionText: { color: colors.primary, fontSize: typography.detail, fontFamily: 'Poppins_500Medium' },
  dangerButton: { borderColor: colors.alertInk, backgroundColor: colors.alertSoft },
  dangerText: { color: colors.alertInk, fontFamily: 'Poppins_600SemiBold', fontSize: typography.detail },
  plainButton: { borderColor: colors.primary, backgroundColor: colors.surface },
  roleCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginTop: 8 },
  warning: { fontSize: typography.caption, color: colors.warningInk, backgroundColor: colors.warningSoft, borderRadius: 8, padding: 9, fontFamily: 'Poppins_400Regular', marginBottom: 10 },
  
  fieldWrap: { marginBottom: spacing.field },
  fieldLabel: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 10 },
  required: { color: colors.alertInk },
  input: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingHorizontal: 12, backgroundColor: colors.surfaceSunken, fontFamily: 'Poppins_400Regular', fontSize: typography.body, minHeight: spacing.control, height: spacing.control },
  
  pickerWrap: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingHorizontal: 12, backgroundColor: colors.surfaceSunken, justifyContent: 'center', height: spacing.control },
  dropdownPlaceholder: { fontFamily: 'Poppins_400Regular', fontSize: typography.body, color: colors.textMuted },
  dropdownText: { fontFamily: 'Poppins_400Regular', fontSize: typography.body, color: colors.textPrimary },
  
  phoneRow: { flexDirection: 'row' },
  countryCode: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', marginRight: 8, height: spacing.control, backgroundColor: colors.surfaceSunken },
  countryCodeText: { fontSize: typography.body, fontWeight: '600' },
  phoneInput: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 8, paddingHorizontal: 12, backgroundColor: colors.surfaceSunken, fontSize: typography.body, fontFamily: 'Poppins_400Regular', height: spacing.control },

  bottomBar: { paddingHorizontal: spacing.screen, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  button: { borderRadius: 10, backgroundColor: colors.primarySoft, paddingVertical: 16, alignItems: 'center', marginBottom: 8, minHeight: spacing.control, justifyContent: 'center' },
  buttonText: { color: colors.primary, fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  cancelBtnFull: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 10, paddingVertical: 16, alignItems: 'center', minHeight: spacing.control, justifyContent: 'center' },
  cancelTextFull: { color: colors.primary, fontSize: typography.body, fontFamily: 'Poppins_400Regular' },
  pageLabel: { textAlign: 'center', color: colors.textMuted, marginTop: 8, fontSize: typography.caption, fontFamily: 'Poppins_400Regular' },
});