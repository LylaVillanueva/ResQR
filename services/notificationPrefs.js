import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'resqr.notificationPrefs';

// One shared shape across all three roles — each Settings screen only
// renders the toggles relevant to that role, but storing them together
// keeps this module (and the hook that wraps it) role-agnostic.
export const DEFAULT_NOTIFICATION_PREFS = {
  pushEnabled: true,
  alertSound: true,
  newAlert: true,
  responderAssignment: true,
  escalatedAlert: true,
  alertUpdates: true,
  responderConfirmation: true,
};

export async function loadNotificationPrefs() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_NOTIFICATION_PREFS };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export async function saveNotificationPrefs(prefs) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Non-fatal — the toggle still reflects the in-memory value this session.
  }
}
