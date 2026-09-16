import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import GuardianTabBar from '../../component/GuardianTabButtons';
import { useAdminData } from '../../AdminDataContext';

const GUARDIAN_NAME = 'Ana Santos';

export default function ResidentScreen({ navigation }) {
  const { users, residents, alerts } = useAdminData();
  const guardianAccount = useMemo(() => users.find((user) => user.name === GUARDIAN_NAME), [users]);
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
                <Image source={require('../../assets/profile.png')} style={styles.photo} />
                <View style={styles.textWrap}>
                  <Text style={styles.name}>{ward.name}</Text>
                  <Text style={styles.type}>{ward.type}</Text>
                  <Text style={styles.id}>{ward.id}</Text>
                  <Text style={styles.tapHint}>Tap to view ward information</Text>
                </View>
                <View style={styles.rightWrap}>
                  <View style={[styles.statusPill, pillStyle(status)]}>
                    <View style={[styles.dot, dotStyle(status)]} />
                    <Text style={[styles.statusText, statusTextStyle(status)]}>{status === 'safe' ? 'Safe' : statusLabel(status)}</Text>
                  </View>
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
function pillStyle(status) {
  if (status === 'escalated' || status === 'open') return styles.pillRed;
  if (status === 'pending') return styles.pillYellow;
  return styles.pillGreen;
}
function statusTextStyle(status) {
  if (status === 'escalated' || status === 'open') return styles.redText;
  if (status === 'pending') return styles.yellowText;
  return styles.greenText;
}
function dotStyle(status) {
  if (status === 'escalated' || status === 'open') return styles.dotRed;
  if (status === 'pending') return styles.dotYellow;
  return styles.dotGreen;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  heading: { fontSize: 27, fontFamily: 'Poppins_700Bold', marginBottom: 1 },
  subheading: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 14 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 18, paddingBottom: 25 },
  wardCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 13, padding: 13, marginBottom: 11, backgroundColor: '#fff', shadowColor: '#777', shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.16, shadowRadius: 5, elevation: 3 },
  wardCardActive: { borderColor: '#e0aaaa' },
  photo: { width: 63, height: 63, borderRadius: 32, borderWidth: 1.4, borderColor: '#a83232', marginRight: 11 },
  textWrap: { flex: 1 },
  name: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#222' },
  type: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#245490', marginTop: 1 },
  id: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: '#777', marginTop: 1 },
  tapHint: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: '#aaa', marginTop: 5 },
  rightWrap: { alignItems: 'flex-end', marginLeft: 5, gap: 8 },
  statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 9, fontFamily: 'Poppins_600SemiBold' },
  pillGreen: { backgroundColor: '#e8f8ea' }, pillYellow: { backgroundColor: '#fff7d5' }, pillRed: { backgroundColor: '#fbd1d1' },
  greenText: { color: '#288928' }, yellowText: { color: '#8a6d1d' }, redText: { color: '#a83232' },
  dotGreen: { backgroundColor: '#288928' }, dotYellow: { backgroundColor: '#d0a928' }, dotRed: { backgroundColor: '#a83232' },
  emptyWrap: { alignItems: 'center', paddingHorizontal: 25, paddingVertical: 65 },
  emptyTitle: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', color: '#555', marginTop: 14 },
  emptyText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#999', textAlign: 'center', lineHeight: 18, marginTop: 6 },
});
