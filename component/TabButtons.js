import React from 'react';
import TabBar from './TabBar';

const tabs = [
  { key: 'home', labelKey: 'home', screen: 'Home', icon: 'home' },
  { key: 'residents', labelKey: 'residents', screen: 'ResidentScreen', icon: 'address-card' },
  { key: 'alert', labelKey: 'alert', screen: 'AlertScreen', icon: 'bell' },
  { key: 'profile', labelKey: 'profile', screen: 'SettingsScreen', icon: 'user' },
];

const activeMap = {
  ProfileScreen: 'residents',
  AuditLogScreen: 'alert',
  AlertDetails: 'alert',
  AssignResponder: 'alert',
  EnrollNewResident: 'residents',
  ManageUsers: 'residents',
  UserDetails: 'residents',
  AddUser: 'residents',
};

export default function AdminTabBar() {
  return <TabBar tabs={tabs} activeMap={activeMap} />;
}
