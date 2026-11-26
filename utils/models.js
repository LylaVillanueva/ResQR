export const ROLE_LABELS = { guardian: 'Guardian', barangay_official: 'Barangay Official', barangay_responder: 'Barangay Responder' };

export function mapResident(row) {
  return { ...row, id: row.id, code: row.resident_code || '', name: row.full_name,
    type: row.resident_type || 'Resident', birthDate: row.date_of_birth?.slice(0, 10) || '',
    address: row.home_address || '', guardianId: row.guardian_id, photoUrl: row.photo_url || null,
    guardianName: row.guardian_name || '', guardianContact: row.guardian_phone || '',
    relationship: row.guardian_relationship || '' };
}

export function mapUser(row, role, residents, barangay) {
  return { id: row.id, name: row.fullName || row.full_name, phone: row.phoneNumber || row.phone_number || '',
    role: ROLE_LABELS[role] || role, position: row.position || '', email: row.email || '', barangay: row.barangay_name || row.barangayName || barangay || 'Not available',
    address: row.home_address || row.homeAddress || '', photoUrl: row.photo_url || row.photoUrl || null,
    status: row.is_active === false ? 'Inactive' : row.is_active === true ? 'Active' : 'Not available',
    wardIds: role === 'guardian' ? (row.ward_ids || residents.filter((r) => r.guardianId === row.id).map((r) => r.id)) : [] };
}

export function incidentStatus(row) {
  if (['closed', 'resolved', 'confirmed_safe', 'cancelled'].includes(row.status)) return 'closed';
  if (['escalated', 'confirmed_not_safe'].includes(row.status)) return 'escalated';
  if (row.status === 'assigned' || row.assigned_responder_id || row.guardian_decision === 'safe' || row.responder_decision === 'safe') return 'pending';
  return 'open';
}

// Every alert is in exactly one stage, and every screen uses these labels,
// so "New", "In progress", "Escalated" and "Closed" never overlap.
export const ALERT_STAGES = {
  open: { label: 'New', description: 'No responder assigned yet' },
  pending: { label: 'In progress', description: 'Responder assigned; waiting for Safe confirmations' },
  escalated: { label: 'Escalated', description: 'Overdue, reported Not Safe, or reported by several people' },
  closed: { label: 'Closed', description: 'Resolved, closed or cancelled' },
};

export const ALERT_FILTERS = [
  { key: 'all', label: 'All', description: 'Every alert' },
  ...Object.entries(ALERT_STAGES).map(([key, stage]) => ({ key, ...stage })),
];

export function alertStageLabel(status) {
  return (ALERT_STAGES[status] || ALERT_STAGES.open).label;
}

// Shortcuts the Home screens link to. They aren't filter chips (they'd
// overlap the stages); the alert list just explains what it's showing.
const ALERT_SHORTCUTS = {
  active: { description: 'Ongoing alerts: New, In progress and Escalated', matches: (alert) => alert.status !== 'closed' },
  unassigned: { description: 'Ongoing alerts still waiting for a responder', matches: (alert) => alert.status !== 'closed' && !alert.responderId },
};

export function matchesAlertFilter(alert, key) {
  if (!key || key === 'all') return true;
  if (ALERT_SHORTCUTS[key]) return ALERT_SHORTCUTS[key].matches(alert);
  return alert.status === key;
}

export function alertFilterDescription(key) {
  return ALERT_SHORTCUTS[key]?.description || ALERT_FILTERS.find((filter) => filter.key === key)?.description || ALERT_FILTERS[0].description;
}

function decisionLabel(value) { return value === 'safe' ? 'Safe' : value === 'not_safe' ? 'Not Safe' : 'Waiting'; }

function liveLocationNote(row) {
  const updated = row.live_location_updated_at ? new Date(row.live_location_updated_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  const where = readableLocation(row.live_address, row.live_latitude, row.live_longitude, row.live_location_updated_at);
  return row.live_location_sharing
    ? `Bystander is now at ${where} · updated ${updated}`
    : `Bystander stopped sharing · last seen at ${where} at ${updated}`;
}

// The backend turns coordinates into a street address a few seconds after
// they arrive. Until then (or if the lookup failed) show rounded coordinates.
function readableLocation(address, latitude, longitude, createdAt) {
  if (address) return address;
  if (latitude == null || longitude == null) return null;
  const isFresh = createdAt && Date.now() - new Date(createdAt).getTime() < 60000;
  return isFresh ? 'Finding address…' : `Near ${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`;
}

function escalationReason(row) {
  if (row.escalation_reason) return row.escalation_reason;
  const reasons = [];
  if (row.report_count > 1) reasons.push(`${row.report_count} separate reports for this resident`);
  if (row.status === 'confirmed_not_safe') reasons.push('A party reported Not Safe');
  return reasons.join(' · ');
}

export function mapIncident(row, residents = [], users = []) {
  const resident = residents.find((r) => r.id === row.resident_id);
  const responder = users.find((user) => user.id === row.assigned_responder_id);
  // A bystander may keep sharing their live position after the scan; when
  // they have, the map opens that newer position instead of the scan spot.
  const hasLiveLocation = row.live_latitude != null && row.live_longitude != null;
  return { ...row, status: incidentStatus(row), backendStatus: row.status,
    residentId: row.resident_id, residentName: row.resident_name || resident?.name || 'Resident',
    residentType: row.resident_type || resident?.type || 'Resident', residentCode: row.resident_code || resident?.code || '', guardianName: resident?.guardianName || '',
    responderId: row.assigned_responder_id, responderName: row.assigned_responder_name,
    residentPhotoUrl: row.resident_photo_url || resident?.photoUrl || null,
    responderPhotoUrl: row.assigned_responder_photo_url || responder?.photoUrl || null,
    officialReviewRequired: row.guardian_required === false || !!row.guardian_unreachable_at,
    readyForReview: (row.guardian_required === false || !!row.guardian_unreachable_at || row.guardian_decision === 'safe')
      && row.responder_decision === 'safe' && row.guardian_decision !== 'not_safe'
      && !!row.report_submitted_at && !!row.final_action_summary?.trim() && row.report_submitted_by === row.assigned_responder_id,
    guardianStatus: row.guardian_unreachable_at ? 'Unreachable' : row.guardian_required === false ? 'Not registered' : decisionLabel(row.guardian_decision),
    responderStatus: decisionLabel(row.responder_decision),
    // True the moment guardian and responder actually disagree (one Safe,
    // one Not Safe) — surfaced distinctly so it reads as "these two
    // conflict" rather than just another Not Safe.
    hasDiscrepancy: !!row.guardian_decision && !!row.responder_decision && row.guardian_decision !== row.responder_decision,
    guardianUnreachableAt: row.guardian_unreachable_at || null,
    guardianUnreachableReason: row.guardian_unreachable_reason || '',
    guardianUnreachableBySystem: !!row.guardian_unreachable_at && !row.guardian_unreachable_by,
    responderUnreachableAt: row.responder_unreachable_at || null,
    responderUnreachableReason: row.responder_unreachable_reason || '',
    cancelledReason: row.cancelled_reason || '',
    scannedAt: row.created_at ? new Date(row.created_at).toLocaleString() : '',
    scannedBy: row.qr_token ? 'A Bystander' : 'An authorized user',
    location: readableLocation(row.scan_address, row.scan_latitude, row.scan_longitude, row.created_at) || 'Location unavailable',
    liveAddress: hasLiveLocation ? readableLocation(row.live_address, row.live_latitude, row.live_longitude, row.live_location_updated_at) : '',
    reportCount: row.report_count || 1,
    mapLatitude: hasLiveLocation ? row.live_latitude : row.scan_latitude,
    mapLongitude: hasLiveLocation ? row.live_longitude : row.scan_longitude,
    liveLocationNote: hasLiveLocation ? liveLocationNote(row) : '',
    bystanderNote: row.bystander_notes || '',
    escalationReason: escalationReason(row),
    incidentReport: row.final_action_summary || null,
  };
}

export function mapAuditLog(row, users = [], residents = [], incidents = []) {
  const actor = users.find((user) => user.id === row.actor_id);
  const incident = incidents.find((item) => item.id === row.entity_id);
  const residentId = row.entity_type === 'resident' ? row.entity_id : incident?.resident_id;
  const resident = residents.find((item) => item.id === residentId);
  const action = row.action || '';
  const category = action.includes('closed') || action.includes('resolved') ? 'alertClosed'
    : action.includes('escalat') ? 'alertEscalated' : action.includes('assign') ? 'assignment'
    : row.entity_type === 'incident' ? 'alert' : row.entity_type === 'resident' ? 'resident'
    : row.entity_type === 'user' ? 'user' : 'system';
  return { ...row, category, title: action.replace(/[._]/g, ' '), residentId,
    subject: resident?.name || row.entity_id || 'System',
    detail: Object.entries(row.metadata || {}).map(([key, value]) => `${key}: ${String(value)}`).join(' • '),
    actor: actor?.name || row.actor_id || 'System', actorRole: ROLE_LABELS[row.actor_role] || 'System',
    date: new Date(row.created_at).toLocaleDateString(), time: new Date(row.created_at).toLocaleTimeString(),
  };
}

// Prioritize actionable alerts without mutating shared context data.
export function sortAlertsByPriority(alerts) {
  const priority = { escalated: 0, open: 1, pending: 2, closed: 3 };
  const timestamp = (alert) => Date.parse(alert.created_at || '') || 0;
  return [...alerts].sort((a, b) =>
    (priority[a.status] ?? 2) - (priority[b.status] ?? 2) || timestamp(b) - timestamp(a));
}
