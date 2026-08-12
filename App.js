import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StartScreen from './screens/StartScreen';
import HomeScreen from './screens/HomeScreen';
import EnrollNewResident from './screens/EnrollNewResident';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <>
              <Stack.Screen name="Home">
                {(props) => <HomeScreen {...props} setSession={setSession} />}
              </Stack.Screen>
              <Stack.Screen name="EnrollNewResident" component={EnrollNewResident} />
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