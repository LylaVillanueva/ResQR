import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'closed', label: 'Closed' },
];

export default function AlertScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState(null);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.heading}>Alert</Text>
            <Text style={styles.subheading}>Tap an alert to confirm status</Text>
          </View>

          <TouchableOpacity
            style={styles.auditButton}
            onPress={() => navigation.navigate('AuditLogScreen')}
          >
            <FontAwesome5 name="bars" size={25} color="#666" />
            <Text style={styles.auditButtonText}>Audit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>Filter by:</Text>
          <View style={styles.filterWrap}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterButton, activeFilter === f.key && styles.filterButtonActive]}
                onPress={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
              >
                <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>  
        </View> 
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.alertCard, styles.alertCardActive]}>
          <View style={styles.alertCardTextWrap}>
            <Text style={[styles.alertCardTitle, styles.alertOpen, styles.shadow]}>Alert Open</Text>
            <Text style={styles.alertTime}>12:00 PM</Text>
          </View>
          
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.alertSubtitle}>Scanned by a Bystander</Text>
          <Text style={styles.alertSubtitle}>Note: Optional Note that the bystander sent through the 
            public landing page. This is very helpful for the guardian and responder</Text>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, styles.statusOpen, styles.shadow]}>Guardian: Waiting</Text>
            <Text style={[styles.statusText, styles.statusOpen, styles.shadow]}>Responder: Waiting</Text>
          </View>

          <View style={styles.buttonWrap}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AssignResponder')}>
              <Text style={styles.buttonText}>Assign Responder</Text>
              <FontAwesome5 name="caret-down" size={18} color="#245490" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.alertCard]}>
          <View style={styles.alertCardTextWrap}>
            <Text style={[styles.alertCardTitle, styles.alertPending, styles.shadow]}>Alert Pending</Text>
            <Text style={styles.alertTime}>12:00 PM</Text>
          </View>
          
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.alertSubtitle}>Scanned by a Bystander</Text>

          <View style={styles.statusRow}>
            <Text style={[styles.statusText, styles.statusPending, styles.shadow]}>Guardian: Pending</Text>
            <Text style={[styles.statusText, styles.statusOpen, styles.shadow]}>Responder: Not Safe</Text>
          </View>

          <View style={styles.buttonWrap}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AlertDetails')}>
              <Text style={styles.buttonText}>Tap for Full Details</Text>
              <FontAwesome5 name="caret-down" size={18} color="#245490" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertCardTextWrap}>
            <Text style={[styles.alertCardTitle, styles.alertClosed, styles.shadow]}>Alert Closed</Text>
            <Text style={styles.alertTime}>12:00 PM</Text>
          </View>
          
          <Text style={styles.heading1}>[Resident Name]</Text>
          <Text style={styles.alertSubtitle}>Resolved - Both Party Confirmed Safe</Text>
          <View style={styles.buttonWrap}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AlertDetails')}>
              <Text style={styles.buttonText}>Tap for Full Details</Text>
              <FontAwesome5 name="caret-down" size={18} color="#245490" />
            </TouchableOpacity>
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
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 20 },
  heading: { fontSize: 26, fontFamily: 'Poppins_700Bold', marginBottom: -6 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginLeft: 8 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  auditButton: { alignItems: 'center', padding: 6, marginTop: 8 },
  auditButtonText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 2 },
  
  shadow: {
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  filterBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 4, 
    marginTop: -10,
    marginBottom: 6,
  },
  filterWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: { backgroundColor: '#ffdcdc', borderWidth: 1, borderColor: '#a83232', paddingVertical: 4, paddingHorizontal: 7 },
  filterLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#666', marginLeft: 2 },
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold', },

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
});