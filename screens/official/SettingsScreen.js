import { typography, spacing, colors, font, radius } from '../../constants/theme';
import { changePhoto } from '../../utils/photos';
import Avatar from "../../components/Avatar";
import { useAppData } from "../../contexts/AppDataContext";
import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/TabButtons";
import InfoModal from "../../components/modals/InfoModal";
import useNotificationPrefs from "../../hooks/useNotificationPrefs";
import { Section, Divider, ToggleRow, LinkRow, InfoRow } from "../../components/ui";
import { useAccessibilitySettings, FONT_SCALES, FONT_FAMILIES, LANGUAGES } from "../../contexts/AccessibilitySettingsContext";

export default function SettingsScreen({ navigation, setSession }) {
  const { account, myPhotoUrl, setAccountPhoto, barangayContacts = [], saveBarangayContact, verifyBarangayContact } = useAppData();
  const [contactModal, setContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactLabel, setContactLabel] = useState('Barangay Hotline');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAvailability, setContactAvailability] = useState('');
  const [contactPrimary, setContactPrimary] = useState(false);
  const changeMyPhoto = () => changePhoto({ title: 'Your photo', hasPhoto: !!myPhotoUrl, save: (image) => setAccountPhoto(account.id, image) });
  const { prefs, set, setPushEnabled, pushSupported } = useNotificationPrefs();
  const { fontScaleKey, fontFamilyKey, languageKey, t } = useAccessibilitySettings();

  const [infoModal, setInfoModal] = useState(null); // { title, message }
  const info = (title, message) => setInfoModal({ title, message });
  const editContact = (contact = null) => {
    setEditingContact(contact);
    setContactLabel(contact?.label || 'Barangay Hotline');
    setContactPhone(contact?.phone || '');
    setContactAvailability(contact?.availability || '');
    setContactPrimary(Boolean(contact?.isPrimary));
    setContactModal(true);
  };
  const saveContact = async () => {
    try {
      await saveBarangayContact({ id: editingContact?.id || null, label: contactLabel.trim(), phone: contactPhone.trim(), availability: contactAvailability.trim() || null, isPrimary: contactPrimary });
      setContactModal(false);
    } catch (error) { Alert.alert('Unable to Save Contact', error.message || 'Check the details and try again.'); }
  };
  const confirmContact = (contact) => Alert.alert(
    contact.isActive ? 'Deactivate Contact?' : 'Confirm Official Contact?',
    contact.isActive
      ? `Stop showing ${contact.label} as a current public contact?`
      : `Confirm that ${contact.phone} is an official, reachable ${account.barangayName || 'barangay'} contact. This will make it available in the app and public QR help view.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: contact.isActive ? 'Deactivate' : 'Confirm and Activate', style: contact.isActive ? 'destructive' : 'default', onPress: async () => {
        try { await verifyBarangayContact(contact.id, !contact.isActive); }
        catch (error) { Alert.alert('Unable to Update Contact', error.message || 'Please try again.'); }
      } },
    ],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Settings</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.residentCard, styles.shadow]}>
          <Avatar uri={myPhotoUrl} name={account.fullName} style={styles.residentPhoto} onChangePress={changeMyPhoto} />
          <View style={{ flex: 1, margin: 0 }}>
            <Text style={styles.contextTitle}>{account.fullName}</Text>
            <Text style={styles.small}>Role: {account.role}</Text>
            <Text style={styles.small}>ID Number: {account.id}</Text>
          </View>
        </View>

        <Section compact title={t('accountInformation')} titleStyle={{ marginTop: 10 }}>
          <InfoRow compact label={t('name')} value={account.fullName} />
          <Divider />
          <InfoRow compact label={t('position')} value={'Barangay Secretary'} />
          <Divider />
          <InfoRow compact label={t('barangay')} value={account.barangayName} />
        </Section>

        <Section compact title={t('notifications')}>
          {pushSupported && <ToggleRow compact label={t('pushNotifications')} value={prefs.pushEnabled} onChange={setPushEnabled} />}
          <Divider />
          <ToggleRow compact label={t('emergencyAlertSound')} value={prefs.alertSound} onChange={(v) => set('alertSound', v)} />
          <Divider />
          <ToggleRow compact label="New Emergency Alert" value={prefs.newAlert} onChange={(v) => set('newAlert', v)} />
          <Divider />
          <ToggleRow compact label="Responder Assignment Update" value={prefs.responderAssignment} onChange={(v) => set('responderAssignment', v)} />
          <Divider />
          <ToggleRow compact label="Escalated Alert Notification" value={prefs.escalatedAlert} onChange={(v) => set('escalatedAlert', v)} />
        </Section>

        <Section compact title={t('userAccessManagement')}>
          <LinkRow compact icon="users-cog" label={t('manageUsers')} onPress={() => navigation.navigate('ManageUsers')} />
        </Section>

        {account.role === 'barangay_official' && <Section compact title="Barangay Emergency Contacts">
          <Text style={styles.contactHint}>Only confirmed active numbers appear to guardians and on public QR help pages. Editing a number requires confirmation again.</Text>
          {barangayContacts.map((contact, index) => <View key={contact.id}>
            {index > 0 && <Divider />}
            <View style={styles.contactRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{contact.label}{contact.isPrimary ? ' · Primary' : ''}</Text>
                <Text style={styles.contactDetail}>{contact.phone} · {contact.isActive ? 'Active and confirmed' : 'Not active'}</Text>
                {contact.availability ? <Text style={styles.contactDetail}>{contact.availability}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => editContact(contact)} accessibilityRole="button" accessibilityLabel={`Edit ${contact.label}`} style={styles.contactAction}>
                <Text style={styles.contactActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmContact(contact)} accessibilityRole="button" accessibilityLabel={contact.isActive ? `Deactivate ${contact.label}` : `Confirm ${contact.label}`} style={styles.contactAction}>
                <Text style={styles.contactActionText}>{contact.isActive ? 'Pause' : 'Confirm'}</Text>
              </TouchableOpacity>
            </View>
          </View>)}
          <TouchableOpacity style={styles.addContact} onPress={() => editContact()} accessibilityRole="button">
            <FontAwesome5 name="plus" size={13} color={colors.primary} />
            <Text style={styles.contactActionText}> Add contact</Text>
          </TouchableOpacity>
        </Section>}

        <Section compact title={t('accessibility')}>
          <LinkRow compact icon="language" label={t('language')} value={LANGUAGES.find((l) => l.key === languageKey)?.label} onPress={() => navigation.navigate('AccessibilityOptions', { type: 'language' })} />
          <Divider />
          <LinkRow compact icon="font" label={t('font')} value={FONT_FAMILIES.find((f) => f.key === fontFamilyKey)?.label} onPress={() => navigation.navigate('AccessibilityOptions', { type: 'fontFamily' })} />
          <Divider />
          <LinkRow compact icon="text-height" label={t('fontSize')} value={FONT_SCALES.find((s) => s.key === fontScaleKey)?.label} onPress={() => navigation.navigate('AccessibilityOptions', { type: 'fontSize' })} />
        </Section>

        <Section compact title={t('helpSupport')}>
          <LinkRow compact icon="question-circle" label={t('faq')} onPress={() => info('FAQ', 'Frequently asked questions about using QRAlalay.')} />
          <Divider />
          <LinkRow compact icon="phone" label={t('barangayContactNumber')} onPress={() => info('Barangay Contact', 'Ask your barangay office for its official contact number.')} />
          <Divider />
          <LinkRow compact icon="bug" label={t('reportProblem')} onPress={() => info('Report a Problem', 'Please provide the issue you encountered.')} />
        </Section>

        <Section compact title={t('about')}>
          <LinkRow compact icon="check-circle" label={t('appVersion')} value="1.0" />
          <Divider />
          <LinkRow compact icon="info-circle" label={t('aboutQrAlalay')} onPress={() => navigation.navigate('Legal', { type: 'about' })} />
          <Divider />
          <LinkRow compact icon="file-contract" label={t('termsOfService')} onPress={() => navigation.navigate('Legal', { type: 'terms' })} />
          <Divider />
          <LinkRow compact icon="user-shield" label={t('privacyPolicy')} onPress={() => navigation.navigate('Legal', { type: 'privacy' })} />
        </Section>

        <TouchableOpacity
          style={styles.logout}
          onPress={() => Alert.alert('Log Out?', 'Are you sure you want to log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', style: 'destructive', onPress: () => setSession?.(null) }])}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <FontAwesome5 name="sign-out-alt" size={16} color={colors.primary} style={{ marginTop: -2 }} />
          <Text style={styles.logoutText}>{t('logOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={contactModal} transparent animationType="slide" onRequestClose={() => setContactModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.contactModal}>
            <Text style={styles.modalTitle}>{editingContact ? 'Edit Barangay Contact' : 'Add Barangay Contact'}</Text>
            <Text style={styles.inputLabel}>Contact label</Text>
            <TextInput value={contactLabel} onChangeText={setContactLabel} maxLength={100} style={styles.input} accessibilityLabel="Contact label" />
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" maxLength={16} style={styles.input} accessibilityLabel="Phone number" />
            <Text style={styles.inputLabel}>Availability (optional)</Text>
            <TextInput value={contactAvailability} onChangeText={setContactAvailability} maxLength={120} placeholder="For example, 24 hours" style={styles.input} accessibilityLabel="Availability" />
            <TouchableOpacity style={styles.primaryToggle} onPress={() => setContactPrimary((value) => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: contactPrimary }}>
              <FontAwesome5 name={contactPrimary ? 'check-square' : 'square'} size={16} color={colors.primary} />
              <Text style={styles.inputLabel}>  Set as primary</Text>
            </TouchableOpacity>
            <Text style={styles.contactHint}>A new number or changed number stays hidden until an official confirms it is correct and reachable.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setContactModal(false)} style={styles.secondaryButton}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveContact} style={styles.saveButton}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <InfoModal visible={!!infoModal} title={infoModal?.title} message={infoModal?.message} onClose={() => setInfoModal(null)} />
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 30 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 10 },
  photo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.8, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 13 },
  name: { fontSize: typography.body, fontFamily: font.semibold },
  meta: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: font.regular, marginTop: 2 },
  heading: { fontSize: typography.title, fontFamily: font.semibold, marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 12, backgroundColor: colors.primarySoft, padding: spacing.card, marginBottom: 16, marginTop: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 11 },
  small: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 2 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.dangerSurface, borderRadius: radius.md, paddingVertical: 13, marginTop: 22 },
  logoutText: { color: colors.primary, fontFamily: font.semibold, marginLeft: 7 },
  contactHint: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: Math.ceil(typography.caption * 1.5), marginBottom: 9 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  contactName: { fontSize: typography.detail, fontFamily: font.semibold, color: colors.text },
  contactDetail: { fontSize: typography.caption, fontFamily: font.regular, color: colors.textSecondary, marginTop: 2 },
  contactAction: { paddingVertical: 8, paddingHorizontal: 8 },
  contactActionText: { fontSize: typography.caption, color: colors.primary, fontFamily: font.semibold },
  addContact: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  modalBackdrop: { flex: 1, justifyContent: 'center', backgroundColor: colors.overlay, padding: spacing.screen },
  contactModal: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.card },
  modalTitle: { fontSize: typography.body, fontFamily: font.semibold, marginBottom: 12 },
  inputLabel: { fontSize: typography.caption, color: colors.text, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 9, marginBottom: 10, color: colors.text },
  primaryToggle: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  secondaryButton: { paddingVertical: 10, paddingHorizontal: 14 },
  saveButton: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 20, marginLeft: 8 },
  saveButtonText: { color: colors.onPrimary, fontFamily: font.semibold },
});
