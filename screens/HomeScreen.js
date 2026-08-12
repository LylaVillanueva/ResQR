import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const gridItems = [
  { id: '1', label: 'text' },
  { id: '2', label: 'text' },
  { id: '3', label: 'text' },
  { id: '4', label: 'text' },
];

const tabs = [
  { key: 'home', label: 'Home' },
  { key: 'residents', label: 'Residents' },
  { key: 'alert', label: 'Alert' },
  { key: 'log', label: 'Log' },
];

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = React.useState('home');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, [Name]</Text>

        <View style={styles.grid}>
          {gridItems.map((item) => (
            <View key={item.id} style={styles.gridCard}>
              <Text style={styles.gridIcon}>#</Text>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.heading}>Needs Attention</Text>

        <View style={styles.headCard}>
          <View style={styles.headCardTextWrap}>
            <Text style={styles.headCardTitle}>[Name] - open alert</Text>
            <Text style={styles.headCardSubtitle}>waiting for confirmation</Text>
          </View>
          <View style={styles.headCardDot} />
        </View>

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
            onPress={() => setActiveTab(tab.key)}
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
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#666', marginBottom: 20 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    aspectRatio: 1.3,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridIcon: { fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  gridLabel: { fontSize: 13, color: '#999' },

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
  headCardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  headCardSubtitle: { fontSize: 13, color: '#666' },
  headCardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },

  enrollButton: {
    borderWidth: 1,
    borderColor: '#e02f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  enrollButtonText: { color: '#e02f2f', fontSize: 15, fontWeight: '600' },

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
    backgroundColor: '#e02f2f',
    borderColor: '#e02f2f',
  },
  tabLabel: { fontSize: 12, color: '#333' },
  tabLabelActive: { color: '#fff', fontWeight: '600' },
});