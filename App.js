import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';

import StartScreen from './screens/StartScreen';
import { AdminDataProvider } from './AdminDataContext';

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
import AdminManageUsers from './screens/admin/ManageUsers';
import AdminAddUser from './screens/admin/AddUser';
import AdminUserDetails from './screens/admin/UserDetails';

// Guardian screens
import GuardianHomeScreen from './screens/guardian/HomeScreen';
import GuardianResidentScreen from './screens/guardian/ResidentScreen';
import GuardianAlertScreen from './screens/guardian/AlertScreen';
import GuardianSettingsScreen from './screens/guardian/SettingsScreen';
import GuardianScannerScreen from './screens/guardian/ScannerScreen';
import GuardianProfileScreen from './screens/guardian/ProfileScreen';
import GuardianConfirmationScreen from './screens/guardian/ConfirmationScreen';
import GuardianAlertDetails from './screens/guardian/AlertDetails';
import GuardianEmergencyHelpScreen from './screens/guardian/EmergencyHelpScreen';

// Responder screens
import ResponderHomeScreen from './screens/responder/HomeScreen';
import ResponderAlertScreen from './screens/responder/AlertScreen';
import ResponderSettingsScreen from './screens/responder/SettingsScreen';
import ResponderScannerScreen from './screens/responder/ScannerScreen';
import ResponderProfileScreen from './screens/responder/ProfileScreen';
import ResponderAuditLogScreen from './screens/responder/AuditLogScreen';
import ResponderConfirmationScreen from './screens/responder/ConfirmationScreen';
import ResponderAlertDetails from './screens/responder/AlertDetails';
import ResponderIncidentReportScreen from './screens/responder/IncidentReportScreen';
import ResponderIncidentScreen from './screens/responder/IncidentScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null); // session.role: 'admin' | 'responder' | 'guardian'

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AdminDataProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>

            {session?.role === 'admin' && (
              <>
                <Stack.Screen name="Home">
                  {(props) => <AdminHomeScreen {...props} setSession={setSession} />}
                </Stack.Screen>
                <Stack.Screen name="ResidentScreen" component={AdminResidentScreen} />
                <Stack.Screen name="AlertScreen" component={AdminAlertScreen} />
                <Stack.Screen name="SettingsScreen">
                  {(props) => <AdminSettingsScreen {...props} setSession={setSession} />}
                </Stack.Screen>
                <Stack.Screen name="ScannerScreen" component={AdminScannerScreen} />
                <Stack.Screen name="EnrollNewResident" component={AdminEnrollNewResident} />
                <Stack.Screen name="ProfileScreen" component={AdminProfileScreen} />
                <Stack.Screen name="AuditLogScreen" component={AdminAuditLogScreen} />
                <Stack.Screen name="AlertDetails" component={AdminAlertDetails} />
                <Stack.Screen name="AssignResponder" component={AdminAssignResponder} />
                <Stack.Screen name="ManageUsers" component={AdminManageUsers} />
                <Stack.Screen name="AddUser" component={AdminAddUser} />
                <Stack.Screen name="UserDetails" component={AdminUserDetails} />
              </>
            )}

            {session?.role === 'guardian' && (
              <>
                <Stack.Screen name="Home">
                  {(props) => <GuardianHomeScreen {...props} setSession={setSession} />}
                </Stack.Screen>
                <Stack.Screen name="ResidentScreen" component={GuardianResidentScreen} />
                <Stack.Screen name="AlertScreen" component={GuardianAlertScreen} />
                <Stack.Screen name="SettingsScreen">
                  {(props) => <GuardianSettingsScreen {...props} setSession={setSession} />}
                </Stack.Screen>
                <Stack.Screen name="ScannerScreen" component={GuardianScannerScreen} />
                <Stack.Screen name="ProfileScreen" component={GuardianProfileScreen} />
                <Stack.Screen name="ConfirmationScreen" component={GuardianConfirmationScreen} />
                <Stack.Screen name="AlertDetails" component={GuardianAlertDetails} />
                <Stack.Screen name="EmergencyHelp" component={GuardianEmergencyHelpScreen} />
              </>
            )}

            {session?.role === 'responder' && (
              <>
                <Stack.Screen name="Home">
                  {(props) => <ResponderHomeScreen {...props} setSession={setSession} />}
                </Stack.Screen>
                <Stack.Screen name="AlertScreen" component={ResponderAlertScreen} />
                <Stack.Screen name="IncidentScreen" component={ResponderIncidentScreen} />
                <Stack.Screen name="SettingsScreen">
                  {(props) => <ResponderSettingsScreen {...props} setSession={setSession} />}
                </Stack.Screen>
                <Stack.Screen name="ScannerScreen" component={ResponderScannerScreen} />
                <Stack.Screen name="ProfileScreen" component={ResponderProfileScreen} />
                <Stack.Screen name="AuditLogScreen" component={ResponderAuditLogScreen} />
                <Stack.Screen name="ConfirmationScreen" component={ResponderConfirmationScreen} />
                <Stack.Screen name="AlertDetails" component={ResponderAlertDetails} />
                <Stack.Screen name="IncidentReportScreen" component={ResponderIncidentReportScreen} />
              </>
            )}

            {!session && (
              <Stack.Screen name="Start">
                {(props) => <StartScreen {...props} setSession={setSession} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AdminDataProvider>
    </SafeAreaProvider>
  );
}