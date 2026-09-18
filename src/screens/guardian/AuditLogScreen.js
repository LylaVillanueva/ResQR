import { typography, spacing } from '../../theme';
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from '../../components/AppText';
import TextInput from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../components/GuardianTabButtons';
import { useAppData } from '../../context/AppDataContext';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'alert', label: 'Alert Log' },
  { key: 'escalation', label: 'Escalation Log' },
  { key: 'assignment', label: 'Assign Log' },
];

export default function AuditLogScreen({ navigation }) {
  const { auditLogs, users, account } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const guardianAccount = useMemo(() => users.find((user) => user.id === account.id), [users, account.id]);
  const wardIds = guardianAccount?.wardIds || [];

  const guardianLogs = useMemo(() => auditLogs.filter((entry) => {
    const isWardEntry = entry.residentId && wardIds.includes(entry.residentId);
    const isMyAction = entry.actorRole === 'Guardian' && entry.actor_id === account.id;
    if (!isWardEntry && !isMyAction) return false;

    const categoryMatch =
      activeFilter === 'all'
      || (activeFilter === 'assignment' && entry.category === 'assignment')
      || (activeFilter === 'escalation' && entry.category === 'alertEscalated')
      || (activeFilter === 'alert' && ['alert', 'alertClosed'].includes(entry.category));

    const query = searchQuery.trim().toLowerCase();
    const text = [entry.title, entry.subject, entry.detail, entry.actor].join(' ').toLowerCase();

    return categoryMatch && (!query || text.includes(query));
  }), [auditLogs, wardIds, activeFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Activity Log</Text>
            <Text style={styles.subheading}>View alerts & activity for your wards</Text>
          </View>
          <TouchableOpacity style={styles.auditButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('AlertScreen')} accessibilityRole="button" accessibilityLabel="Close activity log">
            <FontAwesome5 name="times" size={24} color="#a83232" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={18} color="#a83232" />
          <TextInput style={styles.searchInput} placeholder="Search by alert or activity type" placeholderTextColor="#999" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterWrap}>
            {filters.map((f) => (
              <TouchableOpacity key={f.key} style={[styles.filterButton, activeFilter === f.key && styles.filterButtonActive]} onPress={() => setActiveFilter(f.key)}>
                <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {guardianLogs.length === 0 ? (
          <Text style={styles.emptyText}>No log entries match this filter.</Text>
        ) : (
          guardianLogs.map((entry) => (
            <View key={entry.id} style={styles.scanCard}>
              <View style={styles.scanCardTextWrap}>
                <Text style={[styles.scanCardTitle, entry.category === 'alertClosed' ? styles.statusClosed : entry.category === 'alertEscalated' ? styles.statusEscalated : styles.statusAccount]}>
                  {entry.category === 'assignment' ? 'Responder Assigned' : entry.title}
                </Text>
                <Text style={styles.scanCardTime}>{entry.time}</Text>
              </View>
              <Text style={styles.heading1}>{entry.subject}</Text>
              <Text style={styles.scanCardSubtitle}>{entry.detail}</Text>
              <Text style={styles.actorText}>{entry.actor} • {entry.actorRole}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, marginTop: 20, paddingBottom: 20 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 4 },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginLeft: 8, marginTop: spacing.section , marginBottom: 12 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  auditButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#ccc', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 0, marginBottom: 16, marginTop: 10 , minHeight: spacing.control },
  searchInput: { flex: 1, fontSize: typography.body, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: '#333' , minHeight: spacing.control, backgroundColor: '#f2f2f2' },
  filterBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, marginTop: -10, marginBottom: 6 },
  filterWrap: { alignItems: 'center', paddingRight: 4, marginLeft: 8 },
  filterButton: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 5, marginHorizontal: 2, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  filterButtonActive: { backgroundColor: '#ffdcdc', borderColor: '#a83232' },
  filterLabel: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 2 },
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },
  scanCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 10, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 12, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  statusAccount: { color: '#245490', backgroundColor: '#d3e5f8' },
  statusClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  statusEscalated: { color: '#a83232', backgroundColor: '#fbd1d1' },
  scanCardTime: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  scanCardSubtitle: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', marginLeft: 8, marginTop: 2 },
  actorText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888', marginLeft: 8, marginTop: 10 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#777', textAlign: 'center', marginTop: 60 },
});