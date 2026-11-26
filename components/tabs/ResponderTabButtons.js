import React from 'react';
import TabBar from './TabBar';

const tabs = [
  { key: 'home', labelKey: 'home', screen: 'Home', icon: 'home' },
  { key: 'alerts', labelKey: 'alerts', screen: 'AlertScreen', icon: 'bell' },
  { key: 'incidents', labelKey: 'incidents', screen: 'IncidentScreen', icon: 'clipboard-list' },
  { key: 'settings', labelKey: 'settings', screen: 'SettingsScreen', icon: 'cog' },
];

const activeMap = {
  AlertDetails: 'alerts',
  ConfirmationScreen: 'alerts',
  IncidentReportScreen: 'incidents',
  AuditLogScreen: 'incidents',
};

export default function ResponderTabBar() {
  return <TabBar tabs={tabs} activeMap={activeMap} />;
}
