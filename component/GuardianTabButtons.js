import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const tabs = [
  { key: 'home', label: 'Home', screen: 'Home', icon: 'home' },
  { key: 'wards', label: 'My Wards', screen: 'ResidentScreen', icon: 'user-friends' },
  { key: 'alerts', label: 'Alerts', screen: 'AlertScreen', icon: 'bell' },
  { key: 'settings', label: 'Settings', screen: 'SettingsScreen', icon: 'cog' },
];

export default function GuardianTabBar() {
  const navigation = useNavigation();
  const route = useRoute();

  const activeMap = {
    Home: 'home',
    ResidentScreen: 'wards',
    ProfileScreen: 'wards',
    AlertScreen: 'alerts',
    AlertDetails: 'alerts',
    ConfirmationScreen: 'alerts',
    SettingsScreen: 'settings',
    ScannerScreen: null,
    EmergencyHelp: 'home',
  };

  const activeTab = activeMap[route.name];

  return (
    <View style={styles.tabBar}>
      <TabItem tab={tabs[0]} active={activeTab === 'home'} navigation={navigation} />
      <TabItem tab={tabs[1]} active={activeTab === 'wards'} navigation={navigation} />

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('ScannerScreen')}
        activeOpacity={0.85}
      >
        <FontAwesome5 name="qrcode" size={31} color="#a83232" />
        <Text style={styles.scanLabel}>Scan</Text>
      </TouchableOpacity>

      <TabItem tab={tabs[2]} active={activeTab === 'alerts'} navigation={navigation} />
      <TabItem tab={tabs[3]} active={activeTab === 'settings'} navigation={navigation} />
    </View>
  );
}

function TabItem({ tab, active, navigation }) {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={() => navigation.navigate(tab.screen)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, active && styles.iconActive]}>
        <FontAwesome5 name={tab.icon} size={18} color={active ? '#a83232' : '#fff'} />
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#a83232',
    paddingVertical: 9,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 2,
    minWidth: 0,
  },
  iconWrap: {
    borderRadius: 20,
    width: 38,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: '#fbd1d1',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: '#fff',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#ffdcdc',
    fontFamily: 'Poppins_700Bold',
  },
  scanButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.3,
    borderColor: '#a83232',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 7,
  },
  scanLabel: {
    fontSize: 8,
    fontFamily: 'Poppins_600SemiBold',
    color: '#a83232',
    marginTop: -1,
  },
});
