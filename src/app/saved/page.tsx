'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { SavedProfilesPanel } from '@/components/saved-profiles';
import { SearchModal } from '@/components/search-modal';
import { useProfileStore } from '@/lib/use-profile-store';
import { useToast } from '@/lib/toast-context';
import { setActiveIdentity } from '@/lib/active-identity-store';
import { SyntheticIdentity } from '@/types';

export default function SavedPage() {
  const router = useRouter();
  const { savedProfiles, deleteIdentity } = useProfileStore();
  const { addToast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleOpenIdentity = (identity: SyntheticIdentity) => {
    setActiveIdentity(identity);
    router.push(`/identity/${identity.id}`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background">
      <Navbar
        activeTab="saved"
        onTabChange={(tab) => {
          if (tab === 'dashboard') router.push('/');
          else if (tab === 'create') router.push('/create');
          else if (tab === 'identities') router.push('/identities');
          else if (tab === 'saved') router.push('/saved');
          else if (tab === 'settings') router.push('/settings');
        }}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <SavedProfilesPanel
        savedProfiles={savedProfiles}
        onView={handleOpenIdentity}
        onDelete={(id) => {
          deleteIdentity(id);
          addToast('Profile deleted', 'info');
        }}
        onCreateIdentity={() => router.push('/create')}
      />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        savedProfiles={savedProfiles}
        onSelect={handleOpenIdentity}
      />
    </div>
  );
}