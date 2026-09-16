'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { SearchModal } from '@/components/search-modal';
import { GeneratingSkeleton } from '@/components/skeleton';
import { generateIdentityAI } from '@/lib/generator';
import { setActiveIdentity } from '@/lib/active-identity-store';
import { ensureWorkingEmail } from '@/lib/temp-mailbox';
import { useProfileStore } from '@/lib/use-profile-store';
import { useToast } from '@/lib/toast-context';
import {
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { savedProfiles } = useProfileStore();

  const [isGeneratingInstant, setIsGeneratingInstant] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleInstantGenerate = async () => {
    setIsGeneratingInstant(true);
    try {
      const identity = await ensureWorkingEmail(
        await generateIdentityAI({
          country: 'random',
          gender: 'random',
          profileType: 'random',
          ageRange: [20, 65],
          seniorityLevel: 'auto',
          educationLevel: 'auto',
          personalityTone: 'auto',
          maritalStatus: 'auto',
        }),
      );
      setActiveIdentity(identity);
      addToast('Instant identity generated');
      router.push(`/identity/${identity.id}`);
    } catch (err) {
      console.error('Instant generation error:', err);
      addToast('Failed to generate identity', 'error');
      setIsGeneratingInstant(false);
    }
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

      <main className="max-w-md mx-auto px-6 pt-16 sm:pt-24 pb-28 sm:pb-16 w-full flex-1 flex flex-col justify-center items-center text-center">
        {isGeneratingInstant ? (
          <div className="rounded-3xl border border-border bg-surface p-8 text-center space-y-4 shadow-sm w-full">
            <GeneratingSkeleton />
            <p className="text-sm font-semibold text-foreground">
              Creating identity...
            </p>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-xs">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Identity Creator
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate realistic test profiles with one tap.
              </p>
            </div>

            <div className="pt-2 w-full">
              <Link
                href="/create"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <span>Create Identity</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="pt-4 space-y-2">
              <p className="text-xs text-muted-foreground/70">
                Free &amp; open-source. Works offline. No API key needed.
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground/50">
                <span>100+ countries</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span>Batch generation</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <span>Export to JSON</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        savedProfiles={savedProfiles}
        onSelect={(target) => {
          setActiveIdentity(target);
          router.push(`/identity/${target.id}`);
        }}
      />

      <footer className="hidden sm:flex items-center justify-center gap-4 pb-6 text-xs text-muted-foreground">
        <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
      </footer>
    </div>
  );
}