import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { api, clearSession } from './lib/api';
import StartScreen from './screens/StartScreen';
import BystanderPublicWeb from './web/BystanderPublicWeb';

// Admin screens
import AdminHomeScreen from './screens/admin/HomeScreen';
import AdminResidentScreen from './screens/admin/ResidentScreen';
import AdminAlertScreen from './screens/admin/AlertScreen';
import AdminSettingsScreen from './screens/admin/SettingsScreen';
import AdminScannerScreen from './screens/admin/ScannerScreen';
import AdminEnrollNewResident from './screens/admin/EnrollNewResident';
import AdminProfileScreen from './screens/admin/ProfileScreen';
import AdminAuditLogScreen from './screens/admin/AuditLogScreen';
import AdminAlertDetails from './screens/admin/AlertDetails';
import AdminAssignResponder from './screens/admin/AssignResponder';

// Guardian screens
import GuardianHomeScreen from './screens/guardian/HomeScreen';
import GuardianResidentScreen from './screens/guardian/ResidentScreen';
import GuardianAlertScreen from './screens/guardian/AlertScreen';
import GuardianSettingsScreen from './screens/guardian/SettingsScreen';
import GuardianScannerScreen from './screens/guardian/ScannerScreen';
import GuardianProfileScreen from './screens/guardian/ProfileScreen';
import GuardianAuditLogScreen from './screens/guardian/AuditLogScreen';
import GuardianConfirmationScreen from './screens/guardian/ConfirmationScreen';
import GuardianAlertDetails from './screens/guardian/AlertDetails';

// Responder screens
import ResponderHomeScreen from './screens/responder/HomeScreen';
import ResponderResidentScreen from './screens/responder/ResidentScreen';
import ResponderAlertScreen from './screens/responder/AlertScreen';
import ResponderSettingsScreen from './screens/responder/SettingsScreen';
import ResponderScannerScreen from './screens/responder/ScannerScreen';
import ResponderProfileScreen from './screens/responder/ProfileScreen';
import ResponderAuditLogScreen from './screens/responder/AuditLogScreen';
import ResponderConfirmationScreen from './screens/responder/ConfirmationScreen';
import ResponderAlertDetails from './screens/responder/AlertDetails';

const Stack = createNativeStackNavigator();

// The public bystander landing page (a scanned QR resolves here) needs to
// be reachable outside the authenticated stacks below, on web.
const linking = {
  prefixes: [],
  config: {
    screens: {
      BystanderLanding: 'resident/:residentId',
      Start: '',
    },
  },
};

export default function App() {
  const [session, setSession] = useState(null);
  const [restoringSession, setRestoringSession] = useState(true);

  // The backend's real role values (types/domain.ts UserRole).
  const role = session?.user?.role;

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    (async () => {
      const restored = await api.restoreSession();
      if (restored) {
        try {
          const user = await api.getMyProfile();
          setSession({ user });
        } catch {
          await clearSession();
        }
      }
      setRestoringSession(false);
    })();
  }, []);

  if (!fontsLoaded || restoringSession) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
          {role === 'barangay_official' && (
            <>
              <Stack.Screen name="Home">
                {(props) => <AdminHomeScreen {...props} session={session} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="ResidentScreen">
                {(props) => <AdminResidentScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AlertScreen">
                {(props) => <AdminAlertScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="SettingsScreen">
                {(props) => <AdminSettingsScreen {...props} session={session} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="ScannerScreen">
                {(props) => <AdminScannerScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="EnrollNewResident">
                {(props) => <AdminEnrollNewResident {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="ProfileScreen">
                {(props) => <AdminProfileScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AuditLogScreen">
                {(props) => <AdminAuditLogScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AlertDetails">
                {(props) => <AdminAlertDetails {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AssignResponder">
                {(props) => <AdminAssignResponder {...props} session={session} />}
              </Stack.Screen>
            </>
          )}

          {role === 'guardian' && (
            <>
              <Stack.Screen name="Home">
                {(props) => <GuardianHomeScreen {...props} session={session} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="ResidentScreen">
                {(props) => <GuardianResidentScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AlertScreen">
                {(props) => <GuardianAlertScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="SettingsScreen">
                {(props) => <GuardianSettingsScreen {...props} session={session} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="ScannerScreen">
                {(props) => <GuardianScannerScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="ProfileScreen">
                {(props) => <GuardianProfileScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AuditLogScreen">
                {(props) => <GuardianAuditLogScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="ConfirmationScreen">
                {(props) => <GuardianConfirmationScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AlertDetails">
                {(props) => <GuardianAlertDetails {...props} session={session} />}
              </Stack.Screen>
            </>
          )}

          {role === 'barangay_responder' && (
            <>
              <Stack.Screen name="Home">
                {(props) => <ResponderHomeScreen {...props} session={session} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="ResidentScreen">
                {(props) => <ResponderResidentScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AlertScreen">
                {(props) => <ResponderAlertScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="SettingsScreen">
                {(props) => <ResponderSettingsScreen {...props} session={session} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="ScannerScreen">
                {(props) => <ResponderScannerScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="ProfileScreen">
                {(props) => <ResponderProfileScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AuditLogScreen">
                {(props) => <ResponderAuditLogScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="ConfirmationScreen">
                {(props) => <ResponderConfirmationScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="AlertDetails">
                {(props) => <ResponderAlertDetails {...props} session={session} />}
              </Stack.Screen>
            </>
          )}

          {!session && (
            <>
              <Stack.Screen name="Start">
                {(props) => <StartScreen {...props} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="BystanderLanding" component={BystanderPublicWeb} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}