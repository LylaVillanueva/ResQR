import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { useAdminData } from '../../AdminDataContext';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'user', label: 'User Log' },
  { key: 'alert', label: 'Alert Log' },
  { key: 'assign', label: 'Assign Log' },
];

const typeStyles = {
  account: {
    label: 'Account',
    icon: 'user-plus',
    color: '#245490',
    background: '#d3e5f8',
  },
  assignment: {
    label: 'Responder Assignment',
    icon: 'user-shield',
    color: '#245490',
    background: '#d3e5f8',
  },
  alertClosed: {
    label: 'Alert Closed',
    icon: 'check-circle',
    color: '#288928',
    background: '#a1fbaa',
  },
  alertEscalated: {
    label: 'Alert Escalated',
    icon: 'exclamation-triangle',
    color: '#a83232',
    background: '#fbd1d1',
  },
  resident: {
    label: 'Resident Update',
    icon: 'user-edit',
    color: '#245490',
    background: '#d3e5f8',
  },
  user: {
    label: 'User Update',
    icon: 'user-cog',
    color: '#6b3fb5',
    background: '#eadcff',
  },
  system: {
    label: 'System',
    icon: 'cog',
    color: '#666',
    background: '#eeeeee',
  },
};

const initialAuditLogs = [
  {
    id: 'AUD-0007',
    category: 'account',
    title: 'New resident enrolled',
    subject: 'Maria Santos',
    detail: 'Resident profile was added to the system.',
    time: '3:29 PM',
    date: 'September 10, 2026',
    actor: 'Maria Reyes',
    actorRole: 'Barangay Official',
  },
  {
    id: 'AUD-0006',
    category: 'assignment',
    title: 'Responder assigned',
    subject: 'Maria Santos',
    detail: 'was assigned to alert AL-0001',
    time: '12:00 PM',
    date: 'September 10, 2026',
    actor: 'Maria Reyes',
    actorRole: 'Barangay Official',
  },
  {
    id: 'AUD-0005',
    category: 'alertEscalated',
    title: 'Alert escalated',
    subject: 'Maria Santos',
    detail: 'Guardian marked the resident as Not Safe.',
    time: '11:42 AM',
    date: 'September 10, 2026',
    actor: 'Ana Santos',
    actorRole: 'Guardian',
  },
  {
    id: 'AUD-0004',
    category: 'alertClosed',
    title: 'Alert closed',
    subject: 'Juan Dela Cruz',
    detail: 'Resolved - both parties confirmed Safe.',
    time: '10:30 AM',
    date: 'September 10, 2026',
    actor: 'Jadrick Coast',
    actorRole: 'Barangay Responder',
  },
  {
    id: 'AUD-0003',
    category: 'resident',
    title: 'Resident information updated',
    subject: 'Pedro Reyes',
    detail: 'Resident profile information was updated.',
    time: '9:18 AM',
    date: 'September 10, 2026',
    actor: 'Maria Reyes',
    actorRole: 'Barangay Official',
  },
  {
    id: 'AUD-0002',
    category: 'user',
    title: 'User role updated',
    subject: 'Rowendo Carpino',
    detail: 'User role changed to Barangay Responder.',
    time: '4:10 PM',
    date: 'September 9, 2026',
    actor: 'Maria Reyes',
    actorRole: 'Barangay Official',
  },
  {
    id: 'AUD-0001',
    category: 'system',
    title: 'System settings updated',
    subject: 'Notification settings',
    detail: 'Emergency alert notification settings were changed.',
    time: '3:45 PM',
    date: 'September 9, 2026',
    actor: 'Maria Reyes',
    actorRole: 'Barangay Official',
  },
];

export default function AuditLogScreen({ navigation }) {
  const { auditLogs = [] } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const logs = auditLogs.length ? auditLogs : initialAuditLogs;

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'user' &&
          ['account', 'user', 'resident', 'system'].includes(log.category)) ||
        (activeFilter === 'alert' &&
          ['alertClosed', 'alertEscalated'].includes(log.category)) ||
        (activeFilter === 'assign' && log.category === 'assignment');

      const searchableText = [
        log.title,
        log.subject,
        log.detail,
        log.actor,
        log.actorRole,
        log.date,
        log.time,
      ]
        .join(' ')
        .toLowerCase();

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

  const openLog = (log) => {
    const meta = `${log.date} • ${log.time}\n\nPerformed by: ${log.actor}\n${log.actorRole}\n\nAffected record: ${log.subject}\n\n${log.detail}`;
    Alert.alert(log.title, meta);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.heading}>Activity Log</Text>
            <Text style={styles.subheading}>View alert log & user activities</Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('AlertScreen')}
            activeOpacity={0.75}
          >
            <FontAwesome5 name="bars" size={27} color="#a83232" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={20} color="#a83232" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by alert or activity type"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome5 name="times-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterTitle}>Filter by:</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filters.map((filter) => {
              const active = activeFilter === filter.key;

              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterButton, active && styles.filterButtonActive]}
                  onPress={() => setActiveFilter(filter.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.divider} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedLogs).length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="clipboard-list" size={38} color="#bbb" />
            <Text style={styles.emptyTitle}>No activity found</Text>
            <Text style={styles.emptyText}>
              Try another search or filter.
            </Text>
          </View>
        ) : (
          Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeading}>{date}</Text>

              {dateLogs.map((log) => {
                const type = typeStyles[log.category] || typeStyles.system;

                return (
                  <TouchableOpacity
                    key={log.id}
                    style={styles.logCard}
                    onPress={() => openLog(log)}
                    activeOpacity={0.82}
                  >
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: type.background },
                        ]}
                      >
                        <FontAwesome5
                          name={type.icon}
                          size={13}
                          color={type.color}
                          style={styles.badgeIcon}
                        />
                        <Text style={[styles.categoryText, { color: type.color }]}>
                          {type.label}
                        </Text>
                      </View>

                      <Text style={styles.timeText}>{log.time}</Text>
                    </View>

                    <Text style={styles.logTitle}>{log.title}</Text>
                    <Text style={styles.subjectText}>{log.subject}</Text>
                    <Text style={styles.detailText}>{log.detail}</Text>

                    <View style={styles.actorRow}>
                      <FontAwesome5 name="user" size={11} color="#888" />
                      <Text style={styles.actorText}>
                        {log.actor} • {log.actorRole}
                      </Text>
                      <FontAwesome5
                        name="chevron-right"
                        size={12}
                        color="#888"
                        style={styles.chevron}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.exportButton}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              'Export Report',
              'PDF/CSV export will be connected when the reporting module is implemented.'
            )
          }
        >
          <FontAwesome5 name="file-export" size={16} color="#8a6d1d" />
          <Text style={styles.exportButtonText}>Export report (PDF/CSV)</Text>
        </TouchableOpacity>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  heading: {
    fontSize: 27,
    fontFamily: 'Poppins_700Bold',
    color: '#111',
    marginBottom: -3,
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    marginBottom: 18,
  },
  backButton: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  backText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#a83232',
    marginTop: 2,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdcdc',
    borderWidth: 1.2,
    borderColor: '#a83232',
    borderRadius: 14,
    paddingHorizontal: 17,
    minHeight: 62,
    marginTop: 20,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    marginLeft: 12,
    paddingVertical: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 5,
  },
  filterTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
    marginRight: 7,
  },
  filterScroll: {
    alignItems: 'center',
    paddingRight: 4,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 7,
  },
  filterButtonActive: {
    backgroundColor: '#ffdcdc',
    borderColor: '#a83232',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  filterTextActive: {
    color: '#a83232',
    fontFamily: 'Poppins_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 22,
  },
  dateGroup: {
    marginBottom: 4,
  },
  dateHeading: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#555',
    marginBottom: 9,
    marginLeft: 2,
  },
  logCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    padding: 15,
    marginBottom: 13,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: '78%',
  },
  badgeIcon: {
    marginRight: 7,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  logTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111',
    marginBottom: 1,
  },
  subjectText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#222',
    marginBottom: 3,
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    lineHeight: 19,
  },
  actorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actorText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
    marginLeft: 6,
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: '#555',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
    marginTop: 3,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8a6d1d',
    borderRadius: 12,
    backgroundColor: '#ebd28f',
    paddingVertical: 15,
    marginTop: 4,
    marginBottom: 4,
  },
  exportButtonText: {
    color: '#8a6d1d',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: 9,
  },
});
