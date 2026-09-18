import { useEffect, useState } from 'react';
import { api, clearSession, getDeviceId } from '../lib/api';
import { registerDeviceForPush } from '../lib/pushRegistration';

export default function useSession() {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (await api.restoreSession()) {
          const user = await api.getMyProfile();
          if (active) setSession({ user });
        }
      } catch {
        await clearSession().catch(() => {});
      } finally {
        if (active) setRestoring(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Push tokens can rotate — re-registering on every session (not just the
  // first permission grant) keeps the backend's copy current.
  useEffect(() => {
    if (session) registerDeviceForPush();
  }, [session]);

  async function updateSession(next) {
    if (next) { setSession(next); return; }
    try { await api.logout({ deviceId: await getDeviceId() }); }
    catch { /* Local logout must still work offline. */ }
    finally { await clearSession().catch(() => {}); setSession(null); }
  }
  return { session, setSession: updateSession, restoring };
}
