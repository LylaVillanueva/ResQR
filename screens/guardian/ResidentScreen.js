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
import { shadow } from '../../theme';


export default function ResidentScreen({ navigation }) {
  const { users, residents, alerts, account } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const guardianAccount = useMemo(() => users.find((user) => user.id === account.id), [users, account.id]);
  const wardIds = guardianAccount?.wardIds || [];
  const myWards = useMemo(() => residents.filter((resident) => wardIds.includes(resident.id)), [residents, wardIds]);

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
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {myWards.length === 0 ? (
          <View style={styles.emptyWrap}>
            <FontAwesome5 name="user-friends" size={36} color="#888" />
            <Text style={styles.emptyTitle}>No Wards Linked</Text>
            <Text style={styles.emptyText}>Your linked ward information will appear here once your Guardian account is connected to a resident.</Text>
          </View>
        ) : (
          myWards.map((ward) => {
            const active = alerts.find((alert) => alert.residentId === ward.id && alert.status !== 'closed');
            const status = active ? active.status : 'safe';
            return (
              <TouchableOpacity key={ward.id} style={[styles.wardCard, active && styles.wardCardActive]} onPress={() => navigation.navigate('ProfileScreen', { resident: ward })} activeOpacity={0.85}>
                <Image source={require("../../assets/profile.png")} style={styles.photo} />
                <View style={styles.textWrap}>
                  <Text style={styles.name}>{ward.name}</Text>
                  <Text style={styles.type}>{ward.type}</Text>
                  <Text style={styles.id}>{ward.code || ward.type}</Text>
                  <Text style={styles.tapHint}>Tap to view ward information</Text>
                </View>
                <View style={styles.rightWrap}>
                  <StatusBadge status={status === 'safe' ? 'closed' : status} label={status === 'safe' ? 'Safe' : statusLabel(status)} />
                  <FontAwesome5 name="chevron-right" size={11} color="#888" />
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
  scrollContent: { padding: spacing.screen, paddingTop: 12 , paddingBottom: 32 }, 
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4 }, 
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: -8 }, 
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 10 },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderWidth: 1, borderColor: '#ccc', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 0, marginBottom: 16, marginTop: 10, minHeight: spacing.control },
  searchInput: { flex: 1, fontSize: typography.body, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: '#333', minHeight: spacing.control, backgroundColor: '#f2f2f2' },
  wardCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 13, padding: 13, marginBottom: 11, backgroundColor: '#fff', ...shadow.card },
  wardCardActive: { borderColor: '#e0aaaa' },
  photo: { width: 63, height: 63, borderRadius: 32, borderWidth: 1.4, borderColor: '#a83232', marginRight: 11 },
  textWrap: { flex: 1 },
  name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', color: '#222' },
  type: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#245490', marginTop: 1 },
  id: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#777', marginTop: 1 },
  tapHint: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#aaa', marginTop: 5 },
  rightWrap: { alignItems: 'flex-end', marginLeft: 5, gap: 8 },
  emptyWrap: { alignItems: 'center', paddingHorizontal: 25, paddingVertical: 24 },
  emptyTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', color: '#555', marginTop: 14 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#999', textAlign: 'center', lineHeight: Math.ceil(typography.caption * 1.5), marginTop: 6 },
});
