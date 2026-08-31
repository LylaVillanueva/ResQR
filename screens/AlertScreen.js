import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const tabs = [
  { key: 'home', label: 'Home', screen: 'Home', icon: 'home' },
  { key: 'residents', label: 'Residents', screen: 'ResidentScreen', icon: 'address-card' },
  { key: 'alert', label: 'Alert', screen: 'AlertScreen', icon: 'bell' },
  { key: 'audit', label: 'Settings', screen: 'SettingsScreen', icon: 'cog' },
];

export default function AlertScreen({ navigation }) {
  const route = useRoute();
  const activeTab = tabs.find((tab) => tab.screen === route.name)?.key;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Alert</Text>
        <Text style={styles.subheading}>Tap an alert to confirm status</Text>
     
        <View style={styles.divider} /> 
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.scanCard, styles.scanCardActive]}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusOpen, styles.shadow]}>Alert Open</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>Scanned by a Bystander</Text>
          <Text style={styles.scanCardSubtitle}>Note: Optional Note that the bystander sent through the 
            public landing page. This is very helpful for the guardian and responder</Text>
          
          <View style={styles.scanCardButtonWrap}>
            <TouchableOpacity>
              <Text style={[styles.scanCardButtons, styles.statusClosed, styles.shadow]}>Mark Safe</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={[styles.scanCardButtons, styles.statusOpen, styles.shadow]}>Not Safe</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusClosed, styles.shadow]}>Alert Closed</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.scanCardSubtitle}>Resolved - Both Confirmed Safe</Text>
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
  
  shadow: {
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
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
    shadowRadius: 4,
    elevation: 8,
  },
  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardButtonWrap: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  scanCardTitle: { 
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 16,
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold', 
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scanCardButtons: { 
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 42,
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold', 
    marginBottom: 2,
  },
  scanCardActive: { 
    borderColor: '#a83232',
    backgroundColor: '#fff',
    shadowColor: '#a83232',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusOpen: { color: '#a83232', backgroundColor: '#fbd1d1', },
  statusPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1', },
  statusClosed: { color: '#288928', backgroundColor: '#a1fbaa', },
  scanCardTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  scanCardSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginLeft: 8 },
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
});