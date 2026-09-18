import { typography, spacing } from '../../theme';
import { useIsFocused } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Text from '../../components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const focused = useIsFocused();

  function handleBarcodeScanned({ data }) {
    if (scanned) return;
    setScanned(true);
    const token = data.match(/\/scan\/([^/?#]+)/)?.[1];
    if (token) { navigation.navigate('BystanderLanding', { token }); return; }
    const match = data.match(/resident\/([^/?#]+)/);
    if (match) {
      navigation.navigate('ProfileScreen', { residentId: match[1] });
    } else {
      Alert.alert('Unrecognized QR code', 'This doesn\'t look like a QRAlalay resident code.', [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>‹ Back</Text>
        <Text style={styles.heading}>QR Scanner</Text>
        <Text style={styles.subheading}>Align the QR Code in the frame</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.fieldContent}>
        <View style={styles.scanBox}>
          {!permission ? (
            <View style={styles.boxFallback} />
          ) : !permission.granted ? (
            <View style={styles.boxFallback}>
              <Text style={styles.permissionText}>Camera permission needed</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {focused && <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              />}
              {scanned && (
                <View style={styles.rescanOverlay}>
                  <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
                    <Text style={styles.rescanButtonText}>Tap to scan again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
        <Text style={styles.subheading}>Make sure the QR Code is visible and clear </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: spacing.screen, paddingBottom: -10 , paddingTop: 4 },
  back: { fontSize: typography.body, fontFamily: 'Poppins_400Regular', color: '#a83232', marginBottom: 4, marginTop: 0, minHeight: 44, paddingVertical: 4},
  heading: { fontSize: typography.title, fontFamily: 'Poppins_700Bold', textAlign: 'center' , marginBottom: 8 },
  heading1: { fontSize: typography.section, fontFamily: 'Poppins_600SemiBold', marginBottom: 12 , marginTop: spacing.section },
  subheading: { fontSize: typography.body, fontFamily: 'Poppins_500Medium', color: '#666', marginBottom: 20, textAlign: 'center' },

  divider: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginBottom: 20,
  },
  fieldContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: -80,
  },

  scanBox: {
    width: 320,
    height: 320,
    borderWidth: 5,
    borderColor: '#a83232',
    borderStyle: 'dashed',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFallback: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  permissionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: typography.detail,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionButton: {
    backgroundColor: '#a83232',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontFamily: 'Poppins_500Medium',
    fontSize: typography.detail,
  },

  rescanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rescanButton: {
    backgroundColor: '#a83232',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontFamily: 'Poppins_500Medium',
    fontSize: typography.detail,
  },
});