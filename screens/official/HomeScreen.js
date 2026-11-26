import { alertLayout, colors, typography, spacing } from '../../constants/theme';
import Avatar from "../../components/Avatar";
import { alertStageLabel } from '../../utils/models';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/TabButtons";
import { useAppData } from "../../contexts/AppDataContext";
import { typeStyles } from "../../constants/auditTypes";

function getStatusLabel(alert) {
  return alertStageLabel(alert.status);
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
  const { alerts, residents, users, auditLogs, account, myPhotoUrl } = useAppData();

  const counts = useMemo(() => ({
    active: alerts.filter((a) => a.status !== 'closed').length,
    unassigned: alerts.filter((a) => a.status !== 'closed' && !a.responderId).length,
    residents: residents.length,
    users: users.length,
  }), [alerts, residents, users]);

  const attentionAlerts = alerts.filter((a) => a.status !== 'closed').slice(0, 3);
  const recentActivity = auditLogs.slice(0, 3);

  const openAlerts = () => navigation.navigate('AlertScreen', { filter: 'active' });
  const pendingAssignments = () => navigation.navigate('AlertScreen', { filter: 'unassigned' });

  const cards = [
    { label: 'Active Alerts', count: counts.active, icon: 'exclamation-triangle', onPress: openAlerts },
    { label: 'Registered Residents', count: counts.residents, icon: 'users', onPress: () => navigation.navigate('ResidentScreen') },
    { label: 'Pending Assignments', count: counts.unassigned, icon: 'clock', onPress: pendingAssignments },
    { label: 'System Users', count: counts.users, icon: 'user-shield', onPress: () => navigation.navigate('ManageUsers') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
          <Avatar uri={myPhotoUrl} style={styles.photo} />
          <View style={{ flex: 1, marginTop: 3 }}>
            <Text style={styles.subheading}>Welcome, {account.fullName}</Text>
            <Text style={styles.roleLine}>{'Barangay Official'} • {account.barangayName}</Text>
          </View>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, styles.overviewTitle]}>System Overview</Text>
        <View style={styles.grid}>
          {cards.map((item) => (
            <TouchableOpacity key={item.label} style={[styles.gridCard, styles.shadow]} onPress={item.onPress} activeOpacity={0.78}>
              <Text style={styles.gridLabel}>{item.label}</Text>
              <View style={{ flexDirection: 'row', paddingHorizontal: 4 }}>
                <FontAwesome5 name={item.icon} size={28} color={colors.primary} style={{ marginTop: 4 }}/>
                <View style={styles.gridTextWrap}>
                  <Text style={styles.gridCount}>{item.count}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={13} color={colors.primary} style={{ marginTop: 12}}/>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Needs Attention</Text>
          <TouchableOpacity onPress={openAlerts}><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity>
        </View>

        {attentionAlerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <FontAwesome5 name="check-circle" size={24} color={colors.successInk} />
            <Text style={styles.emptyTitle}>No need attention</Text>
            <Text style={styles.emptyText}>All current alerts have been closed.</Text>
          </View>
        ) : attentionAlerts.map((alert) => (
          <TouchableOpacity key={alert.id} style={[styles.headCard, styles.shadow, alert.status === 'escalated' && styles.escalatedCard]} onPress={() => alert.status === 'open' ? navigation.navigate('AssignResponder', { alertId: alert.id }) : navigation.navigate('AlertDetails', { alertId: alert.id })} activeOpacity={0.8}>
            <View style={styles.cardTopRow}>
              <Text style={[styles.statusPill, styles[`status_${alert.status}`]]}>{getStatusLabel(alert)}</Text>
              <Text style={styles.cardTime}>{alert.scannedAt}</Text>
            </View>
            <Text style={styles.cardName}>{alert.residentName}</Text>
            <Text style={styles.cardType}>Type:  {alert.residentType}</Text>
            <View style={styles.locationRow}><FontAwesome5 name="map-marker-alt" size={16} color={colors.primary} /><Text style={styles.cardLocation}>{alert.location}</Text></View>
            <Text style={styles.cardSubtitle}>{getStatusMessage(alert)}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AuditLogScreen')}><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity>
        </View>

        {recentActivity.length === 0 ? (
          <Text style={styles.emptyListText}>No recent activity yet.</Text>
        ) : (
        <View style={[styles.headCard, styles.shadow]}>
          {recentActivity.map((item, index) => {
            const type = typeStyles[item.category] || typeStyles.system;
            return (
              <React.Fragment key={item.id || index}>
                <View style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: type.background }]}>
                    <FontAwesome5 name={type.icon} size={14} color={type.color} />
                  </View>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityDetail}>{item.subject}</Text>
                    <Text style={styles.activityDetail}>{item.detail}</Text>
                  </View>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
                {index < recentActivity.length - 1 && <View style={styles.activityDivider} />}
              </React.Fragment>
            );
          })}
        </View>
        )}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyListText: { fontSize: typography.body, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginBottom: 10, textAlign: 'center' },
  container: { flex: 1, backgroundColor: colors.background }, 
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 }, 
  scrollView: { flex: 1 }, scrollContent: { padding: spacing.screen, paddingTop: 0 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 10 },
  photo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.8, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 13 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4, marginBottom: 0 }, 
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textSecondary }, 
  roleLine: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: colors.primary, marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 }, 
  
  sectionTitle: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary, marginTop: 12, marginBottom: 10 },
  overviewTitle: { marginTop: 10, marginBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, 
  gridCard: { width: '49%', minHeight: 88, borderWidth: 1, borderColor: colors.border, borderRadius: 12, flexDirection: 'column', alignItems: 'center', padding: 10, marginBottom: 10, backgroundColor: colors.surface }, 
  gridTextWrap: { flex: 1, marginRight: 6 }, 
  gridCount: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', textAlign: 'center' }, 
  gridLabel: { fontSize: typography.caption, lineHeight: 21, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 12 }, 
  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 }, 
  viewAll: { color: colors.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: typography.caption }, 
  
  headCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: colors.surface , ...alertLayout.card }, 
  escalatedCard: { borderColor: colors.alert, shadowColor: colors.alert, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', gap: 8 , ...alertLayout.headerRow }, 
  statusPill: { borderRadius: 10, paddingHorizontal: 11, paddingVertical: 3, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, 
  status_escalated: { color: colors.alertInk, backgroundColor: colors.alertSoft }, 
  status_open: { color: colors.alertInk, backgroundColor: colors.alertSoft }, 
  status_pending: { color: colors.warningInk, backgroundColor: colors.warningSoft }, 
  status_closed: { color: colors.successInk, backgroundColor: colors.successSoft }, 
  
  cardTime: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }, 
  cardName: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 8 }, 
  cardType: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }, 
  cardLocation: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', flex: 1 }, 
  cardSubtitle: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 5 }, 
  
  emptyCard: { alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 22 }, 
  emptyTitle: { fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold', marginTop: 7 }, 
  emptyText: { fontSize: typography.body, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 2 }, 
  
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginTop: -10, marginBottom: -10 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: colors.border, marginVertical: 8 },
  activityIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, 
  activityTitle: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' }, 
  activityDetail: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }, 
  activityTime: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
});