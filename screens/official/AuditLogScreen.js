import { typography, spacing, colors } from '../../constants/theme';
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Text from "../../components/AppText";
import TextInput from "../../components/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/TabButtons";
import IncidentLogModal from "../../components/modals/IncidentLogModal";
import { useAppData } from "../../contexts/AppDataContext";
import { typeStyles } from "../../constants/auditTypes";
import { Dropdown } from 'react-native-element-dropdown';

const filters = [
  { label: 'All Activity', value: 'all' },
  { label: 'Account', value: 'account' },
  { label: 'Alert Closed', value: 'alertClosed' },
  { label: 'Alert Escalated', value: 'alertEscalated' },
  { label: 'Alert Confirmation', value: 'alert' },
  { label: 'Resident Update', value: 'resident' },
  { label: 'Responder Assignment', value: 'assignment' },
  { label: 'User Update', value: 'user' },
  { label: 'System', value: 'system' },
];

export default function AuditLogScreen({ navigation }) {
  const { auditLogs = [], account } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const logs = auditLogs;

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'user' && ['account', 'user', 'resident', 'system'].includes(log.category)) ||
        (activeFilter === 'alert' && ['alertClosed', 'alertEscalated'].includes(log.category)) ||
        (activeFilter === 'assign' && log.category === 'assignment');
      const searchableText = [log.title, log.subject, log.detail, log.actor, log.actorRole, log.date, log.time].join(' ').toLowerCase();
      return matchesFilter && (!query || searchableText.includes(query));
    });
  }, [logs, searchQuery, activeFilter]);

  const groupedLogs = useMemo(() => {
    return filteredLogs.reduce((groups, log) => {
      const key = log.date || 'Recent';
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
      return groups;
    }, {});
  }, [filteredLogs]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.heading}>Activity Log</Text>
            <Text style={styles.subheading}>View alert log & user activities</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AlertScreen')} accessibilityRole="button" accessibilityLabel="Close activity log" activeOpacity={0.75}>
            <FontAwesome5 name="times" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={18} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by alert or activity type"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome5 name="times-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <Dropdown
            style={styles.filterSelect} containerStyle={styles.filterMenu} placeholderStyle={styles.filterText}
            selectedTextStyle={styles.filterText} itemTextStyle={styles.filterText} fontFamily="Poppins_500Medium"
            data={filters} labelField="label" valueField="value" value={activeFilter}
            onChange={(item) => setActiveFilter(item.value)} iconColor={colors.textSecondary} activeColor={colors.primarySoft} dropdownPosition="auto"
          />
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedLogs).length === 0 ? (
          <View style={styles.emptyWrap}>
            <FontAwesome5 name="clipboard-list" size={38} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No activity found</Text>
            <Text style={styles.emptyText}>Try another search or filter.</Text>
          </View>
        ) : (
          Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeading}>{date}</Text>
              {dateLogs.map((log) => {
                const type = typeStyles[log.category] || typeStyles.system;
                return (
                  <TouchableOpacity key={log.id} style={styles.logCard} onPress={() => setSelectedLog(log)} activeOpacity={0.82}>
                    <View style={styles.cardTopRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: type.background }]}>
                        <FontAwesome5 name={type.icon} size={13} color={type.color} style={styles.badgeIcon} />
                        <Text style={[styles.categoryText, { color: type.color }]}>{type.label}</Text>
                      </View>
                      <Text style={styles.timeText}>{log.time}</Text>
                    </View>
                    <Text style={styles.logTitle}>{log.title}</Text>
                    <Text style={styles.subjectText}>{log.subject}</Text>
                    <Text style={styles.detailText}>{log.detail}</Text>
                    <View style={styles.actorRow}>
                      <FontAwesome5 name="user" size={11} color={colors.textSecondary} />
                      <Text style={styles.actorText}>{log.actor} • {log.actorRole}</Text>
                      <FontAwesome5 name="chevron-right" size={12} color={colors.textSecondary} style={styles.chevron} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.buttonContent}>
        <TouchableOpacity
          style={styles.exportButton}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Export Report', 'PDF/CSV export will be connected when the reporting module is implemented.')}
        >
          <FontAwesome5 name="file-export" size={14} color={colors.warningInk} style={{ marginTop: -4 }}  />
          <Text style={styles.exportButtonText}> Export report (PDF/CSV)</Text>
        </TouchableOpacity>
      </View>

      <IncidentLogModal visible={!!selectedLog} log={selectedLog} onClose={() => setSelectedLog(null)} />
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screen, paddingBottom: 0, marginTop: -16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, marginTop: 20 },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  headerTextWrap: { flex: 1, paddingRight: 10 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4, marginBottom: -6 }, 
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, marginBottom: 10 }, 
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSunken, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 0, marginBottom: 16, marginTop: 10, minHeight: spacing.control },
  searchInput: { flex: 1, fontSize: typography.body, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: colors.textPrimary, minHeight: spacing.control, backgroundColor: colors.surfaceSunken },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginTop: -4, marginBottom: 12, gap: 10 },
  filterSelect: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: colors.surface, minHeight: 42 },
  filterMenu: { borderRadius: 10, borderColor: colors.border, backgroundColor: colors.surface },
  filterText: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },
  filterLabel: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: 'Poppins_500Medium' },

  dateGroup: { marginBottom: 4 },
  dateHeading: { fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary, marginBottom: 9, marginLeft: 2 },
  logCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 15, marginBottom: 13, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 11, paddingVertical: 6, paddingHorizontal: 12, maxWidth: '78%' },
  badgeIcon: { marginRight: 7 },
  categoryText: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  timeText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  logTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary, marginBottom: 1 },
  subjectText: { fontSize: typography.detail, fontFamily: 'Poppins_500Medium', color: colors.textPrimary, marginBottom: 3 },
  detailText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textPrimary, lineHeight: Math.ceil(typography.caption * 1.5) },
  actorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 11, paddingTop: 9, borderTopWidth: 1, borderTopColor: colors.border },
  actorText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginLeft: 6, flex: 1 },
  chevron: { marginLeft: 8 },

  emptyWrap: { alignItems: 'center', paddingVertical: 65 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: colors.textSecondary, marginTop: 14 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: Math.ceil(typography.detail * 1.5) },

  exportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.warningInk, borderRadius: 10, backgroundColor: colors.warningSoft, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  exportButtonText: { color: colors.warningInk, fontSize: typography.detail, fontFamily: 'Poppins_500Medium' },
});