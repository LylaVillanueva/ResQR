import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'user log', label: 'User Log' },
  { key: 'alert log', label: 'Alert Log' },
  { key: 'assign log', label: 'Assign Log' },
];

export default function AuditLogScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  
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
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusAccount]}>Account</Text>
            <Text style={styles.scanCardTime}>3:29 PM</Text>
          </View>
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>New resident enrolled</Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusAccount]}>Responder Assignment</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>was assigned to alert [number]</Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusClosed]}>Alert Closed</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>Resolved - Both party confirmed safe</Text>
        </View>

      </ScrollView>

      <View style={styles.buttonContent}>
        <TouchableOpacity style={styles.pdfButton}>
          <Text style={styles.pdfButtonText}>Export report (PDF/CSV)</Text>
        </TouchableOpacity>
      </View>

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