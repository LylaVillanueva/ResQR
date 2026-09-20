import { typography, spacing } from '../../theme';
import { useAppData } from "../../lib/AppDataContext";
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import GuardianTabBar from "../../component/GuardianTabButtons";

// IMPORTANT: Replace this with your official Barangay 206 contact number.
// Keep the number in digits only, e.g. '09171234567'.
const BARANGAY_PHONE = process.env.EXPO_PUBLIC_BARANGAY_PHONE || '';
const EMERGENCY_PHONE = '911';

async function callNumber(number, label) {
  if (!number) {
    Alert.alert('Barangay Number Not Set', 'The barangay contact number is not available. Please contact your barangay office.');
    return;
  }

  const url = `tel:${number}`;
  try {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Unable to Call', `This device cannot place a call to ${label}.`);
  }
  } catch { Alert.alert('Unable to call', 'Please dial the number using your phone.'); }
}

export default function EmergencyHelpScreen({ navigation }) {
  const { account } = useAppData();
  const barangay = account.barangayName || 'your barangay';
  const confirmCall = (type) => {
    const is911 = type === '911';
    const title = is911 ? 'Call 911?' : 'Call Barangay?';
    const message = is911
      ? 'Use 911 for an immediate emergency requiring urgent assistance.'
      : `You are about to call ${barangay} for immediate local assistance.`;
    const number = is911 ? EMERGENCY_PHONE : BARANGAY_PHONE;
    const label = is911 ? '911' : barangay;

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: is911 ? 'Call 911' : 'Call', style: 'destructive', onPress: () => callNumber(number, label) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>Get Emergency Help</Text>
        <Text style={styles.subheading}>Choose an option below to make a direct call.</Text>

        <TouchableOpacity style={[styles.helpCard, styles.barangayCard]} onPress={() => confirmCall('barangay')} activeOpacity={0.85}>
          <View style={[styles.iconCircle, styles.barangayIcon]}>
            <FontAwesome5 name="phone-alt" size={24} color="#a83232" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Call Barangay</Text>
            <Text style={styles.cardSubtitle}>{barangay}</Text>
            <Text style={styles.cardDescription}>Contact your barangay for immediate local assistance.</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={14} color="#a83232" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.helpCard, styles.nineOneOneCard]} onPress={() => confirmCall('911')} activeOpacity={0.85}>
          <View style={[styles.iconCircle, styles.nineOneOneIcon]}>
            <FontAwesome5 name="ambulance" size={24} color="#245490" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Call 911</Text>
            <Text style={styles.cardSubtitle}>National Emergency Assistance</Text>
            <Text style={styles.cardDescription}>Use 911 for urgent situations requiring immediate response.</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={14} color="#245490" />
        </TouchableOpacity>

        <View style={styles.noteBox}>
          <FontAwesome5 name="info-circle" size={15} color="#666" />
          <Text style={styles.noteText}>If the emergency involves your own ward, you do not need to scan their QR code first. Use this page to contact help directly.</Text>
        </View>
      </View>
      <GuardianTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: spacing.screen , paddingTop: 4 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4},
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
  subheading: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 24 },
  helpCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 15, marginBottom: 14 },
  barangayCard: { backgroundColor: '#fff1f1', borderColor: '#efbaba' },
  nineOneOneCard: { backgroundColor: '#eef5fc', borderColor: '#c6d9ef' },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  barangayIcon: { backgroundColor: '#fbd1d1' },
  nineOneOneIcon: { backgroundColor: '#d3e5f8' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: typography.body, fontFamily: 'Poppins_700Bold', color: '#222' },
  cardSubtitle: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', color: '#666', marginTop: 1 },
  cardDescription: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666', marginTop: 5, lineHeight: Math.ceil(typography.caption * 1.5) },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f6f6f6', borderRadius: 10, padding: 12, marginTop: 8 },
  noteText: { flex: 1, marginLeft: 9, fontSize: typography.caption, lineHeight: Math.ceil(typography.caption * 1.5), color: '#666', fontFamily: 'Poppins_400Regular' },
});
