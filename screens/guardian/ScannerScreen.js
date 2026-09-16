import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAdminData } from '../../AdminDataContext';
import GuardianTabBar from '../../component/GuardianTabButtons';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const { residents } = useAdminData();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const residentById = useMemo(() => new Map(residents.map((resident) => [resident.id, resident])), [residents]);

  function handleBarcodeScanned({ data }) {
    if (scanned) return;
    setScanned(true);

    // Current prototype QR values use the resident ID. If a future QR payload
    // uses JSON, the ID can be extracted here without changing the UI flow.
    let residentId = data;
    try {
      const parsed = JSON.parse(data);
      residentId = parsed.id || parsed.residentId || data;
    } catch (_) {}

    const resident = residentById.get(residentId);
    if (resident) {
      setResult(resident);
    } else {
      setResult({ invalid: true, raw: data });
    }
  }

  function resetScanner() {
    setScanned(false);
    setResult(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>Scan Resident QR</Text>
        <Text style={styles.subheading}>Use this when you encounter an emergency involving another resident in your barangay.</Text>
      </View>

      {!result ? (
        <View style={styles.fieldContent}>
          <View style={styles.scanBox}>
            {!permission ? <View style={styles.boxFallback} /> : !permission.granted ? (
              <View style={styles.boxFallback}>
                <FontAwesome5 name="camera" size={30} color="#888" />
                <Text style={styles.permissionText}>Camera permission is needed to scan a resident QR.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}><Text style={styles.permissionButtonText}>Grant Permission</Text></TouchableOpacity>
              </View>
            ) : (
              <CameraView style={StyleSheet.absoluteFillObject} facing="back" onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} />
            )}
          </View>
          <Text style={styles.scanHint}>Align the QR Code inside the frame.</Text>
          <Text style={styles.helperText}>If this is an emergency involving your own ward, use Get Emergency Help instead of scanning.</Text>
        </View>
      ) : result.invalid ? (
        <View style={styles.resultWrap}>
          <View style={styles.resultIconError}><FontAwesome5 name="times" size={30} color="#fff" /></View>
          <Text style={styles.resultTitle}>QR Not Recognized</Text>
          <Text style={styles.resultText}>This QR code is not linked to a resident in the current system.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={resetScanner}><Text style={styles.primaryButtonText}>Scan Again</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('EmergencyHelp')}><Text style={styles.secondaryButtonText}>Get Emergency Help</Text></TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultWrap}>
          <View style={styles.resultIcon}><FontAwesome5 name="check" size={30} color="#fff" /></View>
          <Text style={styles.resultTitle}>Resident Found</Text>
          <View style={styles.residentCard}>
            <Image source={require('../../assets/profile.png')} style={styles.residentPhoto} />
            <View style={{ flex: 1 }}>
              <Text style={styles.residentName}>{result.name}</Text>
              <Text style={styles.residentType}>{result.type}</Text>
              <Text style={styles.residentId}>{result.id}</Text>
            </View>
          </View>
          <View style={styles.noticeBox}><FontAwesome5 name="info-circle" size={14} color="#666" /><Text style={styles.noticeText}>For an emergency involving this resident, you can view the resident information or contact emergency help.</Text></View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ProfileScreen', { resident: result })}><Text style={styles.primaryButtonText}>View Resident Information</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('EmergencyHelp')}><Text style={styles.secondaryButtonText}>Get Emergency Help</Text></TouchableOpacity>
          <TouchableOpacity style={styles.scanAgain} onPress={resetScanner}><Text style={styles.scanAgainText}>Scan Another QR</Text></TouchableOpacity>
        </View>
      )}

      <GuardianTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, content: { padding: 20, paddingBottom: 0 }, back: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 13, marginTop: -5 }, heading: { fontSize: 25, fontFamily: 'Poppins_700Bold', textAlign: 'center' }, subheading: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', lineHeight: 17, marginTop: 3 },
  fieldContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25, marginTop: -15 }, scanBox: { width: 300, height: 300, borderWidth: 4, borderColor: '#a83232', borderStyle: 'dashed', borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }, boxFallback: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', padding: 25 }, permissionText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#666', textAlign: 'center', marginVertical: 12, lineHeight: 18 }, permissionButton: { backgroundColor: '#a83232', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8 }, permissionButtonText: { color: '#fff', fontFamily: 'Poppins_500Medium', fontSize: 12 }, scanHint: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: '#555', textAlign: 'center' }, helperText: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: '#999', textAlign: 'center', lineHeight: 16, marginTop: 10, maxWidth: 300 },
  resultWrap: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 40 }, resultIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#288928', alignItems: 'center', justifyContent: 'center', marginBottom: 13 }, resultIconError: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#a83232', alignItems: 'center', justifyContent: 'center', marginBottom: 13 }, resultTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#222', marginBottom: 5 }, resultText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#666', textAlign: 'center', lineHeight: 18, maxWidth: 300, marginBottom: 20 }, residentCard: { width: '100%', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 13, padding: 13, marginTop: 8, marginBottom: 13, elevation: 3 }, residentPhoto: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.3, borderColor: '#a83232', marginRight: 11 }, residentName: { fontSize: 16, fontFamily: 'Poppins_600SemiBold' }, residentType: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#245490' }, residentId: { fontSize: 9, fontFamily: 'Poppins_400Regular', color: '#777', marginTop: 1 }, noticeBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#f6f6f6', borderRadius: 10, padding: 11, marginBottom: 13 }, noticeText: { flex: 1, marginLeft: 8, fontSize: 10, lineHeight: 16, color: '#666', fontFamily: 'Poppins_400Regular' }, primaryButton: { width: '100%', backgroundColor: '#a83232', borderRadius: 9, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }, primaryButtonText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, secondaryButton: { width: '100%', borderWidth: 1, borderColor: '#a83232', backgroundColor: '#fff5f5', borderRadius: 9, paddingVertical: 12, alignItems: 'center', marginBottom: 8 }, secondaryButtonText: { color: '#a83232', fontFamily: 'Poppins_600SemiBold', fontSize: 12 }, scanAgain: { paddingVertical: 8 }, scanAgainText: { color: '#666', fontFamily: 'Poppins_500Medium', fontSize: 11 },
});
