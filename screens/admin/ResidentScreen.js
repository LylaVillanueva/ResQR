import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { api } from '../../lib/api';

const filters = [
  { key: 'Senior Citizen', label: 'Senior' },
  { key: 'Person with Disability', label: 'PWD' },
  { key: 'guardian', label: 'Guardian' },
  { key: 'Responder', label: 'Responder' },
];

export default function ResidentScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [residents, setResidents] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      Promise.all([api.listResidents(), api.listGuardians()])
        .then(([residentData, guardianData]) => {
          if (cancelled) return;
          setResidents(residentData);
          setGuardians(guardianData);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const query = searchQuery.trim().toLowerCase();
  const filteredResidents = residents.filter((r) => {
    if (activeFilter && activeFilter !== 'guardian' && r.resident_type !== activeFilter) return false;
    return r.full_name.toLowerCase().includes(query) || (r.resident_code || '').toLowerCase().includes(query);
  });
  const filteredGuardians = guardians.filter((g) => g.full_name.toLowerCase().includes(query));
  const showGuardians = activeFilter === 'guardian';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Residents</Text>

        <View style={styles.divider} />
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={18} color="#a83232" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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
        {loading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} color="#a83232" />
        ) : error ? (
          <Text style={styles.emptyText}>Couldn't load residents: {error}</Text>
        ) : showGuardians ? (
          filteredGuardians.length === 0 ? (
            <Text style={styles.emptyText}>No registered guardian accounts found.</Text>
          ) : (
            filteredGuardians.map((guardian) => (
              <View key={guardian.id} style={styles.residentCard}>
                <Image source={require('../../assets/profile.png')} style={styles.residentPhoto} />
                <View style={styles.residentTextWrap}>
                  <Text style={styles.residentName}>{guardian.full_name}</Text>
                  <Text style={styles.residentMeta}>{guardian.phone_number || guardian.email || 'No contact on file'}</Text>
                </View>
              </View>
            ))
          )
        ) : filteredResidents.length === 0 ? (
          <Text style={styles.emptyText}>
            {residents.length === 0 ? 'No residents enrolled in this barangay yet.' : 'No residents match your search.'}
          </Text>
        ) : (
          filteredResidents.map((resident) => (
            <TouchableOpacity
              key={resident.id}
              style={styles.residentCard}
              onPress={() => navigation.navigate('ProfileScreen', { residentId: resident.id })}
            >
              <Image source={require('../../assets/profile.png')} style={styles.residentPhoto} />
              <View style={styles.residentTextWrap}>
                <Text style={styles.residentName}>{resident.full_name}</Text>
                <Text style={styles.residentMeta}>{resident.resident_code || resident.resident_type || 'No ID on file'}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  resident.guardian_has_logged_in
                    ? styles.statusDotLoggedIn
                    : resident.guardian_id
                    ? styles.statusDotPending
                    : styles.statusDotNone,
                ]}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.buttonContent}>
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={() => navigation.navigate('EnrollNewResident')}
        >
          <Text style={styles.enrollButtonText}>+ Enroll New Resident</Text>
        </TouchableOpacity>
      </View>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 20 },
  buttonContent: { paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'flex-end' },
  heading: { fontSize: 28, fontFamily: 'Poppins_700Bold', marginBottom: 10 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  subheading: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888', textAlign: 'center', marginTop: 20 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdcdc',
    borderWidth: 1,
    borderColor: '#a83232',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 16,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 8,
    color: '#333',
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
  filterLabelActive: { color: '#a83232', fontFamily: 'Poppins_700Bold' },

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
    marginRight: 2,
  },
  statusDotLoggedIn: { backgroundColor: '#288928' },
  statusDotPending: { backgroundColor: '#c9a227' },
  statusDotNone: { backgroundColor: '#bbb' },
  enrollButton: {
    borderWidth: 1,
    borderColor: '#a83232',
    borderRadius: 10,
    backgroundColor: '#ffdcdc',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  enrollButtonText: { color: '#a83232', fontSize: 15, fontFamily: 'Poppins_500Medium' },
});
