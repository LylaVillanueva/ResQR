import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { api } from "../services/api";
import { loadAppData, loadCachedBarangayContacts, createAccount, submitIncidentReport, API_ROLES, normalizePhone } from "../services/appData";

const AppDataContext = createContext(null);
const EMPTY = { residents: [], users: [], alerts: [], auditLogs: [], barangayContacts: [], myPhotoUrl: null };

export function AppDataProvider({ children, session }) {
  const account = session?.user;

  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(Boolean(account));
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const generation = useRef(0);
  const inFlight = useRef(null);

  const refresh = useCallback(() => {
    if (!account) return Promise.resolve();

    if (inFlight.current) return inFlight.current;
    const current = generation.current;
    const task = (async () => {
      try {
        const next = await loadAppData(api, account);
        if (current !== generation.current) return;
        setData(next);
        setError(null);
        setHasLoaded(true);
      } catch (err) {
        if (current === generation.current) {
          const cachedContacts = await loadCachedBarangayContacts(account).catch(() => []);
          setData((previous) => ({ ...previous, barangayContacts: cachedContacts }));
          setError(err.message);
        }
      } finally {
        if (current === generation.current) setLoading(false);
      }
    })();
    inFlight.current = task;
    task.finally(() => { if (inFlight.current === task) inFlight.current = null; });
    return task;
  }, [account]);

  useEffect(() => {
    generation.current += 1;
    inFlight.current = null;
    setData(EMPTY);
    setHasLoaded(false);
    setLoading(Boolean(account));
    setError(null);

    refresh();

    const timer = setInterval(() => { if (AppState.currentState === 'active') refresh(); }, 15000);
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => { generation.current += 1; clearInterval(timer); listener.remove(); };
  }, [refresh, account]);

  useEffect(() => {
    if (!account?.id || typeof api.subscribeToUpdates !== 'function') return undefined;
    // In Supabase mode `api` is an async proxy, so the cleanup arrives as a Promise.
    let active = true;
    let unsubscribe = null;
    Promise.resolve(api.subscribeToUpdates(account.id, () => refresh()))
      .then((cleanup) => {
        if (typeof cleanup !== 'function') return;
        if (active) unsubscribe = cleanup; else cleanup();
      })
      .catch(() => { /* Periodic and foreground refresh remain the fallback. */ });
    return () => { active = false; unsubscribe?.(); };
  }, [account?.id, refresh]);

  // While a bystander is actively sharing live location on any alert, poll
  // faster so open alert maps follow them. A share whose last update is
  // over two minutes old (page closed without tapping Stop) doesn't count.
  const liveSharing = data.alerts.some((alert) => alert.live_location_sharing
    && Date.now() - new Date(alert.live_location_updated_at).getTime() < 120000);
  useEffect(() => {
    if (!liveSharing) return undefined;
    const timer = setInterval(() => { if (AppState.currentState === 'active') refresh(); }, 5000);
    return () => clearInterval(timer);
  }, [liveSharing, refresh]);

  const mutate = async (request) => {
    const result = await request();
    if (inFlight.current) await inFlight.current;
    await refresh();
    return result;
  };

  const addUser = (user) => mutate(() => createAccount(api, user));

  return (
    <AppDataContext.Provider value={{ ...data, account, loading, error, hasLoaded, refresh, addUser,
      updateUser: (user) => mutate(() => api.updateAccount(user.id, {
        fullName: user.name.trim(), phone: normalizePhone(user.phone), email: user.email?.trim() || null,
        position: user.role === 'Barangay Official' ? user.position || null : null,
        homeAddress: user.address?.trim() || null,
      })),
      changeUserRole: (id, role, position) => mutate(() => api.changeAccountRole(id, { role: API_ROLES[role], position: position || null })),
      deactivateUser: (id) => mutate(() => api.setAccountActive(id, false)),
      activateUser: (id) => mutate(() => api.setAccountActive(id, true)),
      assignResponder: (id, responderId) => mutate(() => api.assignResponder(id, responderId)),
      updateAlertConfirmation: (id, role, status) => mutate(() => api.submitIncidentConfirmation(id, {
        decision: status === 'Safe' ? 'safe' : 'not_safe',
      })),
      closeIncident: (id, reason) => mutate(() => api.closeIncident(id, reason)),
      respondToAssignment: typeof api.respondToAssignment === 'function'
        ? (id, decision, reason) => mutate(() => api.respondToAssignment(id, decision, reason)) : null,
      addIncidentReport: (id, report) => mutate(() => submitIncidentReport(api, id, report)),
      markGuardianUnreachable: (id, reason) => mutate(() => api.markGuardianUnreachable(id, reason)),
      markResponderUnreachable: (id, reason) => mutate(() => api.markResponderUnreachable(id, reason)),
      // image: base64 JPEG from lib/photos.js, or null to remove the photo.
      setResidentPhoto: (id, image) => mutate(() => api.setResidentPhoto(id, image)),
      setAccountPhoto: (id, image) => mutate(() => (id === account?.id ? api.setMyPhoto(image) : api.setAccountPhoto(id, image))),
      saveBarangayContact: (contact) => mutate(() => api.saveBarangayContact(contact)),
      verifyBarangayContact: (id, confirmed) => mutate(() => api.verifyBarangayContact(id, confirmed)),
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
