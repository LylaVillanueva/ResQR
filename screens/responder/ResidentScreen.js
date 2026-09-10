import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import TabBar from '../../component/TabButtons';
import { api } from '../../lib/api';

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
  const filteredResidents = residents.filter((r) => r.full_name.toLowerCase().includes(query));

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
              <Image source={require('../../assets/profile.png')} style={styles.residentPhoto} />
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
  content: { padding: 20, paddingBottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0, marginTop: 20 },
  heading: { fontSize: 28, fontFamily: 'Poppins_700Bold', marginBottom: 10 },
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
});
