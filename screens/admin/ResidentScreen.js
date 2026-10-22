import { typography, spacing } from '../../theme';
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import Text from "../../component/AppText";
import TextInput from "../../component/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../component/TabButtons";
import { useAppData } from "../../lib/AppDataContext";
import { Dropdown } from 'react-native-element-dropdown';

const filters = [
  { key: 'all', label: 'All Types' },
  { key: 'Senior Citizen', label: 'Senior Citizen' },
  { key: 'Person with Disability', label: 'Person with Disability' },
];

const STAFF_TYPES = ['Guardian', 'Responder', 'Barangay Official'];

export default function ResidentScreen({ navigation }) {
  const { residents, account } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredResidents = useMemo(() => residents.filter((resident) => {
    if (STAFF_TYPES.includes(resident.type)) return false;
    const matchesSearch = `${resident.name} ${resident.code || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
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

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <Dropdown
            style={styles.filterSelect} containerStyle={styles.filterMenu} placeholderStyle={styles.filterText}
            selectedTextStyle={styles.filterText} itemTextStyle={styles.filterText} fontFamily="Poppins_500Medium"
            data={filters} labelField="label" valueField="key" value={activeFilter}
            onChange={(item) => setActiveFilter(item.key)} iconColor="#666" activeColor="#ffdcdc" dropdownPosition="auto"
          />
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
            <Image source={require("../../assets/profile.png")} style={styles.residentPhoto} />
            <View style={styles.residentTextWrap}>
              <Text style={styles.residentName}>{resident.name}</Text>
              <Text style={styles.residentType}>{resident.type || 'Resident'}</Text>
              <Text style={styles.residentMeta}>{resident.code || 'No card number yet'}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={13} color="#666" />
          </TouchableOpacity>
        ))}

        {filteredResidents.length === 0 && (
          <View style={styles.emptyWrap}>
            <FontAwesome5 name="user-slash" size={38} color="#bbb" />
            <Text style={styles.emptyTitle}>No residents found</Text>
            <Text style={styles.emptyText}>Try another name, ID, or resident type.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContent}>
        <TouchableOpacity style={styles.enrollButton} onPress={() => navigation.navigate('EnrollNewResident')}>
          <FontAwesome5 name="user-plus" size={14} color="#a83232" style={{ marginTop: -4 }}  />
          <Text style={styles.enrollButtonText}> Enroll New Resident</Text>
        </TouchableOpacity>
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 0, marginTop: -14 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, marginTop: 20 },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4 }, 
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  
  manageButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ffdcdc', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 , minHeight: 40 },
  manageText: { color: '#a83232', fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', marginLeft: 5 },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#ccc', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 0, marginBottom: 16, marginTop: 10 , minHeight: spacing.control },
  searchInput: { flex: 1, fontSize: typography.body, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: '#333' , minHeight: spacing.control, backgroundColor: '#f2f2f2' },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginTop: -4, marginBottom: 12, gap: 10 },
  filterSelect: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#fff', minHeight: 42 },
  filterMenu: { borderRadius: 10, borderColor: '#ddd', backgroundColor: '#fff' },
  filterText: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_500Medium' },
  filterLabel: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_500Medium' },

  residentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  residentPhoto: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c4c4c4', marginRight: 14 },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentType: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#555', marginBottom: 1 },
  residentMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888' },
  
  emptyWrap: { alignItems: 'center', paddingVertical: 65 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: '#555', marginTop: 14 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', marginTop: 8, lineHeight: Math.ceil(typography.detail * 1.5) },
  
  enrollButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#a83232', borderRadius: 10, backgroundColor: '#ffdcdc', paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  enrollButtonText: { color: '#a83232', fontSize: typography.detail, fontFamily: 'Poppins_500Medium' },
});
