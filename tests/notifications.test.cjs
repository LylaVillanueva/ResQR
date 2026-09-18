const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/lib/notificationPermissions.js'), 'utf8');
const factory = import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

test('Expo Go and web never evaluate the unsupported notifications module', async () => {
  const { createNotificationPermissions } = await factory;
  for (const config of [{ platform: 'android', isExpoGo: true }, { platform: 'ios', isExpoGo: true }, { platform: 'web', isExpoGo: false }]) {
    const permissions = createNotificationPermissions({ ...config, loadNotifications: () => { throw new Error('Must not import'); } });
    assert.equal(permissions.supported, false);
    assert.deepEqual(await permissions.request(), { supported: false, granted: false });
  }
});

test('Android development build creates its channel before requesting permission', async () => {
  const { createNotificationPermissions } = await factory;
  const calls = [];
  const permissions = createNotificationPermissions({ platform: 'android', isExpoGo: false, loadNotifications: async () => ({
    AndroidImportance: { HIGH: 4 },
    setNotificationChannelAsync: async () => calls.push('channel'),
    requestPermissionsAsync: async () => { calls.push('permission'); return { granted: true }; },
  }) });
  assert.deepEqual(await permissions.request(), { supported: true, granted: true });
  assert.deepEqual(calls, ['channel', 'permission']);
});

test('a denied permission stays denied in supported builds', async () => {
  const { createNotificationPermissions } = await factory;
  const permissions = createNotificationPermissions({ platform: 'ios', isExpoGo: false, loadNotifications: async () => ({
    requestPermissionsAsync: async () => ({ granted: false }),
  }) });
  assert.deepEqual(await permissions.request(), { supported: true, granted: false });
});
