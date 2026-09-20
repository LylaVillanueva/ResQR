import { typography, spacing } from '../../theme';
import useResidentProfile from "../../lib/useResidentProfile";
import ScreenState from "../../component/ScreenState";
import { api } from '../../lib/api';
import { mapResident } from '../../lib/models';
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar from "../../component/ResponderTabButtons";
import { useAppData } from "../../lib/AppDataContext";
import { StatusBadge } from "../../component/ui";
import { colors, shadow } from '../../theme';

export default function ProfileScreen({ route, navigation }) {
  const { resident, setResident, alerts, loading, error } = useResidentProfile(route);

  const scanHistory = useMemo(
    () => (resident ? alerts.filter((alert) => alert.residentId === resident.id) : []),
    [alerts, resident]
  );




  if (loading || error || !resident) return <ScreenState loading={loading} error={error} onBack={() => navigation.goBack()} />;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>

        <View style={styles.profileBar}>
          <Image source={require("../../assets/profile.png")} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{resident?.name || 'Resident'}</Text>
            <Text style={styles.meta}>{resident?.id || 'ID: Not available'}</Text>
            <Text style={styles.meta}>{resident?.type || 'Type: Not available'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.qrButton} onPress={() => Alert.alert('Official QR card', 'Ask your barangay official for the resident’s issued QR card.')}>
          <Text style={styles.qrButtonText}>View QR Code</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        <Text style={styles.heading1}>Scan History</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {scanHistory.length === 0 ? (
          <Text style={styles.emptyText}>No scan or alert history yet for this resident.</Text>
        ) : (
          scanHistory.map((alert) => (
            <TouchableOpacity key={alert.id} style={styles.alertCard} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
              <View style={styles.alertCardTextWrap}>
                <StatusBadge
                  status={alert.status}
                  label={alert.status === 'closed' ? 'Alert Closed'
                    : alert.status === 'escalated' ? 'Alert Escalated'
                    : alert.status === 'pending' ? 'Alert Pending'
                    : 'Alert Open'}
                />
                <Text style={styles.alertTime}>{alert.scannedAt}</Text>
              </View>
              <Text style={[styles.alertSubtitle, { fontFamily: 'Poppins_600SemiBold' }]}>Scanned by {alert.scannedBy || 'A Bystander'}</Text>
              <Text style={styles.alertSubtitle}>{alert.status === 'closed' ? 'Resolved - both parties confirmed safe' : `Guardian: ${alert.guardianStatus} • Responder: ${alert.responderStatus}`}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingTop: 4, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4},
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4 , marginBottom: 8 },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginBottom: 12 , marginTop: spacing.section },
  profileBar: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: -12 },
  profilePhoto: { width: 100, height: 100, borderRadius: 50, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#c4c4c4', marginRight: 14, shadowColor: '#625350', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  profileTextWrap: { flex: 1 },
  name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  meta: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#666' },
  qrButton: { backgroundColor: '#ffdcdc', borderColor: '#a83232', borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  qrButtonText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: typography.body },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginBottom: 20 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#777', textAlign: 'center', marginTop: 20 },
  alertCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: '#fff', ...shadow.card },
  alertCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alertTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', marginLeft: 8 },
  primaryButton: { borderRadius: 10, backgroundColor: '#fbd1d1', paddingVertical: 16, alignItems: 'center', marginBottom: 8, shadowColor: '#625350', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , minHeight: spacing.control, justifyContent: 'center' },
  primaryButtonText: { color: '#a83232', fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  secondaryButton: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 12 , minHeight: spacing.control, justifyContent: 'center' },
  secondaryButtonText: { color: '#c12b2b', fontSize: typography.body, fontFamily: 'Poppins_400Regular' },
  qrBox: { borderWidth: 1, borderColor: '#ccc', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 20, marginBottom: 20, marginHorizontal: 16 },
  qrPlaceholder: { width: 280, height: 280, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 5, marginBottom: 25, backgroundColor: '#f2f2f2' },
  qrPlaceholderText: { textAlign: 'center', color: '#999', fontSize: typography.caption, fontFamily: 'Poppins_500Medium' },
  qrName: { fontSize: typography.title, fontFamily: 'Poppins_500Medium', marginBottom: 6 },
  qrDetail: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#333', textAlign: 'center', marginBottom: 4 },
});