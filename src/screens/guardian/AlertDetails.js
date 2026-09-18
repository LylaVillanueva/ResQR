import { alertLayout } from '../../theme';
import { typography, spacing } from '../../theme';
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../components/GuardianTabButtons';
import { useAppData } from '../../context/AppDataContext';

export default function AlertDetails({ route, navigation }) {
  const { alerts, account } = useAppData();
  const alert = alerts.find((item) => item.id === (route.params?.alertId || route.params?.incidentId));

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
          <Image source={require('../../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{alert.residentName}</Text>
            {alert.residentCode ? <Text style={styles.meta}>Card: {alert.residentCode}</Text> : null}
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

        </View>

        <Text style={styles.subheading}>QR Scan Information</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#a83232" />
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Location where QR was scanned</Text>
              <Text style={styles.infoValue}>{alert.location}</Text>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={async () => {
                  if (alert.scan_latitude == null || alert.scan_longitude == null) {
                    Alert.alert('Location unavailable', 'No coordinates were recorded for this incident.');
                    return;
                  }
                  try {
                    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${alert.scan_latitude},${alert.scan_longitude}`);
                  } catch {
                    Alert.alert('Could not open map');
                  }
                }}
              >
                <Text style={styles.mapText}>View Location</Text>
              </TouchableOpacity>
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
          <Image source={require('../../../assets/profile.png')} style={styles.responderPhoto} />
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
        {alert.hasDiscrepancy && (
          <View style={styles.escalationBox}>
            <FontAwesome5 name="exclamation-triangle" size={16} color="#a83232" />
            <View style={{ flex: 1, marginLeft: 9 }}>
              <Text style={styles.escalationTitle}>Your confirmation doesn't match the responder's</Text>
              <Text style={styles.scanCardSubtitle}>One of you said Safe and the other Not Safe. A barangay official will verify directly.</Text>
            </View>
          </View>
        )}
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, confirmationStyle(alert.guardianStatus)]}>Guardian: {'\n'}{alert.guardianStatus}</Text>
          </View>
          <Text style={styles.scanCardSubtitle}>Your confirmation</Text>
        </View>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, confirmationStyle(alert.responderStatus)]}>Responder: {'\n'}{alert.responderStatus}</Text>
          </View>
          <Text style={styles.scanCardSubtitle}>{alert.responderName || 'Responder'} confirmation</Text>
          {alert.responderUnreachableReason ? <Text style={[styles.scanCardSubtitle, { marginTop: 6 }]}>Responder reported unable to reach the location: {alert.responderUnreachableReason}</Text> : null}
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
  content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 25 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4},
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginTop: spacing.section, marginBottom: 12 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginTop: 12, marginBottom: 6 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  profileBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: 8 },
  profilePhoto: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#c4c4c4', marginRight: 14 },
  profileTextWrap: { flex: 1 },
  name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginBottom: 3 },
  meta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },
  statusBanner: { alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: '#fff5d6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8, marginBottom: 4 },
  statusBannerEscalated: { backgroundColor: '#fceaea' },
  statusBannerClosed: { backgroundColor: '#eaf5ed' },
  statusBannerText: { fontSize: typography.detail, fontFamily: 'Poppins_700Bold', color: '#333' },
  headCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 6, backgroundColor: '#fff' , ...alertLayout.card },
  shadow: { shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 13 },
  infoTextWrap: { flex: 1, marginLeft: 10 },
  infoLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888' },
  infoValue: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#333', marginTop: 1 },
  mapButton: { borderWidth: 1, borderColor: '#245490', backgroundColor: '#d3e5f8', borderRadius: 8, paddingVertical: 7, alignItems: 'center', marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 14 },
  mapText: { color: '#245490', fontFamily: 'Poppins_500Medium', fontSize: typography.caption },
  scanCardSubtitle: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#333' },
  responderPhoto: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#a83232', backgroundColor: '#c4c4c4', marginBottom: 10 },
  headCardTitle: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  scanCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 6, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card },
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 12, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', alignSelf: 'flex-start' },
  statusOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  statusPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  statusClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  actionNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff8f8', borderWidth: 1, borderColor: '#e7c1c1', borderRadius: 10, padding: 11, marginBottom: 8 },
  actionNoticeText: { flex: 1, marginLeft: 9, fontSize: typography.caption, lineHeight: Math.ceil(typography.caption * 1.5), fontFamily: 'Poppins_400Regular', color: '#555' },
  escalationBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff1f1', borderWidth: 1, borderColor: '#e3b1b1', borderRadius: 10, padding: 12, marginTop: 10 },
  escalationTitle: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', color: '#a83232' },
  escalationText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#555', marginTop: 2 },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 16 , minHeight: spacing.control, justifyContent: 'center' },
  buttonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa', marginRight: 6 },
  buttonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1', marginLeft: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontFamily: 'Poppins_500Medium', fontSize: typography.body },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },
});
