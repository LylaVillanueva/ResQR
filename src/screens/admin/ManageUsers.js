import { typography, spacing } from '../../theme';
import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import Text from '../../components/AppText';
import TextInput from '../../components/AppTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../components/TabButtons';
import { useAppData } from '../../context/AppDataContext';

const roleFilters = ['All Roles', 'Guardian', 'Barangay Responder', 'Barangay Official'];
const statusFilters = ['All Status', 'Active', 'Inactive'];

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
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Manage Users</Text>
            <Text style={styles.subheading}>All accounts in your barangay</Text>
          </View>
          <FontAwesome5 name="users-cog" size={28} color="#a83232" />
        </View>
        <View style={styles.divider} />
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={16} color="#a83232" />
          <TextInput style={styles.searchInput} placeholder="Search by name or mobile number" placeholderTextColor="#999" value={query} onChangeText={setQuery} />
        </View>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterSelect} onPress={() => { const i = roleFilters.indexOf(roleFilter); setRoleFilter(roleFilters[(i + 1) % roleFilters.length]); }}>
            <Text style={styles.filterText}>{roleFilter}</Text><FontAwesome5 name="chevron-down" size={11} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterSelect} onPress={() => { const i = statusFilters.indexOf(statusFilter); setStatusFilter(statusFilters[(i + 1) % statusFilters.length]); }}>
            <Text style={styles.filterText}>{statusFilter}</Text><FontAwesome5 name="chevron-down" size={11} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredUsers.map((user) => {
          const wardNames = getWardNames(user);
          return (
            <TouchableOpacity key={user.id} style={styles.userCard} onPress={() => navigation.navigate('UserDetails', { userId: user.id })} activeOpacity={0.8}>
              <Image source={require('../../../assets/profile.png')} style={styles.photo} />
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
                <FontAwesome5 name="chevron-right" size={13} color="#666" />
              </View>
            </TouchableOpacity>
          );
        })}
        {filteredUsers.length === 0 && <View style={styles.emptyState}><FontAwesome5 name="user-slash" size={28} color="#aaa" /><Text style={styles.emptyTitle}>No users found</Text><Text style={styles.emptyText}>Try another name, mobile number, role, or status.</Text></View>}
      </ScrollView>

      <View style={styles.buttonContent}><TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddUser')}><Text style={styles.addButtonText}>+ Add User</Text></TouchableOpacity></View>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 4 }, scrollView: { flex: 1 }, scrollContent: { padding: spacing.screen, paddingTop: 14 }, back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4}, headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 }, heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 }, subheading: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#666' }, divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 14 }, searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#ccc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 0, marginTop: 14 , minHeight: spacing.control }, searchInput: { flex: 1, fontSize: typography.body, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: '#333' , minHeight: spacing.control, backgroundColor: '#f2f2f2' }, filterRow: { flexDirection: 'row', gap: 8, marginTop: 10 }, filterSelect: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 9, paddingVertical: 8, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' , minHeight: 44 }, filterText: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#666', flexShrink: 1 }, userCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 10, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }, photo: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ddd', marginRight: 12 }, userText: { flex: 1 }, name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' }, role: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: '#555', marginTop: 1 }, phone: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#888', marginTop: 1 }, wardText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#555', marginTop: 2, paddingRight: 4 }, rightCol: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }, statusPill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }, active: { backgroundColor: '#a1fbaa' }, inactive: { backgroundColor: '#eee' }, statusText: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' }, activeText: { color: '#288928' }, inactiveText: { color: '#666' }, emptyState: { alignItems: 'center', padding: 45 }, emptyTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 10 }, emptyText: { fontSize: typography.body, color: '#888', fontFamily: 'Poppins_400Regular', textAlign: 'center', marginTop: 4 }, buttonContent: { paddingHorizontal: 20, paddingVertical: 10 }, addButton: { borderWidth: 1, borderColor: '#a83232', borderRadius: 10, backgroundColor: '#ffdcdc', paddingVertical: 13, alignItems: 'center' , minHeight: 44 }, addButtonText: { color: '#a83232', fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
});
