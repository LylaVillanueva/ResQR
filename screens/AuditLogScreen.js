import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const tabs = [
  { key: 'home', label: 'Home', screen: 'Home', icon: 'home' },
  { key: 'residents', label: 'Residents', screen: 'ResidentScreen', icon: 'users' },
  { key: 'alert', label: 'Alert', screen: 'AlertScreen', icon: 'bell' },
  { key: 'audit', label: 'Audit', screen: 'AuditLogScreen', icon: 'clipboard' },
];

export default function AuditLogScreen({ navigation }) {
  const route = useRoute();
  const activeTab = tabs.find((tab) => tab.screen === route.name)?.key;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Audit Log</Text>
        <Text style={styles.subheading}>All scans and confirmations activity</Text>

        <View style={styles.divider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusClosed]}>Alert Closed</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>[Responder Name] - 2 of 2</Text>
          <Text style={styles.scanCardSubtitle}>Both confirmed Safe</Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusPending]}>Confirmation</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>Waiting for confirmation - 1 of 2</Text>
          <Text style={styles.scanCardSubtitle}>[Name] confirmed [Safe/Not Safe]</Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusOpen]}>Alert Open</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>Scanned by a bystander</Text>
          <Text style={styles.scanCardSubtitle}>Note: Optional Note</Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusPending]}>Confirmation</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>Waiting for confirmation - 1 of 2</Text>
          <Text style={styles.scanCardSubtitle}>[Name] confirmed [Safe/Not Safe]</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContent}>
        <TouchableOpacity style={styles.pdfButton}>
          <Text style={styles.pdfButtonText}>Export report (PDF/CSV)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => navigation.navigate(tab.screen)}
          >
            <FontAwesome5 name={tab.icon} size={20} color={activeTab === tab.key ? '#245490' : '#333'} />
            <Text
              style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}
            >
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
  scrollContent: { flex: 1, padding: 20, paddingTop: 0 },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginLeft: 8 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridCard: {
    height: 100,
    width: '48%',
    aspectRatio: 1.3,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridIcon: { fontSize: 26, fontFamily: 'Poppins_600SemiBold', marginBottom: 6 },
  gridLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#999' },

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
  },
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: { 
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold', 
    marginBottom: 2 
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

  pdfButton: {
    borderWidth: 1,
    borderColor: '#8a6d1d',
    borderRadius: 10,
    backgroundColor: '#ebd28f',
    paddingVertical: 14,
    alignItems: 'center',
  },
  pdfButtonText: { color: '#8a6d1d', fontSize: 15, fontFamily: 'Poppins_500Medium' },

  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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
  tabButtonActive: { backgroundColor: '#d3e5f8', borderColor: '#d3e5f8'},
  tabLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#333' },
  tabLabelActive: { color: '#245490', fontFamily: 'Poppins_700Bold' },
});