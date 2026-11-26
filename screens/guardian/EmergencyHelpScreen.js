import { typography, spacing, colors } from '../../constants/theme';
import { useAppData } from "../../contexts/AppDataContext";
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import GuardianTabBar from "../../components/tabs/GuardianTabButtons";

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
  const { account, barangayContacts = [] } = useAppData();
  const barangay = account.barangayName || 'your barangay';
  const barangayContact = barangayContacts.find((contact) => contact.isActive && contact.verifiedAt && contact.isPrimary)
    || barangayContacts.find((contact) => contact.isActive && contact.verifiedAt)
    || null;
  const confirmCall = (type) => {
    const is911 = type === '911';
    const title = is911 ? 'Call 911?' : 'Call Barangay?';
    const message = is911
      ? 'Use 911 for an immediate emergency requiring urgent assistance.'
      : `You are about to call ${barangay} for immediate local assistance.`;
    const number = is911 ? EMERGENCY_PHONE : barangayContact?.phone || '';
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
            <FontAwesome5 name="phone-alt" size={24} color={colors.alertInk} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Call Barangay</Text>
            <Text style={styles.cardSubtitle}>{barangayContact ? `${barangay} · ${barangayContact.label}` : barangay}</Text>
            <Text style={styles.cardDescription}>Contact your barangay for immediate local assistance.</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={14} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.helpCard, styles.nineOneOneCard]} onPress={() => confirmCall('911')} activeOpacity={0.85}>
          <View style={[styles.iconCircle, styles.nineOneOneIcon]}>
            <FontAwesome5 name="ambulance" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Call 911</Text>
            <Text style={styles.cardSubtitle}>National Emergency Assistance</Text>
            <Text style={styles.cardDescription}>Use 911 for urgent situations requiring immediate response.</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={14} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.noteBox}>
          <FontAwesome5 name="info-circle" size={15} color={colors.textSecondary} />
          <Text style={styles.noteText}>{barangayContact?.isCached
            ? `Showing the last saved ${barangayContact.label} number from ${barangayContact.cachedAt ? new Date(barangayContact.cachedAt).toLocaleDateString() : 'an earlier sync'}. Confirm it is current if possible. `
            : !barangayContact ? 'No verified barangay number is saved yet. Contact your barangay office to add one. ' : ''}If the emergency involves your own ward, you do not need to scan their QR code first. Use this page to contact help directly.</Text>
        </View>
      </View>
      <GuardianTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.screen , paddingTop: 4 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.primary, marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4},
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
  subheading: { fontSize: typography.detail, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 24 },
  helpCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 15, marginBottom: 14 },
  barangayCard: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  nineOneOneCard: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  barangayIcon: { backgroundColor: colors.primarySoft },
  nineOneOneIcon: { backgroundColor: colors.primarySoft },
  cardText: { flex: 1 },
  cardTitle: { fontSize: typography.body, fontFamily: 'Poppins_700Bold', color: colors.textPrimary },
  cardSubtitle: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary, marginTop: 1 },
  cardDescription: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginTop: 5, lineHeight: Math.ceil(typography.caption * 1.5) },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surfaceSunken, borderRadius: 10, padding: 12, marginTop: 8 },
  noteText: { flex: 1, marginLeft: 9, fontSize: typography.caption, lineHeight: Math.ceil(typography.caption * 1.5), color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
});
