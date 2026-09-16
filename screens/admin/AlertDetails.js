import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { useAdminData } from '../../AdminDataContext';

export default function AlertDetails({ route, navigation }) {
  const { alerts } = useAdminData();
  const alert = alerts.find((item) => item.id === route.params?.alertId) || alerts[0];
  if (!alert) return null;

  const statusLabel = alert.status === 'open' ? 'Open Alert' : alert.status === 'pending' ? 'Pending Confirmation' : alert.status === 'escalated' ? 'Escalated' : 'Closed';
  const statusStyle = alert.status === 'closed' ? styles.closed : alert.status === 'pending' ? styles.pending : styles.danger;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}><Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileBar}>
          <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{alert.residentName}</Text>
            <Text style={styles.meta}>{alert.residentType}</Text>
            <Text style={styles.meta}>{alert.residentId}</Text>
          </View>
        </View>

        <View style={styles.statusHeader}><Text style={[styles.statusPill, statusStyle]}>{statusLabel}</Text><Text style={styles.time}>{alert.scannedAt}</Text></View>

        <Text style={styles.section}>Incident Location</Text>
        <View style={styles.card}>
          <View style={styles.iconRow}><FontAwesome5 name="map-marker-alt" size={18} color="#a83232" /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{alert.location}</Text><Text style={styles.small}>Location where the QR code was scanned</Text></View></View>
          <TouchableOpacity style={styles.mapButton} onPress={() => {}}><Text style={styles.mapText}>View Location</Text></TouchableOpacity>
        </View>

        <Text style={styles.section}>Scanned By</Text>
        <View style={styles.card}><View style={styles.iconRow}><Image source={require('../../assets/profile.png')} style={styles.smallPhoto} /><View><Text style={styles.cardTitle}>{alert.scannedBy}</Text><Text style={styles.small}>QR scan initiated the alert</Text></View></View></View>

        <Text style={styles.section}>Bystander Note</Text>
        <View style={styles.card}><Text style={styles.note}>{alert.bystanderNote || 'No note was submitted by the bystander.'}</Text></View>

        <Text style={styles.section}>Responder Assignment</Text>
        <View style={styles.card}>
          {alert.responderName ? (
            <View style={styles.iconRow}><Image source={require('../../assets/profile.png')} style={styles.smallPhoto} /><View><Text style={styles.cardTitle}>{alert.responderName}</Text><Text style={styles.small}>Barangay Responder</Text><Text style={styles.assigned}>Assigned</Text></View></View>
          ) : (
            <><Text style={styles.cardTitle}>No responder assigned</Text><Text style={styles.small}>This open alert is waiting for assignment.</Text><TouchableOpacity style={styles.assignButton} onPress={() => navigation.navigate('AssignResponder', { alertId: alert.id })}><Text style={styles.assignText}>Assign Responder</Text></TouchableOpacity></>
          )}
        </View>

        <Text style={styles.section}>Confirmation Status</Text>
        <View style={styles.confirmCard}>
          <Confirmation label="Guardian" value={alert.guardianStatus} />
          <Confirmation label="Responder" value={alert.responderName ? alert.responderStatus : 'Waiting'} />
        </View>

        {alert.status === 'escalated' && <View style={styles.escalationCard}><FontAwesome5 name="exclamation-triangle" size={20} color="#a83232" /><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.escalationTitle}>Alert Escalated</Text><Text style={styles.small}>{alert.escalationReason || 'Further response is required.'}</Text></View></View>}
        {alert.status === 'closed' && <View style={styles.closedCard}><FontAwesome5 name="check-circle" size={20} color="#288928" /><Text style={styles.closedText}>Both Guardian and Responder confirmed Safe.</Text></View>}
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}

function Confirmation({ label, value }) {
  const safe = value === 'Safe'; const notSafe = value === 'Not Safe';
  return <View style={styles.confirmRow}><Text style={styles.confirmLabel}>{label}</Text><Text style={[styles.confirmPill, safe ? styles.safe : notSafe ? styles.notSafe : styles.waiting]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, scrollContent: { padding: 20, paddingTop: 0, paddingBottom: 30 }, back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 10, marginTop: -12 },
  profileBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, profilePhoto: { width: 82, height: 82, borderRadius: 41, borderWidth: 1.8, borderColor: '#a83232', backgroundColor: '#ddd', marginRight: 13 }, profileTextWrap: { flex: 1 }, name: { fontSize: 21, fontFamily: 'Poppins_600SemiBold' }, meta: { fontSize: 12, color: '#666', fontFamily: 'Poppins_400Regular', marginTop: 2 }, statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }, statusPill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, fontSize: 13, fontFamily: 'Poppins_600SemiBold' }, danger: { color: '#a83232', backgroundColor: '#fbd1d1' }, pending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, closed: { color: '#288928', backgroundColor: '#a1fbaa' }, time: { fontSize: 12, color: '#777', fontFamily: 'Poppins_400Regular' }, section: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 }, card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 13, backgroundColor: '#fff', shadowColor: '#777', shadowOffset: { width: 3, height: 5 }, shadowOpacity: 0.14, shadowRadius: 5, elevation: 3 }, iconRow: { flexDirection: 'row', alignItems: 'center' }, smallPhoto: { width: 45, height: 45, borderRadius: 23, marginRight: 10, backgroundColor: '#ddd' }, cardTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold' }, small: { fontSize: 11, color: '#777', fontFamily: 'Poppins_400Regular', marginTop: 2 }, note: { fontSize: 13, color: '#555', fontFamily: 'Poppins_400Regular', lineHeight: 19 }, mapButton: { borderWidth: 1, borderColor: '#245490', backgroundColor: '#d3e5f8', borderRadius: 8, paddingVertical: 7, alignItems: 'center', marginTop: 10 }, mapText: { color: '#245490', fontFamily: 'Poppins_500Medium', fontSize: 12 }, assigned: { color: '#288928', fontSize: 11, fontFamily: 'Poppins_600SemiBold', marginTop: 3 }, assignButton: { borderWidth: 1, borderColor: '#a83232', backgroundColor: '#ffdcdc', borderRadius: 9, paddingVertical: 9, alignItems: 'center', marginTop: 10 }, assignText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: 13 }, confirmCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, backgroundColor: '#fff' }, confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }, confirmLabel: { fontSize: 13, fontFamily: 'Poppins_500Medium' }, confirmPill: { minWidth: 90, textAlign: 'center', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 4, fontSize: 11, fontFamily: 'Poppins_600SemiBold' }, waiting: { color: '#8a6d1d', backgroundColor: '#fbf1a1' }, safe: { color: '#288928', backgroundColor: '#a1fbaa' }, notSafe: { color: '#a83232', backgroundColor: '#fbd1d1' }, escalationCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#a83232', backgroundColor: '#fff5f5', borderRadius: 12, padding: 13, marginTop: 15 }, escalationTitle: { fontSize: 14, color: '#a83232', fontFamily: 'Poppins_600SemiBold' }, closedCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#288928', backgroundColor: '#f2fff2', borderRadius: 12, padding: 13, marginTop: 15 }, closedText: { flex: 1, marginLeft: 10, color: '#288928', fontFamily: 'Poppins_500Medium', fontSize: 12 },
});
