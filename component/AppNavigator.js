import React, { useCallback } from 'react';
import { View } from 'react-native';
import Text from "./AppText";
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { roleScreens } from "../lib/screenRegistry";
import { useAppData } from "../lib/AppDataContext";
import ScreenState from "./ScreenState";
import StartScreen from "../screens/StartScreen";
import BystanderPublicWeb from '../web/BystanderPublicWeb';

const Stack = createNativeStackNavigator();
const linking = { prefixes: [], config: { screens: { BystanderLanding: { path: 'scan/:token', alias: ['resident/:residentId'] }, Start: '' } } };

function LiveScreen({ component: Component, session, setSession, ...props }) {
  const { loading, error, hasLoaded, refresh } = useAppData();
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  if (loading) return <ScreenState loading />;
  if (error && !hasLoaded) return <View style={{ flex: 1 }}>
    <ScreenState error={error} onRetry={refresh} />
    <Text style={{ padding: 24, textAlign: 'center', color: '#a83232' }} onPress={() => setSession(null)}>Log out</Text>
  </View>;
  return <View style={{ flex: 1 }}>
    {error && <Text style={{ padding: 12, color: '#a83232', backgroundColor: '#fff1f1' }} onPress={refresh}>Could not refresh. Showing last loaded data. Tap to retry.</Text>}
    <Component {...props} session={session} setSession={setSession} />
  </View>;
}

export default function AppNavigator({ session, setSession }) {
  const screens = roleScreens[session?.user?.role];
  return <NavigationContainer linking={linking}>
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      {session && screens ? <Stack.Group navigationKey={session.user.id}>
        {Object.entries(screens).map(([name, component]) => <Stack.Screen key={name} name={name}>
          {(props) => <LiveScreen {...props} component={component} session={session} setSession={setSession} />}
        </Stack.Screen>)}
      </Stack.Group> : <Stack.Screen name="Start">
        {(props) => <StartScreen {...props} setSession={setSession} />}
      </Stack.Screen>}
      <Stack.Screen name="BystanderLanding" component={BystanderPublicWeb} />
    </Stack.Navigator>
  </NavigationContainer>;
}
