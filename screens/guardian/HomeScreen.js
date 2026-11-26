import { alertLayout, colors, typography, spacing } from '../../constants/theme';
import Avatar from "../../components/Avatar";
import { alertStageLabel, ALERT_STAGES } from '../../utils/models';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/GuardianTabButtons";
import { useAppData } from "../../contexts/AppDataContext";
import { typeStyles } from '../../constants/auditTypes';

export default function HomeScreen({ navigation }) {
  const { alerts, users, residents, account, auditLogs, myPhotoUrl } = useAppData();

  const guardianAccount = useMemo(() => users.find((user) => user.id === account.id), [users, account.id]);
  const wardIds = guardianAccount?.wardIds || [];

  const myWards = useMemo(() => residents.filter((resident) => wardIds.includes(resident.id)), [residents, wardIds]);

  const myAlerts = useMemo(
    () => alerts.filter((alert) => wardIds.includes(alert.residentId) && alert.status !== 'closed'),
    [alerts, wardIds]
  );
  const currentAlert = myAlerts[0];

  const recentActivity = useMemo(
    () =>
      auditLogs
        .filter((entry) => {
          const isWardEntry = entry.residentId && wardIds.includes(entry.residentId);
          const isMyAction = entry.actorRole === 'Guardian' && entry.actor_id === account.id;
          return isWardEntry || isMyAction;
        })
        .slice(0, 3),
    [auditLogs, wardIds, account.id]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
          <Avatar uri={myPhotoUrl} style={styles.photo} />
          <View style={{ flex: 1, marginTop: 3 }}>
            <Text style={styles.subheading}>Welcome, {account.fullName}</Text>
            <Text style={styles.roleLine}>{'Barangay Guardian'} • {account.barangayName}</Text>
          </View>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {!currentAlert ? (
          <View style={styles.emptyCard}>
            <FontAwesome5 name="check-circle" size={24} color={colors.successInk} />
            <Text style={styles.emptyTitle}>No active alerts</Text>
            <Text style={styles.emptyText}>Always remember to keep your ward safe and healthy.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, styles.overviewTitle]}>Active Ward Alert</Text>
              <View style={styles.alertCount}>
                <Text style={styles.alertCountText}>{myAlerts.length}</Text>
              </View>
            </View>
            <View style={[styles.alertCard, styles.alertCardActive]}>
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, statusStyle(currentAlert.status)]}>
                  {currentAlert.status === 'escalated' ? 'Alert Escalated'
                    : currentAlert.status === 'closed' ? 'Alert Closed'
                    : currentAlert.status === 'pending' ? 'Alert Pending'
                    : 'Open Alert'}
                </Text>
                <Text style={styles.alertTime}>{currentAlert.scannedAt}</Text>
              </View>

              <Text style={styles.heading1}>{currentAlert.residentName}</Text>
              <Text style={styles.typeText}>{currentAlert.residentType}</Text>
              <Text style={styles.alertSubtitle}>Scanned by {currentAlert.scannedBy || 'a Bystander'}</Text>

              {currentAlert.location ? (
                <View style={styles.locationBox}>
                  <FontAwesome5 name="map-marker-alt" size={14} color={colors.primary} />
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
                <Text style={[styles.statusText, currentAlert.guardianStatus === 'Not Safe' ? styles.notSafe : currentAlert.guardianStatus === 'Safe' ? styles.safe : styles.waiting]}>Guardian: {'\n'}{currentAlert.guardianStatus}</Text>
                <Text style={[styles.statusText, currentAlert.responderStatus === 'Not Safe' ? styles.notSafe : currentAlert.responderStatus === 'Safe' ? styles.safe : styles.waiting]}>Responder: {'\n'}{currentAlert.responderStatus !== 'Waiting' ? currentAlert.responderStatus: currentAlert.responderName ? 'Assigned': 'Waiting'}</Text>
              </View>

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
                    <Text style={[styles.buttonText, styles.safeText]}>Mark Safe</Text>
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
                    <Text style={[styles.buttonText, styles.notSafeText]}>Mark Not Safe</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AlertDetails', { alertId: currentAlert.id })}>
                <Text style={styles.detailsText}>Tap for Full Details</Text>
                <FontAwesome5 name="caret-right" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>My Wards</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ResidentScreen')}><Text style={styles.viewAll}>View All ›</Text></TouchableOpacity>
        </View>

        {myWards.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No wards found linked to this account</Text>
          </View>
        ) : (
          myWards.map((ward) => (
          <TouchableOpacity
            key={ward.id}
            style={styles.residentCard}
            onPress={() => navigation.navigate('ProfileScreen', { residentId: ward.id })}
            activeOpacity={0.8}
          >
            <Avatar uri={ward.photoUrl} name={ward.name} style={styles.residentPhoto} />
            <View style={styles.residentTextWrap}>
              <Text style={styles.residentName}>{ward.name}</Text>
              <Text style={styles.residentMeta}>{ward.type}</Text>
              <Text style={styles.residentMeta}>{ward.code || 'No card number yet'}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={13} color={colors.textSecondary} />
          </TouchableOpacity>
          ))
        )}

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
                    <FontAwesome5 name={type.icon} size={13} color={type.color} />
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

function statusStyle(status) {
  if (status === 'escalated') return styles.alertEscalated;
  if (status === 'closed') return styles.alertClosed;
  if (status === 'pending') return styles.alertPending;
  return styles.alertOpen;
}

const styles = StyleSheet.create({
  emptyCard: { alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 22 },
  container: { flex: 1, backgroundColor: colors.background }, 
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 }, 
  scrollView: { flex: 1 }, scrollContent: { padding: spacing.screen, paddingTop: 0 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 10 },
  photo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.8, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 13 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4, marginBottom: 0 }, 
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginLeft: 0, marginTop: 8, marginBottom: 6},  
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textSecondary }, 
  roleLine: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: colors.primary, marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 }, 

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary, marginTop: 12, marginBottom: 10 },
  overviewTitle: { marginTop: 10, marginBottom: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  alertCount: { minWidth: 26, height: 26, borderRadius: 14, backgroundColor: colors.alertInk, alignItems: 'center', justifyContent: 'center', marginTop: -4 },
  alertCountText: { color: colors.onPrimary, fontSize: typography.caption, fontFamily: 'Poppins_700Bold', marginTop: 2, marginLeft: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 }, 
  viewAll: { color: colors.textSecondary, fontFamily: 'Poppins_500Medium', fontSize: typography.caption }, 
  
  residentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  residentPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.textMuted, marginRight: 14 },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentType: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 1 },
  residentMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },

  shadow: { shadowColor: colors.shadow, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  headCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: colors.surface , ...alertLayout.card }, 
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginTop: -10, marginBottom: -10 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: colors.border, marginVertical: 8 },
  activityIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, 
  activityTitle: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' }, 
  activityDetail: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }, 
  activityTime: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  emptyListText: { fontSize: typography.body, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginBottom: 10, textAlign: 'center' },
  
  empty: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: typography.body, color: colors.textSecondary, fontFamily: 'Poppins_400Regular', marginTop: 4, textAlign: 'center' },

  alertCard: { flexDirection: 'column', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, ...alertLayout.card },
  alertCardActive: { borderColor: colors.alert, shadowColor: colors.alert, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  alertCardTextWrap: { flexWrap: 'wrap', gap: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, ...alertLayout.headerRow },
  alertCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 16, fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' },  alertOpen: { color: colors.alertInk, backgroundColor: colors.alertSoft },
  alertPending: { color: colors.warningInk, backgroundColor: colors.warningSoft },
  alertEscalated: { color: colors.alertInk, backgroundColor: colors.alertSoft },
  alertClosed: { color: colors.successInk, backgroundColor: colors.successSoft },
  alertTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: colors.textSecondary },
  alertSubtitle: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', marginBottom: 9 },
  time: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: colors.textSecondary },
  typeText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.primary, marginLeft: 0, marginBottom: 4},
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: 10, padding: 10, marginBottom: 8, ...alertLayout.location },
  locationLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, marginLeft: 10 },
  locationText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textPrimary, marginLeft: 10, marginTop: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 8},
  statusText: { flex: 1, textAlign: 'center', fontSize: typography.caption, fontFamily: 'Poppins_500Medium', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginHorizontal: 4, borderWidth: 1 },
  waiting: { color: colors.warningInk, borderColor: colors.warningInk, backgroundColor: colors.warningSoft }, 
  safe: { color: colors.successInk, borderColor: colors.successInk, backgroundColor: colors.successSoft }, 
  notSafe: { color: colors.alertInk, borderColor: colors.alertInk, backgroundColor: colors.alertSoft },
  buttonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  button: { flex: 1, alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingVertical: 10 , minHeight: spacing.control, justifyContent: 'center' },
  buttonSafe: { borderColor: colors.successInk, backgroundColor: colors.successSoft, marginRight: 6 },
  buttonNotSafe: { borderColor: colors.alertInk, backgroundColor: colors.alertSoft, marginLeft: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' },
  safeText: { color: colors.successInk },
  notSafeText: { color: colors.alertInk },
  detailsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.primary, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: colors.primarySoft , minHeight: spacing.control , ...alertLayout.details },
  detailsText: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: colors.primary },
});
