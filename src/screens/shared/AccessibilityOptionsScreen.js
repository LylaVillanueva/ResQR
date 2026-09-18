import { typography, spacing } from '../../theme';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Text from '../../components/AppText';
import { useAccessibilitySettings, FONT_SCALES, FONT_FAMILIES, LANGUAGES } from '../../context/AccessibilitySettingsContext';
import { colors, font, radius, shadow } from '../../theme';

const CONFIG = {
  fontSize: {
    titleKey: 'fontSize',
    note: 'Changes text size across the whole app immediately — try it and see this screen update.',
    options: FONT_SCALES,
    getSelected: (s) => s.fontScaleKey,
    setSelected: (s, key) => s.setFontScaleKey(key),
  },
  fontFamily: {
    titleKey: 'font',
    note: 'Poppins is QRAlalay’s default typeface. System Default uses your device’s own font instead.',
    options: FONT_FAMILIES,
    getSelected: (s) => s.fontFamilyKey,
    setSelected: (s, key) => s.setFontFamilyKey(key),
  },
  language: {
    titleKey: 'language',
    note: 'Filipino currently covers sign-in, settings, and navigation. The rest of the app still reads in English while translation continues.',
    options: LANGUAGES,
    getSelected: (s) => s.languageKey,
    setSelected: (s, key) => s.setLanguageKey(key),
  },
};

export default function AccessibilityOptionsScreen({ route, navigation }) {
  const type = route.params?.type;
  const config = CONFIG[type] || CONFIG.fontSize;
  const settings = useAccessibilitySettings();
  const selected = config.getSelected(settings);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">{settings.t('back')}</Text>
        <Text style={styles.heading} accessibilityRole="header">{settings.t(config.titleKey)}</Text>
        <Text style={styles.note}>{config.note}</Text>
      </View>

      <View style={styles.card}>
        {config.options.map((option, index) => {
          const isSelected = option.key === selected;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.row, index > 0 && styles.rowDivider]}
              onPress={() => config.setSelected(settings, option.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
            >
              <Text style={[styles.rowLabel, type === 'fontSize' && { fontSize: typography.body * option.value }]}>{option.label}</Text>
              {isSelected && <FontAwesome5 name="check-circle" size={18} color={colors.primary} solid />}
            </TouchableOpacity>
          );
        })}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.screen, paddingBottom: 4 , paddingTop: 4 },
  back: { fontSize: typography.body, fontFamily: font.regular, color: colors.primary, marginBottom: 4, minHeight: 44, paddingVertical: 4, marginTop: 0 },
  heading: { fontSize: typography.title, fontFamily: font.bold, marginBottom: 8 },
  note: { fontSize: typography.caption, fontFamily: font.regular, color: colors.textMuted, lineHeight: Math.ceil(typography.caption * 1.5), marginBottom: 10 },
  card: {
    marginHorizontal: spacing.screen, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
    backgroundColor: colors.surface, ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.borderSoft },
  rowLabel: { fontSize: typography.body, fontFamily: font.medium, color: colors.textPrimary },
});
