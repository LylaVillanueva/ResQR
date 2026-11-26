import { mapIncident, mapResident, mapUser, mapAuditLog } from '../utils/models';
import { sessionStorage } from './sessionStorage';
import { readVerifiedContacts, writeVerifiedContacts } from './barangayContactCache';

export function loadCachedBarangayContacts(account) {
  return readVerifiedContacts(sessionStorage, account?.barangayId || null);
}

export async function loadAppData(client, account) {
  const official = account.role === 'barangay_official';
  const [residentRows, incidentRows, logs, accounts, profile] = await Promise.all([
    client.listResidents(), client.listActiveIncidents({ includeClosed: true }), client.listAuditLogs(),
    official ? client.listAccounts() : [], client.getMyProfile(),
  ]);
  const residents = residentRows.map(mapResident);
  const barangayId = account.barangayId || profile?.barangayId || null;
  let barangayContacts = [];
  if (typeof client.listBarangayContacts === 'function') {
    try {
      barangayContacts = await client.listBarangayContacts();
      await writeVerifiedContacts(sessionStorage, barangayId, barangayContacts, undefined, account.barangayName || profile?.barangayName || null);
    } catch {
      barangayContacts = await readVerifiedContacts(sessionStorage, barangayId);
    }
  }
  const users = official
    ? accounts.map((row) => mapUser(row, row.role, residents, account.barangayName))
    : [mapUser(account, account.role, residents, account.barangayName)];
  return { residents, users, myPhotoUrl: profile?.photoUrl || null, alerts: incidentRows.map((row) => mapIncident(row, residents, users)),
    auditLogs: logs.map((row) => mapAuditLog(row, users, residents, incidentRows)), barangayContacts };
}

export const API_ROLES = { Guardian: 'guardian', 'Barangay Official': 'barangay_official', 'Barangay Responder': 'barangay_responder' };
export function normalizePhone(phone) { return phone?.replace(/[\s()-]/g, '').replace(/^09/, '+639') || null; }

export function createAccount(client, user) {
  const role = API_ROLES[user.role];
  if (!role) throw new Error('Choose a valid account role.');
  return client.createAccount({ fullName: user.name, phone: normalizePhone(user.phone), role,
    ...(user.email ? { email: user.email.trim() } : {}),
    position: role === 'barangay_official' ? user.position || null : null,
    residentIds: role === 'guardian' ? user.wardIds || [] : [],
    ...(role === 'guardian' ? { relationship: user.relationship || '' } : {}),
    ...(user.address ? { homeAddress: user.address.trim() } : {}),
  });
}

export function submitIncidentReport(client, id, report) {
  if (!id) throw new Error('Choose an incident before submitting a report.');
  return client.resolveIncident(id, report);
}
