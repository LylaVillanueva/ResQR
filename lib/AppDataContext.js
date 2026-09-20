import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { api } from "./api";
import { loadAppData, createAccount, submitIncidentReport, API_ROLES, normalizePhone } from "./appData";

const AppDataContext = createContext(null);
const EMPTY = { residents: [], users: [], alerts: [], auditLogs: [] };

// Server data and status are authoritative; never seed live sessions with demo records.
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
        if (current === generation.current) setError(err.message);
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

  const mutate = async (request) => {
    const result = await request();
    // Wait for an older read before fetching the successful write. A failed read
    // must not turn a successful write into a retryable mutation.
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
      closeIncident: (id) => mutate(() => api.closeIncident(id)),
      addIncidentReport: (id, report) => mutate(() => submitIncidentReport(api, id, report)),
      markGuardianUnreachable: (id, reason) => mutate(() => api.markGuardianUnreachable(id, reason)),
      markResponderUnreachable: (id, reason) => mutate(() => api.markResponderUnreachable(id, reason)),
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
