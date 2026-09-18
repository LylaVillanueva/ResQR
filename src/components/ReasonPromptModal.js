// Small reusable "type a reason, then submit" dialog — used wherever an
// official/responder needs to record why they're marking a party
// unreachable. Alert.prompt isn't available on Android, so this is a
// minimal cross-platform stand-in.
import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import AppTextInput from './AppTextInput';
import { colors, typography, spacing, radius, font } from '../theme';

export default function ReasonPromptModal({ visible, title, placeholder, confirmLabel = 'Submit', submitting, onCancel, onSubmit }) {
  const [reason, setReason] = useState('');
  const canSubmit = reason.trim().length >= 3 && !submitting;

  const handleClose = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <AppTextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.textPlaceholder}
            value={reason}
            onChangeText={setReason}
            multiline
            maxLength={500}
          />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={handleClose} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn, !canSubmit && styles.disabled]}
              disabled={!canSubmit}
              onPress={() => { const value = reason.trim(); setReason(''); onSubmit(value); }}
            >
              <Text style={styles.confirmText}>{submitting ? 'Submitting…' : confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: spacing.screen },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.card },
  title: { fontSize: typography.body, fontFamily: font.semibold, marginBottom: 10, color: colors.textPrimary },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: 10, minHeight: 80, textAlignVertical: 'top', fontSize: typography.detail, color: colors.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.sm, minHeight: 40, justifyContent: 'center' },
  cancelBtn: { backgroundColor: colors.surfaceSunken },
  cancelText: { color: colors.textSecondary, fontFamily: font.medium, fontSize: typography.detail },
  confirmBtn: { backgroundColor: colors.primary },
  confirmText: { color: '#fff', fontFamily: font.medium, fontSize: typography.detail },
  disabled: { opacity: 0.5 },
});
