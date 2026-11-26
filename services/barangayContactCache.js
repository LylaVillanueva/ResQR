export const contactCacheKey = (barangayId) => `qralalay.verifiedContacts.${barangayId}`;
const LAST_CONTACT_KEY = 'qralalay.lastVerifiedBarangayContacts';

export async function readVerifiedContacts(storage, barangayId) {
  if (!barangayId) return [];
  try {
    const raw = await storage.getItem(contactCacheKey(barangayId));
    const cached = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(cached?.contacts)) return [];
    return cached.contacts.filter((contact) => contact?.id && contact?.phone && contact?.isActive && contact?.verifiedAt)
      .map((contact) => ({ ...contact, cachedAt: cached.cachedAt || null, isCached: true }));
  } catch { return []; }
}

export async function writeVerifiedContacts(storage, barangayId, contacts, cachedAt = new Date().toISOString(), barangayName = null) {
  if (!barangayId) return;
  const safeContacts = (contacts || []).filter((contact) => contact?.id && contact?.phone && contact.isActive && contact.verifiedAt).slice(0, 3)
    .map(({ id, label, phone, availability, isPrimary, isActive, verifiedAt }) => ({
      id, label, phone, availability: availability || '', isPrimary: Boolean(isPrimary), isActive: true, verifiedAt,
    }));
  try {
    await storage.setItem(contactCacheKey(barangayId), JSON.stringify({ contacts: safeContacts, cachedAt }));
    if (safeContacts.length) await storage.setItem(LAST_CONTACT_KEY, JSON.stringify({ barangayId, contacts: safeContacts, cachedAt, barangayName }));
    else {
      const previous = JSON.parse((await storage.getItem(LAST_CONTACT_KEY)) || 'null');
      if (previous?.barangayId === barangayId) await storage.removeItem(LAST_CONTACT_KEY);
    }
  }
  catch { /* Contact calls must still work if the device's storage is unavailable. */ }
}

export async function readLastVerifiedContacts(storage) {
  try {
    const raw = await storage.getItem(LAST_CONTACT_KEY);
    const cached = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(cached?.contacts)) return { contacts: [], barangayName: null, cachedAt: null };
    return {
      contacts: cached.contacts.filter((contact) => contact?.id && contact?.phone && contact?.isActive && contact?.verifiedAt)
        .map((contact) => ({ ...contact, isCached: true })),
      barangayName: cached.barangayName || null,
      cachedAt: cached.cachedAt || null,
    };
  } catch { return { contacts: [], barangayName: null, cachedAt: null }; }
}
