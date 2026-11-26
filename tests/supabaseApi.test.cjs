const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '../services/supabaseApi.js');
const apiSource = fs.readFileSync(sourcePath, 'utf8');
let moduleNumber = 0;

function asModule(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}

async function loadSupabaseApi(fixture) {
  const fixtureKey = `__qralalaySupabaseApiFixture${moduleNumber++}`;
  globalThis[fixtureKey] = fixture;
  const injected = apiSource
    .replace("import { supabase } from './supabase';", `const { supabase } = globalThis.${fixtureKey};`)
    .replace("import { getExpoPushToken } from './notifications';", `const { getExpoPushToken } = globalThis.${fixtureKey};`)
    .replace("import { sessionStorage } from './sessionStorage';", `const { sessionStorage } = globalThis.${fixtureKey};`);
  return import(asModule(injected));
}

function fixture() {
  const calls = [];
  return {
    calls,
    getExpoPushToken: async () => null,
    sessionStorage: {
      async getItem() { return null; },
      async setItem() {},
      async removeItem() {},
    },
    supabase: {
      functions: {
        async invoke(name, options) {
          calls.push({ name, options });
          return { data: { data: options.body?.email
            ? { profileId: 'profile-123', invitationSent: true }
            : { profileId: 'profile-123', invitationSent: false, phoneVerificationRequired: true } }, error: null };
        },
      },
      auth: {
        async verifyOtp() { return { data: { session: { access_token: 'access', refresh_token: 'refresh' } }, error: null }; },
        async getUser() { return { data: { user: { id: 'auth-123', email: null } }, error: null }; },
        async signOut() { return { error: null }; },
      },
      async rpc(name, args) {
        calls.push({ rpc: name, args });
        if (name === 'get_my_profile_with_photos') return { data: [{
          profile_id: 'profile-123', role: 'guardian', full_name: 'Guardian Example', is_active: true,
        }], error: null };
        return { data: true, error: null };
      },
    },
  };
}

test('Supabase adapter implements every mobile API method', async () => {
  const { supabaseApi } = await loadSupabaseApi(fixture());
  const apiText = fs.readFileSync(path.join(__dirname, '../services/api.js'), 'utf8');
  const legacyApi = apiText.match(/const legacyApi = \{([\s\S]*?)\n\};/)[1];
  const methodNames = [...legacyApi.matchAll(/^\s{2}([A-Za-z_$][\w$]*)\s*(?:\(|:)/gm)].map((match) => match[1]);
  const missing = methodNames.filter((name) => !(name in supabaseApi));
  assert.deepEqual(missing, []);
});

test('registerGuardian sends a scoped Auth invitation and returns the legacy-shaped profile', async () => {
  const mock = fixture();
  const { supabaseApi } = await loadSupabaseApi(mock);
  const result = await supabaseApi.registerGuardian({
    fullName: 'Guardian Example',
    email: 'guardian@example.test',
    phone: '+639171234567',
    residentIds: ['resident-123'],
    relationship: 'Parent',
  });

  assert.deepEqual(mock.calls, [{
    name: 'invite-account',
    options: { body: {
      email: 'guardian@example.test',
      fullName: 'Guardian Example',
      phone: '+639171234567',
      role: 'guardian',
      wardIds: ['resident-123'],
      relationship: 'Parent',
      position: null,
      homeAddress: null,
    } },
  }]);
  assert.deepEqual(result, {
    id: 'profile-123',
    profileId: 'profile-123',
    full_name: 'Guardian Example',
    phone_number: '+639171234567',
    email: 'guardian@example.test',
    invitationSent: true,
    phoneVerificationRequired: false,
  });
});

test('phone-only guardian registration creates a pending phone-verification invitation', async () => {
  const mock = fixture();
  const { supabaseApi } = await loadSupabaseApi(mock);
  const result = await supabaseApi.registerGuardian({ fullName: 'Guardian Example', phone: '+639171234567' });
  assert.equal(result.profileId, 'profile-123');
  assert.equal(result.invitationSent, false);
  assert.equal(result.phoneVerificationRequired, true);
  assert.deepEqual(mock.calls[0], { name: 'invite-account', options: { body: {
    email: null,
    fullName: 'Guardian Example',
    phone: '+639171234567',
    role: 'guardian',
    wardIds: [],
    relationship: null,
    position: null,
    homeAddress: null,
  } } });
});

test('phone OTP verifies and claims the phone invitation before loading the profile', async () => {
  const mock = fixture();
  const { supabaseApi } = await loadSupabaseApi(mock);
  const result = await supabaseApi.verifyOtp({ channel: 'phone', identifier: '+639171234567', otp: '123456' });
  assert.equal(result.user.id, 'profile-123');
  assert.deepEqual(mock.calls.filter((call) => call.rpc).map((call) => call.rpc), [
    'claim_phone_invitation',
    'get_my_profile_with_photos',
  ]);
});

test('revokeQr calls the protected QR revocation RPC with card ID and reason', async () => {
  const mock = fixture();
  const { supabaseApi } = await loadSupabaseApi(mock);
  assert.equal(await supabaseApi.revokeQr({ id: 'card-1' }, 'lost card'), true);
  assert.deepEqual(mock.calls[0], {
    rpc: 'revoke_qr_card',
    args: { p_card_id: 'card-1', p_reason: 'lost card' },
  });
  await assert.rejects(() => supabaseApi.revokeQr({ token: 'opaque-token' }), /QR card ID is not available/);
});

test('barangay contact adapter uses scoped list, save, and official confirmation RPCs', async () => {
  const mock = fixture();
  const { supabaseApi } = await loadSupabaseApi(mock);
  mock.supabase.rpc = async (name, args) => {
    mock.calls.push({ rpc: name, args });
    if (name === 'list_my_barangay_contacts') return { data: [{
      contact_id: 'contact-1', label: 'Barangay Hotline', phone: '+639171234567', availability: '24 hours',
      is_primary: true, is_active: true, verified_at: '2026-11-25T00:00:00Z',
    }], error: null };
    return { data: name === 'save_barangay_contact' ? 'contact-1' : true, error: null };
  };

  assert.deepEqual(await supabaseApi.listBarangayContacts(), [{
    id: 'contact-1', label: 'Barangay Hotline', phone: '+639171234567', availability: '24 hours',
    isPrimary: true, isActive: true, verifiedAt: '2026-11-25T00:00:00Z',
  }]);
  assert.equal(await supabaseApi.saveBarangayContact({ id: null, label: 'Barangay Hotline', phone: '+639171234567', isPrimary: true }), 'contact-1');
  assert.equal(await supabaseApi.verifyBarangayContact('contact-1', true), true);
  assert.deepEqual(mock.calls.filter((call) => call.rpc).map(({ rpc, args }) => [rpc, args]), [
    ['list_my_barangay_contacts', {}],
    ['save_barangay_contact', { p_contact_id: null, p_label: 'Barangay Hotline', p_phone: '+639171234567', p_availability: null, p_is_primary: true }],
    ['verify_barangay_contact', { p_contact_id: 'contact-1', p_confirmed: true }],
  ]);
});

test('printable QR card includes the QR image but omits resident personal information', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../utils/qrCardHtml.js'), 'utf8');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  const { buildQrCardHtml } = await import(moduleUrl);
  const html = buildQrCardHtml('data:image/png;base64,SGVsbG8=');
  assert.match(html, /QRAlalay/);
  assert.match(html, /data:image\/png;base64,SGVsbG8=/);
  assert.doesNotMatch(html, /resident|address|guardian|birth date/i);
  assert.throws(() => buildQrCardHtml('https://example.test/qr.png'), /valid QR image/);
});

test('private Realtime profile subscription forwards data-free invalidations and removes its channel', async () => {
  const mock = fixture();
  let broadcastHandler;
  let removedChannel;
  const channel = {
    on(type, filter, handler) {
      assert.equal(type, 'broadcast');
      assert.deepEqual(filter, { event: 'case_event' });
      broadcastHandler = handler;
      return this;
    },
    subscribe() { return this; },
  };
  mock.supabase.channel = (topic, options) => {
    assert.equal(topic, 'qralalay:profile:profile-123');
    assert.deepEqual(options, { config: { private: true } });
    return channel;
  };
  mock.supabase.removeChannel = async (value) => { removedChannel = value; };
  const { supabaseApi } = await loadSupabaseApi(mock);
  let received;
  const unsubscribe = supabaseApi.subscribeToUpdates('profile-123', (payload) => { received = payload; });
  const payload = { eventId: 'event-1', eventType: 'case.updated', caseId: 'case-1' };
  broadcastHandler({ payload });
  assert.deepEqual(received, payload);
  unsubscribe();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(removedChannel, channel);
});
