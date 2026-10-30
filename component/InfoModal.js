// Simple title + message + OK popup. Used for Help & Support items
// (FAQ, Barangay Contact, Report a Problem) on all three roles.
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from './AppText';
import AppModal from './AppModal';
import { colors, typography, font } from '../theme';

export default function InfoModal({ visible, title, message, onClose }) {
  return (
    <AppModal visible={visible} title={title} onClose={onClose}>
      <Text style={styles.message}>{message}</Text>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  message: { fontSize: typography.body, fontFamily: font.regular, color: colors.textPrimary },
});