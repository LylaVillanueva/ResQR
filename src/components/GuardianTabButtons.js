import React from 'react';
import TabBar from './TabBar';

const tabs = [
  { key: 'home', labelKey: 'home', screen: 'Home', icon: 'home' },
  { key: 'wards', labelKey: 'myWards', screen: 'ResidentScreen', icon: 'user-friends' },
  { key: 'alerts', labelKey: 'alerts', screen: 'AlertScreen', icon: 'bell' },
  { key: 'settings', labelKey: 'settings', screen: 'SettingsScreen', icon: 'cog' },
];

const activeMap = {
  ProfileScreen: 'wards',
  AlertDetails: 'alerts',
  ConfirmationScreen: 'alerts',
  EmergencyHelp: 'home',
};

export default function GuardianTabBar() {
  return <TabBar tabs={tabs} activeMap={activeMap} />;
}
