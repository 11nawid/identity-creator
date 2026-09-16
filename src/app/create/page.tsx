'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { SearchModal } from '@/components/search-modal';
import { GeneratingSkeleton } from '@/components/skeleton';
import { GeneratorControls } from '@/components/generator-controls';
import { GeneratorConfig, SyntheticIdentity } from '@/types';
import { generateIdentityAI, DEFAULT_GENERATOR_CONFIG } from '@/lib/generator';
import { setActiveIdentity } from '@/lib/active-identity-store';
import { ensureWorkingEmail } from '@/lib/temp-mailbox';
import { useProfileStore } from '@/lib/use-profile-store';
import { useToast } from '@/lib/toast-context';
import { Sparkles, ArrowRight, RotateCcw, SlidersHorizontal } from 'lucide-react';

export default function CreatePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { savedProfiles } = useProfileStore();

  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_GENERATOR_CONFIG);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleOpenIdentity = (identity: SyntheticIdentity) => {
    setActiveIdentity(identity);
    router.push(`/identity/${identity.id}`);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const identity = await ensureWorkingEmail(await generateIdentityAI(config));
      setActiveIdentity(identity);
      addToast('Identity generated with working email');
      router.push(`/identity/${identity.id}`);
    } catch (err) {
      console.error('Generation failed:', err);
      addToast('Failed to generate identity. Please try again.', 'error');
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_GENERATOR_CONFIG);
    addToast('Filters reset to defaults', 'info');
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background">
      <Navbar
        activeTab="create"
        onTabChange={(tab) => {
          if (tab === 'dashboard') router.push('/');
          else if (tab === 'create') router.push('/create');
          else if (tab === 'identities') router.push('/identities');
          else if (tab === 'saved') router.push('/saved');
          else if (tab === 'settings') router.push('/settings');
        }}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-12 pb-24 sm:pb-12 w-full flex-1">
        {isGenerating ? (
          <div className="space-y-4 max-w-2xl mx-auto py-12 text-center">
            <GeneratingSkeleton />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Generating Identity...
            </h2>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-8">
            {/* Page Header */}
            <div className="border-b border-border pb-3 sm:pb-4 flex items-center justify-between">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                Create Identity
              </h1>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-95 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* GENERATOR CONTROLS */}
            <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-8 shadow-xs">
              <GeneratorControls
                config={config}
                onConfigChange={setConfig}
                showAdvanced={showAdvanced}
              />
            </div>

            {/* TOGGLE ADVANCED FILTERS */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-3.5 text-left transition-colors hover:bg-surface-hover active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-foreground shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {showAdvanced ? 'Hide Advanced Options' : 'Advanced Options'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {showAdvanced ? 'Collapse' : 'Expand'}
              </span>
            </button>

            {/* SINGLE GENERATE ACTION BUTTON */}
            <div className="pt-2 pb-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-background transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:opacity-50 shadow-md"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Generate Identity</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
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