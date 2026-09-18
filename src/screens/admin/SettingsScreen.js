import { typography, spacing } from '../../theme';
import { useAppData } from '../../context/AppDataContext';
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../components/TabButtons';
import useNotificationPrefs from '../../hooks/useNotificationPrefs';
import { Section, Divider, ToggleRow, LinkRow, InfoRow } from '../../components/ui';
import { colors, font, radius } from '../../theme';
import { useAccessibilitySettings, FONT_SCALES, FONT_FAMILIES, LANGUAGES } from '../../context/AccessibilitySettingsContext';


export default function SettingsScreen({ navigation, setSession }) {
  const { account } = useAppData();
  const { prefs, set, setPushEnabled } = useNotificationPrefs();
  const { fontScaleKey, fontFamilyKey, languageKey, t } = useAccessibilitySettings();

  const info = (title, message) => Alert.alert(title, message);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileBar}>
          <Image source={require('../../../assets/profile.png')} style={styles.photo} accessible={false} />
          <View style={{ flex: 1 }}><Text style={styles.name}>{account.fullName}</Text><Text style={styles.meta}>{'Barangay Official'} • {account.barangayName}</Text></View>
        </View>
        <Text style={styles.heading} accessibilityRole="header">{t('settings')}</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section compact title={t('accountInformation')} titleStyle={{ marginTop: 10 }}>
          <InfoRow label={t('name')} value={account.fullName} /><InfoRow label={t('position')} value={'Barangay Official'} /><InfoRow label={t('barangay')} value={account.barangayName} />
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
          <Divider /><LinkRow compact icon="font" label={t('font')} value={FONT_FAMILIES.find((f) => f.key === fontFamilyKey)?.label} onPress={() => navigation.navigate('AccessibilityOptions', { type: 'fontFamily' })} />
          <Divider /><LinkRow compact icon="text-height" label={t('fontSize')} value={FONT_SCALES.find((s) => s.key === fontScaleKey)?.label} onPress={() => navigation.navigate('AccessibilityOptions', { type: 'fontSize' })} />
        </Section>

        <Section compact title={t('helpSupport')}>
          <LinkRow compact icon="question-circle" label={t('faq')} onPress={() => info('FAQ', 'Frequently asked questions about using QRAlalay.')} />
          <Divider /><LinkRow compact icon="phone" label={t('barangayContactNumber')} value="View contact" onPress={() => info('Barangay Contact', 'Ask your barangay office for its official contact number.')} />
          <Divider /><LinkRow compact icon="bug" label={t('reportProblem')} onPress={() => info('Report a Problem', 'Please provide the issue you encountered.')} />
        </Section>

        <Section compact title={t('about')}>
          <LinkRow compact icon="info-circle" label={t('aboutQrAlalay')} onPress={() => info('About QRAlalay', 'QRAlalay is a barangay emergency response and resident safety system that uses QR-based identification and coordinated Guardian–Responder confirmation.')} />
          <Divider /><LinkRow compact label={t('appVersion')} value="1.0" />
          <Divider /><LinkRow compact icon="file-contract" label={t('termsOfService')} onPress={() => navigation.navigate('Legal', { type: 'terms' })} />
          <Divider /><LinkRow compact icon="user-shield" label={t('privacyPolicy')} onPress={() => navigation.navigate('Legal', { type: 'privacy' })} />
        </Section>

        <TouchableOpacity
          style={styles.logout}
          onPress={() => Alert.alert('Log Out?', 'Are you sure you want to log out?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Log Out', style: 'destructive', onPress: () => setSession?.(null) }])}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <FontAwesome5 name="sign-out-alt" size={15} color={colors.primary} /><Text style={styles.logoutText}>{t('logOut')}</Text>
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
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  photo: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.8, borderColor: colors.primary, backgroundColor: colors.border, marginRight: 13 },
  name: { fontSize: typography.body, fontFamily: font.semibold },
  meta: { fontSize: typography.caption, color: colors.textSecondary, fontFamily: font.regular, marginTop: 2 },
  heading: { fontSize: typography.title, fontFamily: font.semibold, marginBottom: 4 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.dangerSurface, borderRadius: radius.md, paddingVertical: 13, marginTop: 22 },
  logoutText: { color: colors.primary, fontFamily: font.semibold, marginLeft: 7 },
});
