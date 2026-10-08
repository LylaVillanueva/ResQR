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
import { Section, InfoRow, StatusBadge, BackLink } from "../../component/ui";
import { colors, font, radius, shadow } from '../../theme';

export default function ProfileScreen({ route, navigation }) {
  const { resident, setResident, alerts, loading, error } = useResidentProfile(route);

  const wardAlerts = useMemo(() => resident ? alerts.filter((alert) => alert.residentId === resident.id) : [], [alerts, resident]);
  const activeAlert = wardAlerts.find((alert) => alert.status !== 'closed');


  if (loading || error || !resident) return <ScreenState loading={loading} error={error} onBack={() => navigation.goBack()} />;
  if (!resident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}><Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text><Text style={styles.heading1}>Ward not found</Text></View>
        <GuardianTabBar />
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
            <Text style={styles.small}>Role: {resident.role}</Text>
            <Text style={styles.small}>ID Number: {resident.id}</Text>
          </View>
        </View>


      </View>

          <View style={[styles.currentStatus, activeAlert ? styles.currentStatusAlert : styles.currentStatusSafe]}>
            <View style={[styles.statusDot, activeAlert ? styles.dotAlert : styles.dotSafe]} />
            <Text style={[styles.currentStatusText, activeAlert ? styles.redText : styles.greenText]}>{activeAlert ? statusLabel(activeAlert.status) : 'No active alert'}</Text>
          </View>
        <TouchableOpacity style={styles.qrButton} onPress={() => Alert.alert('Official QR card', 'Ask your barangay official for the resident’s issued QR card.')}>
          <FontAwesome5 name="qrcode" size={15} color="#a83232" />
          <Text style={styles.qrButtonText}>View QR Code</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section title="Personal Information">
          <InfoRow label="Full Name" value={resident.name} />
          <InfoRow label="Date of Birth" value={resident.birthDate} />
          <InfoRow label="Address" value={resident.address} />
        </Section>

        <Section title="Guardian Information">
          <InfoRow label="Guardian Name" value={resident.guardianName} />
          <InfoRow label="Relationship" value={resident.relationship} />
          <InfoRow label="Contact Number" value={resident.guardianContact} />
        </Section>

        <Section title="Scan & Alert History">
          {wardAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No scan or alert history yet for this ward.</Text>
          ) : wardAlerts.map((alert) => (
            <TouchableOpacity key={alert.id} style={styles.historyCard} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
              <View style={styles.historyTextWrap}>
                <View style={styles.historyTopRow}>
                  <StatusBadge status={alert.status} label={statusLabel(alert.status)} />
                  <Text style={styles.historyTime}>{alert.scannedAt}</Text>
                </View>
                <Text style={styles.historyMeta}>QR scanned by {alert.scannedBy || 'a Bystander'}</Text>
                <Text style={styles.historyMeta}>📍 {alert.location || 'Location unavailable'}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={11} color="#999" />
            </TouchableOpacity>
          ))}
        </Section>

        <View style={styles.readOnlyNote}>
          <FontAwesome5 name="lock" size={13} color="#777" />
          <Text style={styles.readOnlyText}>Ward information is read-only. Only authorized barangay officials can edit resident information.</Text>
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

function statusLabel(status) {
  if (status === 'escalated') return 'Escalated';
  if (status === 'pending') return 'Pending';
  if (status === 'closed') return 'Closed';
  return 'Open';
}
function Field({ label, value, onChangeText, placeholder, keyboardType }) { return <View style={styles.fieldWrap}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} value={value || ''} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#999" keyboardType={keyboardType} /></View>; }
function Empty({ text }) { return <Text style={styles.empty}>{text}</Text>; }


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingTop: 4, paddingBottom: 0 },
  scrollContent: { padding: spacing.screen, paddingTop: 4, paddingBottom: 30 },
  editScroll: { padding: 20, paddingTop: 4, paddingBottom: 30 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4 },
  section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 14, marginBottom: 7 },
  sectionLabel: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 5, marginBottom: 3 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a83232', borderRadius: 12, backgroundColor: '#ffdcdc', padding: spacing.card, marginBottom: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 11 },
  small: { fontSize: typography.caption, color: '#555', fontFamily: 'Poppins_400Regular', marginTop: 2 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 8 }, 

  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, 
  escalated: { color: '#a83232', backgroundColor: '#fbd1d1' }, dotEscalted: { backgroundColor: '#a83232' },
  pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, dotPending: { backgroundColor: '#8a6d1d' },
  closed: { color: '#288928', backgroundColor: '#a1fbaa' }, dotSafe: { backgroundColor: '#288928' },
  viewButton: { flex: 1, backgroundColor: '#ffdcdc', borderColor: '#a83232', borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  viewButtonText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: typography.caption },

  currentStatus: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 5 },
  currentStatusSafe: { backgroundColor: '#e8f8ea' }, currentStatusAlert: { backgroundColor: '#fbd1d1' },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 4 },
  dotSafe: { backgroundColor: '#288928' }, dotPending: { backgroundColor: '#d0a928' }, dotAlert: { backgroundColor: '#a83232' },
  currentStatusText: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  greenText: { color: '#288928' }, redText: { color: '#a83232' },
  qrButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#d9a2a2', backgroundColor: '#fff5f5', borderRadius: 9, paddingVertical: 9, marginBottom: 13 },
  qrButtonText: { color: '#a83232', fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  sectionTitle: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#222', marginTop: spacing.section, marginBottom: 12 },
  infoCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff', elevation: 1, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 13, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777' },
  infoValue: { flex: 1, textAlign: 'right', marginLeft: 15, fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#333' },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyDot: { width: 9, height: 9, borderRadius: 5, marginRight: 10 },
  historyTextWrap: { flex: 1 },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', color: '#333' },
  historyTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888' },
  historyMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777', marginTop: 2 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#999', padding: 14 },
  readOnlyNote: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f6f6f6', borderRadius: 10, padding: 11, marginTop: 15 },
  readOnlyText: { flex: 1, fontSize: typography.caption, lineHeight: Math.ceil(typography.caption * 1.5), fontFamily: 'Poppins_400Regular', color: '#777', marginLeft: 8 },
  qrContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  qrBox: { width: 230, height: 230, borderWidth: 2, borderColor: '#333', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  qrPlaceholder: { textAlign: 'center', fontFamily: 'Poppins_700Bold', color: '#333', lineHeight: 22 },
  qrName: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: '#222' },
  qrDetail: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666', marginTop: 3 },
  qrNote: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888', textAlign: 'center', marginTop: 12 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 },
  subheading: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666', marginTop: 2 },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold' , marginTop: spacing.section, marginBottom: 12 },
});
