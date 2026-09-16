'use client';

import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useProfileStore } from '@/lib/use-profile-store';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const router = useRouter();
  const { savedProfiles } = useProfileStore();

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
        onSearchOpen={() => {}}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-28 sm:pb-16 w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Shield className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: September 17, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Data Collection</h2>
            <p>
              <strong className="text-foreground">We collect zero data.</strong> Identity Creator is a
              client-side web application. There is no analytics, no tracking, no telemetry, and no
              server-side data storage.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>No user accounts or registration</li>
              <li>No cookies set by this application</li>
              <li>No third-party analytics (Google Analytics, Mixpanel, etc.)</li>
              <li>No advertising or tracking scripts</li>
              <li>No phone-home or beacon requests</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Generated Data</h2>
            <p>
              All synthetic identities are generated <strong className="text-foreground">locally in your
              browser</strong> or on your self-hosted server. The data never leaves your machine unless
              you explicitly choose to export it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Local Storage</h2>
            <p>Identity Creator uses your browser&apos;s LocalStorage to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Remember your saved profiles</li>
              <li>Store your theme preference (dark/light)</li>
              <li>Persist temporary mailbox credentials</li>
            </ul>
            <p>
              This data stays entirely on your device. Clearing your browser data will remove it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Third-Party Services</h2>

            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Google Gemini API (Optional)</h3>
              <p>
                If you provide a <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">GEMINI_API_KEY</code>,
                Identity Creator will send prompts to Google&apos;s Gemini API to generate richer
                biographies and profile details.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Only triggered when you explicitly enable AI generation and provide your own API key</li>
                <li>Data sent: the generation prompt (includes name, age, country for context)</li>
                <li>Data stored by us: nothing. Your API key stays in your local .env file.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Mail.tm (Temporary Email)</h3>
              <p>
                Identity Creator can create disposable email addresses via the Mail.tm public API.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Data sent: a randomly generated email address and password</li>
                <li>Purpose: to provide a working temporary inbox for generated identities</li>
                <li>Data stored by us: nothing. Mailbox credentials are stored only in your browser.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-foreground">DiceBear (Avatars)</h3>
              <p>
                Identity avatars are generated via DiceBear&apos;s public API. Data sent: style and
                seed parameters (no personal data). Nothing is stored.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Your Data, Your Control</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All generated profiles are stored locally in your browser</li>
              <li>You can export data in JSON, CSV, TXT, or PDF at any time</li>
              <li>You can delete any profile at any time</li>
              <li>Clearing browser data removes all stored profiles</li>
              <li>No data survives a browser reset</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Changes to This Policy</h2>
            <p>
              If this privacy policy changes, the updated version will be posted in this page. Since the
              app has no backend, there are no push notifications or email updates.
            </p>
          </section>

          <div className="pt-4 border-t border-border">
            <Link
              href="/"
              className="text-foreground font-medium hover:underline"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
