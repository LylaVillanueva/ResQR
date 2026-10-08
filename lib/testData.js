// lib/testData.js
//
// Frontend-only mock data for test accounts. Every row is mapped through the
// real mappers in lib/models.js so the shape is IDENTICAL to what the API
// returns. Remove this file (and its one import in AppDataContext.js) when
// test accounts are removed.
//
// Three personas, three data sets — one per test account. Add or edit freely.

import { mapIncident, mapResident, mapUser, mapAuditLog } from './models';

// ---------------------------------------------------------------------------
// Residents (shared across all three personas so alerts reference real people)
// ---------------------------------------------------------------------------
const RAW_RESIDENTS = [
  {
    id: 'res-001', resident_code: 'R-2026-0001', full_name: 'Maria Theresita A. Santos',
    resident_type: 'Senior Citizen', date_of_birth: '1948-03-12',
    home_address: '12 Mabini St, Purok 1', guardian_id: 'test-guardian-001',
    guardian_name: 'Test Guardian', guardian_phone: '+639111111111',
    guardian_relationship: 'Daughter',
  },
  {
    id: 'res-002', resident_code: 'R-2026-0002', full_name: 'Jose Reyes',
    resident_type: 'Person with Disability', date_of_birth: '1975-11-02',
    home_address: '45 Rizal Ave, Purok 3', guardian_id: 'test-guardian-001',
    guardian_name: 'Test Guardian', guardian_phone: '+639111111111',
    guardian_relationship: 'Wife',
  },
  {
    id: 'res-003', resident_code: 'R-2026-0003', full_name: 'Lola Pacing Cruz',
    resident_type: 'Senior Citizen', date_of_birth: '1940-07-21',
    home_address: '8 Bonifacio St, Purok 2', guardian_id: null,
    guardian_name: '', guardian_phone: '', guardian_relationship: '',
  },
  {
    id: 'res-004', resident_code: 'R-2026-0004', full_name: 'Andres Bautista',
    resident_type: 'Resident', date_of_birth: '1990-01-15',
    home_address: '23 Luna St, Purok 4', guardian_id: null,
    guardian_name: '', guardian_phone: '', guardian_relationship: '',
  },
];

// ---------------------------------------------------------------------------
// Incidents — cover every status the UI branches on:
//   open     → "Open Alert", waiting for responder
//   pending  → assigned / partially confirmed
//   escalated→ conflict or escalation
//   closed   → fully confirmed
// ---------------------------------------------------------------------------
const now = Date.now();
const minutesAgo = (m) => new Date(now - m * 60 * 1000).toISOString();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

const RAW_INCIDENTS = [
  // 1. OPEN — scanned 4 min ago, no responder yet
  {
    id: 'inc-001',
    resident_id: 'res-001', resident_name: 'Maria A. Santos', resident_type: 'Senior Citizen',
    resident_code: 'R-2026-0001',
    status: 'open', created_at: minutesAgo(4),
    qr_token: 'tok-abc123',
    scan_latitude: 14.5995, scan_longitude: 120.9842,
    scan_landmark_notes: 'Near barangay hall entrance',
    bystander_notes: 'Found resident sitting on the ground, conscious but dizzy.',
    assigned_responder_id: null, assigned_responder_name: null,
    guardian_required: true, guardian_decision: null, responder_decision: null,
    guardian_unreachable_at: null, responder_unreachable_at: null,
    report_submitted_at: null, report_submitted_by: null, final_action_summary: null,
    escalation_reason: null,
  },

  // 2. PENDING — assigned, guardian marked Safe, waiting on responder
  {
    id: 'inc-002',
    resident_id: 'res-002', resident_name: 'Jose Reyes', resident_type: 'Person with Disability',
    resident_code: 'R-2026-0002',
    status: 'assigned', created_at: minutesAgo(18),
    qr_token: 'tok-def456',
    scan_latitude: 14.6011, scan_longitude: 120.9821,
    scan_landmark_notes: 'Corner of Rizal Ave and Mabini',
    bystander_notes: 'Wheelchair tipped over. Bystander helped him up.',
    assigned_responder_id: 'test-responder-001', assigned_responder_name: 'Test Responder',
    guardian_required: true, guardian_decision: 'safe', responder_decision: null,
    guardian_unreachable_at: null, responder_unreachable_at: null,
    report_submitted_at: null, report_submitted_by: null, final_action_summary: null,
    escalation_reason: null,
  },

  // 3. ESCALATED — guardian and responder disagree
  {
    id: 'inc-003',
    resident_id: 'res-003', resident_name: 'Lola Pacing Cruz', resident_type: 'Senior Citizen',
    resident_code: 'R-2026-0003',
    status: 'confirmed_not_safe', created_at: hoursAgo(2),
    qr_token: 'tok-ghi789',
    scan_latitude: null, scan_longitude: null,
    scan_landmark_notes: 'Purok 2 basketball court',
    bystander_notes: 'Resident fell while walking. Complaining of hip pain.',
    assigned_responder_id: 'test-responder-001', assigned_responder_name: 'Test Responder',
    guardian_required: false, guardian_decision: null, responder_decision: 'not_safe',
    guardian_unreachable_at: hoursAgo(1), guardian_unreachable_reason: 'No answer after 3 calls',
    responder_unreachable_at: null,
    report_submitted_at: hoursAgo(1), report_submitted_by: 'test-responder-001',
    final_action_summary: 'Resident transported to Barangay Health Center. Hip injury suspected. Family notified.',
    escalation_reason: 'Responder reported Not Safe',
  },

  // 4. CLOSED — fully confirmed safe
  {
    id: 'inc-004',
    resident_id: 'res-004', resident_name: 'Andres Bautista', resident_type: 'Resident',
    resident_code: 'R-2026-0004',
    status: 'closed', created_at: hoursAgo(26),
    qr_token: 'tok-jkl012',
    scan_latitude: 14.5988, scan_longitude: 120.9855,
    scan_landmark_notes: 'Luna St, in front of sari-sari store',
    bystander_notes: 'Resident slipped but said he was fine.',
    assigned_responder_id: 'test-responder-001', assigned_responder_name: 'Test Responder',
    guardian_required: false, guardian_decision: null, responder_decision: 'safe',
    guardian_unreachable_at: null, responder_unreachable_at: null,
    report_submitted_at: hoursAgo(25), report_submitted_by: 'test-responder-001',
    final_action_summary: 'Resident declined assistance. No injuries observed. Case closed.',
    escalation_reason: null,
  },

  // 5. OPEN — just scanned, no notes yet
  {
    id: 'inc-005',
    resident_id: 'res-001', resident_name: 'Maria Theresita A. Santos', resident_type: 'Senior Citizen',
    resident_code: 'R-2026-0001',
    status: 'closed', created_at: minutesAgo(1),
    qr_token: 'tok-mno345',
    scan_latitude: 14.5991, scan_longitude: 120.9839,
    scan_landmark_notes: null,
    bystander_notes: null,
    assigned_responder_id: null, assigned_responder_name: null,
    guardian_required: true, guardian_decision: null, responder_decision: null,
    guardian_unreachable_at: null, responder_unreachable_at: null,
    report_submitted_at: null, report_submitted_by: null, final_action_summary: null,
    escalation_reason: null,
  },
];

// ---------------------------------------------------------------------------
// Audit logs — a few entries so HomeScreen "Recent Activity" isn't empty
// ---------------------------------------------------------------------------
const RAW_LOGS = [
  { id: 'log-001', actor_id: 'test-responder-001', actor_role: 'barangay_responder',
    action: 'incident.responder_confirmed_not_safe', entity_type: 'incident', entity_id: 'inc-003',
    metadata: { decision: 'not_safe' }, created_at: hoursAgo(1) },
  { id: 'log-002', actor_id: 'test-guardian-001', actor_role: 'guardian',
    action: 'incident.guardian_confirmed_safe', entity_type: 'incident', entity_id: 'inc-002',
    metadata: { decision: 'safe' }, created_at: minutesAgo(12) },
  { id: 'log-003', actor_id: 'test-responder-001', actor_role: 'barangay_responder',
    action: 'incident.resolved', entity_type: 'incident', entity_id: 'inc-004',
    metadata: { summary: 'No injuries observed' }, created_at: hoursAgo(25) },
  { id: 'log-004', actor_id: 'test-admin-001', actor_role: 'barangay_official',
    action: 'user.created', entity_type: 'user', entity_id: 'test-guardian-001',
    metadata: { role: 'guardian' }, created_at: hoursAgo(48) },
];

// ---------------------------------------------------------------------------
// Public API — returns the SAME shape loadAppData() returns.
// ---------------------------------------------------------------------------
export function loadTestData(account) {
  const official = account.role === 'barangay_official';

  const residents = RAW_RESIDENTS.map(mapResident);

  // For test purposes, all three personas see themselves as the only "user".
  // Admins additionally see the other two test accounts as system users.
  const TEST_USERS_RAW = [
    { id: 'test-admin-001',     fullName: 'Test Admin Secretary Jr. Batumbakal siguro tama na',     role: 'barangay_official',  phoneNumber: '+639000000001', email: 'admin@gmail.com',    is_active: true, position: 'Barangay Captain' },
    { id: 'test-guardian-001',  fullName: 'Test Guardian',  role: 'guardian',           phoneNumber: '+639111111111', email: '',                    is_active: false, ward_ids: ['res-001', 'res-002'] },
    { id: 'test-responder-001', fullName: 'Test Responder', role: 'barangay_responder', phoneNumber: '+639222222222', email: '',                    is_active: true, position: 'Responder' },
  ];
  const users = official
    ? TEST_USERS_RAW.map((row) => mapUser(row, row.role, residents, account.barangayName))
    : [mapUser(account, account.role, residents, account.barangayName)];

  const alerts = RAW_INCIDENTS.map((row) => mapIncident(row, residents));
  const auditLogs = RAW_LOGS.map((row) => mapAuditLog(row, users, residents, RAW_INCIDENTS));

  return { residents, users, alerts, auditLogs };
}