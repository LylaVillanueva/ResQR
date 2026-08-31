import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const gridItems = [
  { id: '1', label: 'text' },
  { id: '2', label: 'text' },
  { id: '3', label: 'text' },
  { id: '4', label: 'text' },
];

const tabs = [
  { key: 'home', label: 'Home', screen: 'Home', icon: 'home' },
  { key: 'residents', label: 'Residents', screen: 'ResidentScreen', icon: 'address-card' },
  { key: 'alert', label: 'Alert', screen: 'AlertScreen', icon: 'bell' },
  { key: 'audit', label: 'Audit', screen: 'AuditLogScreen', icon: 'clipboard' },
];

export default function HomeScreen({ navigation }) {
  const route = useRoute();
  const activeTab = tabs.find((tab) => tab.screen === route.name)?.key;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, [Name]</Text>

        <View style={styles.divider} />
        <View style={styles.grid}>
          {gridItems.map((item) => (
            <View key={item.id} style={[styles.gridCard, styles.shadow]}>
              <Text style={styles.gridIcon}>#</Text>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />
        <Text style={styles.heading1}>Needs Attention</Text>

        <View style={[styles.headCard, styles.shadow]}>
          <View style={styles.headCardTextWrap}>
            <Text style={styles.headCardTitle}>[Name] - open alert</Text>
            <Text style={styles.headCardSubtitle}>waiting for confirmation</Text>
          </View>
          <View style={styles.headCardDot} />
        </View>
      </View>

            <View style={styles.buttonContent}>
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={() => navigation.navigate('ResidentHomeScreen')}
              >
                <Text style={styles.enrollButtonText}>View Guardian Home (temporary)</Text>
              </TouchableOpacity>
            </View>

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
  content: { flex: 1, padding: 20 },
  heading: { fontSize: 28, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },

  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },
  enrollButton: {
    borderWidth: 1,
    borderColor: '#245490',
    borderRadius: 10,
    backgroundColor: '#d3e5f8',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  enrollButtonText: { color: '#245490', fontSize: 16, fontFamily: 'Poppins_500Medium' },


  shadow: {
    backgroundColor: '#fff',
    shadowColor: '#245490',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

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

  headCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headCardTextWrap: { flex: 1 },
  headCardTitle: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  headCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' },
  headCardDot: {
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