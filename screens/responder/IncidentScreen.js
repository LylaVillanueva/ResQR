import { typography, spacing, colors } from '../../constants/theme';
import { alertStageLabel } from '../../utils/models';
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Text from "../../components/AppText";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../components/tabs/ResponderTabButtons";
import { useAppData } from "../../contexts/AppDataContext";


export default function IncidentScreen({ navigation }) {
  const { alerts, account } = useAppData();
  const incidents = useMemo(() => alerts.filter((alert) => alert.responderId === account.id), [alerts, account.id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Incidents</Text>
        </View>
        <Text style={styles.subheading}>Your handled emergency incidents</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {incidents.length === 0 ? (
          <View style={styles.emptyWrap}>
            <FontAwesome5 name="clipboard-list" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>NO INCIDENT RECORDS</Text>
            <Text style={styles.emptyText}>Handled emergency incidents will appear here.</Text>
          </View>
        ) : incidents.map((incident) => (
          <TouchableOpacity key={incident.id} style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate('AlertDetails', { alertId: incident.id })}>
            <View style={styles.topRow}>
              <Text style={[styles.status, incident.status === 'closed' ? styles.closed : incident.status === 'escalated' ? styles.escalated : styles.open]}>
                {alertStageLabel(incident.status)}
              </Text>
              <Text style={styles.time}>{incident.scannedAt}</Text>
            </View>
            <Text style={styles.name}>{incident.residentName}</Text>
            <Text style={styles.type}>{incident.residentType}</Text>
            <View style={styles.locationRow}>
              <FontAwesome5 name="map-marker-alt" size={13} color={colors.primary} />
              <Text style={styles.location}>{incident.location}</Text>
            </View>
            <Text style={styles.reportText}>{incident.incidentReport ? 'Incident report submitted' : 'Incident report not yet submitted'}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.details}>View Incident Details</Text>
              <FontAwesome5 name="caret-right" size={17} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, 
  content: { padding: spacing.screen, paddingBottom: 0, marginTop: -14 },
  scrollView: { flex: 1 }, 
  scrollContent: { padding: spacing.screen, paddingTop: 12 , paddingBottom: 32 }, 
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , flexWrap: 'wrap', columnGap: 12, rowGap: 8 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginTop: 4 }, 
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginLeft: 0, marginTop: 8, marginBottom: 6},
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: colors.textSecondary, marginTop: -8 }, 
  divider: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10 },

  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.card, marginBottom: 16, backgroundColor: colors.surface, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  status: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 13, fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold' },
  closed: { color: colors.successInk, backgroundColor: colors.successSoft },
  escalated: { color: colors.alertInk, backgroundColor: colors.alertSoft },
  open: { color: colors.warningInk, backgroundColor: colors.warningSoft },
  time: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary },
  name: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold' },
  type: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.primary, marginTop: 2, marginBottom: 9 },
  locationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: 9, padding: 10, marginBottom: 9 },
  location: { flex: 1, fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textPrimary, marginLeft: 9 },
  reportText: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, marginBottom: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.primary, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: colors.primarySoft },
  details: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', color: colors.primary },
  
  emptyWrap: { alignItems: 'center', paddingVertical: 65 },
  emptyTitle: { fontSize: typography.section, fontFamily: 'Poppins_700Bold', color: colors.textSecondary, marginTop: 14 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: Math.ceil(typography.detail * 1.5) },
});
