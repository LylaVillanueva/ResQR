import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';

export default function ProfileScreen({ route, navigation }) {
  const [showQR, setShowQR] = useState(false);
  const resident = route.params?.resident;
   
  function viewQR() {
    setShowQR(true);
  }

  if (showQR) {
    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
            <Text style={styles.heading}>QR Card Generated</Text>

            <View style={styles.qrBox}>
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>QR CODE{'\n'}PLACEHOLDER</Text>
              </View>
                
              <Text style={styles.qrName}>{resident?.name || 'Maria Santos'}</Text>
              <Text style={styles.qrDetail}>{resident?.id || 'ID: BRG-SC-2026-001'}</Text>
              <Text style={styles.qrDetail}>{resident?.guardian || 'Guardian: Mang Kanor'}</Text>
              <Text style={styles.qrDetail}>{resident?.phone || 'Contact: +639XXXXXXXXXX'}</Text>
              <Text style={styles.qrDetail}>{resident?.barangay || 'Barangay: 206'}</Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => { /* download PDF logic goes here */ }}>
              <Text style={styles.primaryButtonText}>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowQR(false)}
            >
              <Text style={styles.secondaryButtonText}>Back to Profile</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>

        <View style={styles.profileBar}>
            <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
            <View style={styles.profileTextWrap}>
                <Text style={styles.name}>{resident?.name || 'Maria Santos'}</Text>
                <Text style={styles.meta}>{resident?.id || 'ID: BRC-SC-2026-0001'}</Text>
                <Text style={styles.meta}>{resident?.role || 'Type: Person with Disability'}</Text>
            </View>
        </View>

        <TouchableOpacity style={styles.qrButton} onPress={viewQR}>
            <Text style={styles.qrButtonText}>View QR Code</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        <Text style={styles.heading1}>Scan History</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.alertCard}>
          <View style={styles.alertCardTextWrap}>
            <Text style={[styles.alertCardTitle, styles.statusClosed]}>Alert Closed</Text>
            <Text style={styles.alertTime}>12:00 PM</Text>
          </View>
          <Text style={[styles.alertSubtitle, { fontFamily: 'Poppins_600SemiBold' }]}>Confirmation Complete</Text>
          <Text style={styles.alertSubtitle}>[Responder Name] - 2 of 2</Text>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertCardTextWrap}>
            <Text style={[styles.alertCardTitle, styles.statusPending]}>Alert Pending</Text>
            <Text style={styles.alertTime}>12:00 PM</Text>
          </View>
          <Text style={[styles.alertSubtitle, { fontFamily: 'Poppins_600SemiBold' }]}>[Resident Name] Confirm Safe </Text>
          <Text style={styles.alertSubtitle}>Waiting for Confirmation</Text>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertCardTextWrap}>
            <Text style={[styles.alertCardTitle, styles.statusOpen]}>Alert Open</Text>
            <Text style={styles.alertTime}>12:00 PM</Text>
          </View>
          <Text style={[styles.alertSubtitle, { fontFamily: 'Poppins_600SemiBold' }]}>A Bystander Scanned</Text>
          <Text style={styles.alertSubtitle}>Optional Note</Text>
        </View>
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 16, marginTop: -16 },
  heading: { fontSize: 28, fontFamily: 'Poppins_700Bold', marginTop: -10 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },

  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: -12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 90,
    borderWidth: 1.8,
    borderColor: '#a83232',
    backgroundColor: '#c4c4c4',
    marginRight: 14,
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  profileTextWrap: { flex: 1 },
  name: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  meta: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666' },

  qrButton: {
    backgroundColor: '#ffdcdc',
    borderColor: '#a83232',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  qrButtonText: { color: '#a83232', fontFamily: 'Poppins_500Medium', fontSize: 16, fontWeight: '600' },

  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 20,
  },
  alertCard: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  alertCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  alertCardTitle: { 
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold', 
    marginBottom: 2,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#245490',
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#d3e5f8',
  },
  buttonWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSafe: {
    flex: 1,
    justifyContent: 'center',
    borderColor: '#288928',
    backgroundColor: '#a1fbaa',
    marginRight: 6,
  },
  buttonNotSafe: {
    flex: 1,
    justifyContent: 'center',
    borderColor: '#a83232',
    backgroundColor: '#fbd1d1',
    marginLeft: 6,
  },
  buttonText: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: '#245490' },
  buttonTextWrap: { flexDirection: 'row', justifyContent: 'space-between' },
  alertCardActive: { 
    borderColor: '#a83232',
    backgroundColor: '#fff',
    shadowColor: '#a83232',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertOpen: { color: '#a83232', backgroundColor: '#fbd1d1', },
  alertPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1', },
  alertClosed: { color: '#288928', backgroundColor: '#a1fbaa', },
  alertTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginLeft: 8 },
  detailButton: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginLeft: 8, color: '#245490' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12
  },
  statusText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#666',
  },
  statusOpen: { color: '#a83232', borderColor: '#a83232', backgroundColor: '#fbd1d1', },
  statusPending: { color: '#8a6d1d', borderColor: '#8a6d1d', backgroundColor: '#fbf1a1', },
  statusClosed: { color: '#288928', borderColor: '#288928', backgroundColor: '#a1fbaa', },

  primaryButton: {
    borderRadius: 10,
    backgroundColor: '#fbd1d1',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: { color: '#a83232', fontSize: 16, fontFamily: 'Poppins_500Medium' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#c12b2b', fontSize: 16, fontFamily: 'Poppins_400Regular' },

  pageLabel: { textAlign: 'center', color: '#999', marginTop: 8, fontSize: 12, fontFamily: 'Poppins_400Regular',},

  qrBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  qrPlaceholder: {
    width: 280,
    height: 280,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 25,
    backgroundColor: '#f2f2f2',
  },
  qrPlaceholderText: { textAlign: 'center', color: '#999', fontSize: 13, fontFamily: 'Poppins_500Medium' },
  qrName: { fontSize: 24, fontFamily: 'Poppins_500Medium', marginBottom: 6 },
  qrDetail: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#333', textAlign: 'center', marginBottom: -2 },
});