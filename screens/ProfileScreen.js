import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const tabs = [
  { key: 'home', label: 'Home', screen: 'Home', icon: 'home' },
  { key: 'residents', label: 'Residents', screen: 'ResidentScreen', icon: 'address-card' },
  { key: 'alert', label: 'Alert', screen: 'AlertScreen', icon: 'bell' },
  { key: 'audit', label: 'Audit', screen: 'AuditLogScreen', icon: 'clipboard' },
];

export default function ProfileScreen({ route, navigation }) {
  const [showQR, setShowQR] = useState(false);
  const resident = route.params?.resident;
  const activeTab = route.name === 'ProfileScreen'
    ? 'residents'
    : tabs.find((tab) => tab.screen === route.name)?.key; 
   
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
            <Image source={require('../assets/profile.png')} style={styles.profilePhoto} />
            <View style={styles.profileTextWrap}>
                <Text style={styles.name}>{resident?.name || 'Maria Santos'}</Text>
                <Text style={styles.meta}>{resident?.id || 'ID: BRC-SC-2026-0001'}</Text>
                <Text style={styles.meta}>{resident?.role || 'Type: Person with Disability'}</Text>
            </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={viewQR}>
            <Text style={styles.buttonText}>View QR Code</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        <Text style={styles.heading1}>Scan History</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusClosed]}>Alert Closed</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={[styles.scanCardSubtitle, { fontFamily: 'Poppins_600SemiBold' }]}>Confirmation Complete</Text>
          <Text style={styles.scanCardSubtitle}>[Responder Name] - 2 of 2</Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusPending]}>Confirmation</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={[styles.scanCardSubtitle, { fontFamily: 'Poppins_600SemiBold' }]}>[Name] Confirm Safe/Not Safe</Text>
          <Text style={styles.scanCardSubtitle}>Waiting for confirmation - 1 of 2</Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusOpen]}>Alert Open</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={[styles.scanCardSubtitle, { fontFamily: 'Poppins_600SemiBold' }]}>A Bystander Scanned</Text>
          <Text style={styles.scanCardSubtitle}>Optional Note</Text>
        </View> 
      </ScrollView>

      <View style={styles.tabBar}>
        {tabs.slice(0, 2).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => navigation.navigate(tab.screen)}
          >
            <View style={[styles.tabLabel, activeTab === tab.key && styles.iconActive]}>
              <FontAwesome5 name={tab.icon} size={20} color={activeTab === tab.key ? '#245490' : '#333'} />
            </View>            
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('ScannerScreen')}
        >
          <FontAwesome5 name="qrcode" size={28} color="#333" />
        </TouchableOpacity>

        {tabs.slice(2).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => navigation.navigate(tab.screen)}
          >
            <View style={[styles.tabLabel, activeTab === tab.key && styles.iconActive]}>
              <FontAwesome5 name={tab.icon} size={20} color={activeTab === tab.key ? '#245490' : '#333'} />
            </View>          
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#245490', marginBottom: 16, marginTop: -16 },
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
    borderWidth: 1,
    backgroundColor: '#c4c4c4',
    marginRight: 14,
    shadowColor: '#051c37',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  profileTextWrap: { flex: 1 },
  name: { fontSize: 22, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  meta: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666' },

  button: {
    backgroundColor: '#d3e5f8',
    borderColor: '#245490',
    borderWidth: .5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonText: { color: '#245490', fontFamily: 'Poppins_500Medium', fontSize: 16, fontWeight: '600' },

  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 20,
  },
  scanCard: {
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
    shadowRadius: 8,
    elevation: 4,
  },
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: { 
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold', 
    marginBottom: 2,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  statusOpen: { color: '#a83232', backgroundColor: '#fbd1d1', },
  statusPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1', },
  statusClosed: { color: '#288928', backgroundColor: '#a1fbaa', },
  scanCardTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  scanCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', marginLeft: 8 },
  scanCardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginRight: 2,
  },

  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#ebf1f7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingBottom: 0,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tabLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#333' },
  tabLabelActive: { color: '#245490', fontFamily: 'Poppins_700Bold' },
  iconActive: {
    borderRadius: 20,
    width: 40,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d3e5f8',
    shadowColor: '#245490',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },

  primaryButton: {
    backgroundColor: '#d3e5f8',
    borderColor: '#245490',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#245490',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: { color: '#245490', fontSize: 16, fontFamily: 'Poppins_500Medium' },

  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#245490',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#245490',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButtonText: { color: '#245490', fontSize: 16, fontFamily: 'Poppins_400Regular' },

  qrBox: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    shadowColor: '#245490',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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