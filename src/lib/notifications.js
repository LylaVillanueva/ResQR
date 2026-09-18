import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import { createNotificationPermissions } from './notificationPermissions';

const loadNotifications = () => import('expo-notifications');

export const notificationPermissions = createNotificationPermissions({
  platform: Platform.OS,
  isExpoGo: isRunningInExpoGo(),
  loadNotifications,
});

// An Expo push token is what the backend needs to actually deliver an
// alert. Returns null (never throws) whenever one can't be obtained right
// now — unsupported platform/Expo Go, no EAS project id configured, or a
// device/network failure — so callers can always treat "no token" as a
// normal, retry-later outcome.
export async function getExpoPushToken() {
  if (!notificationPermissions.supported) return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  try {
    const notifications = await loadNotifications();
    const { data } = await notifications.getExpoPushTokenAsync({ projectId });
    return data ?? null;
  } catch {
    return null;
  }
}
