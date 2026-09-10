import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../lib/api';

export default function ConfirmationScreen({ route, navigation }) {
  const incidentId = route.params?.incidentId;
  const decision = route.params?.decision; // 'safe' | 'not_safe'
  const residentName = route.params?.residentName;

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isSafe = decision === 'safe';

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await api.submitIncidentConfirmation(incidentId, { decision });
      setConfirmed(true);
    } catch (err) {
      Alert.alert('Could not submit', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const bullets = isSafe
    ? [
        'This will be recorded as your confirmation.',
        'The alert stays open until the responder also confirms.',
        'You can still view the alert status in your alerts list.',
      ]
    : [
        'This will immediately escalate the alert to high priority.',
        'The barangay responder will be notified right away.',
        'This action cannot be undone once confirmed.',
      ];

  if (confirmed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={[styles.resultIconWrap, isSafe ? styles.resultIconSafe : styles.resultIconNotSafe]}>
            <FontAwesome5 name={isSafe ? 'check' : 'exclamation'} size={55} color="#fff" />
          </View>

          <Text style={styles.subheading}>{isSafe ? 'Marked as Safe' : 'Alert Escalated'}</Text>
          <Text style={styles.subheading2}>
            {isSafe ? 'Your confirmation has been submitted.' : 'Barangay has been notified as high priority.'}
          </Text>

          <View style={styles.residentCard}>
            <Image source={require('../../assets/profile.png')} style={styles.residentPhoto} />
            <View style={styles.residentTextWrap}>
              <Text style={styles.residentName}>{residentName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.blueButton, { marginBottom: 8 }]}
            onPress={() => navigation.navigate('AlertDetails', { incidentId })}
          >
            <Text style={[styles.buttonText, styles.blueText]}>View Alert Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading1}>
          Are you sure you want to mark this resident as {isSafe ? 'safe' : 'Not Safe'}?
        </Text>

        <Image source={require('../../assets/profile.png')} style={styles.profilePhoto} />
        <Text style={styles.subheading}>{residentName}</Text>

        <View style={styles.bulletBox}>
          {bullets.map((line, i) => (
            <View key={i} style={styles.bulletRow}>
              <FontAwesome5
                name="exclamation-circle"
                size={20}
                color={isSafe ? '#288928' : '#a83232'}
                style={styles.bulletIcon}
              />
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmButton, isSafe ? styles.confirmButtonSafe : styles.confirmButtonNotSafe]}
          onPress={handleConfirm}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={isSafe ? '#288928' : '#a83232'} />
          ) : (
            <Text style={[styles.confirmButtonText, isSafe ? styles.safeText : styles.notSafeText]}>
              {isSafe ? 'Confirm Safe' : 'Confirm Not Safe'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()} disabled={submitting}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', padding: 24 },
  heading1: { fontSize: 18, fontFamily: 'Poppins_500Medium', color: '#666', marginTop: 20, marginBottom: 20, textAlign: 'center' },
  subheading: { fontSize: 20, fontFamily: 'Poppins_700Bold', textAlign: 'center', marginBottom: -4 },
  subheading2: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', marginBottom: 24 },

  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 90,
    borderWidth: 1.8,
    borderColor: '#a83232',
    backgroundColor: '#c4c4c4',
    marginBottom: 20,
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  bulletBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  bulletIcon: { marginRight: 14, marginTop: 12 },
  bulletText: { flex: 1, fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#333' },

  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonSafe: { borderColor: '#288928', backgroundColor: '#a1fbaa' },
  confirmButtonNotSafe: { borderColor: '#a83232', backgroundColor: '#fbd1d1' },
  confirmButtonText: { fontFamily: 'Poppins_500Medium', fontSize: 16 },
  safeText: { color: '#288928' },
  notSafeText: { color: '#a83232' },

  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  blueButton: { borderColor: '#245490', backgroundColor: '#d3e5f8' },
  buttonText: { color: '#333', fontFamily: 'Poppins_500Medium', fontSize: 16 },
  blueText: { color: '#245490' },

  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  resultIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultIconSafe: { backgroundColor: '#288928' },
  resultIconNotSafe: { backgroundColor: '#a83232' },

  residentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
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
});
