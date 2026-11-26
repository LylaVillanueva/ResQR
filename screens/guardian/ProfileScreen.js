import { typography, spacing, colors, font, radius, shadow } from '../../constants/theme';
import { changePhoto } from '../../utils/photos';
import Avatar from "../../components/Avatar";
import QRCode from 'react-native-qrcode-svg';
import useResidentProfile from "../../hooks/useResidentProfile";
import ScreenState from "../../components/ScreenState";
import { api } from '../../services/api';
import { mapResident, alertStageLabel } from '../../utils/models';
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Text from "../../components/AppText";
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from "../../contexts/AppDataContext";
import TabBar from "../../components/tabs/GuardianTabButtons";
import { Divider } from "../../components/ui";

export default function ProfileScreen({ route, navigation }) {
  // Loaded from the backend on every focus; only verified wards are returned.
  const { resident, setResident, alerts: wardAlerts, loading, error } = useResidentProfile(route);
  const { setResidentPhoto } = useAppData();

  if (loading || error || !resident) {
    return <ScreenState loading={loading} error={error || (!resident ? 'Resident not found' : null)} onBack={() => navigation.goBack()} />;
  }
  const liveResident = resident;
  const activeAlert = wardAlerts.find((alert) => alert.status !== 'closed');

  // Officials of this barangay and the resident's guardian can change it.
  const changeResidentPhoto = () => changePhoto({
    title: `Photo of ${resident.name}`,
    hasPhoto: !!resident.photoUrl,
    save: async (image) => {
      const result = await setResidentPhoto(resident.id, image);
      setResident((current) => ({ ...current, photoUrl: result?.photo_url || null }));
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>

        <View style={[styles.residentCard, styles.shadow]}>
          <Avatar uri={resident.photoUrl} name={resident.name} style={styles.residentPhoto} onChangePress={changeResidentPhoto} />
          <View style={{ flex: 1, margin: 0 }}>
            {/* Using liveResident ensures this updates immediately */}
            <Text style={styles.contextTitle}>{liveResident.name}</Text>
            <Text style={styles.small}>Type: {liveResident.type || 'Resident'}</Text>
            <Text style={styles.small}>ID Number: {liveResident.code || liveResident.id}</Text>
          </View>
        </View>

        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>My Ward's Status: </Text>
          <Text style={[styles.statusPill, activeAlert ? styles.danger : styles.closed]}>
            {activeAlert ? alertStageLabel(activeAlert.status) : 'No active alert'}
          </Text>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Personal Information</Text>
        <View style={styles.card}>
          <InfoRow label="Full Name" value={liveResident.name} />
          <Divider />
          <InfoRow label="Date of Birth" value={liveResident.birthDate} />
          <Divider />
          <InfoRow label="Address" value={liveResident.address} />
        </View>

        <Text style={styles.section}>Guardian Information</Text>
        <View style={styles.card}>
          <InfoRow label="Guardian Name" value={liveResident.guardianName} />
          <Divider />
          <InfoRow label="Relationship" value={liveResident.relationship} />
          <Divider />
          <InfoRow label="Contact Number" value={liveResident.guardianContact} />
        </View>

        <Text style={styles.section}>Scan & Alert History</Text>
        <View style={styles.card}>
          {wardAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No scan or alert history yet for this ward.</Text>
          ) : wardAlerts.map((alert, index) => (
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
                  <Text style={styles.historyMeta}>QR scanned by {alert.scannedBy || 'a Bystander'}</Text>
                  <Text style={styles.historyMeta}>{alert.location || 'Location unavailable'}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={11} color={colors.textMuted} />
              </TouchableOpacity>
              {index < wardAlerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.readOnlyNote}>
          <FontAwesome5 name="lock" size={14} color={colors.textSecondary} style={{ marginHorizontal: 6 }} />
          <Text style={styles.readOnlyText}>
            Ward information is read-only. Only authorized barangay officials can edit resident information.
          </Text>
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, paddingBottom: 0, paddingTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 30 },

  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.primary, marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 },

  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 12, backgroundColor: colors.primarySoft, padding: spacing.card, marginBottom: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 11 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  small: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 2 },

  statusHeader: { flexWrap: 'wrap', gap: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  statusLabel: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  danger: { color: colors.alertInk, backgroundColor: colors.alertSoft },
  closed: { color: colors.successInk, backgroundColor: colors.successSoft },

  qrButton: { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 10 },
  qrButtonText: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },

  section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, paddingVertical: 4, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  infoValue: { flex: 1, textAlign: 'right', marginLeft: 15, fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textPrimary },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  historyTextWrap: { flex: 1 },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  historyMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginTop: 2 },

  emptyText: { textAlign: 'center', fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textMuted, padding: 14 },

  readOnlyNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSunken, borderRadius: 10, padding: 11, marginTop: 15, marginBottom: -10 },
  readOnlyText: { flex: 1, fontSize: typography.caption, lineHeight: Math.ceil(typography.caption * 1.5), fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginLeft: 12 },

  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
});