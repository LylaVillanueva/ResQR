const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const asModule = (source) => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const modelsUrl = asModule(fs.readFileSync(path.join(__dirname, '../src/lib/models.js'), 'utf8'));
const models = import(modelsUrl);
const service = import(asModule(fs.readFileSync(path.join(__dirname, '../src/lib/appData.js'), 'utf8').replace("'./models'", JSON.stringify(modelsUrl))));

function clientFixture() {
  const calls = [];
  const client = {};
  for (const name of ['listResidents', 'listActiveIncidents', 'listAuditLogs', 'listAccounts', 'createAccount', 'resolveIncident']) {
    client[name] = async (...args) => { calls.push([name, ...args]); return []; };
  }
  return { client, calls };
}

test('server status wins over conflicting local safety decisions', async () => {
  const { incidentStatus } = await models;
  assert.equal(incidentStatus({ status: 'escalated', guardian_decision: 'safe', responder_decision: 'safe' }), 'escalated');
  for (const status of ['closed', 'resolved', 'confirmed_safe']) {
    assert.equal(incidentStatus({ status, guardian_decision: 'not_safe' }), 'closed');
  }
  assert.equal(incidentStatus({ status: 'active', guardian_decision: 'safe' }), 'pending');
  assert.equal(incidentStatus({ status: 'assigned' }), 'pending');
  assert.equal(incidentStatus({ status: 'active' }), 'open');
});

test('resident API identity is separate from its displayed card code', async () => {
  const { mapResident, mapUser } = await models;
  const residents = [mapResident({ id: 'uuid-1', full_name: 'Test Resident', resident_code: 'BRC-SC-2026-0001', guardian_id: 'guardian-1' })];
  assert.equal(residents[0].id, 'uuid-1');
  assert.equal(residents[0].code, 'BRC-SC-2026-0001');
  assert.deepEqual(mapUser({ id: 'guardian-1', full_name: 'Guardian' }, 'guardian', residents).wardIds, ['uuid-1']);
  assert.deepEqual(mapUser({ id: 'guardian-2', full_name: 'Guardian' }, 'guardian', residents).wardIds, []);
});

test('incident mapping uses scan location and retains the saved report', async () => {
  const { mapIncident } = await models;
  const incident = mapIncident({ id: 'i1', status: 'resolved', scan_landmark_notes: 'Library entrance', home_address: 'Private home', final_action_summary: 'Resident assisted', assigned_responder_id: 'r1' });
  assert.equal(incident.location, 'Library entrance');
  assert.equal(incident.incidentReport, 'Resident assisted');
  assert.equal(incident.responderId, 'r1');
  assert.equal(mapIncident({ scan_latitude: 0, scan_longitude: 0 }).location, '0, 0');
  assert.equal(mapIncident({ home_address: 'Private home' }).location, 'Location unavailable');
});

test('guardian and responder loads never call official-only account endpoints', async () => {
  const { loadAppData } = await service;
  for (const role of ['guardian', 'barangay_responder']) {
    const { client, calls } = clientFixture();
    const data = await loadAppData(client, { id: 'u1', fullName: 'User', role });
    assert.deepEqual(calls.map(([name]) => name).sort(), ['listActiveIncidents', 'listAuditLogs', 'listResidents']);
    assert.deepEqual(calls.find(([name]) => name === 'listActiveIncidents')[1], { includeClosed: true });
    assert.deepEqual(data.alerts, []);
    assert.deepEqual(data.residents, []);
    assert.deepEqual(data.auditLogs, []);
    assert.equal(data.users[0].id, 'u1');
  }
});

test('official load includes live account lists and preserves failures', async () => {
  const { loadAppData } = await service;
  const { client, calls } = clientFixture();
  await loadAppData(client, { id: 'u1', role: 'barangay_official' });
  assert.ok(calls.some(([name]) => name === 'listAccounts'));
  client.listResidents = async () => { throw new Error('Offline'); };
  await assert.rejects(loadAppData(client, { id: 'u1', role: 'guardian' }), /Offline/);
});

test('guardian creation normalizes phone and sends actual ward IDs', async () => {
  const { createAccount } = await service;
  const { client, calls } = clientFixture();
  await createAccount(client, { name: 'Test Guardian', phone: '0917 123 4567', role: 'Guardian', wardIds: ['ward-uuid'] });
  assert.deepEqual(calls, [['createAccount', { fullName: 'Test Guardian', phone: '+639171234567', role: 'guardian', position: null, residentIds: ['ward-uuid'], relationship: '' }]]);
});

test('staff creation uses the account contract without creating a resident', async () => {
  const { createAccount } = await service;
  const { client, calls } = clientFixture();
  await createAccount(client, { name: 'Test Responder', phone: '+639171234567', role: 'Barangay Responder' });
  assert.deepEqual(calls[0], ['createAccount', { fullName: 'Test Responder', phone: '+639171234567', role: 'barangay_responder', position: null, residentIds: [] }]);
});

test('reports persist via resolve and propagate rejected writes', async () => {
  const { submitIncidentReport } = await service;
  const { client, calls } = clientFixture();
  const report = { natureOfEmergency: 'Fall', actionsTaken: 'Assisted resident', conditionOfResident: 'Stable' };
  await submitIncidentReport(client, 'incident-uuid', report);
  assert.deepEqual(calls[0], ['resolveIncident', 'incident-uuid', 'Nature of emergency: Fall\nActions taken: Assisted resident\nResident condition: Stable']);
  client.resolveIncident = async () => { throw new Error('Not assigned'); };
  await assert.rejects(submitIncidentReport(client, 'incident-uuid', report), /Not assigned/);
  assert.throws(() => submitIncidentReport(client, null, report), /Choose an incident/);
});

test('urgent alerts precede newer closed alerts without changing shared data', async () => {
  const { sortAlertsByPriority } = await models;
  const alerts = [
    { id: 'closed', status: 'closed', created_at: '2026-09-17T10:00:00Z' },
    { id: 'open-old', status: 'open', created_at: '2026-09-01T10:00:00Z' },
    { id: 'pending', status: 'pending' },
    { id: 'escalated', status: 'escalated', created_at: '2026-08-01T10:00:00Z' },
    { id: 'open-new', status: 'open', created_at: '2026-09-16T10:00:00Z' },
  ];
  const original = alerts.map(a => a.id);
  assert.deepEqual(sortAlertsByPriority(alerts).map(a => a.id), ['escalated', 'open-new', 'open-old', 'pending', 'closed']);
  assert.deepEqual(alerts.map(a => a.id), original);
  assert.deepEqual(sortAlertsByPriority([]), []);
});

test('no-guardian review stays active and requires the assigned responder report', async () => {
  const { mapIncident } = await models;
  const row = { status: 'assigned', guardian_required: false, responder_decision: 'safe', assigned_responder_id: 'r1' };
  assert.equal(mapIncident(row).guardianStatus, 'Not registered');
  assert.equal(mapIncident(row).status, 'pending');
  assert.equal(mapIncident(row).readyForReview, false);
  const reported = { ...row, report_submitted_by: 'r1', report_submitted_at: '2026-09-17', final_action_summary: 'Assessed and safe' };
  assert.equal(mapIncident(reported).readyForReview, true);
  assert.equal(mapIncident({ ...reported, responder_decision: 'not_safe' }).readyForReview, false);
  assert.equal(mapIncident({ ...reported, assigned_responder_id: 'r2' }).readyForReview, false);
  assert.equal(mapIncident({ ...reported, guardian_required: true }).officialReviewRequired, false);
});
