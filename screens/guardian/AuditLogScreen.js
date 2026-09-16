import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/GuardianTabButtons';
import { useAdminData } from '../../AdminDataContext';

const GUARDIAN_NAME = 'Ana Santos';
const filters = [
  { key: 'all', label: 'All' },
  { key: 'alert', label: 'Alert Log' },
  { key: 'escalation', label: 'Escalation Log' },
  { key: 'assignment', label: 'Assign Log' },
];

export default function AuditLogScreen({ navigation }) {
  const { auditLogs, users } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const guardianAccount = useMemo(() => users.find((user) => user.name === GUARDIAN_NAME), [users]);
  const wardIds = guardianAccount?.wardIds || [];

  const guardianLogs = useMemo(() => auditLogs.filter((entry) => {
    const isWardEntry = entry.residentId && wardIds.includes(entry.residentId);
    const isMyAction = entry.actorRole === 'Guardian' && entry.actor === GUARDIAN_NAME;
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
          <View>
            <Text style={styles.heading}>Activity Log</Text>
            <Text style={styles.subheading}>View alerts & activity for your wards</Text>
          </View>
          <TouchableOpacity style={styles.auditButton} onPress={() => navigation.navigate('AlertScreen')}>
            <FontAwesome5 name="bars" size={25} color="#a83232" />
            <Text style={styles.auditButtonText}>Back</Text>
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
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 20, paddingBottom: 20 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginLeft: 8, marginTop: 7 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  auditButton: { alignItems: 'center', padding: 6, marginTop: 8 },
  auditButtonText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#a83232', marginTop: 2 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffdcdc', borderWidth: 1, borderColor: '#a83232', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 6, marginBottom: 16, marginTop: 10 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: '#333' },
  filterBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, marginTop: -10, marginBottom: 6 },
  filterWrap: { alignItems: 'center', paddingRight: 4, marginLeft: 8 },
  filterButton: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 5, marginHorizontal: 2, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  filterButtonActive: { backgroundColor: '#ffdcdc', borderColor: '#a83232' },
  filterLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 2 },
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },
  scanCard: { flexDirection: 'column', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 10, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 12, fontSize: 13, fontFamily: 'Poppins_600SemiBold' },
  statusAccount: { color: '#245490', backgroundColor: '#d3e5f8' },
  statusClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  statusEscalated: { color: '#a83232', backgroundColor: '#fbd1d1' },
  scanCardTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  scanCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', marginLeft: 8, marginTop: 2 },
  actorText: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#888', marginLeft: 8, marginTop: 10 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#777', textAlign: 'center', marginTop: 60 },
});