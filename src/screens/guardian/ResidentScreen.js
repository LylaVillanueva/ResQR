import { typography, spacing } from '../../theme';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import GuardianTabBar from '../../components/GuardianTabButtons';
import { useAppData } from '../../context/AppDataContext';
import { StatusBadge } from '../../components/ui';
import { shadow } from '../../theme';


export default function ResidentScreen({ navigation }) {
  const { users, residents, alerts, account } = useAppData();
  const guardianAccount = useMemo(() => users.find((user) => user.id === account.id), [users, account.id]);
  const wardIds = guardianAccount?.wardIds || [];
  const myWards = useMemo(() => residents.filter((resident) => wardIds.includes(resident.id)), [residents, wardIds]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>My Wards</Text>
        <Text style={styles.subheading}>Residents linked to your Guardian account</Text>
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
                <Image source={require('../../../assets/profile.png')} style={styles.photo} />
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
  content: { padding: spacing.screen, paddingBottom: 0 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
  subheading: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 14 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 18, paddingBottom: 25 },
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
