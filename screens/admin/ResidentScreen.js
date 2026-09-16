import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { useAdminData } from '../../AdminDataContext';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'Senior Citizen', label: 'SC' },
  { key: 'Person with Disability', label: 'PWD' },
];

export default function ResidentScreen({ navigation }) {
  const { residents } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredResidents = useMemo(() => residents.filter((resident) => {
    const matchesSearch = `${resident.name} ${resident.id}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeFilter === 'all' || resident.type === activeFilter;
    return matchesSearch && matchesType;
  }), [residents, searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Residents</Text>
          <TouchableOpacity style={styles.manageButton} onPress={() => navigation.navigate('ManageUsers')}>
            <FontAwesome5 name="users" size={13} color="#a83232" />
            <Text style={styles.manageText}>Manage Users</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={18} color="#a83232" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <View style={styles.filterWrap}>
            {filters.map((filter) => {
              const active = activeFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterButton, active && styles.filterButtonActive]}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredResidents.map((resident) => (
          <TouchableOpacity
            key={resident.id}
            style={styles.residentCard}
            onPress={() => navigation.navigate('ProfileScreen', { resident })}
            activeOpacity={0.8}
          >
            <Image source={require('../../assets/profile.png')} style={styles.residentPhoto} />
            <View style={styles.residentTextWrap}>
              <Text style={styles.residentName}>{resident.name}</Text>
              <Text style={styles.residentType}>{resident.type === 'Senior Citizen' ? 'Senior Citizen' : 'Person with Disability'}</Text>
              <Text style={styles.residentMeta}>{resident.id}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={13} color="#666" />
          </TouchableOpacity>
        ))}

        {filteredResidents.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No residents found</Text>
            <Text style={styles.emptyText}>Try another name, ID, or resident type.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContent}>
        <TouchableOpacity style={styles.enrollButton} onPress={() => navigation.navigate('EnrollNewResident')}>
          <Text style={styles.enrollButtonText}>+ Enroll New Resident</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { fontSize: 28, fontFamily: 'Poppins_700Bold', marginBottom: 10 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  manageButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ffdcdc', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  manageText: { color: '#a83232', fontSize: 10, fontFamily: 'Poppins_600SemiBold', marginLeft: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffdcdc', borderWidth: 1, borderColor: '#a83232', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 6, marginBottom: 16, marginTop: 10 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: '#333' },
  filterBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, marginTop: -10, marginBottom: 6 },
  filterWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 8 },
  filterButton: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 5, marginHorizontal: 2, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  filterButtonActive: { backgroundColor: '#ffdcdc', borderColor: '#a83232', paddingVertical: 4, paddingHorizontal: 9 },
  filterLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 2 },
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },
  residentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#625350', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  residentPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c4c4c4', marginRight: 14 },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentType: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#555', marginBottom: 1 },
  residentMeta: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#888' },
  empty: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
  emptyText: { fontSize: 12, color: '#888', fontFamily: 'Poppins_400Regular', marginTop: 4, textAlign: 'center' },
  enrollButton: { borderWidth: 1, borderColor: '#a83232', borderRadius: 10, backgroundColor: '#ffdcdc', paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  enrollButtonText: { color: '#a83232', fontSize: 15, fontFamily: 'Poppins_500Medium' },
});
