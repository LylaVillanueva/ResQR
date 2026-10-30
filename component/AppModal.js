// Base dialog used by every popup in the app (IncidentLogModal, IssueCardModal,
// InfoModal). Replaces Alert.alert so popups look the same on all roles.
import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Text from './AppText';
import { colors, typography, spacing, radius, font } from '../theme';

// actions: [{ label, onPress, variant: 'primary' | 'plain', disabled }]
export default function AppModal({ visible, title, onClose, children, actions }) {
  const buttons = actions && actions.length ? actions : [{ label: 'OK', onPress: onClose, variant: 'plain' }];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {title ? <Text style={styles.title} accessibilityRole="header">{title}</Text> : null}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>{children}</ScrollView>
          <View style={styles.row}>
            {buttons.map((b) => (
              <TouchableOpacity
                key={b.label}
                style={[styles.btn, b.variant === 'primary' && styles.primaryBtn, b.disabled && styles.disabled]}
                onPress={b.onPress}
                disabled={b.disabled}
                accessibilityRole="button"
              >
                <Text style={[styles.btnText, b.variant === 'primary' && styles.primaryText]}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: spacing.screen },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.card, maxHeight: '80%' },
  title: { fontSize: typography.section, fontFamily: font.semibold, color: colors.textPrimary, marginBottom: 10 },
  body: { flexGrow: 0 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.sm, minHeight: 40, justifyContent: 'center' },
  btnText: { color: colors.primary, fontFamily: font.medium, fontSize: typography.detail },
  primaryBtn: { backgroundColor: colors.primary },
  primaryText: { color: '#fff' },
  disabled: { opacity: 0.5 },
});