import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/ResponderTabButtons';
import { useAdminData } from '../../AdminDataContext';

const RESPONDER_NAME = 'Rowendo Carpino';

export default function IncidentScreen({ navigation }) {
  const { alerts } = useAdminData();
  const incidents = useMemo(() => alerts.filter((alert) => alert.responderName === RESPONDER_NAME), [alerts]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Incidents</Text>
        <Text style={styles.subheading}>Your handled emergency incidents</Text>
        <View style={styles.divider} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {incidents.length === 0 ? (
          <View style={styles.emptyWrap}>
            <FontAwesome5 name="clipboard-list" size={40} color="#999" />
            <Text style={styles.emptyTitle}>NO INCIDENT RECORDS</Text>
            <Text style={styles.emptyText}>Handled emergency incidents will appear here.</Text>
          </View>
        ) : incidents.map((incident) => (
          <TouchableOpacity key={incident.id} style={styles.card} activeOpacity={0.8} onPress={() => navigation.navigate('AlertDetails', { alertId: incident.id })}>
            <View style={styles.topRow}>
              <Text style={[styles.status, incident.status === 'closed' ? styles.closed : incident.status === 'escalated' ? styles.escalated : styles.open]}>
                {incident.status === 'closed' ? 'Closed' : incident.status === 'escalated' ? 'Escalated' : 'Active'}
              </Text>
              <Text style={styles.time}>{incident.scannedAt}</Text>
            </View>
            <Text style={styles.name}>{incident.residentName}</Text>
            <Text style={styles.type}>{incident.residentType}</Text>
            <View style={styles.locationRow}>
              <FontAwesome5 name="map-marker-alt" size={13} color="#a83232" />
              <Text style={styles.location}>{incident.location}</Text>
            </View>
            <Text style={styles.reportText}>{incident.incidentReport ? 'Incident report submitted' : 'Incident report not yet submitted'}</Text>
            <View style={styles.detailsRow}>
              <Text style={styles.details}>View Incident Details</Text>
              <FontAwesome5 name="caret-right" size={17} color="#245490" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -2 },
  subheading: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 16 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 18, paddingBottom: 24 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: '#fff', shadowColor: '#aaa', shadowOffset: { width: 7, height: 10 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  status: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 13, fontSize: 13, fontFamily: 'Poppins_600SemiBold' },
  closed: { color: '#288928', backgroundColor: '#a1fbaa' },
  escalated: { color: '#a83232', backgroundColor: '#fbd1d1' },
  open: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  time: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#666' },
  name: { fontSize: 19, fontFamily: 'Poppins_600SemiBold' },
  type: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#245490', marginTop: 2, marginBottom: 9 },
  locationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7f7', borderWidth: 1, borderColor: '#f0cccc', borderRadius: 9, padding: 10, marginBottom: 9 },
  location: { flex: 1, fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#333', marginLeft: 9 },
  reportText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666', marginBottom: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#245490', paddingVertical: 7, paddingHorizontal: 14, backgroundColor: '#d3e5f8' },
  details: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#245490' },
  emptyWrap: { alignItems: 'center', paddingVertical: 70 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#666', marginTop: 14 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#777', textAlign: 'center', marginTop: 8 },
});
