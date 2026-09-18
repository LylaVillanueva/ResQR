import { alertLayout } from '../../theme';
import { typography, spacing } from '../../theme';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar from '../../components/GuardianTabButtons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppData } from '../../context/AppDataContext';


export default function HomeScreen({ navigation }) {
  const { alerts, users, residents, account } = useAppData();

  const guardianAccount = useMemo(() => users.find((user) => user.id === account.id), [users, account.id]);
  const wardIds = guardianAccount?.wardIds || [];

  const myWards = useMemo(() => residents.filter((resident) => wardIds.includes(resident.id)), [residents, wardIds]);

  const myAlerts = useMemo(
    () => alerts.filter((alert) => wardIds.includes(alert.residentId) && alert.status !== 'closed'),
    [alerts, wardIds]
  );
  const currentAlert = myAlerts[0];

  const recentAlerts = useMemo(
    () => alerts.filter((alert) => wardIds.includes(alert.residentId)).slice(0, 2),
    [alerts, wardIds]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EmergencyHelp')}><Text style={{ color: '#a83232', fontFamily: 'Poppins_600SemiBold' }}>Get Emergency Help</Text></TouchableOpacity>
        <Text style={styles.subheading}>Welcome, {account.fullName}</Text>
        <Text style={styles.roleLine}>Guardian • {account.barangayName}</Text>
        <View style={[styles.divider, { marginTop: 4 }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {!currentAlert ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <FontAwesome5 name="clipboard-check" size={38} color="#288928" />
            </View>
            <Text style={styles.emptyTitle}>No active alerts</Text>
            <Text style={styles.emptyText}>Always remember to keep your{`\n`}ward safe and healthy.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeaderRow}><Text style={styles.heading1}>Active Ward Alert</Text><View style={styles.alertCount}><Text style={styles.alertCountText}>{myAlerts.length}</Text></View></View>
            <View style={[styles.alertCard, styles.alertCardActive]}>
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, statusStyle(currentAlert.status)]}>
                  {currentAlert.status === 'escalated' ? 'Alert Escalated'
                    : currentAlert.status === 'closed' ? 'Alert Closed'
                    : currentAlert.status === 'pending' ? 'Pending Confirmation'
                    : 'Open Alert'}
                </Text>
                <Text style={styles.alertTime}>{currentAlert.scannedAt}</Text>
              </View>

              <Text style={styles.heading1Dark}>{currentAlert.residentName}</Text>
              <Text style={styles.typeText}>{currentAlert.residentType}</Text>
              <Text style={styles.alertSubtitle}>Scanned by {currentAlert.scannedBy || 'a Bystander'}</Text>

              {currentAlert.location ? (
                <View style={styles.locationBox}>
                  <FontAwesome5 name="map-marker-alt" size={14} color="#a83232" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationLabel}>QR scanned at</Text>
                    <Text style={styles.locationText}>{currentAlert.location}</Text>
                  </View>
                </View>
              ) : null}

              {currentAlert.bystanderNote ? (
                <Text style={styles.alertSubtitle}>Note: {currentAlert.bystanderNote}</Text>
              ) : null}

              <View style={styles.statusRow}>
                <View style={styles.confirmationCard}><Text style={styles.confirmationLabel}>YOUR CONFIRMATION</Text><Text style={[styles.statusText, confirmationStyle(currentAlert.guardianStatus)]}>{currentAlert.guardianStatus === 'Pending' ? 'Action Needed' : currentAlert.guardianStatus}</Text></View>
                <View style={styles.confirmationCard}><Text style={styles.confirmationLabel}>RESPONDER</Text><Text style={[styles.statusText, confirmationStyle(currentAlert.responderStatus)]}>{currentAlert.responderStatus === 'Pending' ? (currentAlert.responderName ? 'Pending' : 'Not Assigned') : currentAlert.responderStatus}</Text></View>
              </View>

              {/* Guardian action: the Guardian must confirm the ward's current safety status. */}
              {currentAlert.status !== 'closed' && (
                <View style={styles.buttonWrap}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonSafe,
                      currentAlert.guardianStatus === 'Safe' && styles.buttonDisabled,
                    ]}
                    disabled={currentAlert.guardianStatus === 'Safe'}
                    onPress={() => navigation.navigate('ConfirmationScreen', {
                      status: 'Safe',
                      alertId: currentAlert.id,
                      resident: { name: currentAlert.residentName, id: currentAlert.residentId },
                    })}
                  >
                    <Text style={[styles.buttonText, styles.safeText]}>✓ Mark Safe</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonNotSafe,
                      currentAlert.guardianStatus === 'Not Safe' && styles.buttonDisabled,
                    ]}
                    disabled={currentAlert.guardianStatus === 'Not Safe'}
                    onPress={() => navigation.navigate('ConfirmationScreen', {
                      status: 'Not Safe',
                      alertId: currentAlert.id,
                      resident: { name: currentAlert.residentName, id: currentAlert.residentId },
                    })}
                  >
                    <Text style={[styles.buttonText, styles.notSafeText]}>✕ Mark Not Safe</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AlertDetails', { alertId: currentAlert.id })}>
                <Text style={styles.detailsText}>Tap for Full Details</Text>
                <FontAwesome5 name="caret-right" size={18} color="#245490" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.divider} />
        <Text style={styles.heading1}>My Wards</Text>
        {myWards.length === 0 ? (
          <Text style={styles.emptyListText}>No wards linked to this account yet.</Text>
        ) : (
          myWards.map((ward) => (
            <TouchableOpacity key={ward.id} style={styles.residentCard} onPress={() => navigation.navigate('ProfileScreen', { resident: ward })}>
              <Image source={require('../../../assets/profile.png')} style={styles.residentPhoto} />
              <View style={styles.residentTextWrap}>
                <Text style={styles.residentName}>{ward.name}</Text>
                <Text style={styles.residentMeta}>{ward.code || ward.type}</Text>
              </View>
              <View style={styles.statusDot} />
            </TouchableOpacity>
          ))
        )}

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.heading1}>Recent Alerts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AlertScreen')}>
            <Text style={styles.heading2}>View All <FontAwesome5 name="caret-right" size={14} color="#666" /></Text>
          </TouchableOpacity>
        </View>

        {recentAlerts.length === 0 ? (
          <Text style={styles.emptyListText}>No alerts yet for your wards.</Text>
        ) : (
          recentAlerts.map((alert) => (
            <TouchableOpacity key={alert.id} style={[styles.headCard, styles.shadow]} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
              <View style={styles.headCardTextWrap}>
                <Text style={styles.headCardTitle}>{alert.residentName}</Text>
                <Text style={styles.headCardSubtitle}>
                  {alert.status === 'closed' ? 'Resolved'
                    : alert.status === 'escalated' ? 'Escalated'
                    : alert.status === 'pending' ? 'Waiting for confirmation'
                    : 'Awaiting responder'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

function statusStyle(status) {
  if (status === 'escalated') return styles.alertEscalated;
  if (status === 'closed') return styles.alertClosed;
  if (status === 'pending') return styles.alertPending;
  return styles.alertOpen;
}

function confirmationStyle(status) {
  if (status === 'Safe') return styles.statusClosed;
  if (status === 'Not Safe') return styles.statusEscalated;
  return styles.statusPending;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, marginTop: 4, paddingBottom: 25 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 0 },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#222', marginTop: 12, marginBottom: 12 },
  heading1Dark: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#111', marginBottom: 6 , marginTop: 8 },
  heading2: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 15, marginBottom: 4 },
  typeText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#245490', marginBottom: 6 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 2 },
  roleLine: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#a83232', marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 6 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertCount: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: '#a83232', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  alertCountText: { color: '#fff', fontSize: typography.caption, fontFamily: 'Poppins_700Bold' },
  confirmationCard: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 9, marginHorizontal: 3, backgroundColor: '#fff' },
  confirmationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#888', marginBottom: 4, textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  shadow: { shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

  emptyWrap: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#e8f8ea', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: '#288928', textAlign: 'center', marginBottom: 12 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', lineHeight: Math.ceil(typography.detail * 1.5) },
  emptyListText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#999', marginBottom: 10 },

  alertCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card },
  alertCardActive: { borderColor: '#e0e0e0', shadowColor: '#a83232' },
  alertCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 , ...alertLayout.headerRow },
  alertCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' },
  alertOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  alertEscalated: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  alertTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', marginBottom: 9 },
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7f7', borderWidth: 1, borderColor: '#f0cccc', borderRadius: 10, padding: 11, marginBottom: 10 , ...alertLayout.location },
  locationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#888', marginLeft: 10 },
  locationText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#333', marginLeft: 10, marginTop: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 12 },
  statusText: { flex: 1, textAlign: 'center', fontSize: typography.caption, fontFamily: 'Poppins_500Medium', borderRadius: 10, paddingVertical: 5, paddingHorizontal: 6, marginHorizontal: 3, borderWidth: 1 },
  statusPending: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1' },
  statusClosed: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa' },
  statusEscalated: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 16 , minHeight: spacing.control, justifyContent: 'center' },
  buttonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa', marginRight: 6 },
  buttonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1', marginLeft: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },
  detailsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#245490', paddingVertical: 16, paddingHorizontal: 16, backgroundColor: '#d3e5f8' , minHeight: spacing.control , ...alertLayout.details },
  detailsText: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#245490' },

  residentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  residentPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c4c4c4', marginRight: 14 },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#333', marginRight: 2 },
  headCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 7, backgroundColor: '#fff' , ...alertLayout.card },
  headCardTextWrap: { flex: 1 },
  headCardTitle: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  headCardSubtitle: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },
});