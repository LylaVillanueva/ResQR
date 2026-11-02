import { typography, spacing } from '../../theme';
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Text from "../../component/AppText";
import TextInput from "../../component/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import GuardianTabBar from "../../component/GuardianTabButtons";
import { useAppData } from "../../lib/AppDataContext";
import { StatusBadge } from "../../component/ui";
import { Dropdown } from 'react-native-element-dropdown';

const filters = [
  { key: 'all', label: 'All Types' },
  { key: 'Senior Citizen', label: 'Senior Citizen' },
  { key: 'Person with Disability', label: 'Person with Disability' },
];

export default function ResidentScreen({ navigation }) {
  const { users, residents, alerts, account } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const guardianAccount = useMemo(
    () => users.find((user) => user.id === account.id),
    [users, account.id]
  );
  const wardIds = guardianAccount?.wardIds || [];

  const myWards = useMemo(
    () => residents.filter((resident) => wardIds.includes(resident.id)),
    [residents, wardIds]
  );

  const filteredWards = useMemo(() => {
    return myWards.filter((ward) => {
      const matchesSearch = `${ward.name} ${ward.code || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        activeFilter === 'all' || ward.type === activeFilter;
      return matchesSearch && matchesType;
    });
  }, [myWards, searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>My Wards</Text>
        </View>
        <Text style={styles.subheading}>Residents linked to Your Account</Text>
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
            style={styles.filterSelect}
            containerStyle={styles.filterMenu}
            placeholderStyle={styles.filterText}
            selectedTextStyle={styles.filterText}
            itemTextStyle={styles.filterText}
            fontFamily="Poppins_500Medium"
            data={filters}
            labelField="label"
            valueField="key"
            value={activeFilter}
            onChange={(item) => setActiveFilter(item.key)}
            iconColor="#666"
            activeColor="#ffdcdc"
            dropdownPosition="auto"
          />
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredWards.length === 0 ? (
          <View style={styles.emptyWrap}>
            <FontAwesome5 name="user-friends" size={36} color="#888" />
            <Text style={styles.emptyTitle}>
              {myWards.length === 0 ? 'No Wards Linked' : 'No Wards Found'}
            </Text>
            <Text style={styles.emptyText}>
              {myWards.length === 0
                ? 'Your linked ward information will appear here once your Guardian account is connected to a resident.'
                : 'Try another name, ID, or filter.'}
            </Text>
          </View>
        ) : (
          filteredWards.map((ward) => {
            const active = alerts.find(
              (alert) => alert.residentId === ward.id && alert.status !== 'closed'
            );
            const status = active ? active.status : 'safe';
            return (
              <TouchableOpacity
                key={ward.id}
                style={[styles.wardCard, active && styles.wardCardActive]}
                onPress={() => navigation.navigate('ProfileScreen', { residentId: ward.id })}
                activeOpacity={0.85}
              >
                <Image
                  source={require("../../assets/profile.png")}
                  style={[styles.photo, active && styles.photoActive]}
                />
                <View style={styles.textWrap}>
                  <Text style={styles.residentName}>{ward.name}</Text>
                  <Text style={styles.residentType}>{ward.type}</Text>
                  <Text style={styles.residentMeta}>{ward.code}</Text>
                </View>
                <View style={styles.rightCol}>
                  <StatusBadge
                    status={status === 'safe' ? 'closed' : status}
                    label={status === 'safe' ? 'Safe' : statusLabel(status)}
                  />
                  <FontAwesome5
                    name="chevron-right"
                    size={13}
                    color="#666"
                    style={{ marginBottom: 7 }}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <GuardianTabBar />
    </SafeAreaView>
  );
}

function statusLabel(status) {
  if (status === 'escalated') return 'Escalated';
  if (status === 'pending') return 'Pending';
  return 'Open';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 0, marginTop: -14 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 12, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4, marginBottom: -6 },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 10 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#ccc', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 0, marginBottom: 16, marginTop: 10, minHeight: spacing.control },
  searchInput: { flex: 1, fontSize: typography.body, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: '#333', minHeight: spacing.control, backgroundColor: '#f2f2f2' },

  filterRow: { flexDirection: 'row', alignItems: 'center', marginTop: -4, marginBottom: 12, gap: 10 },
  filterSelect: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#fff', minHeight: 42 },
  filterMenu: { borderRadius: 10, borderColor: '#ddd', backgroundColor: '#fff' },
  filterText: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_500Medium' },
  filterLabel: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_500Medium' },

  wardCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  wardCardActive: { borderColor: '#a83232', shadowColor: '#a83232', shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  photo: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#c4c4c4', marginRight: 14 },
  photoActive: { borderColor: '#a83232', borderWidth: 1.3 },
  textWrap: { flex: 1, marginRight: 6 },
  residentName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentType: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#555', marginBottom: 1 },
  residentMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888' },
  rightCol: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },

  emptyWrap: { alignItems: 'center', paddingHorizontal: 25, paddingVertical: 24 },
  emptyTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', color: '#555', marginTop: 14 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#999', textAlign: 'center', lineHeight: Math.ceil(typography.caption * 1.5), marginTop: 6 },
});