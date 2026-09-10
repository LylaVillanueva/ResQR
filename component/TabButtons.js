import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const tabs = [
  { key: 'home', label: 'Home', screen: 'Home', icon: 'home' },
  { key: 'residents', label: 'Residents', screen: 'ResidentScreen', icon: 'address-card' },
  { key: 'alert', label: 'Alert', screen: 'AlertScreen', icon: 'bell' },
  { key: 'profile', label: 'Profile', screen: 'SettingsScreen', icon: 'user' },
];

export default function TabBar() {
  const navigation = useNavigation();
  const route = useRoute();

  const screen = {
    ProfileScreen: 'residents',
    ResidentHomeScreen: 'home',
    AuditLogScreen: 'alert',
  };

  const activeTab = screen[route.name] ?? tabs.find((tab) => tab.screen === route.name)?.key;
  
  return (
    <View style={styles.tabBar}>
      {tabs.slice(0, 2).map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabButton}
          onPress={() => navigation.navigate(tab.screen)}
        >
          <View style={[styles.iconWrap, activeTab === tab.key && styles.iconActive]}>
            <FontAwesome5 name={tab.icon} size={20} color={activeTab === tab.key ? '#a83232' : '#fff'} />
          </View>
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('ScannerScreen')}
      >
        <FontAwesome5 name="qrcode" size={32} color="#a83232" />
      </TouchableOpacity>

      {tabs.slice(2).map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tabButton}
          onPress={() => navigation.navigate(tab.screen)}
        >
          <View style={[styles.iconWrap, activeTab === tab.key && styles.iconActive]}>
            <FontAwesome5 name={tab.icon} size={20} color={activeTab === tab.key ? '#a83232' : '#fff'} />
          </View>
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#a83232',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    paddingBottom: 0,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tabLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#fff' },
  tabLabelActive: { color: '#ffdcdc', fontFamily: 'Poppins_700Bold' },
  iconWrap: {
    borderRadius: 20,
    width: 40,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActive: {
    backgroundColor: '#fbd1d1',
    shadowColor: '#fbd1d1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.3,
    borderColor: '#a83232',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -22,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});