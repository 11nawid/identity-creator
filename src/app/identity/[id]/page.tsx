'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { IdentityTabsView } from '@/components/identity-tabs-view';
import { SearchModal } from '@/components/search-modal';
import { GeneratingSkeleton } from '@/components/skeleton';
import { getIdentityById, setActiveIdentity } from '@/lib/active-identity-store';
import { useProfileStore } from '@/lib/use-profile-store';
import { generateIdentityAI } from '@/lib/generator';
import { ensureWorkingEmail } from '@/lib/temp-mailbox';
import { SyntheticIdentity } from '@/types';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function IdentityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { savedProfiles } = useProfileStore();

  const [storedIdentity, setStoredIdentity] = useState<SyntheticIdentity | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setStoredIdentity(getIdentityById(resolvedParams.id));
    }, 0);

    const handleUpdate = () => {
      const found = getIdentityById(resolvedParams.id);
      if (found) setStoredIdentity(found);
    };
    window.addEventListener('active_identity_updated', handleUpdate);
    window.addEventListener('recent_identities_updated', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('active_identity_updated', handleUpdate);
      window.removeEventListener('recent_identities_updated', handleUpdate);
    };
  }, [resolvedParams.id]);

  const identity = storedIdentity;

  const handleRegenerate = async () => {
    if (!identity) return;
    setIsRegenerating(true);
    try {
      const regenerated = await ensureWorkingEmail(
        await generateIdentityAI({
          gender: identity.gender,
          profileType: identity.profileType,
        }),
      );
      setActiveIdentity(regenerated);
      router.push(`/identity/${regenerated.id}`);
    } catch (e) {
      console.error('Regeneration error:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOpenIdentity = (target: SyntheticIdentity) => {
    setActiveIdentity(target);
    router.push(`/identity/${target.id}`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background">
      <Navbar
        activeTab="dashboard"
        onTabChange={(tab) => {
          if (tab === 'dashboard') router.push('/');
          else if (tab === 'create') router.push('/create');
          else if (tab === 'identities') router.push('/identities');
          else if (tab === 'saved') router.push('/saved');
          else if (tab === 'settings') router.push('/settings');
        }}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-24 sm:pb-12 w-full flex-1 space-y-4 sm:space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-95 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <Link
            href="/create"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline active:scale-95 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Create Another</span>
          </Link>
        </div>

        {!mounted || isRegenerating ? (
          <div className="space-y-4 max-w-2xl mx-auto py-12 text-center">
            <GeneratingSkeleton />
            <p className="text-sm font-semibold text-foreground">
              {isRegenerating ? 'Generating profile...' : 'Loading...'}
            </p>
          </div>
        ) : identity ? (
          <IdentityTabsView identity={identity} onRegenerate={handleRegenerate} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Identity Not Found</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                This identity profile session has expired or was not found in your local history.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/create"
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
              >
                Create New Profile
              </Link>
            </div>
          </div>
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