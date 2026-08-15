import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import StartScreen from './screens/StartScreen';
import HomeScreen from './screens/HomeScreen';
import ResidentScreen from './screens/ResidentScreen';
import ProfileScreen from './screens/ProfileScreen';
import EnrollNewResident from './screens/EnrollNewResident';
import AlertScreen from './screens/AlertScreen';
import LogScreen from './screens/LogScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

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
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
          {session ? (
            <>
              <Stack.Screen name="Home">
                {(props) => <HomeScreen {...props} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="ResidentScreen" component={ResidentScreen} />
              <Stack.Screen name="EnrollNewResident" component={EnrollNewResident} />
              <Stack.Screen name="AlertScreen" component={AlertScreen} />
              <Stack.Screen name="LogScreen" component={LogScreen} />
              <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            </>
          ) : (
            <Stack.Screen name="Start">
              {(props) => <StartScreen {...props} setSession={setSession} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}