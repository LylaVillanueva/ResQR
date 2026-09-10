import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { api } from '../../lib/api';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'confirmation', label: 'Confirmation' },
  { key: 'escalated', label: 'Escalated' },
  { key: 'scan', label: 'Scan' },
];

const ACTION_LABELS = {
  'resident.enrolled': 'Resident enrolled',
  'resident.updated': 'Resident record updated',
  'incident.created': 'Alert raised (QR scanned)',
  'incident.confirmation_submitted': 'Safety confirmation submitted',
  'incident.responder_assigned': 'Responder assigned',
  'incident.resolved': 'Alert resolved',
  'incident.closed': 'Alert closed',
  'incident.auto_escalated': 'Alert auto-escalated',
};

function matchesFilter(action, filterKey) {
  if (!filterKey || filterKey === 'all') return true;
  if (filterKey === 'confirmation') return action === 'incident.confirmation_submitted';
  if (filterKey === 'escalated') return action === 'incident.auto_escalated';
  if (filterKey === 'scan') return action === 'incident.created';
  return true;
}

export default function AuditLogScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      api
        .listAuditLogs()
        .then((data) => {
          if (!cancelled) setLogs(data);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const query = searchQuery.trim().toLowerCase();
  const filteredLogs = logs.filter((log) => {
    if (!matchesFilter(log.action, activeFilter)) return false;
    const label = ACTION_LABELS[log.action] || log.action;
    return !query || label.toLowerCase().includes(query);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Activity Log</Text>
            <Text style={styles.subheading /*eme eme lang this pakichange*/}>View alert log & user activities</Text>
          </View>
      
          <TouchableOpacity
            style={styles.auditButton}
            onPress={() => navigation.navigate('AlertScreen')}
          >
            <FontAwesome5 name="bars" size={25} color="#a83232" />
            <Text style={styles.auditButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <View style={styles.searchBar}>
            <FontAwesome5 name="search" size={18} color="#a83232" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by alert or activity type"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
        </View>

        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <View style={styles.filterWrap}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterButton, activeFilter === f.key && styles.filterButtonActive]}
                onPress={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
              >
                <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>  
        </View> 
        <View style={styles.divider} />
      </View>    

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} color="#a83232" />
        ) : error ? (
          <Text style={styles.emptyText}>Couldn't load activity: {error}</Text>
        ) : filteredLogs.length === 0 ? (
          <Text style={styles.emptyText}>No activity matches this filter.</Text>
        ) : (
          filteredLogs.map((log) => (
            <View key={log.id} style={styles.scanCard}>
              <View style={styles.scanCardTextWrap}>
                <Text style={[styles.scanCardTitle, styles.statusAccount]}>{log.actor_role || 'system'}</Text>
                <Text style={styles.scanCardTime}>
                  {new Date(log.created_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.scanCardSubtitle}>{ACTION_LABELS[log.action] || log.action}</Text>
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
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 20 },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginLeft: 8 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888', textAlign: 'center', marginTop: 20 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  auditButton: { alignItems: 'center', padding: 6, marginTop: 8, marginRight: 1 },
  auditButtonText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#a83232', marginTop: 2 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdcdc',
    borderWidth: 1,
    borderColor: '#a83232',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 16,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 8,
    color: '#333',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridCard: {
    height: 100,
    width: '48%',
    aspectRatio: 1.3,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridIcon: { fontSize: 26, fontFamily: 'Poppins_600SemiBold', marginBottom: 6 },
  gridLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#999' },

  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  shadow: {
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  filterBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 4, 
    marginTop: -10,
    marginBottom: 6,
  },
  filterWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: { backgroundColor: '#ffdcdc', borderWidth: 1, borderColor: '#a83232', paddingVertical: 4, paddingHorizontal: 7 },
  filterLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 2 },
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold', },

  scanCard: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: { 
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold', 
    marginBottom: 2 
  },
  statusOpen: { color: '#a83232', backgroundColor: '#fbd1d1', },
  statusPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1', },
  statusClosed: { color: '#288928', backgroundColor: '#a1fbaa', },
  statusAccount: { color: '#245490', backgroundColor: '#d3e5f8', },
  scanCardTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  scanCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', marginLeft: 8 },
  scanCardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginRight: 2,
  },

  pdfButton: {
    borderWidth: 1,
    borderColor: '#8a6d1d',
    borderRadius: 10,
    backgroundColor: '#ebd28f',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  pdfButtonText: { color: '#8a6d1d', fontSize: 16, fontFamily: 'Poppins_500Medium' }
});