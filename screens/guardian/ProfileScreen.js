import { typography, spacing } from '../../theme';
import QRCode from 'react-native-qrcode-svg';
import useResidentProfile from "../../lib/useResidentProfile";
import ScreenState from "../../component/ScreenState";
import { api } from '../../lib/api';
import { mapResident } from '../../lib/models';
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Text from "../../component/AppText";
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from "../../lib/AppDataContext";
import TabBar from "../../component/GuardianTabButtons";
import { Divider } from "../../component/ui";
import { colors, font, radius, shadow } from '../../theme';

export default function ProfileScreen({ route, navigation }) {
  const { residents, alerts, loading: contextLoading } = useAppData();
  const residentId = route.params?.residentId || route.params?.resident?.id;

  const liveResident = useMemo(
    () => residents.find((r) => r.id === residentId),
    [residents, residentId]
  );

  const { alerts: hookAlerts, loading: alertLoading, error } = useResidentProfile({ 
    params: { residentId, resident: liveResident } 
  });

  const currentAlerts = hookAlerts || alerts;

  const wardAlerts = useMemo(
    () => liveResident ? currentAlerts.filter((alert) => alert.residentId === liveResident.id) : [],
    [currentAlerts, liveResident]
  );
  
  const activeAlert = wardAlerts.find((alert) => alert.status !== 'closed');

  if (contextLoading || alertLoading || error || !liveResident) {
    return <ScreenState loading={contextLoading || alertLoading} error={error || (!liveResident ? 'Resident not found' : null)} onBack={() => navigation.goBack()} />;
  }

  const statusLabel = (status) => {
    if (status === 'escalated') return 'Escalated';
    if (status === 'pending') return 'Pending';
    if (status === 'closed') return 'Closed';
    return 'Open';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>

        <View style={[styles.residentCard, styles.shadow]}>
          <Image source={require("../../assets/profile.png")} style={styles.residentPhoto} />
          <View style={{ flex: 1, margin: 0 }}>
            {/* Using liveResident ensures this updates immediately */}
            <Text style={styles.contextTitle}>{liveResident.name}</Text>
            <Text style={styles.small}>Role: {liveResident.type || 'Resident'}</Text>
            <Text style={styles.small}>ID Number: {liveResident.id}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => Alert.alert('Official QR card', 'Ask your barangay official for the resident\'s issued QR card.')}
        >
          <FontAwesome5 name="qrcode" size={13} color="#245490" />
          <Text style={styles.qrButtonText}>View QR Code</Text>
        </TouchableOpacity>
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>My Ward's Status: </Text>
          <Text style={[styles.statusPill, activeAlert ? styles.danger : styles.closed]}>
            {activeAlert ? statusLabel(activeAlert.status) : 'No active alert'}
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
                      {statusLabel(alert.status)}
                    </Text>
                    <Text style={styles.historyTime}>{alert.scannedAt}</Text>
                  </View>
                  <Text style={styles.historyMeta}>QR scanned by {alert.scannedBy || 'a Bystander'}</Text>
                  <Text style={styles.historyMeta}>{alert.location || 'Location unavailable'}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={11} color="#999" />
              </TouchableOpacity>
              {index < wardAlerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.readOnlyNote}>
          <FontAwesome5 name="lock" size={14} color="#777" style={{ marginHorizontal: 6 }} />
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
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 0, paddingTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 30 },

  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 8 },

  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a83232', borderRadius: 12, backgroundColor: '#ffdcdc', padding: spacing.card, marginBottom: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 11 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  small: { fontSize: typography.caption, color: '#555', fontFamily: 'Poppins_400Regular', marginTop: 2 },

  statusHeader: { flexWrap: 'wrap', gap: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  statusLabel: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular' },
  danger: { color: '#a83232', backgroundColor: '#fbd1d1' },
  closed: { color: '#288928', backgroundColor: '#a1fbaa' },

  qrButton: { backgroundColor: '#d3e5f8', borderColor: '#245490', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 10 },
  qrButtonText: { color: '#245490', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },

  section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, paddingVertical: 4, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777' },
  infoValue: { flex: 1, textAlign: 'right', marginLeft: 15, fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#333' },

  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  historyTextWrap: { flex: 1 },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888' },
  historyMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777', marginTop: 2 },

  emptyText: { textAlign: 'center', fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#999', padding: 14 },

  readOnlyNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f6f6f6', borderRadius: 10, padding: 11, marginTop: 15, marginBottom: -10 },
  readOnlyText: { flex: 1, fontSize: typography.caption, lineHeight: Math.ceil(typography.caption * 1.5), fontFamily: 'Poppins_400Regular', color: '#777', marginLeft: 12 },

  shadow: { shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
});