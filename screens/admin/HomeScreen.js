import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { useAdminData } from '../../AdminDataContext';

const ADMIN_NAME = 'Maria Reyes';
const ADMIN_POSITION = 'Barangay Secretary';
const BARANGAY = 'Barangay 206';

function getStatusLabel(alert) {
  if (alert.status === 'escalated') return 'Escalated';
  if (alert.status === 'closed') return 'Closed';
  if (alert.status === 'pending') return 'Pending';
  return 'Open Alert';
}

function getStatusMessage(alert) {
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
  const { alerts, residents, users } = useAdminData();

  const counts = useMemo(() => ({
    active: alerts.filter((a) => a.status !== 'closed').length,
    unassigned: alerts.filter((a) => a.status === 'open').length,
    residents: residents.length,
    users: users.length,
  }), [alerts, residents, users]);

  const attentionAlerts = alerts.filter((a) => a.status !== 'closed').slice(0, 3);
  const recentActivity = [
    { title: 'Responder assigned to Alert #0003', detail: 'Rowendo Carpino', time: '12:00 PM' },
    { title: 'New resident enrolled', detail: 'Yeti Kaye', time: '11:42 AM' },
    { title: 'Alert #0004 closed', detail: 'Both confirmations completed', time: '11:20 AM' },
  ];

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
        <Text style={styles.subheading}>Welcome, {ADMIN_NAME}</Text>
        <Text style={styles.roleLine}>{ADMIN_POSITION} • {BARANGAY}</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>System Overview</Text>
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
            <Text style={styles.cardLocation}>📍 {alert.location}</Text>
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
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, scrollView: { flex: 1 }, scrollContent: { padding: 20, paddingTop: 0 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -5 }, subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666' }, roleLine: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 2, marginBottom: 16 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 14, marginBottom: 10 }, sectionTitle: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#a83232', marginTop: 5, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, gridCard: { width: '48%', minHeight: 92, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 10, backgroundColor: '#fff' }, gridTextWrap: { flex: 1, marginLeft: 10 }, gridCount: { fontSize: 21, fontFamily: 'Poppins_700Bold' }, gridLabel: { fontSize: 11, lineHeight: 14, fontFamily: 'Poppins_400Regular', color: '#777' }, shadow: { shadowColor: '#777', shadowOffset: { width: 3, height: 5 }, shadowOpacity: 0.18, shadowRadius: 5, elevation: 3 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, viewAll: { color: '#666', fontFamily: 'Poppins_500Medium', fontSize: 13 }, headCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 13, marginBottom: 10, backgroundColor: '#fff' }, escalatedCard: { borderColor: '#a83232' }, cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, statusPill: { borderRadius: 10, paddingHorizontal: 11, paddingVertical: 3, fontSize: 12, fontFamily: 'Poppins_600SemiBold' }, status_escalated: { color: '#a83232', backgroundColor: '#fbd1d1' }, status_open: { color: '#a83232', backgroundColor: '#fbd1d1' }, status_pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, status_closed: { color: '#288928', backgroundColor: '#a1fbaa' }, cardTime: { fontSize: 11, color: '#777', fontFamily: 'Poppins_400Regular' }, cardName: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', marginTop: 8 }, cardType: { fontSize: 12, color: '#666', fontFamily: 'Poppins_400Regular' }, cardLocation: { fontSize: 12, color: '#555', fontFamily: 'Poppins_400Regular', marginTop: 4 }, cardSubtitle: { fontSize: 12, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 5 }, emptyCard: { alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 22 }, emptyTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', marginTop: 7 }, emptyText: { fontSize: 12, color: '#888', fontFamily: 'Poppins_400Regular', marginTop: 2 }, activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }, activityIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ffdcdc', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, activityTitle: { fontSize: 13, fontFamily: 'Poppins_500Medium' }, activityDetail: { fontSize: 11, color: '#777', fontFamily: 'Poppins_400Regular' }, activityTime: { fontSize: 10, color: '#888', fontFamily: 'Poppins_400Regular' },
});
