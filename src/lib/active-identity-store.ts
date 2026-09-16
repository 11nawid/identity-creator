import { SyntheticIdentity } from '@/types';

const ACTIVE_ID_KEY = 'identity_creator_active_identity';
const RECENT_IDS_KEY = 'identity_creator_recent_identities';
const ALL_CREATED_IDS_KEY = 'identity_creator_all_created_identities';

export function setActiveIdentity(identity: SyntheticIdentity): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ACTIVE_ID_KEY, JSON.stringify(identity));
    localStorage.setItem(`${ACTIVE_ID_KEY}_${identity.id}`, JSON.stringify(identity));
    saveRecentIdentity(identity);
    saveCreatedIdentity(identity);
    window.dispatchEvent(new Event('active_identity_updated'));
  } catch (e) {
    console.error('Failed to set active identity:', e);
  }
}

export function getActiveIdentity(): SyntheticIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_ID_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function getIdentityById(id: string): SyntheticIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const active = getActiveIdentity();
    if (active && active.id === id) return active;

    const stored = localStorage.getItem(`${ACTIVE_ID_KEY}_${id}`);
    if (stored) return JSON.parse(stored);

    // Check all created identities
    const allCreated = getAllCreatedIdentities();
    const foundInCreated = allCreated.find((p) => p.id === id);
    if (foundInCreated) return foundInCreated;

    // Also check saved profiles
    const savedRaw = localStorage.getItem('identity-creator-saved-profiles');
    if (savedRaw) {
      const saved: SyntheticIdentity[] = JSON.parse(savedRaw);
      const found = saved.find((p) => p.id === id);
      if (found) return found;
    }

    // Check recent profiles
    const recent = getRecentIdentities();
    const foundRecent = recent.find((p) => p.id === id);
    if (foundRecent) return foundRecent;
  } catch {}
  return null;
}

export function saveRecentIdentity(identity: SyntheticIdentity): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentIdentities();
    const filtered = existing.filter((p) => p.id !== identity.id);
    const updated = [identity, ...filtered].slice(0, 12);
    localStorage.setItem(RECENT_IDS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('recent_identities_updated'));
  } catch {}
}

export function getRecentIdentities(): SyntheticIdentity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_IDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function getAllCreatedIdentities(): SyntheticIdentity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ALL_CREATED_IDS_KEY);
    if (raw) {
      const parsed: SyntheticIdentity[] = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback: seed from recent identities or saved profiles if empty
    const recent = getRecentIdentities();
    if (recent.length > 0) {
      localStorage.setItem(ALL_CREATED_IDS_KEY, JSON.stringify(recent));
      return recent;
    }
  } catch {}
  return [];
}

export function saveCreatedIdentity(identity: SyntheticIdentity): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAllCreatedIdentities();
    const filtered = existing.filter((p) => p.id !== identity.id);
    const updated = [identity, ...filtered].slice(0, 1000);
    localStorage.setItem(ALL_CREATED_IDS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('all_created_identities_updated'));
  } catch (e) {
    console.error('Failed to save created identity to history:', e);
  }
}

export function saveCreatedIdentities(identities: SyntheticIdentity[]): void {
  if (typeof window === 'undefined' || !identities.length) return;
  try {
    const existing = getAllCreatedIdentities();
    const map = new Map<string, SyntheticIdentity>();
    for (const item of identities) {
      map.set(item.id, item);
    }
    for (const item of existing) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    const updated = Array.from(map.values()).slice(0, 1000);
    localStorage.setItem(ALL_CREATED_IDS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('all_created_identities_updated'));
  } catch (e) {
    console.error('Failed to batch save created identities:', e);
  }
}

export function deleteCreatedIdentity(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAllCreatedIdentities();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(ALL_CREATED_IDS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('all_created_identities_updated'));
  } catch {}
}

export function clearAllCreatedIdentities(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ALL_CREATED_IDS_KEY);
    window.dispatchEvent(new Event('all_created_identities_updated'));
  } catch {}
}
