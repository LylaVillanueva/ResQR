import { typography, spacing } from '../../theme';
import { useAppData } from "../../lib/AppDataContext";
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Text from "../../component/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../component/TabButtons";
import useNotificationPrefs from "../../lib/useNotificationPrefs";
import { Section, Divider, ToggleRow, LinkRow, InfoRow } from "../../component/ui";
import { colors, font, radius } from '../../theme';
import { useAccessibilitySettings, FONT_SCALES, FONT_FAMILIES, LANGUAGES } from "../../lib/AccessibilitySettingsContext";

export default function SettingsScreen({ navigation, setSession }) {
  const { account } = useAppData();
  const { prefs, set, setPushEnabled } = useNotificationPrefs();
  const { fontScaleKey, fontFamilyKey, languageKey, t } = useAccessibilitySettings();

  const info = (title, message) => Alert.alert(title, message);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Settings</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.residentCard, styles.shadow]}>
          <Image source={require("../../assets/profile.png")} style={styles.residentPhoto} />
          <View style={{ flex: 1, margin: 0 }}>
            <Text style={styles.contextTitle}>{account.fullName}</Text>
            <Text style={styles.small}>Role: {account.role}</Text>
            <Text style={styles.small}>ID Number: {account.id}</Text>
          </View>
        </View>

        <Section compact title={t('accountInformation')} titleStyle={{ marginTop: 10 }}>
          <InfoRow compact label={t('name')} value={account.fullName} />
          <Divider />
          <InfoRow compact label={t('position')} value={'Barangay Secretary'} />
          <Divider />
          <InfoRow compact label={t('barangay')} value={account.barangayName} />
        </Section>

        <Section compact title={t('notifications')}>
          <ToggleRow compact label={t('pushNotifications')} value={prefs.pushEnabled} onChange={setPushEnabled} />
          <Divider />
          <ToggleRow compact label={t('emergencyAlertSound')} value={prefs.alertSound} onChange={(v) => set('alertSound', v)} />
          <Divider />
          <ToggleRow compact label="New Emergency Alert" value={prefs.newAlert} onChange={(v) => set('newAlert', v)} />
          <Divider />
          <ToggleRow compact label="Responder Assignment Update" value={prefs.responderAssignment} onChange={(v) => set('responderAssignment', v)} />
          <Divider />
          <ToggleRow compact label="Escalated Alert Notification" value={prefs.escalatedAlert} onChange={(v) => set('escalatedAlert', v)} />
        </Section>

        <Section compact title={t('userAccessManagement')}>
          <LinkRow compact icon="users-cog" label={t('manageUsers')} onPress={() => navigation.navigate('ManageUsers')} />
        </Section>

        <Section compact title={t('accessibility')}>
          <LinkRow compact icon="language" label={t('language')} value={LANGUAGES.find((l) => l.key === languageKey)?.label} onPress={() => navigation.navigate('AccessibilityOptions', { type: 'language' })} />
          <Divider />
          <LinkRow compact icon="font" label={t('font')} value={FONT_FAMILIES.find((f) => f.key === fontFamilyKey)?.label} onPress={() => navigation.navigate('AccessibilityOptions', { type: 'fontFamily' })} />
          <Divider />
          <LinkRow compact icon="text-height" label={t('fontSize')} value={FONT_SCALES.find((s) => s.key === fontScaleKey)?.label} onPress={() => navigation.navigate('AccessibilityOptions', { type: 'fontSize' })} />
        </Section>

        <Section compact title={t('helpSupport')}>
          <LinkRow compact icon="question-circle" label={t('faq')} onPress={() => info('FAQ', 'Frequently asked questions about using QRAlalay.')} />
          <Divider />
          <LinkRow compact icon="phone" label={t('barangayContactNumber')} onPress={() => info('Barangay Contact', 'Ask your barangay office for its official contact number.')} />
          <Divider />
          <LinkRow compact icon="bug" label={t('reportProblem')} onPress={() => info('Report a Problem', 'Please provide the issue you encountered.')} />
        </Section>

        <Section compact title={t('about')}>
          <LinkRow compact icon="check-circle" label={t('appVersion')} value="1.0" />
          <Divider />
          <LinkRow compact icon="info-circle" label={t('aboutQrAlalay')} onPress={() => navigation.navigate('Legal', { type: 'about' })} />
          <Divider />
          <LinkRow compact icon="file-contract" label={t('termsOfService')} onPress={() => navigation.navigate('Legal', { type: 'terms' })} />
          <Divider />
          <LinkRow compact icon="user-shield" label={t('privacyPolicy')} onPress={() => navigation.navigate('Legal', { type: 'privacy' })} />
        </Section>

        <TouchableOpacity
          style={styles.logout}
          onPress={() => Alert.alert('Log Out?', 'Are you sure you want to log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', style: 'destructive', onPress: () => setSession?.(null) }])}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <FontAwesome5 name="sign-out-alt" size={16} color={colors.primary} style={{ marginTop: -2 }} />
          <Text style={styles.logoutText}>{t('logOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.screen, paddingTop: 8, paddingBottom: 0 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, paddingBottom: 30 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 10 },
  photo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.8, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 13 },
  name: { fontSize: typography.body, fontFamily: font.semibold },
  meta: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: font.regular, marginTop: 2 },
  heading: { fontSize: typography.title, fontFamily: font.semibold, marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a83232', borderRadius: 12, backgroundColor: '#ffdcdc', padding: spacing.card, marginBottom: 16, marginTop: 16 },
  residentPhoto: { width: 85, height: 100, borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 11 },
  small: { fontSize: typography.caption, color: '#555', fontFamily: 'Poppins_400Regular', marginTop: 2 },
  contextTitle: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.dangerSurface, borderRadius: radius.md, paddingVertical: 13, marginTop: 22 },
  logoutText: { color: colors.primary, fontFamily: font.semibold, marginLeft: 7 },
});