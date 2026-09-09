import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';

const gridItems = [
  { id: '1', label: 'Active Alerts', icon: 'exclamation-triangle', count: '7' },
  { id: '2', label: 'Pending Assignments', icon: 'clock', count: '4' },
  { id: '3', label: 'Registered Residents', icon: 'users', count: '289' },
  { id: '4', label: 'Active Responder', icon: 'user-shield', count: '27' },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, [Name]</Text>

        <View style={[styles.divider, {marginTop: 0}]} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading1, {marginTop: 0}]}>System Overview</Text>
        <View style={styles.grid}>
          {gridItems.map((item) => (
            <View key={item.id} style={[styles.gridCard, styles.shadow]}>
              <FontAwesome5 name={item.icon} size={32} color="#a83232" />
              <View style={styles.gridTextWrap}>
                <Text style={styles.gridCount}>{item.count}</Text>
                <Text style={styles.gridLabel}>{item.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.heading1}>Needs Attention</Text>
          <Text style={styles.heading2} onPress={() => navigation.navigate('AlertScreen')}>
            View All <FontAwesome5 name="caret-right" size={14} color="#666" />
          </Text>
        </View>

        <View style={[styles.headCard, styles.shadow]}>
          <TouchableOpacity 
            style={styles.headCardTextWrap}
            onPress={() => navigation.navigate('AlertDetails')}
          >
            <View style={styles.scanCardTextWrap}>
              <Text style={[styles.scanCardTitle, styles.statusPending]}>Pending</Text>
              <Text style={styles.scanCardTime}>12:00 PM</Text>
            </View>
            <Text style={styles.headCardTitle}>[Resident Name]</Text>
            <Text style={styles.headCardSubtitle}>waiting for guardian confirmation</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.headCard, styles.shadow]}>
          <TouchableOpacity 
            style={styles.headCardTextWrap}
            onPress={() => navigation.navigate('AssignResponder')}
          >
            <View style={styles.scanCardTextWrap}>
              <Text style={[styles.scanCardTitle, styles.statusOpen]}>Open Alert</Text>
              <Text style={styles.scanCardTime}>12:00 PM</Text>
            </View>
            <Text style={styles.headCardTitle}>[Resident Name]</Text>
            <Text style={styles.headCardSubtitle}>waiting for responder assignment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.heading1}>Recent Activity</Text>
          <Text style={styles.heading2} onPress={() => navigation.navigate('AuditLogScreen')}>
            View All <FontAwesome5 name="caret-right" size={14} color="#666" />
          </Text>
        </View>

        <View style={[styles.headCard, styles.shadow]}>
          <View style={styles.headCardTextWrap}>
            <Text style={styles.headCardTitle}>New Resident Enrolled</Text>
            <Text style={styles.headCardSubtitle}>Yeti Kaye</Text>
          </View>
        </View>
        <View style={[styles.headCard, styles.shadow]}>
          <View style={styles.headCardTextWrap}>
            <Text style={styles.headCardTitle}>Responder Assigned to Alert [Num]</Text>
            <Text style={styles.headCardSubtitle}>waiting for confirmation</Text>
          </View>
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
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 10 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: '#a83232', marginTop: 12, marginBottom: 4 },
  heading2: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 15, marginBottom: 4, marginRight: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  
  shadow: {
    backgroundColor: '#fff',
    shadowColor: '#666',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: -50
  },
  gridCard: {
    /* height: 100, */
    width: '48%',
    aspectRatio: 1.3,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'left',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  gridTextWrap: { flex: 1, marginLeft: 16 },
  gridCount: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', textAlign: 'center' },
  gridLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#999', textAlign: 'center', marginTop: -2 },

  headCard: {
    flexDirection: 'row',
    justifyContent: 'left',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  headCardTextWrap: { flex: 1 },
  headCardTitle: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2, marginLeft: 8 },
  headCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666', marginLeft: 8 },

  scanCardTextWrap: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scanCardTitle: { 
    borderRadius: 10,
    paddingVertical: 2,
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
});