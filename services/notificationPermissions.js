// The notifications module itself throws when evaluated in Android Expo Go.
// Keep its loader lazy, check capability before invoking it, and — since
// Expo Go detection is one more thing that can be wrong on a given device —
// wrap the actual call too, so a misdetection degrades to "unavailable"
// instead of crashing the app.
export function createNotificationPermissions({ platform, isExpoGo, loadNotifications }) {
  const supported = platform !== 'web' && !isExpoGo;
  return {
    supported,
    async request() {
      if (!supported) return { supported: false, granted: false };
      try {
        const notifications = await loadNotifications();
        if (platform === 'android') {
          await notifications.setNotificationChannelAsync('emergency-alerts', {
            name: 'Emergency alerts', importance: notifications.AndroidImportance.HIGH,
          });
        }
        const result = await notifications.requestPermissionsAsync();
        return { supported: true, granted: result.granted };
      } catch {
        return { supported: false, granted: false };
      }
    },
  };
}
