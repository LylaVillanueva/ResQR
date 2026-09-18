import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_NOTIFICATION_PREFS, loadNotificationPrefs, saveNotificationPrefs } from '../lib/notificationPrefs';
import { registerDeviceForPush, unregisterDeviceForPush } from '../lib/pushRegistration';

// Backs every Settings screen's notification toggles with real, persisted
// state (they used to be a bare useState that reset the moment you left the
// screen). The master "push enabled" toggle also actually (de)registers
// this device with the backend, so turning it off really stops delivery.
export default function useNotificationPrefs() {
  const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATION_PREFS);

  useEffect(() => {
    let active = true;
    loadNotificationPrefs().then((loaded) => { if (active) setPrefs(loaded); });
    return () => { active = false; };
  }, []);

  const set = useCallback((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      saveNotificationPrefs(next);
      return next;
    });
  }, []);

  const setPushEnabled = useCallback((value) => {
    set('pushEnabled', value);
    if (value) registerDeviceForPush();
    else unregisterDeviceForPush();
  }, [set]);

  return { prefs, set, setPushEnabled };
}
