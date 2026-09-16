'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { AllIdentitiesPanel } from '@/components/all-identities-panel';
import { SearchModal } from '@/components/search-modal';
import {
  getAllCreatedIdentities,
  deleteCreatedIdentity,
  clearAllCreatedIdentities,
  setActiveIdentity,
} from '@/lib/active-identity-store';
import { useProfileStore } from '@/lib/use-profile-store';
import { SyntheticIdentity } from '@/types';

export default function IdentitiesPage() {
  const router = useRouter();
  const { savedProfiles } = useProfileStore();

  const [identities, setIdentities] = useState<SyntheticIdentity[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setIdentities(getAllCreatedIdentities());
    }, 0);

    const handleUpdate = () => {
      setIdentities(getAllCreatedIdentities());
    };

    window.addEventListener('all_created_identities_updated', handleUpdate);
    window.addEventListener('active_identity_updated', handleUpdate);
    window.addEventListener('recent_identities_updated', handleUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('all_created_identities_updated', handleUpdate);
      window.removeEventListener('active_identity_updated', handleUpdate);
      window.removeEventListener('recent_identities_updated', handleUpdate);
    };
  }, []);

  const handleOpenIdentity = (identity: SyntheticIdentity) => {
    setActiveIdentity(identity);
    router.push(`/identity/${identity.id}`);
  };

  const handleDelete = (id: string) => {
    deleteCreatedIdentity(id);
    setIdentities((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    clearAllCreatedIdentities();
    setIdentities([]);
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background">
      <Navbar
        activeTab="identities"
        onTabChange={(tab) => {
          if (tab === 'dashboard') router.push('/');
          else if (tab === 'create') router.push('/create');
          else if (tab === 'identities') router.push('/identities');
          else if (tab === 'saved') router.push('/saved');
          else if (tab === 'settings') router.push('/settings');
        }}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <main className="flex-1 w-full">
        {mounted && (
          <AllIdentitiesPanel
            identities={identities}
            onView={handleOpenIdentity}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            onCreateNew={() => router.push('/create')}
          />
        )}
      </main>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        savedProfiles={savedProfiles}
        onSelect={handleOpenIdentity}
      />
    </div>
  );
}
