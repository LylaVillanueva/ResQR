import { supabase } from './supabase';
import { getExpoPushToken } from './notifications';
import { sessionStorage } from './sessionStorage';

const ROLE_FROM_DB = { official: 'barangay_official', guardian: 'guardian', responder: 'barangay_responder', resident: 'resident' };
const PROFILE_PHOTO_BUCKET = 'profile-photos';
let profileCache = null;
const qrTokenByRequestToken = new Map();

function fail(error) {
  if (!error) return;
  const result = new Error(error.message || 'The Supabase request failed.');
  result.code = error.code;
  result.status = error.status;
  throw result;
}

async function rpc(name, args = {}) {
  const { data, error } = await supabase.rpc(name, args);
  fail(error);
  return data;
}

function rows(value) { return Array.isArray(value) ? value : value ? [value] : []; }

// A function requested from the backend owner but not deployed yet. See
// docs/handoff/CODEX_BACKEND_REQUESTS_2026-11-26.md.
export const BACKEND_UPDATE_PENDING = 'BACKEND_UPDATE_PENDING';
function isMissingFunction(error) {
  return error?.code === 'PGRST202' || error?.code === '42883' || error?.status === 404;
}
// supabase-js reports any non-2xx Edge Function reply as a generic error; read
// the function's own `{ error: { code, message } }` body so users see why.
async function functionFailure(error) {
  if (!error) return;
  let body = null;
  try { body = await error.context?.json?.(); } catch { /* not JSON */ }
  const result = new Error(body?.error?.message || error.message || 'The request failed.');
  result.code = body?.error?.code || error.code;
  result.status = error.context?.status;
  throw result;
}

async function optionalRpc(name, args = {}) {
  const { data, error } = await supabase.rpc(name, args);
  if (isMissingFunction(error)) return { unavailable: true, data: null };
  fail(error);
  return { unavailable: false, data };
}
function pendingError(feature) {
  const error = new Error(`${feature} requires a backend update that hasn't been deployed yet.`);
  error.code = BACKEND_UPDATE_PENDING;
  return error;
}

async function signPhotoRows(sourceRows) {
  const values = rows(sourceRows).map((row) => ({ ...row }));
  const paths = values.map((row) => row.photo_path).filter(Boolean);
  if (!paths.length) return values.map((row) => ({ ...row, photo_url: null }));
  const chunks = [];
  for (let index = 0; index < paths.length; index += 50) chunks.push(paths.slice(index, index + 50));
  const results = await Promise.all(chunks.map((chunk) => supabase.storage.from(PROFILE_PHOTO_BUCKET).createSignedUrls(chunk, 3600)));
  for (const result of results) fail(result.error);
  const signed = results.flatMap((result) => result.data || []);
  let index = 0;
  return values.map((row) => ({ ...row, photo_url: row.photo_path ? signed[index++]?.signedUrl || null : null }));
}

function photoBytes(base64) {
  if (typeof base64 !== 'string' || !base64.length || base64.length > 960000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw new Error('Choose a smaller JPEG photo and try again.');
  }
  const binary = globalThis.atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.length > 716800) throw new Error('Photo must be 700 KB or smaller.');
  const jpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!jpeg) throw new Error('The selected photo could not be processed as a JPEG. Choose it again and retry.');
  return bytes;
}

async function savePhoto(folder, targetId, image, rpcName, profileId = targetId) {
  let currentRows = folder === 'profiles'
    ? await supabase.rpc('get_my_profile_with_photos')
    : await supabase.rpc('list_accessible_residents_with_photos');
  fail(currentRows.error);
  let current = rows(currentRows.data).find((row) => (folder === 'profiles' ? row.profile_id : row.resident_id) === targetId);
  if (!current && folder === 'profiles') {
    currentRows = await supabase.rpc('list_barangay_profiles_with_photos');
    fail(currentRows.error);
    current = rows(currentRows.data).find((row) => row.profile_id === targetId);
  }
  if (!current && folder === 'profiles') throw new Error('The profile is not available to this account.');
  if (!current && folder === 'residents') throw new Error('The resident is not available to this account.');
  const previousPath = current.photo_path || null;
  let nextPath = null;
  if (image) {
    const bytes = photoBytes(image);
    nextPath = `${folder}/${targetId}/${randomUuid()}.jpg`;
    const { error } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).upload(nextPath, bytes, {
      contentType: 'image/jpeg', cacheControl: '3600', upsert: false,
    });
    fail(error);
  }
  let previous;
  try {
    previous = await rpc(rpcName, { [folder === 'profiles' ? 'p_profile_id' : 'p_resident_id']: profileId, p_path: nextPath });
  } catch (error) {
    if (nextPath) await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([nextPath]).catch(() => {});
    throw error;
  }
  if (previous || previousPath) {
    const { error } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([previous || previousPath]);
    if (error) console.warn('Old private photo cleanup failed:', error.message);
  }
  if (!nextPath) return { photo_url: null };
  const { data, error } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).createSignedUrl(nextPath, 3600);
  fail(error);
  return { photo_url: data?.signedUrl || null };
}

function mapProfile(row, authUser = null) {
  const role = ROLE_FROM_DB[row.role] || row.role;
  return {
    id: row.profile_id,
    authUserId: authUser?.id,
    fullName: row.full_name,
    name: row.full_name,
    email: authUser?.email || null,
    phone: row.phone || null,
    position: row.position || '',
    home_address: row.home_address || '',
    role,
    is_active: row.is_active,
    barangayId: row.barangay_id,
    barangayName: row.barangay_name || null,
    photoUrl: row.photo_url || null,
  };
}

async function getMyProfile() {
  const { data: authResult, error: authError } = await supabase.auth.getUser();
  fail(authError);
  const profiles = await signPhotoRows(await rpc('get_my_profile_with_photos'));
  if (!profiles[0]) {
    await supabase.auth.signOut().catch(() => {});
    const error = new Error('This account is not active in QRAlalay. Contact your barangay official.');
    error.code = 'ACCOUNT_INACTIVE';
    throw error;
  }
  profileCache = mapProfile(profiles[0], authResult?.user);
  return profileCache;
}

function mapResident(row) {
  return {
    id: row.resident_id,
    full_name: row.full_name,
    resident_type: row.resident_category || 'Resident',
    date_of_birth: row.date_of_birth || null,
    home_address: row.address || '',
    phone: row.phone || '',
    guardian_id: row.guardian_id || null,
    guardian_name: row.guardian_name || '',
    guardian_phone: row.guardian_phone || '',
    guardian_relationship: row.guardian_relationship || '',
    is_active: row.registration_status === 'active',
    display_name: row.display_name || null,
    photo_url: row.photo_url || null,
  };
}

function mapCase(row) {
  const status = row.status === 'new' ? 'active'
    : row.status === 'in_progress' && row.assigned_responder_id ? 'assigned'
    : row.status === 'in_progress' ? 'active' : row.status;
  return {
    ...row,
    id: row.case_id,
    status,
    resident_id: row.resident_id,
    resident_name: row.resident_name,
    responder_id: row.assigned_responder_id,
    assignment_id: row.assignment_id,
    assignment_status: row.assignment_status,
    guardian_unreachable_reason: row.guardian_unreachable_reason,
    guardian_unreachable_by: row.guardian_unreachable_by,
    guardian_decision: row.guardian_decision,
    responder_decision: row.responder_decision,
    guardian_required: row.guardian_required,
    report_submitted_at: row.report_submitted_at,
    report_submitted_by: row.report_submitted_by,
    final_action_summary: row.final_action_summary,
    live_latitude: row.live_latitude,
    live_longitude: row.live_longitude,
    live_location_updated_at: row.live_location_updated_at,
    live_location_sharing: row.live_location_sharing,
    outcome: row.outcome,
    closed_at: row.closed_at,
    responder_unreachable_at: row.responder_unreachable_at,
    responder_unreachable_reason: row.responder_unreachable_reason,
    guardian_contact_attempt_reason: row.guardian_contact_attempt_reason,
    bystander_notes: row.public_note,
    scan_latitude: row.latitude,
    scan_longitude: row.longitude,
    scan_address: row.location_description,
    report_count: row.report_count || 1,
  };
}

function unsupported(name) {
  const error = new Error(`${name} is not available in the Supabase backend yet. The legacy API remains available while this workflow is completed.`);
  error.code = 'SUPABASE_WORKFLOW_PENDING';
  return error;
}

function randomCapability() {
  const bytes = new Uint8Array(32);
  if (!globalThis.crypto?.getRandomValues) throw new Error('Secure random token generation is unavailable on this device.');
  globalThis.crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function randomUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (!globalThis.crypto?.getRandomValues) throw new Error('Secure random token generation is unavailable on this device.');
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function requestKey(token) { return `qralalay.public-request.${token}`; }

async function publicCapabilities(token) {
  const key = requestKey(token);
  const stored = await sessionStorage.getItem(key);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.idempotencyKey && parsed?.requestToken && parsed?.locationToken) return parsed;
    } catch { /* Replace malformed local state with fresh capabilities. */ }
  }
  const created = { idempotencyKey: randomUuid(), requestToken: randomCapability(), locationToken: randomCapability() };
  await sessionStorage.setItem(key, JSON.stringify(created));
  return created;
}

export const supabaseApi = {
  async getPublicQrView(token) {
    const { data, error } = await supabase.functions.invoke('public-qr-view', { body: { token } });
    fail(error);
    return data?.data;
  },

  async getPublicAssistanceStatus(requestToken) {
    const { data, error } = await supabase.functions.invoke('public-assistance-status', { body: { requestToken } });
    fail(error);
    return data?.data;
  },

  async recordQrScan(token, body = {}) {
    const capability = await publicCapabilities(token);
    qrTokenByRequestToken.set(capability.requestToken, token);
    const { data, error } = await supabase.functions.invoke('submit-assistance-request', {
      body: {
        token,
        idempotencyKey: capability.idempotencyKey,
        requestToken: capability.requestToken,
        locationToken: capability.locationToken,
        publicNote: body.bystanderNotes || null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        accuracyMeters: body.accuracyMeters ?? null,
        locationDescription: body.locationDescription ?? null,
      },
    });
    fail(error);
    const result = data?.data;
    return {
      status: result?.status,
      joined: result?.joinedExisting,
      cancelToken: result?.requestToken,
      cancellableUntil: result?.cancellableUntil,
      locationShareToken: result?.locationToken,
    };
  },

  async cancelQrScan(cancelToken) {
    const { data, error } = await supabase.functions.invoke('cancel-assistance-request', { body: { requestToken: cancelToken } });
    fail(error);
    const token = qrTokenByRequestToken.get(cancelToken);
    if (data?.data?.cancelled && token) await sessionStorage.removeItem(requestKey(token)).catch(() => {});
    qrTokenByRequestToken.delete(cancelToken);
    return data?.data;
  },
  async sendOtp({ channel, identifier }) {
    const credentials = channel === 'email' ? { email: identifier } : channel === 'phone' ? { phone: identifier } : null;
    if (!credentials) throw new Error('Choose email or phone sign-in.');
    const { error } = await supabase.auth.signInWithOtp({
      ...credentials,
      options: { shouldCreateUser: false },
    });
    fail(error);
    return { sent: true };
  },

  async verifyOtp({ channel, identifier, otp }) {
    const credentials = channel === 'email'
      ? { email: identifier, token: otp, type: 'email' }
      : { phone: identifier, token: otp, type: 'sms' };
    const { data, error } = await supabase.auth.verifyOtp(credentials);
    fail(error);
    if (!data.session) throw new Error('The verification code did not create a session.');
    try {
      if (channel === 'phone') await rpc('claim_phone_invitation');
      const user = await getMyProfile();
      return { accessToken: data.session.access_token, refreshToken: data.session.refresh_token, user };
    } catch (profileError) {
      await supabase.auth.signOut().catch(() => {});
      throw profileError;
    }
  },

  async restoreSession() {
    const { data, error } = await supabase.auth.getSession();
    fail(error);
    if (!data.session) return false;
    await getMyProfile();
    return true;
  },

  async logout() {
    profileCache = null;
    const { error } = await supabase.auth.signOut();
    fail(error);
  },

  getMyProfile,

  async listBarangayContacts() {
    return rows(await rpc('list_my_barangay_contacts')).map((row) => ({
      id: row.contact_id,
      label: row.label,
      phone: row.phone,
      availability: row.availability || '',
      isPrimary: row.is_primary,
      isActive: row.is_active,
      verifiedAt: row.verified_at || null,
    }));
  },

  async saveBarangayContact(contact) {
    return rpc('save_barangay_contact', {
      p_contact_id: contact.id || null,
      p_label: contact.label,
      p_phone: contact.phone,
      p_availability: contact.availability || null,
      p_is_primary: Boolean(contact.isPrimary),
    });
  },

  async verifyBarangayContact(contactId, confirmed) {
    return rpc('verify_barangay_contact', { p_contact_id: contactId, p_confirmed: Boolean(confirmed) });
  },

  async listResidents() {
    return (await signPhotoRows(await rpc('list_accessible_residents_with_photos'))).map(mapResident);
  },

  async getResident(residentId) {
    return (await this.listResidents()).find((resident) => resident.id === residentId) || null;
  },

  async listAccounts() {
    return (await signPhotoRows(await rpc('list_barangay_profiles_with_photos'))).map((row) => ({
      id: row.profile_id,
      fullName: row.full_name,
      phoneNumber: row.phone,
      email: row.email,
      position: row.position || '',
      home_address: row.home_address || '',
      role: ROLE_FROM_DB[row.role] || row.role,
      is_active: row.is_active,
      barangay_id: row.barangay_id,
      photo_url: row.photo_url || null,
    }));
  },

  async listGuardians() { return (await this.listAccounts()).filter((row) => row.role === 'guardian'); },
  async listResponders() { return (await this.listAccounts()).filter((row) => row.role === 'barangay_responder'); },

  async listActiveIncidents({ includeClosed = false } = {}) {
    const [caseResult, photoResult] = await Promise.all([
      rpc('list_assistance_cases', { p_include_closed: includeClosed }),
      rpc('list_accessible_case_responder_photos'),
    ]);
    const photos = await signPhotoRows(photoResult);
    const photoByProfile = new Map(photos.map((row) => [row.profile_id, row.photo_url]));
    return rows(caseResult).map((row) => mapCase({
      ...row,
      assigned_responder_photo_url: row.assigned_responder_photo_url || photoByProfile.get(row.assigned_responder_id) || null,
    }));
  },

  async listResidentHistory(residentId) {
    return rows(await rpc('list_resident_case_history', { p_resident_id: residentId })).map((row) => ({ ...row, id: row.case_id }));
  },

  async getIncident(caseId) {
    const [result, overview] = await Promise.all([
      rpc('get_assistance_case', { p_case_id: caseId }),
      this.listActiveIncidents({ includeClosed: true }),
    ]);
    const detail = rows(result)[0];
    if (!detail) return null;
    const row = rows(overview).find((item) => item.case_id === caseId);
    return mapCase({ ...detail, assigned_responder_photo_url: row?.assigned_responder_photo_url || detail.assigned_responder_photo_url });
  },

  async listAuditLogs() {
    return rows(await rpc('list_my_audit_history', { p_limit: 100 }));
  },

  async assignResponder(caseId, responderId) {
    const current = await this.getIncident(caseId);
    return rpc('assign_responder', { p_case_id: caseId, p_responder_id: responderId, p_expected_version: current.version });
  },

  async submitIncidentConfirmation(caseId, body) {
    const profile = profileCache || await getMyProfile();
    if (!['guardian', 'barangay_responder', 'official'].includes(profile.role)) throw new Error('This account cannot record a safety observation.');
    return rpc('record_safety_observation', {
      p_case_id: caseId,
      p_observation: body.decision,
      p_basis: body.basis || 'unknown',
      p_note: body.note || null,
    });
  },

  async markGuardianUnreachable(caseId, reason) {
    const profile = profileCache || await getMyProfile();
    if (profile.role === 'barangay_responder') {
      return rpc('record_guardian_contact_attempt', { p_case_id: caseId, p_reason: reason });
    }
    return rpc('mark_guardian_unreachable', { p_case_id: caseId, p_reason: reason });
  },

  async markResponderUnreachable(caseId, reason) {
    return rpc('record_responder_unreachable', { p_case_id: caseId, p_reason: reason });
  },

  async closeIncident(caseId, reason) {
    if (!reason || !reason.trim()) throw new Error('A closure reason is required.');
    const current = await this.getIncident(caseId);
    return rpc('close_assistance_case', {
      p_case_id: caseId,
      p_closure_reason: reason.trim(),
      p_expected_version: current.version,
    });
  },

  async respondToAssignment(caseId, decision, reason = null) {
    const current = await this.getIncident(caseId);
    if (!current?.assignment_id) throw new Error('No responder assignment is available.');
    return rpc('respond_to_assignment', {
      p_assignment_id: current.assignment_id, p_decision: decision, p_reason: reason,
    });
  },

  async reopenIncident(caseId, reason) {
    const current = await this.getIncident(caseId);
    return rpc('reopen_assistance_case', { p_case_id: caseId, p_reason: reason, p_expected_version: current.version });
  },

  async getDashboardStats() {
    const cases = await this.listActiveIncidents({ includeClosed: true });
    return {
      total: cases.length,
      open: cases.filter((item) => item.status === 'active').length,
      escalated: cases.filter((item) => item.status === 'escalated').length,
      closed: cases.filter((item) => item.status === 'closed').length,
    };
  },

  subscribeToUpdates(profileId, onUpdate) {
    if (!profileId || typeof onUpdate !== 'function') return () => {};
    const channel = supabase.channel(`qralalay:profile:${profileId}`, { config: { private: true } })
      .on('broadcast', { event: 'case_event' }, (message) => onUpdate(message?.payload || {}))
      .subscribe();
    return () => { supabase.removeChannel(channel).catch(() => {}); };
  },

  async registerPushToken({ pushToken }) {
    return rpc('register_my_device_token', { p_expo_token: pushToken });
  },

  async unregisterPushToken() {
    const pushToken = await getExpoPushToken();
    if (pushToken) return rpc('unregister_my_device_token', { p_expo_token: pushToken });
    return true;
  },

  async generateQr({ residentId }) {
    const { data, error } = await supabase.functions.invoke('issue-qr-card', { body: { residentId } });
    await functionFailure(error);
    const publicScanUrl = data?.data?.publicUrl;
    return { id: data?.data?.cardId, token: data?.data?.token, publicUrl: publicScanUrl, publicScanUrl };
  },

  async revokeQr(card, reason = 'QR card revoked by an authorized official.') {
    const cardId = typeof card === 'string' ? card : card?.id;
    if (!cardId) throw new Error('The QR card ID is not available to revoke this card.');
    return rpc('revoke_qr_card', { p_card_id: cardId, p_reason: reason });
  },

  // Guardian relationships for one resident, including pending ones.
  async listResidentGuardianLinks(residentId) {
    const result = await optionalRpc('list_resident_guardian_links', { p_resident_id: residentId });
    if (result.unavailable) return { unavailable: true, links: [] };
    return {
      unavailable: false,
      links: rows(result.data).filter((row) => row.status !== 'revoked').map((row) => ({
        id: row.link_id, guardianId: row.guardian_profile_id, guardianName: row.guardian_name,
        guardianPhone: row.guardian_phone || '', guardianEmail: row.guardian_email || '',
        guardianActive: row.guardian_is_active === true, emailConfirmed: row.guardian_email_confirmed === true,
        relationship: row.relationship, status: row.status, verifiedAt: row.verified_at,
      })),
    };
  },

  // Creates a pending link; verification is a separate, explicit official action.
  async linkGuardianToResident({ residentId, guardianId, relationship }) {
    return rpc('create_guardian_link', {
      p_resident_id: residentId, p_guardian_profile_id: guardianId, p_relationship: relationship,
    });
  },

  async verifyGuardianLink(linkId) {
    return rpc('review_guardian_link', {
      p_link_id: linkId, p_decision: 'verified',
      p_reason: 'Identity and relationship confirmed by a barangay official.',
    });
  },

  // Email-confirmed status per profile, when the backend provides it.
  async listAccountStatus() {
    const result = await optionalRpc('list_barangay_profiles_with_status');
    if (result.unavailable) return null;
    return new Map(rows(result.data).map((row) => [row.profile_id, { emailConfirmed: row.email_confirmed === true, hasAuthUser: row.has_auth_user === true }]));
  },

  // Active card metadata only; never a token.
  async getResidentQrCard(residentId) {
    const result = await optionalRpc('get_resident_edit_details', { p_resident_id: residentId });
    if (result.unavailable) return { unavailable: true, card: null };
    const row = rows(result.data)[0];
    return { unavailable: false, card: row?.qr_card_id
      ? { id: row.qr_card_id, issuedAt: row.qr_card_issued_at, reexportable: row.qr_card_reexportable === true } : null };
  },

  // Re-exports the existing card without replacing it (authorized, audited).
  async exportExistingQr({ cardId }) {
    if (!cardId) throw pendingError('Re-exporting an existing QR card');
    const { data, error } = await supabase.functions.invoke('export-qr-card', { body: { cardId } });
    const status = error?.context?.status;
    if (error && (status === 404 || status === 409)) throw pendingError(status === 409 ? 'Re-exporting this older card' : 'Re-exporting an existing QR card');
    await functionFailure(error);
    const publicScanUrl = data?.data?.publicUrl;
    return { id: data?.data?.cardId, publicUrl: publicScanUrl, publicScanUrl };
  },

  async enrollResident(input) {
    const residentId = await rpc('create_resident_with_birth_date', {
      p_full_name: input.fullName,
      p_phone: input.phone || null,
      p_address: input.homeAddress || null,
      p_resident_category: input.residentType || null,
      p_display_name: null,
      p_assistance_instructions: null,
      p_public_disclosure_approved: false,
      p_disclosure_reference: null,
      p_date_of_birth: input.dateOfBirth || null,
    });
    try {
      if (input.guardianId) {
        // Links start as pending; only verified links are shown on the resident
        // and give the guardian access. The official who registers the resident
        // verifies the link after explicitly confirming identity and relationship.
        const linkId = await rpc('create_guardian_link', {
          p_resident_id: residentId,
          p_guardian_profile_id: input.guardianId,
          p_relationship: input.relationship || 'Guardian',
        });
        if (input.guardianVerifiedByOfficial === true) {
          await rpc('review_guardian_link', {
            p_link_id: linkId,
            p_decision: 'verified',
            p_reason: 'Identity and relationship confirmed by the registering barangay official.',
          });
        }
      }
      if (input.newGuardian) {
        if (!input.newGuardian.email && !input.newGuardian.phone) throw new Error('The resident was created, but a guardian invitation needs an email address or phone number.');
        const { error } = await supabase.functions.invoke('invite-account', {
          body: {
            email: input.newGuardian.email,
            fullName: input.newGuardian.fullName,
            phone: input.newGuardian.phone || null,
            role: 'guardian',
            wardIds: [residentId],
            relationship: input.newGuardian.relation || 'Guardian',
          },
        });
        if (error) {
          const detailed = await functionFailure(error).catch((reason) => reason);
          detailed.code = detailed.code || 'GUARDIAN_INVITATION_FAILED';
          detailed.message = `Resident created, but the guardian invitation could not be sent: ${detailed.message}`;
          throw detailed;
        }
      }
    } catch (guardianError) {
      // The resident already exists; let the screen continue with it.
      guardianError.residentId = residentId;
      guardianError.residentName = input.fullName;
      if (!/^Resident created/.test(guardianError.message || '')) {
        guardianError.message = `Resident created, but the guardian could not be linked: ${guardianError.message}`;
      }
      throw guardianError;
    }
    return { id: residentId, full_name: input.fullName, resident_category: input.residentType || null };
  },

  async updateResident(residentId, input) {
    // Preferred: send only the changed fields (backend partial update).
    const FIELD_MAP = { fullName: 'full_name', phone: 'phone', homeAddress: 'address', residentType: 'resident_category',
      displayName: 'display_name', assistanceInstructions: 'assistance_instructions', dateOfBirth: 'date_of_birth' };
    const changes = {};
    for (const [key, column] of Object.entries(FIELD_MAP)) {
      if (input[key] !== undefined) changes[column] = typeof input[key] === 'string' ? (input[key].trim() || null) : input[key];
    }
    if (changes.full_name === null) throw new Error('Full name is required.');
    const patched = await optionalRpc('update_resident_fields', { p_resident_id: residentId, p_changes: changes });
    if (!patched.unavailable) return this.getResident(residentId);

    // Until the partial update is deployed, the full-row RPC is used and every
    // field the caller didn't send keeps its current value.
    const full = await optionalRpc('get_resident_edit_details', { p_resident_id: residentId });
    const record = rows(full.data)[0];
    const listed = record ? null : await this.getResident(residentId);
    const current = record ? {
      phone: record.phone, address: record.address, category: record.resident_category,
      displayName: record.display_name, birthDate: record.date_of_birth,
      instructions: record.assistance_instructions, disclosureApproved: record.public_disclosure_approved === true,
      disclosureReference: record.disclosure_reference,
    } : {
      phone: listed?.phone, address: listed?.home_address, category: listed?.resident_type,
      displayName: listed?.display_name, birthDate: listed?.date_of_birth,
      instructions: null, disclosureApproved: false, disclosureReference: null,
    };
    const keep = (value, existing) => (value === undefined ? existing || null : value || null);
    await rpc('update_resident_with_birth_date', {
      p_resident_id: residentId,
      p_full_name: input.fullName,
      p_phone: keep(input.phone, current.phone),
      p_address: keep(input.homeAddress, current.address),
      p_resident_category: keep(input.residentType, current.category),
      p_display_name: keep(input.displayName, current.displayName),
      p_assistance_instructions: keep(input.assistanceInstructions, current.instructions),
      // Disclosure approval is never changed from the edit screen.
      p_public_disclosure_approved: current.disclosureApproved,
      p_disclosure_reference: current.disclosureReference,
      p_date_of_birth: keep(input.dateOfBirth, current.birthDate),
    });
    return this.getResident(residentId);
  },

  async createAccount(input) {
    const email = input.email?.trim().toLowerCase() || null;
    const phone = input.phone?.trim() || null;
    if (!email && !phone) throw new Error('An email address or phone number is required to create an account.');
    const role = input.role === 'barangay_official' ? 'official'
      : input.role === 'barangay_responder' ? 'responder' : input.role;
    const { data, error } = await supabase.functions.invoke('invite-account', {
      body: {
        email,
        fullName: input.fullName,
        phone,
        role,
        wardIds: input.residentIds || input.wardIds || [],
        relationship: input.relationship || null,
        position: input.position || null,
        homeAddress: input.homeAddress || null,
      },
    });
    await functionFailure(error);
    return {
      id: data?.data?.profileId,
      profileId: data?.data?.profileId,
      invitationSent: data?.data?.invitationSent,
      phoneVerificationRequired: data?.data?.phoneVerificationRequired || false,
    };
  },

  async registerGuardian(input) {
    const result = await this.createAccount({
      ...input,
      role: 'guardian',
      residentIds: input.residentIds || [],
    });
    return {
      id: result.profileId,
      profileId: result.profileId,
      full_name: input.fullName,
      phone_number: input.phone || null,
      email: input.email,
      invitationSent: result.invitationSent,
      phoneVerificationRequired: result.phoneVerificationRequired,
    };
  },

  async updateAccount(profileId, input) {
    const requestedEmail = input.email?.trim().toLowerCase();
    if (requestedEmail && requestedEmail !== profileCache?.email?.toLowerCase()) {
      if (profileId !== profileCache?.id) {
        const error = new Error('A linked user must change their sign-in email through their own verified account.');
        error.code = 'EMAIL_CHANGE_REQUIRES_VERIFICATION';
        throw error;
      }
      const { error } = await supabase.auth.updateUser({ email: requestedEmail });
      fail(error);
    }
    await rpc('update_profile_details_with_work_info', {
      p_profile_id: profileId,
      p_full_name: input.fullName || input.name,
      p_phone: input.phone || input.phoneNumber || null,
      p_position: input.position || null,
      p_home_address: input.homeAddress || input.address || null,
    });
    return true;
  },

  async changeAccountRole(profileId, input) {
    const roleValue = input.role === 'Barangay Official' || input.role === 'barangay_official' ? 'official'
      : input.role === 'Barangay Responder' || input.role === 'barangay_responder' ? 'responder' : input.role;
    return rpc('change_profile_role', {
      p_profile_id: profileId, p_role: roleValue, p_reason: input.reason || 'Role updated by authorized official.',
    });
  },

  async setAccountActive(profileId, isActive) {
    return rpc('set_profile_active', {
      p_profile_id: profileId, p_active: isActive,
      p_reason: isActive ? 'Account activated by authorized official.' : 'Account deactivated by authorized official.',
    });
  },

  async resolveIncident(caseId, report) {
    if (!report || typeof report !== 'object') throw new Error('An explicit responder report and outcome are required.');
    const actions = `Nature of emergency: ${report.natureOfEmergency}\n${report.actionsTaken}`;
    return rpc('submit_case_report', {
      p_case_id: caseId,
      p_actions_taken: actions,
      p_resident_condition: report.conditionOfResident,
      p_outcome: report.outcome,
      p_handover_details: report.handoverDetails || null,
    });
  },

  async getMyProfilePhoto() { return (await getMyProfile()).photoUrl || null; },
  async setMyPhoto(image) {
    const profile = profileCache || await getMyProfile();
    const result = await savePhoto('profiles', profile.id, image, 'set_profile_photo_path');
    profileCache = { ...profile, photoUrl: result.photo_url };
    return result;
  },
  async setAccountPhoto(profileId, image) {
    const result = await savePhoto('profiles', profileId, image, 'set_profile_photo_path');
    return result;
  },
  async setResidentPhoto(residentId, image) {
    return savePhoto('residents', residentId, image, 'set_resident_photo_path');
  },
};
