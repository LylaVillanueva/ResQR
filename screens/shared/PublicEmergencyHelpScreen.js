import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Text from '../../components/AppText';
import { spacing, typography, colors, font, radius } from '../../constants/theme';
import { sessionStorage } from '../../services/sessionStorage';
import { readLastVerifiedContacts } from '../../services/barangayContactCache';

async function callNumber(phone, label) {
  try {
    const url = `tel:${phone}`;
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
    else Alert.alert('Unable to Call', `This device cannot place a call to ${label}.`);
  } catch { Alert.alert('Unable to Call', 'Please dial the number using your phone.'); }
}

export default function PublicEmergencyHelpScreen({ navigation }) {
  const [saved, setSaved] = useState({ contacts: [], barangayName: null, cachedAt: null });
  useEffect(() => { let current = true; readLastVerifiedContacts(sessionStorage).then((value) => { if (current) setSaved(value); }); return () => { current = false; }; }, []);

  const askToCall = (phone, label) => Alert.alert(
    `Call ${label}?`,
    `You are about to call ${phone}. Use this number only if it is appropriate for your current location.`,
    [{ text: 'Cancel', style: 'cancel' }, { text: 'Call', onPress: () => callNumber(phone, label) }],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Emergency Help</Text>
        <Text style={styles.subheading}>Call local assistance or the national emergency number. You can use this page without signing in.</Text>

        {saved.contacts.map((contact) => <TouchableOpacity
          key={contact.id}
          style={styles.barangayCard}
          onPress={() => askToCall(contact.phone, `${contact.label}${saved.barangayName ? ` · ${saved.barangayName}` : ''}`)}
          accessibilityRole="button"
          accessibilityLabel={`Call saved contact ${contact.label}, ${contact.phone}`}
        >
          <FontAwesome5 name="phone-alt" size={20} color={colors.primary} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Call Barangay</Text>
            <Text style={styles.cardSubtitle}>{contact.label} · {contact.phone}</Text>
            {saved.barangayName ? <Text style={styles.cardSubtitle}>{saved.barangayName}</Text> : null}
          </View>
          <FontAwesome5 name="chevron-right" size={13} color={colors.primary} />
        </TouchableOpacity>)}

        {saved.contacts.length > 0 && <Text style={styles.note}>This is the last saved confirmed public number{saved.cachedAt ? `, saved ${new Date(saved.cachedAt).toLocaleDateString()}` : ''}. It may be outdated or for another barangay. Check your current location before calling.</Text>}
        {saved.contacts.length === 0 && <Text style={styles.note}>No confirmed barangay number is saved on this device. You can still call 911.</Text>}

        <TouchableOpacity style={styles.nationalCard} onPress={() => askToCall('911', '911')} accessibilityRole="button" accessibilityLabel="Call 911">
          <FontAwesome5 name="ambulance" size={20} color={colors.primary} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Call 911</Text>
            <Text style={styles.cardSubtitle}>National Emergency Assistance</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={13} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1, padding: spacing.screen },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { color: colors.primary, fontSize: typography.body },
  heading: { color: colors.text, fontSize: typography.title, fontFamily: font.semibold, marginTop: 6 },
  subheading: { color: colors.textSecondary, fontSize: typography.detail, lineHeight: Math.ceil(typography.detail * 1.5), marginTop: 6, marginBottom: 22 },
  barangayCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder, borderWidth: 1, borderRadius: radius.md, padding: spacing.card, marginBottom: 12, minHeight: 82 },
  nationalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder, borderWidth: 1, borderRadius: radius.md, padding: spacing.card, marginBottom: 12, minHeight: 82 },
  cardBody: { flex: 1, marginHorizontal: 12 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontFamily: font.semibold },
  cardSubtitle: { color: colors.textSecondary, fontSize: typography.caption, marginTop: 3 },
  note: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: Math.ceil(typography.caption * 1.5), marginBottom: 18 },
});
