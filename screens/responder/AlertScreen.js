import { sortAlertsByPriority, ALERT_FILTERS, alertStageLabel, alertFilterDescription } from '../../utils/models';
import { alertLayout, colors, typography, spacing } from '../../constants/theme';
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/ResponderTabButtons";
import { useAppData } from "../../contexts/AppDataContext";
import { Dropdown } from 'react-native-element-dropdown';


export default function AlertScreen({ navigation }) {
  const { alerts, account } = useAppData();
  const [activeFilter, setActiveFilter] = useState('all');

  const myAlerts = useMemo(
    () => alerts.filter((alert) => alert.responderId === account.id),
    [alerts, account.id]
  );

  const filteredAlerts = useMemo(
    () => sortAlertsByPriority(activeFilter === 'all'
        ? myAlerts : myAlerts.filter((alert) => alert.status?.toLowerCase() === activeFilter)),
    [myAlerts, activeFilter]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Alerts</Text>
          <TouchableOpacity style={styles.auditButton} onPress={() => navigation.navigate('AuditLogScreen')}>
            <FontAwesome5 name="bars" size={13} color={colors.primary} />
            <Text style={styles.auditText}>Audit Log</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subheading}>{filteredAlerts === 'unassigned' ? 'Alerts waiting for responder assignment' : 'Monitor emergency alert status'}</Text>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <Dropdown
            style={styles.filterSelect} containerStyle={styles.filterMenu} placeholderStyle={styles.filterText}
            selectedTextStyle={styles.filterText} itemTextStyle={styles.filterText} fontFamily="Poppins_500Medium"
            data={ALERT_FILTERS} labelField="label" valueField="key" value={activeFilter}
            onChange={(item) => setActiveFilter(item.key)} iconColor={colors.textSecondary} activeColor={colors.primarySoft} dropdownPosition="auto"
          />
        </View>
        <Text style={styles.filterHint}>Showing: {alertFilterDescription(activeFilter)}</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <FontAwesome5 name="clipboard-check" size={40} color={colors.successInk} />
            <Text style={styles.emptyTitle}>NO ACTIVE ASSIGNMENT</Text>
            <Text style={styles.emptyText}>You currently have no emergency task assigned.</Text>
          </View>
        ) : filteredAlerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, alert.status === 'escalated' && styles.alertCardEscalated]}>
            <View style={styles.alertCardTextWrap}>
              <Text style={[styles.alertCardTitle, statusStyle(alert.status)]}>
                {alertStageLabel(alert.status)}
              </Text>
              <Text style={styles.alertTime}>{alert.scannedAt}</Text>
            </View>

            <Text style={styles.heading1}>{alert.residentName}</Text>
            <Text style={styles.typeText}>{alert.residentType}</Text>
            <Text style={styles.alertSubtitle}>Scanned by {alert.scannedBy || 'A Bystander'}</Text>

            <View style={styles.locationBox}>
              <FontAwesome5 name="map-marker-alt" size={14} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>QR scanned at</Text>
                <Text style={styles.locationText}>{alert.location}</Text>
              </View>
            </View>

            {alert.bystanderNote ? <Text style={styles.alertSubtitle}>Note: {alert.bystanderNote}</Text> : null}

              <View style={styles.statusRow}>
                <Text style={[styles.statusText, alert.guardianStatus === 'Not Safe' ? styles.notSafe : alert.guardianStatus === 'Safe' ? styles.safe : styles.waiting]}>Guardian: {'\n'}{alert.guardianStatus}</Text>
                <Text style={[styles.statusText, alert.responderStatus === 'Not Safe' ? styles.notSafe : alert.responderStatus === 'Safe' ? styles.safe : styles.waiting]}>Responder: {'\n'}{alert.responderStatus !== 'Pending' ? alert.responderStatus: alert.responderName ? 'Assigned': 'Waiting'}</Text>
              </View>

            {alert.status !== 'closed' && alert.responderStatus !== 'Safe' && alert.responderStatus !== 'Not Safe' && (
              <View style={styles.buttonWrap}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSafe, alert.responderStatus === 'Safe' && styles.buttonDisabled]}
                  disabled={alert.responderStatus === 'Safe'}
                  onPress={() => navigation.navigate('ConfirmationScreen', { status: 'Safe', alertId: alert.id, resident: { name: alert.residentName, id: alert.residentId } })}
                >
                  <Text style={[styles.buttonText, styles.safeText]}>Mark Safe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonNotSafe, alert.responderStatus === 'Not Safe' && styles.buttonDisabled]}
                  disabled={alert.responderStatus === 'Not Safe'}
                  onPress={() => navigation.navigate('ConfirmationScreen', { status: 'Not Safe', alertId: alert.id, resident: { name: alert.residentName, id: alert.residentId } })}
                >
                  <Text style={[styles.buttonText, styles.notSafeText]}>Mark Not Safe</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}>
              <Text style={styles.detailsText}>Tap for Full Details</Text>
              <FontAwesome5 name="caret-right" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
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
  container: { flex: 1, backgroundColor: colors.background }, 
  content: { padding: spacing.screen, paddingBottom: 0, marginTop: -14 },
  scrollView: { flex: 1 }, 
  scrollContent: { padding: spacing.screen, paddingTop: 12 , paddingBottom: 32 }, 
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4 }, 
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginLeft: 0, marginTop: 8, marginBottom: 6},
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, marginTop: -8 }, 
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10 },

  auditButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primarySoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, minHeight: 40 },
  auditText: { color: colors.primary, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', marginLeft: 5 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 2, gap: 10 },
  filterSelect: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: colors.surface, minHeight: 42 },
  filterMenu: { borderRadius: 10, borderColor: colors.border, backgroundColor: colors.surface },
  filterText: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  filterLabel: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  filterHint: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginTop: 6, marginBottom: 6 },

  alertCard: { flexDirection: 'column', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, ...alertLayout.card },
  alertCardEscalated: { borderColor: colors.alert, shadowColor: colors.alert, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
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

  emptyWrap: { alignItems: 'center', paddingVertical: 65 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: colors.successInk, marginTop: 14 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: Math.ceil(typography.detail * 1.5) },
});