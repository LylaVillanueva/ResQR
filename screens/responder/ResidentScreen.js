import { typography, spacing } from '../../theme';
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import Text from "../../component/AppText";
import TextInput from "../../component/AppTextInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from "../../component/ResponderTabButtons";
import { api } from '../../lib/api';

// Enrollment also creates a residents row for staff/guardian sign-ups (their
// login account needs a linked person record) — those aren't residents and
// shouldn't show up in this list.
const STAFF_TYPES = ['Guardian', 'Responder', 'Barangay Official'];

export default function ResidentScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      api
        .listResidents()
        .then((data) => {
          if (!cancelled) setResidents(data);
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
  const filteredResidents = residents
    .filter((r) => !STAFF_TYPES.includes(r.resident_type))
    .filter((r) => r.full_name.toLowerCase().includes(query));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Assigned Residents</Text>

        <View style={styles.divider} />
        <View style={styles.searchBar}>
          <FontAwesome5 name="search" size={18} color="#a83232" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator style={{ marginVertical: 20 }} color="#a83232" />
        ) : error ? (
          <Text style={styles.emptyText}>Couldn't load residents: {error}</Text>
        ) : filteredResidents.length === 0 ? (
          <Text style={styles.emptyText}>
            {residents.length === 0 ? 'No residents assigned to you yet.' : 'No residents match your search.'}
          </Text>
        ) : (
          filteredResidents.map((resident) => (
            <TouchableOpacity
              key={resident.id}
              style={styles.residentCard}
              onPress={() => navigation.navigate('ProfileScreen', { residentId: resident.id })}
            >
              <Image source={require("../../assets/profile.png")} style={styles.residentPhoto} />
              <View style={styles.residentTextWrap}>
                <Text style={styles.residentName}>{resident.full_name}</Text>
                <Text style={styles.residentMeta}>{resident.resident_code || resident.resident_type || 'No ID on file'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: 0, marginTop: 20 },
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
  emptyText: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#888', textAlign: 'center', marginTop: 20 },
  divider: { borderTopWidth: 1, borderTopColor: '#ddd' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 0,
    marginBottom: 16,
    marginTop: 10,
   minHeight: spacing.control },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 8,
    color: '#333',
   minHeight: spacing.control, backgroundColor: '#f2f2f2' },

  residentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: spacing.card,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  residentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#c4c4c4',
    marginRight: 14,
  },
  residentTextWrap: { flex: 1 },
  residentName: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', marginBottom: 2 },
  residentMeta: { fontSize: typography.caption, fontFamily: 'Poppins_400Regular', color: '#666' },
});
