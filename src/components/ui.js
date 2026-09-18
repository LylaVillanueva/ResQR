import { typography, spacing } from '../theme';
// Shared building blocks pulled out of the three separate, drifting copies
// each role's screens used to define locally (see Section/ToggleRow/LinkRow/
// Info in the old admin/guardian/responder SettingsScreen.js and ProfileScreen.js).
// Using these instead keeps shadows, spacing, and accessibility behavior the
// same everywhere by construction, rather than by three people remembering
// to copy the same numbers.
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Text from './AppText';
import TextInput from './AppTextInput';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, shadow, radius, font, field, statusTone } from '../theme';

export function BackLink({ onPress, label = '‹ Back' }) {
  return <Text style={styles.back} onPress={onPress} accessibilityRole="button" accessibilityLabel="Go back">{label}</Text>;
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Section({ title, children, titleStyle, compact = false }) {
  return <View>
    <Text style={[styles.sectionTitle, compact && styles.compactSectionTitle, titleStyle]} accessibilityRole="header">{title}</Text>
    <Card style={compact && styles.compactCard}>{children}</Card>
  </View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function ToggleRow({ label, value, onChange, compact = false }) {
  return <View style={[styles.row, compact && styles.compactRow]}>
    <Text style={[styles.rowLabel, { flex: 1, marginRight: 10 }]}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#ccc', true: colors.danger.bg }}
      thumbColor={value ? colors.primary : '#f4f3f4'}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
    />
  </View>;
}

export function LinkRow({ icon, label, value, onPress, compact = false }) {
  return <TouchableOpacity
    style={[styles.row, compact && styles.compactRow]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={value ? `${label}, ${value}` : label}
  >
    {icon ? <FontAwesome5 name={icon} size={15} color={colors.primary} style={{ marginRight: 10 }} /> : null}
    <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    {onPress ? <FontAwesome5 name="chevron-right" size={11} color={colors.textFaint} style={{ marginLeft: 7 }} /> : null}
  </TouchableOpacity>;
}

// The labeled-input pattern from EnrollNewResident.js, made reusable —
// large readable label, filled light-gray input well, generous spacing.
export function Field({ label, required, value, onChangeText, placeholder, keyboardType, autoCapitalize, autoCorrect, autoComplete, secureTextEntry, multiline, numberOfLines, inputStyle }) {
  return <View style={styles.fieldWrap}>
    {label ? <Text style={styles.fieldLabel}>{label}{required ? <Text style={styles.required}>*</Text> : null}</Text> : null}
    <TextInput
      style={[styles.fieldInput, multiline && styles.fieldTextArea, inputStyle]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textPlaceholder}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      autoComplete={autoComplete}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
  </View>;
}

export function InfoRow({ label, value }) {
  return <View style={styles.infoRow} accessible accessibilityLabel={`${label}: ${value || 'Not available'}`}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>;
}

// One badge for every "alert/incident status" concept across Home,
// AlertScreen, AlertDetails, and Profile scan history — these all rendered
// the same three colors independently before (see statusTone in theme.js).
export function StatusBadge({ status, label }) {
  const tone = statusTone(status);
  return <Text style={[styles.badge, { color: tone.ink, backgroundColor: tone.bg }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  back: { marginTop: 0, marginBottom: 4, paddingVertical: 4, minHeight: 44, fontSize: typography.body, fontFamily: font.regular, color: colors.primary },
  card: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
    backgroundColor: colors.surface, padding: spacing.card, ...shadow.card,
  },
  sectionTitle: { fontSize: typography.section, fontFamily: font.semibold, color: colors.ink, marginTop: spacing.section, marginBottom: 12 },
  compactSectionTitle: { marginTop: 14, marginBottom: 6 },
  compactCard: { paddingHorizontal: 8, paddingVertical: 4 },
  compactRow: { minHeight: 48, paddingVertical: 6, paddingHorizontal: 8 },
  divider: { height: 1, backgroundColor: colors.borderSoft },
  row: { minHeight: spacing.control, paddingHorizontal: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: typography.body, fontFamily: font.regular, color: colors.textPrimary },
  rowValue: { flexShrink: 1, maxWidth: '45%', textAlign: 'right', marginLeft: 12, fontSize: typography.detail, color: colors.textMuted, fontFamily: font.regular },
  fieldWrap: { marginBottom: spacing.field },
  fieldLabel: { fontSize: field.labelSize, fontFamily: font.regular, color: field.labelColor, marginBottom: 10 },
  required: { color: colors.primaryBright },
  fieldInput: { borderWidth: 1, borderColor: field.inputBorder, borderRadius: radius.sm, padding: 16, backgroundColor: '#f2f2f2', fontFamily: font.regular, fontSize: typography.body , minHeight: spacing.control },
  fieldTextArea: { minHeight: 90, textAlignVertical: 'top' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  infoLabel: { flex: 1, marginRight: 12, fontSize: typography.detail, color: colors.textMuted, fontFamily: font.regular },
  infoValue: { flexShrink: 1, fontSize: typography.detail, fontFamily: font.medium, color: colors.textPrimary, maxWidth: '58%', textAlign: 'right' },
  badge: { borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4, fontSize: typography.caption, fontFamily: font.semibold, alignSelf: 'flex-start' },
});
