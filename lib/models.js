export const ROLE_LABELS = { guardian: 'Guardian', barangay_official: 'Barangay Official', barangay_responder: 'Barangay Responder' };

export function mapResident(row) {
  return { ...row, id: row.id, code: row.resident_code || '', name: row.full_name,
    type: row.resident_type || 'Resident', birthDate: row.date_of_birth?.slice(0, 10) || '',
    address: row.home_address || '', guardianId: row.guardian_id,
    guardianName: row.guardian_name || '', guardianContact: row.guardian_phone || '',
    relationship: row.guardian_relationship || row.emergency_contacts?.[0]?.relation || '' };
}

export function mapUser(row, role, residents, barangay) {
  return { id: row.id, name: row.fullName || row.full_name, phone: row.phoneNumber || row.phone_number || '',
    role: ROLE_LABELS[role] || role, position: row.position || '', email: row.email || '', barangay: row.barangay_name || row.barangayName || barangay || 'Not available',
    address: row.home_address || row.homeAddress || '',
    status: row.is_active === false ? 'Inactive' : row.is_active === true ? 'Active' : 'Not available',
    wardIds: role === 'guardian' ? (row.ward_ids || residents.filter((r) => r.guardianId === row.id).map((r) => r.id)) : [] };
}

export function incidentStatus(row) {
  if (['closed', 'resolved', 'confirmed_safe', 'cancelled'].includes(row.status)) return 'closed';
  if (['escalated', 'confirmed_not_safe'].includes(row.status)) return 'escalated';
  if (row.status === 'assigned' || row.assigned_responder_id || row.guardian_decision === 'safe' || row.responder_decision === 'safe') return 'pending';
  return 'open';
}

function decisionLabel(value) { return value === 'safe' ? 'Safe' : value === 'not_safe' ? 'Not Safe' : 'Pending'; }

export function mapIncident(row, residents = []) {
  const resident = residents.find((r) => r.id === row.resident_id);
  const hasCoordinates = row.scan_latitude != null && row.scan_longitude != null;
  return { ...row, status: incidentStatus(row), backendStatus: row.status,
    residentId: row.resident_id, residentName: row.resident_name || resident?.name || 'Resident',
    residentType: row.resident_type || resident?.type || 'Resident', residentCode: row.resident_code || resident?.code || '', guardianName: resident?.guardianName || '',
    responderId: row.assigned_responder_id, responderName: row.assigned_responder_name,
    officialReviewRequired: row.guardian_required === false || !!row.guardian_unreachable_at,
    readyForReview: (row.guardian_required === false || !!row.guardian_unreachable_at) && row.responder_decision === 'safe' && row.guardian_decision !== 'not_safe' && !!row.report_submitted_at && !!row.final_action_summary?.trim() && row.report_submitted_by === row.assigned_responder_id,
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
    location: row.scan_landmark_notes || (hasCoordinates ? `${row.scan_latitude}, ${row.scan_longitude}` : 'Location unavailable'),
    bystanderNote: row.bystander_notes || '',
    escalationReason: row.escalation_reason || (row.status === 'confirmed_not_safe' ? 'A party reported Not Safe' : ''),
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
