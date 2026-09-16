'use client';

import { useState, useEffect, useCallback } from 'react';
import { SyntheticIdentity } from '@/types';

const STORAGE_KEY = 'identity-creator-saved-profiles';

export function useProfileStore() {
  const [savedProfiles, setSavedProfiles] = useState<SyntheticIdentity[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setSavedProfiles(JSON.parse(raw));
        }
      } catch {
        // ignore corrupt storage
      }
      setLoaded(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProfiles));
    } catch {
      // storage may be unavailable
    }
  }, [savedProfiles, loaded]);

  const saveIdentity = useCallback((identity: SyntheticIdentity) => {
    setSavedProfiles(prev => {
      if (prev.some(p => p.id === identity.id)) return prev;
      return [identity, ...prev];
    });
  }, []);

  const updateIdentity = useCallback((id: string, patch: Partial<SyntheticIdentity>) => {
    setSavedProfiles(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const saveIdentities = useCallback((identities: SyntheticIdentity[]) => {
    setSavedProfiles(prev => {
      const existing = new Set(prev.map(p => p.id));
      const fresh = identities.filter(i => !existing.has(i.id));
      return [...fresh, ...prev];
    });
  }, []);

  const deleteIdentity = useCallback((id: string) => {
    setSavedProfiles(prev => prev.filter(p => p.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSavedProfiles([]);
  }, []);

  const getIdentity = useCallback(
    (id: string) => savedProfiles.find(p => p.id === id) || null,
    [savedProfiles]
  );

  return { savedProfiles, loaded, saveIdentity, updateIdentity, saveIdentities, deleteIdentity, clearAll, getIdentity };
}