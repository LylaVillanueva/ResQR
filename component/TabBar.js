// One tab bar shared by all three roles, parameterized by that role's own
// tabs/active-route mapping (previously three separate files — TabButtons.js,
// GuardianTabButtons.js, ResponderTabButtons.js — that had drifted in icon
// size, scan-button shadow (two of the three used a white shadow on a white
// button, which is effectively invisible), and whether the scan button had
// a text label under it).
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from './AppText';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, font } from '../theme';
import { useAccessibilitySettings } from "../lib/AccessibilitySettingsContext";

export default function TabBar({ tabs, activeMap = {} }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useAccessibilitySettings();
  const activeTab = activeMap[route.name] ?? tabs.find((tab) => tab.screen === route.name)?.key;
  const mid = Math.ceil(tabs.length / 2);

  return (
    <View style={styles.tabBar}>
      {tabs.slice(0, mid).map((tab) => (
        <TabItem key={tab.key} tab={tab} active={activeTab === tab.key} onPress={() => navigation.navigate(tab.screen)} t={t} />
      ))}

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('ScannerScreen')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t('scan')}
      >
        <FontAwesome5 name="qrcode" size={30} color={colors.primary} />
        <Text style={styles.scanLabel}>{t('scan')}</Text>
      </TouchableOpacity>

      {tabs.slice(mid).map((tab) => (
        <TabItem key={tab.key} tab={tab} active={activeTab === tab.key} onPress={() => navigation.navigate(tab.screen)} t={t} />
      ))}
    </View>
  );
}

function TabItem({ tab, active, onPress, t }) {
  const label = tab.labelKey ? t(tab.labelKey) : tab.label;
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <View style={[styles.iconWrap, active && styles.iconActive]}>
        <FontAwesome5 name={tab.icon} size={19} color={active ? colors.primary : '#fff'} />
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]} >{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 4, minWidth: 0 },
  iconWrap: { borderRadius: 20, width: 40, height: 23, justifyContent: 'center', alignItems: 'center' },
  iconActive: {
    backgroundColor: colors.danger.bg,
    shadowColor: colors.danger.bg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: { fontSize: 11, fontFamily: font.regular, color: '#fff', marginTop: 2, textAlign: 'center' },
  tabLabelActive: { color: colors.dangerSurface, fontFamily: font.bold },
  scanButton: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 1.3, borderColor: colors.primary,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginTop: -22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 5, elevation: 7,
  },
  scanLabel: { fontSize: 8, fontFamily: font.semibold, color: colors.primary, marginTop: -1 },
});
