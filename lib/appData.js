import { mapIncident, mapResident, mapUser, mapAuditLog } from './models';

export async function loadAppData(client, account) {
  const official = account.role === 'barangay_official';
  const [residentRows, incidentRows, logs, accounts] = await Promise.all([
    client.listResidents(), client.listActiveIncidents({ includeClosed: true }), client.listAuditLogs(),
    official ? client.listAccounts() : [],
  ]);
  const residents = residentRows.map(mapResident);
  const users = official
    ? accounts.map((row) => mapUser(row, row.role, residents, account.barangayName))
    : [mapUser(account, account.role, residents, account.barangayName)];
  return { residents, users, alerts: incidentRows.map((row) => mapIncident(row, residents)),
    auditLogs: logs.map((row) => mapAuditLog(row, users, residents, incidentRows)) };
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
  const summary = `Nature of emergency: ${report.natureOfEmergency}\nActions taken: ${report.actionsTaken}\nResident condition: ${report.conditionOfResident}`;
  return client.resolveIncident(id, summary);
}
