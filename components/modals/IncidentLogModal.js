// Detail popup for one Activity Log entry. Shared by admin, guardian and
// responder AuditLogScreen. `log` is an item from auditLogs.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../AppText';
import AppModal from './AppModal';
import { colors, typography, font } from '../../constants/theme';

export default function IncidentLogModal({ visible, log, onClose }) {
  if (!log) return null;
  return (
    <AppModal visible={visible} title={log.title} onClose={onClose}>
      <Text style={styles.muted}>{log.date} • {log.time}</Text>
      <View style={styles.block}>
        <Text style={styles.label}>Performed by</Text>
        <Text style={styles.value}>{log.actor}</Text>
        {log.actorRole ? <Text style={styles.muted}>{log.actorRole}</Text> : null}
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Affected record</Text>
        <Text style={styles.value}>{log.subject}</Text>
      </View>
      {log.detail ? <View style={styles.block}>
        <Text style={styles.label}>Details</Text>
        <Text style={styles.value}>{log.detail}</Text>
      </View> : null}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 10 },
  label: { fontSize: typography.caption, fontFamily: font.medium, color: colors.textMuted },
  value: { fontSize: typography.detail, fontFamily: font.regular, color: colors.textPrimary },
  muted: { fontSize: typography.detail, fontFamily: font.regular, color: colors.textMuted },
});