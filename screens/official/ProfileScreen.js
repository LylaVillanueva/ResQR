import { typography, spacing, colors } from '../../constants/theme';
import { changePhoto } from '../../utils/photos';
import Avatar from "../../components/Avatar";
import QRCode from 'react-native-qrcode-svg';
import useResidentProfile from "../../hooks/useResidentProfile";
import ScreenState from "../../components/ScreenState";
import { api } from '../../services/api';
import { alertStageLabel } from '../../utils/models';
import { exportQrCard } from '../../services/qrCardExport';
import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from "../../contexts/AppDataContext";
import TabBar from "../../components/tabs/TabButtons";
import AppModal from "../../components/modals/AppModal";
import { Divider } from "../../components/ui";
import { FontAwesome5 } from '@expo/vector-icons';

const RELATIONSHIPS = ['Parent', 'Grandparent', 'Child', 'Grandchild', 'Sibling', 'Spouse', 'Guardian'];
const PENDING = 'BACKEND_UPDATE_PENDING';

export default function ProfileScreen({ route, navigation }) {
  // Loaded from the backend on every focus, so edits and guardian links show up.
  const { resident, setResident, alerts: residentAlerts, loading, error, refresh } = useResidentProfile(route);
  const { setResidentPhoto } = useAppData();
  const residentId = route.params?.residentId || route.params?.resident?.id;

  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);          // card issued or exported in this session
  const [qrStatus, setQrStatus] = useState({ unavailable: true, card: null });
  const [qrBusy, setQrBusy] = useState(false);
  const qrRef = useRef(null);

  const [links, setLinks] = useState({ unavailable: true, links: [] });
  const [guardians, setGuardians] = useState([]);
  const [linkBusy, setLinkBusy] = useState(false);
  const [modal, setModal] = useState(null);             // { title, message, actions }
  const [linkForm, setLinkForm] = useState(null);       // { guardianId, relationship }

  const loadExtras = useCallback(async () => {
    if (!residentId) return;
    const [cardResult, linkResult] = await Promise.all([
      api.getResidentQrCard(residentId).catch(() => ({ unavailable: true, card: null })),
      api.listResidentGuardianLinks(residentId).catch(() => ({ unavailable: true, links: [] })),
    ]);
    setQrStatus(cardResult);
    setLinks(linkResult);
  }, [residentId]);

  useFocusEffect(useCallback(() => { loadExtras(); }, [loadExtras]));

  if (loading || error || !resident) {
    return <ScreenState loading={loading} error={error || (!resident ? 'Resident not found' : null)} onBack={() => navigation.goBack()} />;
  }

  const notice = (title, message) => setModal({ title, message });
  const closeModal = () => setModal(null);
  const activeCard = qrStatus.card;
  const pendingLinks = links.links.filter((link) => link.status === 'pending');
  const verifiedLinks = links.links.filter((link) => link.status === 'verified');

  // Officials of this barangay and the resident's guardian can change it.
  const changeResidentPhoto = () => changePhoto({
    title: `Photo of ${resident.name}`,
    hasPhoto: !!resident.photoUrl,
    save: async (image) => {
      const result = await setResidentPhoto(resident.id, image);
      setResident((current) => ({ ...current, photoUrl: result?.photo_url || null }));
    },
  });

  // ---- QR card -----------------------------------------------------------
  async function issueCard() {
    closeModal();
    if (qrBusy) return;
    setQrBusy(true);
    try {
      const issued = await api.generateQr({ residentId: resident.id });
      setQrData(issued);
      setShowQR(true);
      await loadExtras();
    } catch (err) { notice('Could not generate QR card', err.message); }
    finally { setQrBusy(false); }
  }

  function confirmIssue(replacing) {
    setModal({
      title: replacing ? 'Replace QR card?' : 'Generate QR card?',
      message: replacing || qrStatus.unavailable
        ? 'A new QR card will be issued. Any previously printed card for this resident will stop working immediately.'
        : 'A QR card will be issued for this resident. You can save or share it as a PDF afterwards.',
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'plain' },
        { label: replacing ? 'Replace Card' : 'Generate Card', onPress: issueCard, variant: replacing || qrStatus.unavailable ? 'danger' : 'primary' },
      ],
    });
  }

  async function openQrCard() {
    if (qrBusy) return;
    if (qrData) { setShowQR(true); return; }
    if (!activeCard) { confirmIssue(false); return; }
    setQrBusy(true);
    try {
      if (!activeCard.reexportable) { const legacy = new Error('legacy'); legacy.code = PENDING; throw legacy; }
      setQrData(await api.exportExistingQr({ cardId: activeCard.id }));
      setShowQR(true);
    } catch (err) {
      setModal({
        title: 'Card can’t be displayed',
        message: err.code === PENDING
          ? 'The current card was issued, but it can’t be shown again yet. Replace it to print a new card — the old printed card will stop working.'
          : err.message,
        actions: [
          { label: 'Close', onPress: closeModal, variant: 'plain' },
          { label: 'Replace Card', onPress: () => confirmIssue(true), variant: 'danger' },
        ],
      });
    } finally { setQrBusy(false); }
  }

  function confirmRevoke() {
    const card = qrData?.id ? qrData : activeCard;
    if (!card?.id) return;
    setModal({
      title: 'Revoke QR card?',
      message: 'The printed card will stop working immediately. Bystanders scanning it will not reach this resident until a new card is issued.',
      actions: [
        { label: 'Cancel', onPress: closeModal, variant: 'plain' },
        { label: 'Revoke Card', variant: 'danger', onPress: async () => {
          closeModal();
          setQrBusy(true);
          try {
            await api.revokeQr(card.id, 'Revoked by an authorized official from the resident profile.');
            setQrData(null);
            setShowQR(false);
            await loadExtras();
            notice('QR card revoked', 'The previous QR card can no longer be used.');
          } catch (err) { notice('Could not revoke QR card', err.message); }
          finally { setQrBusy(false); }
        } },
      ],
    });
  }

  // Exports the card on screen; never issues, replaces or revokes a card.
  async function saveQrCard() {
    if (!qrData?.publicScanUrl || qrBusy) return;
    setQrBusy(true);
    try { await exportQrCard(qrRef); }
    catch (err) { notice('Could not save QR card', err.message); }
    finally { setQrBusy(false); }
  }

  // ---- Guardian relationships -------------------------------------------
  async function openLinkGuardian() {
    setLinkForm({ guardianId: '', relationship: '' });
    try {
      const all = await api.listGuardians();
      setGuardians(all.filter((guardian) => guardian.is_active !== false));
    } catch (err) { setLinkForm(null); notice('Could not load guardians', err.message); }
  }

  function confirmVerify(linkId, guardianName, relationship) {
    setModal({
      title: 'Verify guardian relationship?',
      message: `Confirm that you have checked ${guardianName}'s identity and that they are this resident's ${String(relationship || 'guardian').toLowerCase()}. Once verified, they can see this resident and receive alerts.`,
      actions: [
        { label: 'Not Now', onPress: async () => { closeModal(); await loadExtras(); }, variant: 'plain' },
        { label: 'Verify', variant: 'primary', onPress: async () => {
          closeModal();
          setLinkBusy(true);
          try {
            await api.verifyGuardianLink(linkId);
            await Promise.all([loadExtras(), refresh()]);
            notice('Relationship verified', `${guardianName} is now the verified guardian of ${resident.name}.`);
          } catch (err) { notice('Could not verify relationship', err.message); }
          finally { setLinkBusy(false); }
        } },
      ],
    });
  }

  async function submitLink() {
    if (linkBusy || !linkForm?.guardianId || !linkForm?.relationship) return;
    const guardian = guardians.find((item) => item.id === linkForm.guardianId);
    setLinkBusy(true);
    try {
      const linkId = await api.linkGuardianToResident({ residentId: resident.id, guardianId: linkForm.guardianId, relationship: linkForm.relationship });
      setLinkForm(null);
      // Linking and verifying are separate decisions; verification is offered next.
      confirmVerify(linkId, guardian?.fullName || 'This guardian', linkForm.relationship);
    } catch (err) { notice('Could not link guardian', err.message); }
    finally { setLinkBusy(false); }
  }

  if (showQR && qrData?.publicScanUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => setShowQR(false)}>‹ Back</Text>
          <Text style={styles.heading}>QRAlalay Card</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.qrBox}>
            <QRCode value={qrData.publicScanUrl} size={240} getRef={(node) => { qrRef.current = node; }} />
            <Text style={styles.qrName}>{resident.name}</Text>
            <InfoRow label="ID Number" value={resident.code || resident.id} />
            <InfoRow label="Type" value={resident.type} />
            <InfoRow label="Guardian Name" value={resident.guardianName || 'Not registered'} />
            <InfoRow label="Guardian Contact" value={resident.guardianContact || 'No guardian contact'} />
            <InfoRow label="Address" value={resident.address} />
          </View>
          <TouchableOpacity style={styles.primaryButton} disabled={qrBusy} onPress={saveQrCard}>
            <Text style={styles.primaryButtonText}>{qrBusy ? 'Please wait…' : 'Save / Share QR Card'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.revokeButton} disabled={qrBusy} onPress={() => confirmIssue(true)}>
            <Text style={styles.revokeButtonText}>Replace QR Card</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.revokeButton} disabled={qrBusy} onPress={confirmRevoke}>
            <Text style={styles.revokeButtonText}>Revoke QR Card</Text>
          </TouchableOpacity>
        </ScrollView>
        <AppModal visible={!!modal} title={modal?.title} onClose={closeModal} actions={modal?.actions}>
          <Text style={styles.modalText}>{modal?.message}</Text>
        </AppModal>
      </SafeAreaView>
    );
  }

  const qrLabel = qrBusy ? 'Please wait…' : (qrData || activeCard) ? 'View QR Card' : qrStatus.unavailable ? 'Issue QR Card' : 'Generate QR Card';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>

        <View style={[styles.residentCard, styles.shadow]}>
          <Avatar uri={resident.photoUrl} name={resident.name} style={styles.residentPhoto} onChangePress={changeResidentPhoto} />
          <View style={{ flex: 1, margin: 0 }}>
            <Text style={styles.contextTitle}>{resident.name}</Text>
            <Text style={styles.small}>Type: {resident.type || 'Resident'}</Text>
            <Text style={styles.small}>ID Number: {resident.code || resident.id}</Text>
            {!qrStatus.unavailable && (
              <Text style={[styles.cardPill, activeCard ? styles.verified : styles.pending]}>
                {activeCard ? 'QR card active' : 'No active QR card'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditResidentInfo', { resident })}>
            <Text style={styles.editButtonText}>Edit Information</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qrButton} disabled={qrBusy} onPress={() => (qrStatus.unavailable && !qrData ? confirmIssue(false) : openQrCard())}>
            <Text style={styles.qrButtonText}>{qrLabel}</Text>
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

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Guardian Information</Text>
          <TouchableOpacity onPress={openLinkGuardian} disabled={linkBusy} accessibilityRole="button">
            <Text style={styles.linkAction}>+ Link Guardian</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {resident.guardianName ? <>
            <InfoRow label="Guardian Name" value={resident.guardianName} />
            <Divider />
            <InfoRow label="Relationship" value={resident.relationship} />
            <Divider />
            <InfoRow label="Contact Number" value={resident.guardianContact} />
            <Divider />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Relationship status</Text>
              <Text style={[styles.cardPill, styles.verified]}>Verified</Text>
            </View>
          </> : <Text style={styles.emptyText}>No verified guardian. Assistance can still be requested for this resident.</Text>}
        </View>

        {pendingLinks.length > 0 && <>
          <Text style={styles.section}>Pending Guardian Relationships</Text>
          <View style={styles.card}>
            {pendingLinks.map((link, index) => (
              <React.Fragment key={link.id}>
                <View style={styles.linkRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkName}>{link.guardianName}</Text>
                    <Text style={styles.historyMeta}>{link.relationship} · {link.guardianEmail || link.guardianPhone || 'No contact on file'}</Text>
                    <View style={styles.pillRow}>
                      <Text style={[styles.cardPill, styles.pending]}>Pending verification</Text>
                      <Text style={[styles.cardPill, link.guardianActive ? styles.verified : styles.inactive]}>{link.guardianActive ? 'Account active' : 'Account inactive'}</Text>
                      {!link.emailConfirmed && <Text style={[styles.cardPill, styles.inactive]}>Email not confirmed</Text>}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.verifyButton} disabled={linkBusy} onPress={() => confirmVerify(link.id, link.guardianName, link.relationship)}>
                    <Text style={styles.verifyText}>Verify</Text>
                  </TouchableOpacity>
                </View>
                {index < pendingLinks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </View>
        </>}
        {verifiedLinks.length > 1 && (
          <Text style={styles.historyMeta}>{verifiedLinks.length} verified guardians are linked; the primary one is shown above.</Text>
        )}

        <Text style={styles.section}>Alert History</Text>
        <View style={styles.card}>
          {residentAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No alert history available.</Text>
          ) : residentAlerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              <TouchableOpacity
                style={styles.historyRow}
                onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}
                activeOpacity={0.8}
              >
                <View style={styles.historyTextWrap}>
                  <View style={styles.historyTopRow}>
                    <Text style={[styles.statusPill, alert.status === 'closed' ? styles.closed : styles.danger]}>
                      {alertStageLabel(alert.status)}
                    </Text>
                    <Text style={styles.historyTime}>{alert.scannedAt}</Text>
                  </View>
                  <Text style={styles.historyMeta}>QR scanned by {alert.scannedBy || 'a bystander'}</Text>
                  <Text style={styles.historyMeta}>{alert.location || 'Location unavailable'}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={11} color={colors.textMuted} />
              </TouchableOpacity>
              {index < residentAlerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      <AppModal
        visible={!!linkForm}
        title="Link a guardian"
        onClose={() => setLinkForm(null)}
        actions={[
          { label: 'Cancel', onPress: () => setLinkForm(null), variant: 'plain', disabled: linkBusy },
          { label: linkBusy ? 'Linking…' : 'Link Guardian', onPress: submitLink, variant: 'primary', disabled: linkBusy || !linkForm?.guardianId || !linkForm?.relationship },
        ]}
      >
        <Text style={styles.modalText}>Choose an active guardian account. You'll be asked to verify the relationship next.</Text>
        {guardians.length === 0 ? (
          <Text style={styles.emptyText}>No active guardian accounts. Invite one from Manage Users.</Text>
        ) : guardians.map((guardian) => {
          const selected = linkForm?.guardianId === guardian.id;
          return (
            <TouchableOpacity key={guardian.id} style={[styles.choice, selected && styles.choiceActive]} onPress={() => setLinkForm((form) => ({ ...form, guardianId: guardian.id }))}>
              <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{guardian.fullName}</Text>
              <Text style={styles.historyMeta}>{guardian.email || guardian.phoneNumber || 'No contact on file'}</Text>
            </TouchableOpacity>
          );
        })}
        <Text style={[styles.modalText, { marginTop: 10 }]}>Relationship <Text style={{ color: colors.primary }}>*</Text></Text>
        <View style={styles.pillRow}>
          {RELATIONSHIPS.map((value) => {
            const selected = linkForm?.relationship === value;
            return (
              <TouchableOpacity key={value} style={[styles.chip, selected && styles.choiceActive]} onPress={() => setLinkForm((form) => ({ ...form, relationship: value }))}>
                <Text style={[styles.historyMeta, selected && styles.choiceTextActive]}>{value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </AppModal>

      <AppModal visible={!!modal} title={modal?.title} onClose={closeModal} actions={modal?.actions}>
        <Text style={styles.modalText}>{modal?.message}</Text>
      </AppModal>
      {(qrBusy || linkBusy) && <ActivityIndicator style={styles.busy} color={colors.primary} />}
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, paddingTop: 4, paddingBottom: 0 },
  scrollContent: { padding: spacing.screen, paddingTop: 4, paddingBottom: 30 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.primary, marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },

  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 12, backgroundColor: colors.primarySoft, padding: spacing.card, marginBottom: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 11 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  small: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 2 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 },

  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  editButton: { flex: 1, backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', minHeight: 44 },
  editButtonText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },
  qrButton: { flex: 1, backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', minHeight: 44 },
  qrButtonText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },

  section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  linkAction: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption, paddingVertical: 8, marginBottom: 4 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, paddingVertical: 4, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, alignSelf: 'stretch' },
  infoLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  infoValue: { flex: 1, textAlign: 'right', marginLeft: 15, fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textPrimary },

  cardPill: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', overflow: 'hidden' },
  verified: { color: colors.successInk, backgroundColor: colors.successSoft },
  pending: { color: colors.warningInk, backgroundColor: colors.warningSoft },
  inactive: { color: colors.textSecondary, backgroundColor: colors.border },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },

  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  linkName: { fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary },
  verifyButton: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 14, minHeight: 40, justifyContent: 'center' },
  verifyText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  historyTextWrap: { flex: 1 },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  danger: { color: colors.alertInk, backgroundColor: colors.alertSoft },
  closed: { color: colors.successInk, backgroundColor: colors.successSoft },
  historyTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  historyMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginTop: 2 },
  emptyText: { textAlign: 'center', fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textMuted, padding: 14 },

  modalText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textPrimary },
  choice: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, marginTop: 8 },
  choiceActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceText: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: colors.textPrimary },
  choiceTextActive: { color: colors.primary, fontFamily: 'Poppins_600SemiBold' },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 },
  busy: { position: 'absolute', top: '45%', alignSelf: 'center' },

  qrBox: { margin: 20, marginTop: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 14, padding: 20, paddingTop: 30, paddingBottom: 10, alignItems: 'center', backgroundColor: colors.primarySoft },
  qrName: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: colors.primary, marginTop: 20 },
  primaryButton: { marginTop: 18, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginHorizontal: 20, minHeight: spacing.control, justifyContent: 'center' },
  primaryButtonText: { color: colors.onPrimary, fontFamily: 'Poppins_600SemiBold' },
  revokeButton: { borderColor: colors.alertInk, borderWidth: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginHorizontal: 20, marginTop: 10, minHeight: 44, justifyContent: 'center' },
  revokeButtonText: { color: colors.alertInk, fontFamily: 'Poppins_600SemiBold' },

  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
});
