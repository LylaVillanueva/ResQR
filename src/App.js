import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { AppDataProvider } from './context/AppDataContext';
import { AccessibilitySettingsProvider, useAccessibilitySettings } from './context/AccessibilitySettingsContext';
import useSession from './hooks/useSession';
import AppNavigator from './navigation/AppNavigator';
import ScreenState from './components/ScreenState';

function Root() {
  const { session, setSession, restoring } = useSession();
  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  const { ready: accessibilityReady } = useAccessibilitySettings();
  return restoring || accessibilityReady === false || (!fontsLoaded && !fontError) ? <ScreenState loading /> : (
    <AppDataProvider key={session?.user?.id || 'public'} session={session}>
      <AppNavigator session={session} setSession={setSession} />
    </AppDataProvider>
  );
}

export default function App() {
  return <SafeAreaProvider>
    <AccessibilitySettingsProvider>
      <Root />
    </AccessibilitySettingsProvider>
  </SafeAreaProvider>;
}
