import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import TabBar from '../../component/TabButtons';
import { api } from '../../lib/api';

const STATUS_LABELS = {
  active: 'Alert Open',
  confirmed_safe: 'Alert Closed',
  confirmed_not_safe: 'Alert Pending',
  escalated: 'Escalated',
  assigned: 'Alert Pending',
  resolved: 'Alert Closed',
  closed: 'Alert Closed',
};

function statusStyleKey(status) {
  if (status === 'active') return 'alertOpen';
  if (['confirmed_safe', 'resolved', 'closed'].includes(status)) return 'alertClosed';
  return 'alertPending';
}

function decisionLabel(decision) {
  if (decision === 'safe') return 'Safe';
  if (decision === 'not_safe') return 'Not Safe';
  return 'Pending';
}

export default function ProfileScreen({ route, navigation }) {
  const residentId = route.params?.residentId;
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [resident, setResident] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!residentId) {
      setLoading(false);
      setError('No resident specified.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([api.getResident(residentId), api.listResidentHistory(residentId)])
      .then(([residentData, historyData]) => {
        if (cancelled) return;
        setResident(residentData);
        setHistory(historyData);
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
  }, [residentId]);

  async function viewQR() {
    setQrLoading(true);
    try {
      const data = await api.generateQr({ residentId });
      setQrData(data);
      setShowQR(true);
    } catch (err) {
      Alert.alert('Could not generate QR code', err.message);
    } finally {
      setQrLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
          <ActivityIndicator style={{ marginTop: 40 }} color="#a83232" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !resident) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
          <Text style={styles.emptyText}>Couldn't load this resident{error ? `: ${error}` : '.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showQR) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.back} onPress={() => setShowQR(false)}>‹ Back</Text>
          <Text style={styles.heading}>QR Card Generated</Text>

          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              {qrData?.publicScanUrl ? (
                <QRCode value={qrData.publicScanUrl} size={240} />
              ) : (
                <Text style={styles.qrPlaceholderText}>QR CODE{'\n'}UNAVAILABLE</Text>
              )}
            </View>

            <Text style={styles.qrName}>{resident.full_name}</Text>
            <Text style={styles.qrDetail}>{resident.resident_code}</Text>
            <Text style={styles.qrDetail}>{resident.guardian_name ? `Guardian: ${resident.guardian_name}` : 'No guardian linked'}</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => { /* download PDF logic goes here */ }}>
            <Text style={styles.primaryButtonText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowQR(false)}>
            <Text style={styles.secondaryButtonText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>

        <View style={styles.profileBar}>
          <Image
            source={resident.photo_url ? { uri: resident.photo_url } : require('../../assets/profile.png')}
            style={styles.profilePhoto}
          />
          <View style={styles.profileTextWrap}>
            <Text style={styles.name}>{resident.full_name}</Text>
            {!!resident.resident_code && <Text style={styles.meta}>ID: {resident.resident_code}</Text>}
            {!!resident.resident_type && <Text style={styles.meta}>Type: {resident.resident_type}</Text>}
          </View>
        </View>

        <TouchableOpacity style={styles.qrButton} onPress={viewQR} disabled={qrLoading}>
          <Text style={styles.qrButtonText}>{qrLoading ? 'Generating…' : 'View QR Code'}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        <Text style={styles.heading1}>Scan History</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No alerts have been raised for this resident yet.</Text>
        ) : (
          history.map((incident) => (
            <View key={incident.id} style={[styles.alertCard, incident.status === 'active' && styles.alertCardActive]}>
              <View style={styles.alertCardTextWrap}>
                <Text style={[styles.alertCardTitle, styles[statusStyleKey(incident.status)], styles.shadow]}>
                  {STATUS_LABELS[incident.status] || incident.status}
                </Text>
                <Text style={styles.alertTime}>{new Date(incident.created_at).toLocaleDateString()}</Text>
              </View>

              <Text style={styles.alertSubtitle}>Scanned by a bystander</Text>

              <View style={styles.statusRow}>
                <Text style={[styles.statusText, styles[statusStyleKey(incident.guardian_decision ? 'closed' : 'active')], styles.shadow]}>
                  Guardian: {decisionLabel(incident.guardian_decision)}
                </Text>
                <Text style={[styles.statusText, styles[statusStyleKey(incident.responder_decision ? 'closed' : 'active')], styles.shadow]}>
                  Responder: {decisionLabel(incident.responder_decision)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('AlertDetails', { incidentId: incident.id })}
              >
                <Text style={styles.buttonText}>Tap for Full Details</Text>
                <FontAwesome5 name="caret-down" size={18} color="#245490" />
              </TouchableOpacity>
            </View>
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
  scrollContent: { padding: 20, paddingTop: 0 },
  back: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 16, marginTop: -16 },
  heading: { fontSize: 28, fontFamily: 'Poppins_700Bold', marginTop: -10 },
  heading1: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', marginBottom: 4 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888', marginTop: 20 },

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

  qrButton: {
    backgroundColor: '#ffdcdc',
    borderColor: '#a83232',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  qrButtonText: { color: '#a83232', fontFamily: 'Poppins_500Medium', fontSize: 16, fontWeight: '600' },

  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 20,
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
  buttonText: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: '#245490' },
  alertCardActive: {
    borderColor: '#a83232',
    backgroundColor: '#fff',
    shadowColor: '#a83232',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertOpen: { color: '#a83232', backgroundColor: '#fbd1d1' },
  alertPending: { color: '#8a6d1d', backgroundColor: '#fbf1a1' },
  alertClosed: { color: '#288928', backgroundColor: '#a1fbaa' },
  alertTime: { fontSize: 13, fontFamily: 'Poppins_400Regular', paddingVertical: 4, color: '#666' },
  alertSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', marginLeft: 8, marginBottom: 10 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
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

  shadow: {
    shadowColor: '#aaa',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  primaryButton: {
    borderRadius: 10,
    backgroundColor: '#fbd1d1',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#625350',
    shadowOffset: { width: 7, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: { color: '#a83232', fontSize: 16, fontFamily: 'Poppins_500Medium' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#c12b2b', fontSize: 16, fontFamily: 'Poppins_400Regular' },

  qrBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  qrPlaceholder: {
    width: 280,
    height: 280,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 25,
    backgroundColor: '#f2f2f2',
  },
  qrPlaceholderText: { textAlign: 'center', color: '#999', fontSize: 13, fontFamily: 'Poppins_500Medium' },
  qrName: { fontSize: 24, fontFamily: 'Poppins_500Medium', marginBottom: 6 },
  qrDetail: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#333', textAlign: 'center', marginBottom: -2 },
});
