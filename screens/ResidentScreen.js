import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const tabs = [
  { key: 'home', label: 'Home', screen: 'Home' },
  { key: 'residents', label: 'Residents', screen: 'ResidentScreen' },
  { key: 'alert', label: 'Alert', screen: 'AlertScreen' },
  { key: 'log', label: 'Log', screen: 'LogScreen' },
];

export default function HomeScreen({ navigation }) {
  const route = useRoute();
  const activeTab = tabs.find((tab) => tab.screen === route.name)?.key;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Residents</Text>

        <View style={styles.divider} />
        <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#245490" />
        <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
        />
        </View>
        <View style={styles.divider} />

        <TouchableOpacity 
            style={styles.residentCard}
            onPress={() => navigation.navigate('ProfileScreen')}
        >
            <Image source={require('../assets/profile.png')} style={styles.residentPhoto} />
            <View style={styles.residentTextWrap}>
                <Text style={styles.residentName}>Full Name</Text>
                <Text style={styles.residentMeta}>ID Number</Text>
            </View>
            <View style={styles.statusDot} /> 
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.enrollButton}
          onPress={() => navigation.navigate('EnrollNewResident')}
        >
          <Text style={styles.enrollButtonText}>+ Enroll New Resident</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => navigation.navigate(tab.screen)}
          >
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
  container: { flex: 1, backgroundColor: '#e0e0e' },
  content: { flex: 1, padding: 20 },
  heading: { fontSize: 28, fontFamily: 'Poppins_700Bold', marginBottom: 10 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d3e5f8',
    borderWidth: 1,
    borderColor: '#245490',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchIcon: { fontSize: 16, marginRight: 16, color: '#245490' },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 8,
    color: '#333',
  },

  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 20,
  },

  residentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  residentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#c4c4c4',
    marginRight: 14,
    },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentMeta: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginRight: 2,
  },

  enrollButton: {
    borderWidth: 1,
    borderColor: '#245490',
    borderRadius: 10,
    backgroundColor: '#d3e5f8',
    paddingVertical: 14,
    alignItems: 'center',
  },
  enrollButtonText: { color: '#245490', fontSize: 15, fontFamily: 'Poppins_500Medium' },

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
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tabButtonActive: {
    backgroundColor: '#d3e5f8',
    borderColor: '#d3e5f8',
  },
  tabLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#333' },
  tabLabelActive: { color: '#245490', fontFamily: 'Poppins_700Bold' },
});