import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import TabBar from '../../component/TabButtons';
import { FontAwesome5 } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>HOME</Text>
        <Text style={styles.subheading}>Welcome, [Name]</Text>

        <View style={[styles.divider, {marginTop: 0}]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={{paddingVertical: 45, marginBottom: 4}}>
          <Text style={[styles.heading1, { textAlign: 'center' }]}>No Active Alert</Text>
          <Text style={[styles.subheading, { textAlign: 'center', marginBottom: 0 }]}>Always remember to keep your ward safe and healthy</Text>
        </View>
          
        <View style={[styles.alertCard, styles.alertCardActive]}>
          <View style={styles.alertCardTextWrap}>
            <Text style={[styles.alertCardTitle, styles.statusOpen, styles.shadow]}>Alert Open</Text>
            <Text style={styles.alertTime}>12:00 PM</Text>
          </View>
          
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.alertSubtitle}>Scanned by a Bystander</Text>
          <Text style={styles.alertSubtitle}>Note: Optional Note that the bystander sent through the 
            public landing page. This is very helpful for the guardian and responder</Text>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, styles.statusPending, styles.shadow]}>Guardian: Pending</Text>
            <Text style={[styles.statusText, styles.statusPending, styles.shadow]}>Responder: Pending</Text>
          </View>

          <View style={styles.buttonWrap}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSafe]}
              onPress={() => navigation.navigate('ConfirmationScreen', { status: 'Safe' })}
            >
              <Text style={[styles.buttonText, styles.statusClosed]}>Mark Safe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonNotSafe]}
              onPress={() => navigation.navigate('ConfirmationScreen', { status: 'Not Safe' })}
            >
              <Text style={[styles.buttonText, styles.statusOpen]}>Mark Not Safe</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />
        <Text style={styles.heading1}>My Tasks</Text>

        <View style={[styles.alertCard]}>
          <View style={styles.alertCardTextWrap}>
            <Text style={[styles.alertCardTitle, styles.alertPending, styles.shadow]}>Alert Pending</Text>
            <Text style={styles.alertTime}>12:00 PM</Text>
          </View>
          
          <Text style={styles.headCardTitle}>[Resident Name]</Text>
          <Text style={styles.alertSubtitle}>Investigate and confirm safety</Text>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AlertDetails')}>
            <Text style={styles.buttonText}>Tap for Full Details</Text>
            <FontAwesome5 name="caret-down" size={18} color="#245490" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <View style={styles.headerRow}>
          <Text style={styles.heading1}>Recent Incidents</Text>
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
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  alertSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginLeft: 8, marginBottom: 10 },
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

  residentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
});