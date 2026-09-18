import { typography, spacing } from '../../theme';
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../components/TabButtons';
import { useAppData } from '../../context/AppDataContext';


export default function AssignResponder({ route, navigation }) {
  const { alerts, users, assignResponder, account } = useAppData();
  const alert = alerts.find((item) => item.id === (route.params?.alertId || route.params?.incidentId));
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const responders = useMemo(() => users
    .filter((user) => user.role === 'Barangay Responder')
    .map((user) => {
      const hasOtherActiveAssignment = alerts.some(
        (item) => item.id !== alert?.id && item.responderId === user.id && item.status !== 'closed'
      );
      const configured = user.status === 'Inactive' ? 'Off Duty' : null;
      const availability = configured === 'Off Duty'
        ? 'Off Duty'
        : hasOtherActiveAssignment
          ? 'On another incident'
          : 'Available';
      return { ...user, availability };
    }), [users, alerts, alert?.id]);
  if (!alert) return <SafeAreaView><Text onPress={() => navigation.goBack()}>‹ Back</Text><Text>Alert not found.</Text></SafeAreaView>;

  async function handleConfirm() {
    if (submitting) return;
    if (!selected) {
      Alert.alert('Select a responder', 'Please select an available responder first.');
      return;
    }
    setSubmitting(true);
    try { await assignResponder(alert.id, selected.id); setConfirmed(true); }
    catch (err) { Alert.alert('Could not assign responder', err.message); }
    finally { setSubmitting(false); }
  }

  if (confirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContent}>
          <View style={styles.successIcon}><FontAwesome5 name="check" size={42} color="#fff" /></View>
          <Text style={styles.successTitle}>Responder Assigned</Text>
          <Text style={styles.successText}>{selected.name} has been assigned to this alert.</Text>
          <View style={styles.successCard}><Image source={require('../../../assets/profile.png')} style={styles.photo} /><View><Text style={styles.cardTitle}>{selected.name}</Text><Text style={styles.small}>Barangay Responder</Text><Text style={styles.available}>● Assigned</Text></View></View>
          <Text style={styles.section}>Alert Information</Text>
          <View style={styles.card}><Text style={styles.cardTitle}>{alert.residentName}</Text><Text style={styles.small}>{alert.residentType}</Text><Text style={styles.small}>{alert.residentId}</Text><Text style={styles.location}>📍 {alert.location}</Text><Text style={styles.small}>{alert.scannedAt}</Text></View>
          <View style={styles.notice}><FontAwesome5 name="bell" size={17} color="#245490" /><Text style={styles.noticeText}>The responder has been notified of this emergency.</Text></View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id })}><Text style={styles.primaryText}>View Alert Status</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('AlertScreen', { filter: 'all' })}><Text style={styles.secondaryText}>Back to Alert List</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}><Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text><Text style={styles.heading}>Assign Responder</Text><Text style={styles.subheading}>Select an available responder for this alert.</Text></View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.residentCard}><Image source={require('../../../assets/profile.png')} style={styles.photo} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{alert.residentName}</Text><Text style={styles.small}>{alert.residentType}</Text><Text style={styles.small}>{alert.residentId}</Text></View></View>
        <View style={styles.contextCard}><Text style={styles.contextTitle}>📍 Location (Scanned at)</Text><Text style={styles.contextText}>{alert.location}</Text><Text style={styles.contextTitle}>💬 Bystander Note</Text><Text style={styles.contextText}>{alert.bystanderNote || 'No note submitted.'}</Text></View>
        <Text style={styles.section}>Available Responders</Text>
        {responders.map((responder) => {
          const available = responder.availability === 'Available';
          const isSelected = selected?.id === responder.id;
          return <TouchableOpacity key={responder.id} disabled={!available} style={[styles.responderCard, !available && styles.disabledCard, isSelected && styles.selectedCard]} onPress={() => setSelected(responder)} activeOpacity={0.8}>
            <Image source={require('../../../assets/profile.png')} style={styles.photo} />
            <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{responder.name}</Text><Text style={styles.small}>Barangay Responder</Text><Text style={[styles.availability, available ? styles.available : styles.unavailable]}>● {responder.availability}</Text></View>
            <FontAwesome5 name={isSelected ? 'dot-circle' : 'circle'} size={19} color={isSelected ? '#a83232' : '#999'} />
          </TouchableOpacity>;
        })}
      </ScrollView>
      <View style={styles.buttonContent}><TouchableOpacity style={[styles.assignButton, !selected && styles.assignDisabled]} disabled={submitting || !selected} onPress={handleConfirm}><Text style={styles.assignText}>Assign Responder</Text></TouchableOpacity></View>
      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: spacing.screen, paddingBottom: 0 , paddingTop: 4 }, scrollView: { flex: 1 }, scrollContent: { padding: spacing.screen, paddingTop: 8, paddingBottom: 20 }, back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4}, heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold' , marginBottom: 8 }, subheading: { fontSize: typography.caption, color: '#666', fontFamily: 'Poppins_400Regular' }, residentCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: spacing.card, marginBottom: 10 }, photo: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ddd', marginRight: 11 }, cardTitle: { fontSize: typography.detail, fontFamily: 'Poppins_600SemiBold' }, small: { fontSize: typography.caption, color: '#777', fontFamily: 'Poppins_400Regular', marginTop: 2 }, contextCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 13, backgroundColor: '#fff' }, contextTitle: { fontSize: typography.caption, fontFamily: 'Poppins_600SemiBold', marginTop: 2 }, contextText: { fontSize: typography.caption, color: '#555', fontFamily: 'Poppins_400Regular', marginBottom: 9, marginTop: 3 }, section: { fontSize: typography.body, fontFamily: 'Poppins_600SemiBold', marginTop: 15, marginBottom: 7 }, responderCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 9, backgroundColor: '#fff' }, selectedCard: { borderColor: '#a83232', backgroundColor: '#fff8f8' }, disabledCard: { backgroundColor: '#eee', opacity: 0.7 }, availability: { fontSize: typography.caption, fontFamily: 'Poppins_500Medium', marginTop: 3 }, available: { color: '#288928' }, unavailable: { color: '#a83232' }, buttonContent: { paddingHorizontal: 20, paddingVertical: 10 }, assignButton: { borderWidth: 1, borderColor: '#a83232', borderRadius: 10, backgroundColor: '#ffdcdc', paddingVertical: 14, alignItems: 'center' }, assignDisabled: { opacity: 0.5 }, assignText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: typography.detail }, successContent: { padding: 20, alignItems: 'stretch' }, successIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#159447', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 20 }, successTitle: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', textAlign: 'center', marginTop: 15 }, successText: { fontSize: typography.detail, color: '#666', fontFamily: 'Poppins_400Regular', textAlign: 'center', marginTop: 3, marginBottom: 15 }, successCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 13 }, notice: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#245490', backgroundColor: '#edf5ff', borderRadius: 10, padding: 12, marginTop: 12 }, noticeText: { flex: 1, fontSize: typography.caption, color: '#245490', fontFamily: 'Poppins_400Regular', marginLeft: 8 }, primaryButton: { backgroundColor: '#a83232', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 20 , minHeight: spacing.control, justifyContent: 'center' }, primaryText: { color: '#fff', fontFamily: 'Poppins_600SemiBold' }, secondaryButton: { borderWidth: 1, borderColor: '#a83232', borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 9 , minHeight: spacing.control, justifyContent: 'center' }, secondaryText: { color: '#a83232', fontFamily: 'Poppins_500Medium' },
});
