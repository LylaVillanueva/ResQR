import { typography, spacing, colors } from '../../constants/theme';
import Avatar from "../../components/Avatar";
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import Text from "../../components/AppText";
import TextInput from "../../components/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/TabButtons";
import { Dropdown } from 'react-native-element-dropdown';
import { useAppData } from "../../contexts/AppDataContext";

const ROLE_FILTERS = [
  { label: 'All Roles', value: 'All Roles' },
  { label: 'Guardian', value: 'Guardian' },
  { label: 'Barangay Responder', value: 'Barangay Responder' },
  { label: 'Barangay Official', value: 'Barangay Official' },
];

const STATUS_FILTERS = [
  { label: 'All Status', value: 'All Status' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

export default function ManageUsers({ navigation }) {
  const { users, residents, account } = useAppData();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesQuery = `${user.name} ${user.phone}`.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;
    return matchesQuery && matchesRole && matchesStatus;
  }), [users, query, roleFilter, statusFilter]);

  const getWardNames = (user) => {
    if (user.role !== 'Guardian') return [];
    return (user.wardIds || []).map((wardId) => residents.find((resident) => resident.id === wardId)?.name).filter(Boolean);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Manage Users</Text>
            <Text style={styles.subheading}>All accounts in your barangay</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={16} color={colors.primary} />
          <TextInput style={styles.searchInput} placeholder="Search by name or mobile number" placeholderTextColor={colors.textMuted} value={query} onChangeText={setQuery} />
        </View>
        <View style={styles.filterRow}>
          <Dropdown
            style={styles.filterSelect} containerStyle={styles.filterMenu} placeholderStyle={styles.filterText}
            selectedTextStyle={styles.filterText} itemTextStyle={styles.filterText} fontFamily="Poppins_500Medium"
            data={ROLE_FILTERS} labelField="label" valueField="value" value={roleFilter} 
            onChange={(item) => setRoleFilter(item.value)} iconColor={colors.textSecondary} activeColor={colors.primarySoft} dropdownPosition="auto"
          />
          <Dropdown
            style={styles.filterSelect} containerStyle={styles.filterMenu} placeholderStyle={styles.filterText}
            selectedTextStyle={styles.filterText} itemTextStyle={styles.filterText} fontFamily="Poppins_500Medium"
            data={STATUS_FILTERS} labelField="label" valueField="value" value={statusFilter}
            onChange={(item) => setStatusFilter(item.value)} iconColor={colors.textSecondary} activeColor={colors.primarySoft} dropdownPosition="auto"
          />
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredUsers.map((user) => {
          const wardNames = getWardNames(user);
          return (
            <TouchableOpacity key={user.id} style={styles.userCard} onPress={() => navigation.navigate('UserDetails', { userId: user.id })} activeOpacity={0.8}>
              <Avatar uri={user.photoUrl} name={user.name} style={styles.photo} />
              <View style={styles.userText}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.role}>{user.role}</Text>
                {user.role === 'Guardian' ? (
                  <Text style={styles.wardText} numberOfLines={2}>Ward: {wardNames.length ? wardNames.join(', ') : 'No ward linked'}</Text>
                ) : (
                  <Text style={styles.phone}>{user.phone}</Text>
                )}
              </View>
              <View style={styles.rightCol}>
                <View style={[styles.statusPill, user.status === 'Active' ? styles.active : styles.inactive]}><Text style={[styles.statusText, user.status === 'Active' ? styles.activeText : styles.inactiveText]}>{user.status}</Text></View>
                <FontAwesome5 name="chevron-right" size={13} color={colors.textSecondary} style={{ marginBottom: 7}}/>
              </View>
            </TouchableOpacity>
          );
        })}
        {filteredUsers.length === 0 && <View style={styles.emptyWrap}><FontAwesome5 name="user-slash" size={38} color={colors.textMuted} /><Text style={styles.emptyTitle}>No users found</Text><Text style={styles.emptyText}>Try another name, mobile number, role, or status.</Text></View>}
      </ScrollView>

      <View style={styles.buttonContent}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddUser')}>
          <FontAwesome5 name="user-plus" size={14} color={colors.primary} style={{ marginTop: -4 }}  />
          <Text style={styles.addButtonText}> Add New Account</Text>
        </TouchableOpacity>
      </View>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, 
  content: { padding: spacing.screen, paddingBottom: 0, marginTop: -16 }, 
  scrollView: { flex: 1 }, 
  scrollContent: { padding: spacing.screen, paddingTop: 14 },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.primary, marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4}, 
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 }, 
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4, marginBottom: -6 }, 
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textSecondary }, 
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14 }, 
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSunken, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 0, marginTop: 14 , minHeight: spacing.control }, 
  searchInput: { flex: 1, fontSize: typography.body, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: colors.textPrimary , minHeight: spacing.control, backgroundColor: colors.surfaceSunken }, 
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 10 }, 
  filterSelect: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: colors.surface, minHeight: 42 },
  filterMenu: { borderRadius: 10, borderColor: colors.border, backgroundColor: colors.surface },
  filterText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, flexShrink: 1 }, 
  
  userCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  photo: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.textMuted, marginRight: 14 },
  userText: { flex: 1, marginRight: 6 }, name: { fontSize: typography.body, fontFamily: 'Poppins_500Medium' }, 
  role: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginTop: 1 }, 
  phone: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginTop: 1 }, 
  wardText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginTop: 2, paddingRight: 4 }, 
  
  rightCol: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }, 
  statusPill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }, 
  active: { backgroundColor: colors.successSoft }, 
  inactive: { backgroundColor: colors.border }, 
  statusText: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, 
  activeText: { color: colors.successInk }, inactiveText: { color: colors.textSecondary }, 
  
  emptyWrap: { alignItems: 'center', paddingVertical: 65 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: colors.textSecondary, marginTop: 14 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: Math.ceil(typography.detail * 1.5) },

  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 10, backgroundColor: colors.primarySoft, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  addButtonText: { color: colors.primary, fontSize: typography.detail, fontFamily: 'Poppins_500Medium' },
});
