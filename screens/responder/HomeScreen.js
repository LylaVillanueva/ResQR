import { alertLayout } from '../../theme';
import { typography, spacing, colors } from '../../theme';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar from "../../component/ResponderTabButtons";
import { FontAwesome5 } from '@expo/vector-icons';
import { useAppData } from "../../lib/AppDataContext";

export default function HomeScreen({ navigation }) {
  const { alerts, account } = useAppData();

  const myAssignments = useMemo(
    () => alerts.filter((alert) => alert.responderId === account.id && alert.status !== 'closed'),
    [alerts, account.id]
  );

  const currentAssignment = myAssignments[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, {account.fullName}</Text>
        <Text style={styles.roleLine}>Barangay Responder • {account.barangayName}</Text>
        <View style={[styles.divider, { marginTop: 4 }]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {!currentAssignment ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <FontAwesome5 name="clipboard-check" size={38} color="#288928" />
            </View>
            <Text style={styles.emptyTitle}>✓ NO ACTIVE ASSIGNMENT</Text>
            <Text style={styles.emptyText}>You currently have no{`\n`}emergency task assigned.</Text>
            <Text style={styles.emptyText}>You may scan a resident QR{`\n`}if needed.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.heading1}>Current assignment</Text>
            <View style={styles.alertCard}>
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, statusStyle(currentAssignment.status)]}>
                  {currentAssignment.status === 'escalated' ? 'Escalated' : currentAssignment.status === 'pending' ? 'Pending' : 'Open'}
                </Text>
                <Text style={styles.alertTime}>{currentAssignment.scannedAt}</Text>
              </View>
              <Text style={styles.heading1Dark}>{currentAssignment.residentName}</Text>
              <Text style={styles.alertSubtitle}>{currentAssignment.residentType}</Text>
              <View style={styles.locationBox}>
                <FontAwesome5 name="map-marker-alt" size={16} color="#666" />
                <Text style={styles.locationText}>{currentAssignment.location}</Text>
              </View>

              <View style={styles.confirmations}>
                <ConfirmationSummary label="Guardian" value={currentAssignment.guardianStatus} />
                <ConfirmationSummary label="Your confirmation" value={currentAssignment.responderStatus} />
              </View>
              <Text style={styles.actionLabel}>Update your confirmation</Text>
              <View style={styles.buttonWrap}>
                {['Safe', 'Not Safe'].map((decision) => {
                  const selected = currentAssignment.responderStatus === decision;
                  return <TouchableOpacity key={decision} style={[styles.confirmButton, decision === 'Safe' ? styles.safeButton : styles.notSafeButton, selected && styles.recordedButton]}
                    disabled={selected} accessibilityRole="button" accessibilityState={{ disabled: selected }}
                    accessibilityLabel={selected ? `${decision} already recorded` : `Mark ${decision}`}
                    onPress={() => navigation.navigate('ConfirmationScreen', {
                      status: decision, alertId: currentAssignment.id,
                      resident: { name: currentAssignment.residentName, id: currentAssignment.residentId },
                    })}>
                    <Text style={[styles.confirmButtonText, { color: decision === 'Safe' ? '#288928' : '#a83232' }]}>{selected ? `${decision} recorded` : `Mark ${decision}`}</Text>
                  </TouchableOpacity>;
                })}
              </View>
              <TouchableOpacity style={styles.detailsButton} accessibilityRole="button"
                onPress={() => navigation.navigate('AlertDetails', { alertId: currentAssignment.id })}>
                <Text style={styles.detailsText}>View alert details</Text>
                <FontAwesome5 name="chevron-right" size={14} color="#245490" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.heading1}>Recent Incidents</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AuditLogScreen')}>
            <Text style={styles.heading2}>View All <FontAwesome5 name="caret-right" size={14} color="#666" /></Text>
          </TouchableOpacity>
        </View>

        {alerts.slice(0, 2).map((alert) => (
          <TouchableOpacity key={alert.id} style={[styles.headCard, styles.shadow]} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
            <View style={styles.headCardTextWrap}>
              <Text style={styles.headCardTitle}>{alert.residentName}</Text>
              <Text style={styles.headCardSubtitle}>{alert.residentType} • {alert.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

function ConfirmationSummary({ label, value }) {
  const tone = value === 'Safe' ? colors.success : value === 'Not Safe' ? colors.danger : colors.pending;
  return <View style={[styles.confirmationColumn, { backgroundColor: tone.bg, borderColor: tone.ink }]}>
    <Text style={[styles.confirmationLabel, { color: tone.ink, textAlign: 'center' }]}>{label}</Text>
    <Text style={[styles.confirmationValue, { color: tone.ink, textAlign: 'center' }]}>{value}</Text>
  </View>;
}

function statusStyle(status) {
  if (status === 'escalated') return styles.alertEscalated;
  if (status === 'closed') return styles.alertClosed;
  if (status === 'pending') return styles.alertPending;
  return styles.alertOpen;
}

const styles = StyleSheet.create({
  confirmations: { flexDirection: 'row', gap: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 12 },
  confirmationColumn: { flex: 1, borderRadius: 8, borderWidth: 1, padding: 8, alignItems: 'center' },
  confirmationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },
  confirmationValue: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', color: '#333', marginTop: 2 },
  actionLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 8 },
  confirmButton: { flex: 1, minHeight: 48, padding: 10, borderWidth: 1, borderColor: '#a83232', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  safeButton: { backgroundColor: '#a1fbaa', borderColor: '#288928' },
  notSafeButton: { backgroundColor: '#fbd1d1', borderColor: '#a83232' },
  recordedButton: { opacity: 0.5 },
  confirmButtonText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#333', textAlign: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, marginTop: 4, paddingBottom: 25 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 0 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 2 },
  roleLine: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#a83232', marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 6 },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#222', marginTop: 12, marginBottom: 12 },
  heading1Dark: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#222', marginBottom: 6 },
  heading2: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 15, marginBottom: 4 },
  shadow: { shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },

  emptyWrap: { alignItems: 'center', paddingVertical: 55, paddingHorizontal: 20 },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#e8f8ea', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: '#288928', textAlign: 'center', marginBottom: 12 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', lineHeight: Math.ceil(typography.detail * 1.5), marginBottom: 8 },

  alertCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 , ...alertLayout.card },

  alertCardTextWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'space-between', marginBottom: 12 , ...alertLayout.headerRow },
  alertCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' },
  alertOpen: { backgroundColor: '#fceaea', color: '#912525' },
  alertPending: { backgroundColor: '#fff5d6', color: '#725414' },
  alertEscalated: { backgroundColor: '#fceaea', color: '#912525' },
  alertClosed: { backgroundColor: '#eaf5ed', color: '#24643a' },
  alertTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 12 },
  locationBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 , ...alertLayout.location },

  locationText: { flex: 1, fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#333' },

  buttonWrap: { flexDirection: 'row', gap: 8, marginBottom: 4 },

  detailsButton: { backgroundColor: '#d3e5f8', borderColor: '#245490', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, paddingVertical: 10, marginTop: 8 , ...alertLayout.details },
  detailsText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#245490' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  headCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 7, backgroundColor: '#fff' , ...alertLayout.card },
  headCardTextWrap: { flex: 1 },
  headCardTitle: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  headCardSubtitle: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },
});
