import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const REFRESH_TOKEN_KEY = 'resqr.refreshToken';
const DEVICE_ID_KEY = 'resqr.deviceId';

// Access tokens are short-lived (15 min) and only ever needed in-memory;
// the refresh token is the durable credential and lives in SecureStore.
let accessToken = null;
let refreshInFlight = null;

export async function getDeviceId() {
  let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!id) {
    id = `${Platform.OS}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  }
  return id;
}

async function persistRefreshToken(token) {
  if (token) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

// Call after a successful /auth/verify-otp or /auth/refresh response.
export async function applyTokens({ accessToken: at, refreshToken: rt }) {
  accessToken = at;
  await persistRefreshToken(rt);
}

export async function clearSession() {
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

// De-dupes concurrent refresh attempts (e.g. two screens 401 at once).
async function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) return null;
      try {
        const data = await rawRequest('/auth/refresh', {
          method: 'POST',
          body: { refreshToken: storedRefreshToken },
        });
        accessToken = data.accessToken;
        await persistRefreshToken(data.refreshToken); // rotated every call — must overwrite
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

export const api = {
  sendOtp: (body) => rawRequest('/auth/send-otp', { method: 'POST', body }),
  verifyOtp: (body) => rawRequest('/auth/verify-otp', { method: 'POST', body }),
  logout: (body) => authedRequest('/auth/logout', { method: 'POST', body }),
  getMyProfile: () => authedRequest('/users/profile'),

  listResidents: () => authedRequest('/users/residents'),
  getResident: (residentId) => authedRequest(`/users/residents/${residentId}`),
  enrollResident: (body) => authedRequest('/users/residents', { method: 'POST', body }),
  updateResident: (residentId, body) => authedRequest(`/users/residents/${residentId}`, { method: 'PUT', body }),

  listGuardians: () => authedRequest('/users/guardians'),
  registerGuardian: (body) => authedRequest('/users/guardians', { method: 'POST', body }),
  listResponders: () => authedRequest('/users/responders'),

  generateQr: (body) => authedRequest('/qr/generate', { method: 'POST', body }),

  listActiveIncidents: () => authedRequest('/incidents/active'),
  listResidentHistory: (residentId) => authedRequest(`/incidents/resident/${residentId}`),
  getIncident: (incidentId) => authedRequest(`/incidents/${incidentId}`),
  createIncident: (body) => authedRequest('/incidents/create', { method: 'POST', body }),
  submitIncidentConfirmation: (incidentId, body) =>
    authedRequest(`/incidents/${incidentId}/confirmation`, { method: 'POST', body }),
  assignResponder: (incidentId, responderId) =>
    authedRequest(`/incidents/${incidentId}/assign`, { method: 'POST', body: { responderId } }),
  resolveIncident: (incidentId, finalActionSummary) =>
    authedRequest(`/incidents/${incidentId}/resolve`, { method: 'POST', body: { finalActionSummary } }),
  closeIncident: (incidentId) => authedRequest(`/incidents/${incidentId}/close`, { method: 'POST' }),

  listAuditLogs: (query = {}) => {
    const qs = new URLSearchParams(query).toString();
    return authedRequest(`/audit-logs${qs ? `?${qs}` : ''}`);
  },

  getDashboardStats: () => authedRequest('/dashboard/stats'),

  // Attempts to turn a stored refresh token back into a live access
  // token on app boot. Resolves to the new token pair, or null.
  restoreSession: refreshSession,
};
