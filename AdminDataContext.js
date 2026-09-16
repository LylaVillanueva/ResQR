import React, { createContext, useContext, useMemo, useState } from 'react';

const AdminDataContext = createContext(null);

const initialResidents = [
  { id: 'BRC-PWD-2026-0001', name: 'Maria Santos', type: 'Person with Disability', birthDate: 'June 15, 1962', address: 'Barangay 206, Manila', guardianName: 'Ana Santos', relationship: 'Daughter', guardianContact: '+63 912 345 6789' },
  { id: 'BRC-SC-2026-0002', name: 'Pedro Reyes', type: 'Senior Citizen', birthDate: 'March 2, 1954', address: 'Barangay 206, Manila', guardianName: 'Luis Reyes', relationship: 'Son', guardianContact: '+63 923 456 7890' },
  { id: 'BRC-PWD-2026-0003', name: 'Elena Cruz', type: 'Person with Disability', birthDate: 'October 21, 1970', address: 'Barangay 206, Manila', guardianName: 'Mia Cruz', relationship: 'Daughter', guardianContact: '+63 934 567 8901' },
  { id: 'BRC-SC-2026-0004', name: 'Juan Dela Cruz', type: 'Senior Citizen', birthDate: 'January 11, 1951', address: 'Barangay 206, Manila', guardianName: 'Rosa Dela Cruz', relationship: 'Spouse', guardianContact: '+63 945 678 9012' },
];

const initialUsers = [
  { id: 'U-001', name: 'Maria Reyes', phone: '09123456789', role: 'Barangay Official', position: 'Barangay Secretary', barangay: 'Barangay 206', status: 'Active', wardIds: [] },
  { id: 'U-002', name: 'Rowendo Carpino', phone: '09234567890', role: 'Barangay Responder', position: '', barangay: 'Barangay 206', status: 'Active', wardIds: [] },
  { id: 'U-003', name: 'Ana Santos', phone: '09345678901', role: 'Guardian', position: '', barangay: 'Barangay 206', status: 'Active', relationship: 'Daughter', wardIds: ['BRC-PWD-2026-0001'] },
  { id: 'U-004', name: 'Jadrick Coast', phone: '09456789012', role: 'Barangay Responder', position: '', barangay: 'Barangay 206', status: 'Active', wardIds: [] },
  { id: 'U-005', name: 'Luther Magtiban', phone: '09567890123', role: 'Barangay Responder', position: '', barangay: 'Barangay 206', status: 'Inactive', wardIds: [] },
];

const initialAlerts = [
  { id: 'AL-0001', residentId: 'BRC-PWD-2026-0001', residentName: 'Maria Santos', residentType: 'Person with Disability', location: 'Near Legarda LRT Station', scannedAt: '12:00 PM', scannedBy: 'A Bystander', bystanderNote: 'She was sitting on the sidewalk and looks kawawa.', guardianName: 'Ana Santos', guardianStatus: 'Pending', responderName: null, responderStatus: 'Pending', escalationReason: null },
  { id: 'AL-0002', residentId: 'BRC-SC-2026-0002', residentName: 'Pedro Reyes', residentType: 'Senior Citizen', location: 'Near Barangay Hall', scannedAt: '11:30 AM', scannedBy: 'A Bystander', bystanderNote: 'Resident was found near the entrance and may need assistance.', guardianName: 'Luis Reyes', guardianStatus: 'Pending', responderName: null, responderStatus: 'Pending', escalationReason: null },
  { id: 'AL-0003', residentId: 'BRC-PWD-2026-0003', residentName: 'Elena Cruz', residentType: 'Person with Disability', location: 'Near Legarda LRT Station', scannedAt: '11:00 AM', scannedBy: 'A Bystander', bystanderNote: 'Resident is waiting near the station.', guardianName: 'Mia Cruz', guardianStatus: 'Safe', responderName: 'Rowendo Carpino', responderStatus: 'Pending', escalationReason: null },
  { id: 'AL-0004', residentId: 'BRC-SC-2026-0004', residentName: 'Juan Dela Cruz', residentType: 'Senior Citizen', location: 'Barangay Covered Court', scannedAt: '10:20 AM', scannedBy: 'A Bystander', bystanderNote: 'Resident was found safe after checking.', guardianName: 'Rosa Dela Cruz', guardianStatus: 'Safe', responderName: 'Jadrick Coast', responderStatus: 'Safe', escalationReason: null },
];

const initialAuditLogs = [
  { id: 'AUD-0007', category: 'account', title: 'New resident enrolled', subject: 'Maria Santos', detail: 'Resident profile was added to the system.', time: '3:29 PM', date: 'September 10, 2026', actor: 'Maria Reyes', actorRole: 'Barangay Official', residentId: 'BRC-PWD-2026-0001' },
  { id: 'AUD-0006', category: 'alert', title: 'Emergency alert created', subject: 'Maria Santos', detail: 'A QR scan alert was created and is awaiting responder assignment.', time: '12:00 PM', date: 'September 10, 2026', actor: 'A Bystander', actorRole: 'Bystander', residentId: 'BRC-PWD-2026-0001' },
  { id: 'AUD-0005', category: 'alert', title: 'Guardian confirmation pending', subject: 'Maria Santos', detail: 'Guardian confirmation is awaiting action.', time: '11:42 AM', date: 'September 10, 2026', actor: 'System', actorRole: 'System', residentId: 'BRC-PWD-2026-0001' },
  { id: 'AUD-0004', category: 'alertClosed', title: 'Alert closed', subject: 'Juan Dela Cruz', detail: 'Resolved - both parties confirmed Safe.', time: '10:30 AM', date: 'September 10, 2026', actor: 'Jadrick Coast', actorRole: 'Barangay Responder', residentId: 'BRC-SC-2026-0004' },
  { id: 'AUD-0003', category: 'resident', title: 'Resident information updated', subject: 'Pedro Reyes', detail: 'Resident profile information was updated.', time: '9:18 AM', date: 'September 10, 2026', actor: 'Maria Reyes', actorRole: 'Barangay Official', residentId: 'BRC-SC-2026-0002' },
  { id: 'AUD-0002', category: 'user', title: 'User role updated', subject: 'Rowendo Carpino', detail: 'User role changed to Barangay Responder.', time: '4:10 PM', date: 'September 9, 2026', actor: 'Maria Reyes', actorRole: 'Barangay Official' },
];

function deriveStatus(alert) {
  // Any Not Safe confirmation immediately escalates the incident.
  if (alert.guardianStatus === 'Not Safe' || alert.responderStatus === 'Not Safe') return 'escalated';

  // The alert is closed only after BOTH Guardian and Responder confirm Safe.
  if (alert.guardianStatus === 'Safe' && alert.responderStatus === 'Safe') return 'closed';

  // Once either side has confirmed Safe, the incident is already in the
  // confirmation process, so show it as Pending even if a responder has
  // not yet been assigned. A responder assignment also makes it Pending.
  if (alert.guardianStatus === 'Safe' || alert.responderStatus === 'Safe' || alert.responderName) return 'pending';

  // A brand-new alert with no confirmation and no responder assignment is Open.
  return 'open';
}

export function AdminDataProvider({ children }) {
  const [residents, setResidents] = useState(initialResidents);
  const [users, setUsers] = useState(initialUsers);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  const addAuditLog = (entry) => {
    const now = new Date();
    setAuditLogs((current) => [{
      id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      ...entry,
    }, ...current]);
  };

  const addResident = (resident) => {
    const prefix = resident.type === 'Person with Disability' ? 'PWD' : 'SC';
    const nextNumber = residents.length + 1;
    const newResident = { ...resident, id: `BRC-${prefix}-2026-${String(nextNumber).padStart(4, '0')}` };
    setResidents((current) => [...current, newResident]);
    addAuditLog({ category: 'account', title: 'New resident enrolled', subject: newResident.name, detail: `${newResident.type} resident profile was added to the system.`, actor: 'Maria Reyes', actorRole: 'Barangay Official', residentId: newResident.id });
    return newResident;
  };

  const updateResident = (updatedResident) => {
    setResidents((current) => current.map((resident) => resident.id === updatedResident.id ? updatedResident : resident));
    addAuditLog({ category: 'resident', title: 'Resident information updated', subject: updatedResident.name, detail: 'Resident profile information was updated.', actor: 'Maria Reyes', actorRole: 'Barangay Official', residentId: updatedResident.id });
  };

  const assignResponder = (alertId, responderName) => {
    const alert = alerts.find((item) => item.id === alertId);
    setAlerts((current) => current.map((item) => item.id === alertId ? { ...item, responderName, responderStatus: 'Pending' } : item));
    if (alert) addAuditLog({ category: 'assignment', title: 'Responder assigned', subject: alert.residentName, detail: `${responderName} was assigned to alert ${alertId}.`, actor: 'Maria Reyes', actorRole: 'Barangay Official', residentId: alert.residentId });
  };

  const addUser = (user) => {
    const newUser = { ...user, id: `U-${String(users.length + 1).padStart(3, '0')}`, wardIds: user.role === 'Guardian' ? (user.wardIds || []) : [] };
    setUsers((current) => [...current, newUser]);
    if (newUser.role === 'Guardian' && newUser.wardIds.length) {
      setResidents((current) => current.map((resident) => newUser.wardIds.includes(resident.id) ? { ...resident, guardianName: newUser.name, guardianContact: newUser.phone, relationship: newUser.relationship } : resident));
    }
    addAuditLog({ category: 'account', title: 'New user added', subject: newUser.name, detail: `${newUser.role} account was created.`, actor: 'Maria Reyes', actorRole: 'Barangay Official' });
  };

  const updateUser = (updatedUser) => {
    setUsers((current) => current.map((user) => user.id === updatedUser.id ? updatedUser : user));
    addAuditLog({ category: 'user', title: 'User information updated', subject: updatedUser.name, detail: 'User account information was updated.', actor: 'Maria Reyes', actorRole: 'Barangay Official' });
  };

  const changeUserRole = (id, role, position = '') => {
    const user = users.find((item) => item.id === id);
    setUsers((current) => current.map((item) => item.id === id ? { ...item, role, position, wardIds: role === 'Guardian' ? (item.wardIds || []) : [] } : item));
    if (user) addAuditLog({ category: 'user', title: 'User role updated', subject: user.name, detail: `User role changed to ${role}.`, actor: 'Maria Reyes', actorRole: 'Barangay Official' });
  };

  const deactivateUser = (id) => {
    const user = users.find((item) => item.id === id);
    setUsers((current) => current.map((item) => item.id === id ? { ...item, status: 'Inactive' } : item));
    if (user) addAuditLog({ category: 'user', title: 'User deactivated', subject: user.name, detail: 'User account was marked inactive.', actor: 'Maria Reyes', actorRole: 'Barangay Official' });
  };

  const activateUser = (id) => {
    const user = users.find((item) => item.id === id);
    setUsers((current) => current.map((item) => item.id === id ? { ...item, status: 'Active' } : item));
    if (user) addAuditLog({ category: 'user', title: 'User activated', subject: user.name, detail: 'User account was marked active.', actor: 'Maria Reyes', actorRole: 'Barangay Official' });
  };

  const updateAlertConfirmation = (alertId, role, status, actorName) => {
    const alert = alerts.find((item) => item.id === alertId);
    if (!alert) return;

    const currentPartyStatus = role === 'guardian' ? alert.guardianStatus : alert.responderStatus;
    if (currentPartyStatus === status) return;

    const nextGuardianStatus = role === 'guardian' ? status : alert.guardianStatus;
    const nextResponderStatus = role === 'responder' ? status : alert.responderStatus;

    const stillNotSafe = nextGuardianStatus === 'Not Safe' || nextResponderStatus === 'Not Safe';
    let nextEscalationReason = alert.escalationReason;
    if (!stillNotSafe) {
      nextEscalationReason = null;
    } else if (status === 'Not Safe') {
      nextEscalationReason = role === 'guardian' ? 'Marked Not Safe by Guardian' : 'Marked Not Safe by Responder';
    }

    setAlerts((current) => current.map((item) => {
      if (item.id !== alertId) return item;
      return {
        ...item,
        guardianStatus: nextGuardianStatus,
        responderStatus: nextResponderStatus,
        escalationReason: nextEscalationReason,
      };
    }));

    const roleLabel = role === 'responder' ? 'Barangay Responder' : 'Guardian';
    let category = 'alert';
    let title = `${roleLabel} confirmation submitted`;
    let detail = `${actorName || roleLabel} marked the resident as ${status}.`;

    if (status === 'Not Safe') {
      category = 'alertEscalated';
      title = 'Alert escalated';
      detail = `${actorName || roleLabel} marked the resident as Not Safe.`;
    } else if (nextGuardianStatus === 'Safe' && nextResponderStatus === 'Safe') {
      category = 'alertClosed';
      title = 'Alert closed';
      detail = 'Resolved - both Guardian and Responder confirmed Safe.';
    } else if (status === 'Safe') {
      detail = `${actorName || roleLabel} marked Safe. Waiting for the other party.`;
    }

    addAuditLog({
      category,
      title,
      subject: alert.residentName,
      detail,
      actor: actorName || roleLabel,
      actorRole: roleLabel,
      residentId: alert.residentId,
    });
  };

  const addIncidentReport = (alertId, report, actorName = 'Rowendo Carpino') => {
    const alert = alerts.find((item) => item.id === alertId);
    if (!alert) return;
    setAlerts((current) => current.map((item) =>
      item.id === alertId ? { ...item, incidentReport: report } : item
    ));
    addAuditLog({
      category: 'incident',
      title: 'Incident report submitted',
      subject: alert.residentName,
      detail: `${report.natureOfEmergency}; ${report.conditionOfResident}.`,
      actor: actorName,
      actorRole: 'Barangay Responder',
      residentId: alert.residentId,
    });
  };

  const value = useMemo(() => ({
    residents,
    users,
    alerts: alerts.map((alert) => ({ ...alert, status: deriveStatus(alert) })),
    auditLogs,
    addAuditLog,
    addResident,
    updateResident,
    assignResponder,
    addUser,
    updateUser,
    changeUserRole,
    deactivateUser,
    activateUser,
    updateAlertConfirmation,
    addIncidentReport,
  }), [residents, users, alerts, auditLogs]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used inside AdminDataProvider');
  return context;
}