'use client';

import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { SettingsPanel } from '@/components/settings-panel';
import { useProfileStore } from '@/lib/use-profile-store';
import { useToast } from '@/lib/toast-context';

export default function SettingsPage() {
  const router = useRouter();
  const { savedProfiles, clearAll } = useProfileStore();
  const { addToast } = useToast();

  return (
    <div className="flex flex-col flex-1">
      <Navbar
        activeTab="settings"
        onTabChange={(tab) => {
          if (tab === 'dashboard') router.push('/');
          else if (tab === 'create') router.push('/create');
          else if (tab === 'identities') router.push('/identities');
          else if (tab === 'saved') router.push('/saved');
          else if (tab === 'settings') router.push('/settings');
        }}
        onSearchOpen={() => {}}
      />
      <SettingsPanel
        savedProfiles={savedProfiles}
        onClearAll={() => {
          clearAll();
          addToast('All profiles cleared', 'info');
        }}
      />
    </div>
  );
}