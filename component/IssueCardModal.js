// "Issue QR card?" confirmation. Same dialog wherever a card can be issued.
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from './AppText';
import AppModal from './AppModal';
import { colors, typography, font } from '../theme';

export default function IssueCardModal({ visible, submitting, onCancel, onConfirm }) {
  return (
    <AppModal
      visible={visible}
      title="Issue QR card?"
      onClose={onCancel}
      actions={[
        { label: 'Cancel', onPress: onCancel, variant: 'plain', disabled: submitting },
        { label: submitting ? 'Issuing…' : 'Issue Card', onPress: onConfirm, variant: 'primary', disabled: submitting },
      ]}
    >
      <Text style={styles.message}>Issuing a new QR card replaces any previously issued card for this resident.</Text>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: typography.body, fontFamily: font.regular, color: colors.textPrimary },
});