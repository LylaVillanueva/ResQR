import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { useAdminData } from '../../AdminDataContext';

export default function AlertDetails({ route, navigation }) {
  const { alerts } = useAdminData();
  const alert = alerts.find((item) => item.id === route.params?.alertId);

  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
          <Text style={styles.heading1}>Alert not found</Text>
          <Text style={styles.subheading}>This alert may have been closed or removed.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusLabel = alert.status === 'closed' ? 'Alert Closed'
    : alert.status === 'escalated' ? 'Alert Escalated'
    : alert.status === 'pending' ? 'Pending Confirmation'
    : 'Open Alert';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <View style={styles.profileBar}>
          <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{alert.residentName}</Text>
            <Text style={styles.meta}>ID: {alert.residentId}</Text>
            <Text style={styles.meta}>Type: {alert.residentType}</Text>
          </View>
        </View>
        <Text style={styles.heading1}>Alert Details</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.statusBanner,
          alert.status === 'escalated' && styles.statusBannerEscalated,
          alert.status === 'closed' && styles.statusBannerClosed,
        ]}>
          <Text style={styles.statusBannerText}>{statusLabel}</Text>
          <Text style={styles.alertId}>Alert {alert.id}</Text>
        </View>

        <Text style={styles.subheading}>QR Scan Information</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#a83232" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Location where QR was scanned</Text>
              <Text style={styles.infoValue}>{alert.location}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome5 name="clock" size={15} color="#666" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Scan time</Text>
              <Text style={styles.infoValue}>{alert.scannedAt}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome5 name="user" size={15} color="#666" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Scanned by</Text>
              <Text style={styles.infoValue}>{alert.scannedBy || 'A Bystander'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.subheading}>Bystander Note</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Text style={styles.scanCardSubtitle}>{alert.bystanderNote || 'No note submitted.'}</Text>
        </View>

        <Text style={styles.subheading}>Responder Assigned</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Image source={require('../../assets/profile.png')} style={styles.responderPhoto} />
          <View style={styles.infoTextWrap}>
            <Text style={styles.headCardTitle}>{alert.responderName || 'Not yet assigned'}</Text>
            <Text style={styles.scanCardSubtitle}>{alert.responderName ? 'Barangay Responder' : 'Waiting for assignment'}</Text>
          </View>
        </View>

        <Text style={styles.subheading}>Confirmation Status</Text>
        <View style={styles.actionNotice}>
          <FontAwesome5 name="user-check" size={15} color="#a83232" />
          <Text style={styles.actionNoticeText}>As the Guardian, confirm whether your ward is safe or still needs assistance.</Text>
        </View>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, confirmationStyle(alert.guardianStatus)]}>Guardian: {alert.guardianStatus}</Text>
          </View>
          <Text style={styles.scanCardSubtitle}>Your confirmation</Text>
        </View>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, confirmationStyle(alert.responderStatus)]}>Responder: {alert.responderStatus}</Text>
          </View>
          <Text style={styles.scanCardSubtitle}>{alert.responderName || 'Responder'} confirmation</Text>
        </View>

        {alert.escalationReason ? (
          <View style={styles.escalationBox}>
            <FontAwesome5 name="exclamation-triangle" size={16} color="#a83232" />
            <View style={{ flex: 1, marginLeft: 9 }}>
              <Text style={styles.escalationTitle}>Escalation Reason</Text>
              <Text style={styles.escalationText}>{alert.escalationReason}</Text>
            </View>
          </View>
        ) : null}

        {alert.status !== 'closed' && (
          <View style={styles.buttonWrap}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSafe, alert.guardianStatus === 'Safe' && styles.buttonDisabled]}
              disabled={alert.guardianStatus === 'Safe'}
              onPress={() => navigation.navigate('ConfirmationScreen', {
                status: 'Safe',
                alertId: alert.id,
                resident: { name: alert.residentName, id: alert.residentId },
              })}
            >
              <Text style={[styles.buttonText, styles.safeText]}>✓ Mark Safe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonNotSafe, alert.guardianStatus === 'Not Safe' && styles.buttonDisabled]}
              disabled={alert.guardianStatus === 'Not Safe'}
              onPress={() => navigation.navigate('ConfirmationScreen', {
                status: 'Not Safe',
                alertId: alert.id,
                resident: { name: alert.residentName, id: alert.residentId },
              })}
            >
              <Text style={[styles.buttonText, styles.notSafeText]}>✕ Mark Not Safe</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function confirmationStyle(status) {
  if (status === 'Safe') return styles.statusClosed;
  if (status === 'Not Safe') return styles.statusOpen;
  return styles.statusPending;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, paddingBottom: 25 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 16, marginTop: -16 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginTop: 10, marginBottom: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', marginTop: 12, marginBottom: 6 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  profileBar: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: -12 },
  profilePhoto: { width: 90, height: 90, borderRadius: 45, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#c4c4c4', marginRight: 14 },
  profileTextWrap: { flex: 1 },
  name: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginBottom: 3 },
  meta: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' },
  statusBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fbf1a1', borderWidth: 1, borderColor: '#8a6d1d', borderRadius: 10, padding: 11, marginBottom: 4 },
  statusBannerEscalated: { backgroundColor: '#fbd1d1', borderColor: '#a83232' },
  statusBannerClosed: { backgroundColor: '#a1fbaa', borderColor: '#288928' },
  statusBannerText: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: '#333' },
  alertId: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#666' },
  headCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 6, backgroundColor: '#fff' },
  shadow: { shadowColor: '#aaa', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 13 },
  infoTextWrap: { flex: 1, marginLeft: 10 },
  infoLabel: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#888' },
  infoValue: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#333', marginTop: 1 },
  scanCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#333' },
  responderPhoto: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#a83232', backgroundColor: '#c4c4c4', marginBottom: 10 },
  headCardTitle: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  scanCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 6, backgroundColor: '#fff', elevation: 4 },
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 12, fontSize: 13, fontFamily: 'Poppins_600SemiBold', alignSelf: 'flex-start' },
  statusOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  statusPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  statusClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  actionNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff8f8', borderWidth: 1, borderColor: '#e7c1c1', borderRadius: 10, padding: 11, marginBottom: 8 },
  actionNoticeText: { flex: 1, marginLeft: 9, fontSize: 12, lineHeight: 18, fontFamily: 'Poppins_400Regular', color: '#555' },
  escalationBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff1f1', borderWidth: 1, borderColor: '#e3b1b1', borderRadius: 10, padding: 12, marginTop: 10 },
  escalationTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: '#a83232' },
  escalationText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#555', marginTop: 2 },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 11 },
  buttonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa', marginRight: 6 },
  buttonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1', marginLeft: 6 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontFamily: 'Poppins_500Medium', fontSize: 15 },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },
});