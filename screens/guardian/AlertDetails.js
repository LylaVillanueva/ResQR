import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabBar from '../../component/TabButtons';

export default function ProfileScreen({ route, navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>

        <View style={styles.profileBar}>
            <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
            <View style={styles.profileTextWrap}>
                <Text style={styles.name}>Maria Santos</Text>
                <Text style={styles.meta}>ID: BRC-SC-2026-0001</Text>
                <Text style={styles.meta}>Type: Person with Disability</Text>
            </View>
        </View>

        <Text style={styles.heading1}>Alert Details</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>Scanned By</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Image source={require('../../assets/profile.png')} style={styles.responderPhoto} />
          <Text style={styles.headCardTitle}>A Bystander</Text>
        </View>
        
        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>Optional Note</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Text style={styles.scanCardSubtitle}>Optional note submitted by the bystander/resident once the alert is confirmed</Text>
        </View>

        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>Responder Assigned</Text>
        <View style={[styles.headCard, styles.shadow]}>
          <Image source={require('../../assets/profile.png')} style={styles.responderPhoto} />
          <Text style={styles.headCardTitle}>Rowendo Carpino</Text>
        </View>

        <Text style={[styles.subheading, {fontFamily: 'Poppins_500Medium'}]}>Confirmation Status</Text>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusPending]}>Pending</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={styles.scanCardSubtitle}>Waiting for [Responder Name]'s confirmation</Text>
        </View>
        <View style={styles.scanCard}>
          <View style={styles.scanCardTextWrap}>
            <Text style={[styles.scanCardTitle, styles.statusClosed]}>Marked Safe</Text>
            <Text style={styles.scanCardTime}>12:00 PM</Text>
          </View>
          <Text style={styles.scanCardSubtitle}>Rowendo John T. Carpino sent confirmation</Text>
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
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginTop: 10, marginBottom: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_400Regular', marginTop: 10, marginBottom: 6 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },

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

  button: {
    backgroundColor: '#ffdcdc',
    borderColor: '#a83232',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonText: { color: '#a83232', fontFamily: 'Poppins_500Medium', fontSize: 16, fontWeight: '600' },

  scanCard: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
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
  scanCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', marginLeft: 8 },
  scanCardDot: {
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
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  responderPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#a83232',
    backgroundColor: '#c4c4c4',
    marginLeft: 4,
    marginRight: 12,
    shadowColor: '#625350',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headCardTextWrap: { flex: 1 },
  headCardTitle: { fontSize: 15, fontFamily: 'Poppins_500Medium', marginBottom: 2, marginLeft: 4 },
  headCardSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#666' }
});