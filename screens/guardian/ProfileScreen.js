import React, { useMemo, useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import GuardianTabBar from '../../component/GuardianTabButtons';
import { useAdminData } from '../../AdminDataContext';

export default function ProfileScreen({ route, navigation }) {
  const [showQR, setShowQR] = useState(false);
  const resident = route.params?.resident;
  const { alerts } = useAdminData();

  const wardAlerts = useMemo(() => resident ? alerts.filter((alert) => alert.residentId === resident.id) : [], [alerts, resident]);
  const activeAlert = wardAlerts.find((alert) => alert.status !== 'closed');

  if (showQR) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => setShowQR(false)}>‹ Back to Ward Profile</Text>
          <Text style={styles.heading}>Ward QR Code</Text>
          <Text style={styles.subheading}>Use this QR when someone needs to identify your ward.</Text>
        </View>
        <View style={styles.qrContent}>
          <View style={styles.qrBox}><Text style={styles.qrPlaceholder}>QR CODE{`\n`}PLACEHOLDER</Text></View>
          <Text style={styles.qrName}>{resident?.name}</Text>
          <Text style={styles.qrDetail}>{resident?.id}</Text>
          <Text style={styles.qrNote}>The official QR code is managed by the barangay.</Text>
        </View>
        <GuardianTabBar />
      </SafeAreaView>
    );
  }

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
        <View style={styles.profileBar}>
          <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{resident.name}</Text>
            <Text style={styles.meta}>{resident.id}</Text>
            <Text style={styles.meta}>{resident.type}</Text>
          </View>
          <View style={[styles.currentStatus, activeAlert ? styles.currentStatusAlert : styles.currentStatusSafe]}>
            <View style={[styles.statusDot, activeAlert ? styles.dotAlert : styles.dotSafe]} />
            <Text style={[styles.currentStatusText, activeAlert ? styles.redText : styles.greenText]}>{activeAlert ? statusLabel(activeAlert.status) : 'Safe'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.qrButton} onPress={() => setShowQR(true)}>
          <FontAwesome5 name="qrcode" size={15} color="#a83232" />
          <Text style={styles.qrButtonText}>View QR Code</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section title="Personal Information">
          <Info label="Full Name" value={resident.name} />
          <Info label="Date of Birth" value={resident.dob || 'Not available'} />
          <Info label="Address" value={resident.address || 'Not available'} />
        </Section>

        <Section title="Guardian Information">
          <Info label="Guardian Name" value={resident.guardianName || 'Not available'} />
          <Info label="Relationship" value={resident.relationship || 'Not available'} />
          <Info label="Contact Number" value={resident.guardianContact || 'Not available'} />
        </Section>

        <Section title="Scan & Alert History">
          {wardAlerts.length === 0 ? (
            <Text style={styles.emptyText}>No scan or alert history yet for this ward.</Text>
          ) : wardAlerts.map((alert) => (
            <TouchableOpacity key={alert.id} style={styles.historyCard} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
              <View style={[styles.historyDot, historyDot(alert.status)]} />
              <View style={styles.historyTextWrap}>
                <View style={styles.historyTopRow}>
                  <Text style={styles.historyTitle}>{statusLabel(alert.status)}</Text>
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

      <GuardianTabBar />
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return <View><Text style={styles.sectionTitle}>{title}</Text><View style={styles.infoCard}>{children}</View></View>;
}
function Info({ label, value }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}
function statusLabel(status) {
  if (status === 'escalated') return 'Escalated';
  if (status === 'pending') return 'Pending';
  if (status === 'closed') return 'Closed';
  return 'Open';
}
function historyDot(status) {
  if (status === 'escalated' || status === 'open') return styles.dotAlert;
  if (status === 'pending') return styles.dotPending;
  return styles.dotSafe;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, paddingBottom: 24 },
  back: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 14, marginTop: -5 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  profilePhoto: { width: 76, height: 76, borderRadius: 38, borderWidth: 1.7, borderColor: '#a83232', marginRight: 12 },
  profileTextWrap: { flex: 1 },
  name: { fontSize: 19, fontFamily: 'Poppins_600SemiBold', color: '#222' },
  meta: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#666', marginTop: 1 },
  currentStatus: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 5 },
  currentStatusSafe: { backgroundColor: '#e8f8ea' }, currentStatusAlert: { backgroundColor: '#fbd1d1' },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 4 },
  dotSafe: { backgroundColor: '#288928' }, dotPending: { backgroundColor: '#d0a928' }, dotAlert: { backgroundColor: '#a83232' },
  currentStatusText: { fontSize: 9, fontFamily: 'Poppins_600SemiBold' },
  greenText: { color: '#288928' }, redText: { color: '#a83232' },
  qrButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: '#d9a2a2', backgroundColor: '#fff5f5', borderRadius: 9, paddingVertical: 9, marginBottom: 13 },
  qrButtonText: { color: '#a83232', fontSize: 13, fontFamily: 'Poppins_600SemiBold' },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: '#222', marginTop: 15, marginBottom: 7 },
  infoCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff', elevation: 3, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 13, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#777' },
  infoValue: { flex: 1, textAlign: 'right', marginLeft: 15, fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#333' },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  historyDot: { width: 9, height: 9, borderRadius: 5, marginRight: 10 },
  historyTextWrap: { flex: 1 },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#333' },
  historyTime: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: '#888' },
  historyMeta: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: '#777', marginTop: 2 },
  emptyText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#999', padding: 14 },
  readOnlyNote: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f6f6f6', borderRadius: 10, padding: 11, marginTop: 15 },
  readOnlyText: { flex: 1, fontSize: 10, lineHeight: 16, fontFamily: 'Poppins_400Regular', color: '#777', marginLeft: 8 },
  qrContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  qrBox: { width: 230, height: 230, borderWidth: 2, borderColor: '#333', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  qrPlaceholder: { textAlign: 'center', fontFamily: 'Poppins_700Bold', color: '#333', lineHeight: 22 },
  qrName: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#222' },
  qrDetail: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#666', marginTop: 3 },
  qrNote: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#888', textAlign: 'center', marginTop: 12 },
  heading: { fontSize: 25, fontFamily: 'Poppins_700Bold' },
  subheading: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#666', marginTop: 2 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold' },
});
