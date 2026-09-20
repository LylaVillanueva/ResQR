import { Platform } from 'react-native';
import { getExpoPushToken } from './notifications';
import { api, getDeviceId } from './api';

// Best-effort: never throws. Called right after permission is granted, and
// again on every app start once signed in, since a token can rotate.
export async function registerDeviceForPush() {
  try {
    const pushToken = await getExpoPushToken();
    if (!pushToken) return;
    const deviceId = await getDeviceId();
    await api.registerPushToken({ deviceId, pushToken, platform: Platform.OS });
  } catch {
    // Non-fatal — the next app open or permission grant tries again.
  }
}

// Called when the user turns the "Push Notifications" setting off — removes
// this device's registration so the backend stops sending to it.
export async function unregisterDeviceForPush() {
  try {
    const deviceId = await getDeviceId();
    await api.unregisterPushToken({ deviceId });
  } catch {
    // Non-fatal — worst case the server retries a dead token and drops it.
  }
}
