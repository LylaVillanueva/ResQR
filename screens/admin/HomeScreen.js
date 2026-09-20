import { alertLayout } from '../../theme';
import { typography, spacing } from '../../theme';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../component/TabButtons";
import { useAppData } from "../../lib/AppDataContext";


function getStatusLabel(alert) {
  if (alert.status === 'escalated') return 'Escalated';
  if (alert.status === 'closed') return 'Closed';
  if (alert.status === 'pending') return 'Pending';
  return 'Open Alert';
}

function getStatusMessage(alert) {
  if (alert.officialReviewRequired && alert.status !== 'closed') return alert.readyForReview ? 'Awaiting official review' : 'Responder confirmation and report required';
  if (alert.status === 'escalated') return alert.escalationReason || 'Further response required';
  if (alert.status === 'closed') return 'Both confirmations completed';
  if (alert.status === 'pending') {
    if (alert.guardianStatus === 'Safe') return 'Guardian marked Safe • Waiting for responder';
    if (alert.responderStatus === 'Safe') return 'Responder marked Safe • Waiting for guardian';
    return 'Waiting for confirmation';
  }
  return 'Waiting for responder assignment';
}

export default function HomeScreen({ navigation }) {
  const { alerts, residents, users, auditLogs, account } = useAppData();

  const counts = useMemo(() => ({
    active: alerts.filter((a) => a.status !== 'closed').length,
    unassigned: alerts.filter((a) => a.status === 'open').length,
    residents: residents.length,
    users: users.length,
  }), [alerts, residents, users]);

  const attentionAlerts = alerts.filter((a) => a.status !== 'closed').slice(0, 3);
  const recentActivity = auditLogs.slice(0, 3);

  const openAlerts = () => navigation.navigate('AlertScreen', { filter: 'active' });
  const pendingAssignments = () => navigation.navigate('AlertScreen', { filter: 'unassigned' });

  const cards = [
    { label: 'Active Alerts', count: counts.active, icon: 'exclamation-triangle', onPress: openAlerts },
    { label: 'Pending Assignments', count: counts.unassigned, icon: 'clock', onPress: pendingAssignments },
    { label: 'Registered Residents', count: counts.residents, icon: 'users', onPress: () => navigation.navigate('ResidentScreen') },
    { label: 'System Users', count: counts.users, icon: 'user-shield', onPress: () => navigation.navigate('ManageUsers') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, {account.fullName}</Text>
        <Text style={styles.roleLine}>{'Barangay Official'} • {account.barangayName}</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, styles.overviewTitle]}>System Overview</Text>
        <View style={styles.grid}>
          {cards.map((item) => (
            <TouchableOpacity key={item.label} style={[styles.gridCard, styles.shadow]} onPress={item.onPress} activeOpacity={0.78}>
              <FontAwesome5 name={item.icon} size={28} color="#a83232" />
              <View style={styles.gridTextWrap}>
                <Text style={styles.gridCount}>{item.count}</Text>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={10} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Needs Attention</Text>
          <TouchableOpacity onPress={openAlerts}><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity>
        </View>

        {attentionAlerts.length === 0 ? (
          <View style={styles.emptyCard}><FontAwesome5 name="check-circle" size={24} color="#288928" /><Text style={styles.emptyTitle}>No active alerts</Text><Text style={styles.emptyText}>All current alerts have been closed.</Text></View>
        ) : attentionAlerts.map((alert) => (
          <TouchableOpacity key={alert.id} style={[styles.headCard, styles.shadow, alert.status === 'escalated' && styles.escalatedCard]} onPress={() => alert.status === 'open' ? navigation.navigate('AssignResponder', { alertId: alert.id }) : navigation.navigate('AlertDetails', { alertId: alert.id })} activeOpacity={0.8}>
            <View style={styles.cardTopRow}>
              <Text style={[styles.statusPill, styles[`status_${alert.status}`]]}>{getStatusLabel(alert)}</Text>
              <Text style={styles.cardTime}>{alert.scannedAt}</Text>
            </View>
            <Text style={styles.cardName}>{alert.residentName}</Text>
            <Text style={styles.cardType}>{alert.residentType}</Text>
            <View style={styles.locationRow}><FontAwesome5 name="map-marker-alt" size={16} color="#a83232" /><Text style={styles.cardLocation}>{alert.location}</Text></View>
            <Text style={styles.cardSubtitle}>{getStatusMessage(alert)}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AuditLogScreen')}><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity>
        </View>

        {recentActivity.map((item, index) => (
          <View key={index} style={styles.activityRow}>
            <View style={styles.activityIcon}><FontAwesome5 name={index === 0 ? 'user-check' : index === 1 ? 'user-plus' : 'check'} size={13} color="#a83232" /></View>
            <View style={{ flex: 1 }}><Text style={styles.activityTitle}>{item.title}</Text><Text style={styles.activityDetail}>{item.detail}</Text></View>
            <Text style={styles.activityTime}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 }, scrollView: { flex: 1 }, scrollContent: { padding: spacing.screen, paddingTop: 0 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 0 }, subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666' }, roleLine: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: '#a83232', marginTop: 2, marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 6, marginBottom: 4 }, sectionTitle: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: '#222', marginTop: 12, marginBottom: 12 },
  overviewTitle: { marginTop: 8, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, gridCard: { width: '48%', minHeight: 88, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 8, backgroundColor: '#fff' }, gridTextWrap: { flex: 1, marginLeft: 10 }, gridCount: { fontSize: typography.section, fontFamily: 'Poppins_700Bold' }, gridLabel: { fontSize: typography.caption, lineHeight: 21, fontFamily: 'Poppins_400Regular', color: '#777' }, shadow: { shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 }, viewAll: { color: '#666', fontFamily: 'Poppins_500Medium', fontSize: typography.caption }, headCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: '#fff' , ...alertLayout.card }, escalatedCard: { borderColor: '#a83232' }, cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', gap: 8 , ...alertLayout.headerRow }, statusPill: { borderRadius: 10, paddingHorizontal: 11, paddingVertical: 3, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, status_escalated: { color: '#a83232', backgroundColor: '#fbd1d1' }, status_open: { color: '#a83232', backgroundColor: '#fbd1d1' }, status_pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, status_closed: { color: '#288928', backgroundColor: '#a1fbaa' }, cardTime: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular' }, cardName: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 8 }, cardType: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_400Regular' }, cardLocation: { fontSize: typography.caption, color: '#555', fontFamily: 'Poppins_400Regular', flex: 1 }, cardSubtitle: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 5 }, emptyCard: { alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 22 }, emptyTitle: { fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold', marginTop: 7 }, emptyText: { fontSize: typography.body, color: '#888', fontFamily: 'Poppins_400Regular', marginTop: 2 }, activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }, activityIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ffdcdc', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, activityTitle: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' }, activityDetail: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular' }, activityTime: { fontSize: typography.caption, color: '#888', fontFamily: 'Poppins_400Regular' },
});
