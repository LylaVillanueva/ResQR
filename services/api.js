import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { sessionStorage } from './sessionStorage';

function getApiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!configured) throw new Error('Set EXPO_PUBLIC_API_BASE_URL to the deployed API base URL.');

  let url;
  try {
    url = new URL(configured);
  } catch {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be a valid absolute URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be an http(s) URL without credentials, query, or fragment.');
  }
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('Production builds require an HTTPS API URL.');
  }
  if (!url.pathname.replace(/\/$/, '').endsWith('/api')) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must end with /api.');
  }
  return url.toString().replace(/\/$/, '');
}

const USE_SUPABASE_BACKEND = process.env.EXPO_PUBLIC_BACKEND_MODE === 'supabase';
const API_BASE_URL = USE_SUPABASE_BACKEND ? null : getApiBaseUrl();

const REFRESH_TOKEN_KEY = 'resqr.refreshToken';
const DEVICE_ID_KEY = 'resqr.deviceId';

let accessToken = null;
let refreshInFlight = null;

export async function getDeviceId() {
  let id = await sessionStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    await sessionStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

async function persistRefreshToken(token) {
  if (token) {
    await sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    await sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export async function applyTokens({ accessToken: at, refreshToken: rt }) {
  if (USE_SUPABASE_BACKEND) return;
  accessToken = at;
  await persistRefreshToken(rt);
}

export async function clearSession() {
  if (USE_SUPABASE_BACKEND) {
    const { supabase } = await import('./supabase');
    await supabase.auth.signOut().catch(() => {});
    return;
  }
  accessToken = null;
  await persistRefreshToken(null);
}

async function rawRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json?.error?.message || `Request failed (${res.status})`);
    err.code = json?.error?.code;
    err.status = res.status;
    throw err;
  }
  return json?.data;
}

async function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const storedRefreshToken = await sessionStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) return null;
      try {
        const data = await rawRequest('/auth/refresh', {
          method: 'POST',
          body: { refreshToken: storedRefreshToken },
        });
        accessToken = data.accessToken;
        await persistRefreshToken(data.refreshToken);
        return data;
      } catch {
        await clearSession();
        return null;
      }
    })();
  }
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function authedRequest(path, options = {}, retried = false) {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  try {
    return await rawRequest(path, { ...options, headers });
  } catch (err) {
    if (err.status === 401 && !retried) {
      const refreshed = await refreshSession();
      if (refreshed) return authedRequest(path, options, true);
    }
    throw err;
  }
}

const legacyApi = {
  getPublicQrView: (token) => rawRequest(`/qr/${encodeURIComponent(token)}/public-view`),
  recordQrScan: (token, body) => rawRequest(`/qr/${encodeURIComponent(token)}/scan-event`, { method: 'POST', body }),
  cancelQrScan: (cancelToken) => rawRequest('/qr/cancel', { method: 'POST', body: { cancelToken } }),
  sendOtp: (body) => rawRequest('/auth/send-otp', { method: 'POST', body }),
  verifyOtp: (body) => rawRequest('/auth/verify-otp', { method: 'POST', body }),
  logout: (body) => authedRequest('/auth/logout', { method: 'POST', body }),
  getMyProfile: () => authedRequest('/users/profile'),
  async listBarangayContacts() {
    const rows = await authedRequest('/users/barangay-contacts');
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      id: row.id,
      label: row.label,
      phone: row.phone,
      availability: row.availability || '',
      isPrimary: row.is_primary,
      isActive: row.is_active,
      verifiedAt: row.verified_at || null,
    }));
  },
  saveBarangayContact: (contact) => authedRequest('/users/barangay-contacts', { method: 'PUT', body: contact }),
  verifyBarangayContact: (contactId, confirmed) => authedRequest(`/users/barangay-contacts/${encodeURIComponent(contactId)}/verification`, { method: 'POST', body: { confirmed } }),
  // Photos are sent as a base64 JPEG (see lib/photos.js); null removes it.
  setMyPhoto: (image) => authedRequest('/users/profile/photo', image ? { method: 'PUT', body: { image } } : { method: 'DELETE' }),
  setAccountPhoto: (userId, image) => authedRequest(`/users/accounts/${userId}/photo`, image ? { method: 'PUT', body: { image } } : { method: 'DELETE' }),
  setResidentPhoto: (residentId, image) => authedRequest(`/users/residents/${residentId}/photo`, image ? { method: 'PUT', body: { image } } : { method: 'DELETE' }),
  registerPushToken: (body) => authedRequest('/users/push-token', { method: 'POST', body }),
  unregisterPushToken: (body) => authedRequest('/users/push-token', { method: 'DELETE', body }),

  listResidents: () => authedRequest('/users/residents'),
  getResident: (residentId) => authedRequest(`/users/residents/${residentId}`),
  enrollResident: (body) => authedRequest('/users/residents', { method: 'POST', body }),
  updateResident: (residentId, body) => authedRequest(`/users/residents/${residentId}`, { method: 'PUT', body }),

  listAccounts: () => authedRequest('/users/accounts'),
  createAccount: (body) => authedRequest('/users/accounts', { method: 'POST', body }),
  updateAccount: (userId, body) => authedRequest(`/users/accounts/${userId}`, { method: 'PATCH', body }),
  changeAccountRole: (userId, body) => authedRequest(`/users/accounts/${userId}/role`, { method: 'PATCH', body }),
  setAccountActive: (userId, isActive) => authedRequest(`/users/accounts/${userId}/status`, { method: 'PATCH', body: { isActive } }),

  listGuardians: () => authedRequest('/users/guardians'),
  registerGuardian: (body) => authedRequest('/users/guardians', { method: 'POST', body }),
  listResponders: () => authedRequest('/users/responders'),

  generateQr: (body) => authedRequest('/qr/generate', { method: 'POST', body }),
  revokeQr: (card) => {
    const token = typeof card === 'string' ? card : card?.token;
    if (!token) throw new Error('The QR token is not available to revoke this card.');
    return authedRequest(`/qr/${encodeURIComponent(token)}`, { method: 'DELETE' });
  },

  listActiveIncidents: ({ includeClosed = false } = {}) =>
    authedRequest(`/incidents/active${includeClosed ? '?status=all' : ''}`),
  listResidentHistory: (residentId) => authedRequest(`/incidents/resident/${residentId}`),
  getIncident: (incidentId) => authedRequest(`/incidents/${incidentId}`),
  submitIncidentConfirmation: (incidentId, body) =>
    authedRequest(`/incidents/${incidentId}/confirmation`, { method: 'POST', body }),
  assignResponder: (incidentId, responderId) =>
    authedRequest(`/incidents/${incidentId}/assign`, { method: 'POST', body: { responderId } }),
  resolveIncident: (incidentId, report) => {
    const finalActionSummary = typeof report === 'string' ? report :
      `Nature of emergency: ${report.natureOfEmergency}\nActions taken: ${report.actionsTaken}\nResident condition: ${report.conditionOfResident}`;
    return authedRequest(`/incidents/${incidentId}/resolve`, { method: 'POST', body: { finalActionSummary } });
  },
  closeIncident: (incidentId) => authedRequest(`/incidents/${incidentId}/close`, { method: 'POST' }),
  markGuardianUnreachable: (incidentId, reason) =>
    authedRequest(`/incidents/${incidentId}/guardian-unreachable`, { method: 'POST', body: { reason } }),
  markResponderUnreachable: (incidentId, reason) =>
    authedRequest(`/incidents/${incidentId}/responder-unreachable`, { method: 'POST', body: { reason } }),

  listAuditLogs: (query = {}) => {
    const qs = new URLSearchParams(query).toString();
    return authedRequest(`/audit-logs${qs ? `?${qs}` : ''}`);
  },

  getDashboardStats: () => authedRequest('/dashboard/stats'),

  subscribeToUpdates: () => () => {},

  restoreSession: refreshSession,
};

// Backend selection changes only the service implementation. Existing screens
// and their visual components stay the same. Keep legacy mode as the default
// until every Supabase workflow and its device coverage have passed parity.
export const api = USE_SUPABASE_BACKEND
  ? new Proxy(legacyApi, {
    get(target, property) {
      if (typeof property !== 'string') return target[property];
      return async (...args) => {
        const { supabaseApi } = await import('./supabaseApi');
        const handler = supabaseApi[property];
        if (typeof handler !== 'function') {
          const error = new Error(`${property} is not implemented for Supabase yet. The legacy API remains available until this workflow is completed.`);
          error.code = 'SUPABASE_WORKFLOW_PENDING';
          throw error;
        }
        return handler.apply(supabaseApi, args);
      };
    },
  })
  : legacyApi;
