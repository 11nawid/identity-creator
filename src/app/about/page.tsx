'use client';

import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useProfileStore } from '@/lib/use-profile-store';
import { Fingerprint, ExternalLink, Shield, FileText, Heart } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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
            <Fingerprint className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">About Identity Creator</h1>
            <p className="text-sm text-muted-foreground">Open-source synthetic identity generator</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">What is Identity Creator?</h2>
            <p>
              Identity Creator is an open-source tool that generates realistic, fully-formed fictional
              identities for software testing, prototyping, and development. Each generated profile
              includes a complete set of details — name, address, career, financial data, physical
              attributes, platform usernames, and more.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">How It Works</h2>
            <p>
              The app runs entirely in your browser. It uses bundled data banks for names, professions,
              and locations, combined with public APIs for avatars (DiceBear) and geocoding. No data
              is sent to external servers unless you optionally configure an AI API key.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Key Features</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Offline-first — works without any API key</li>
              <li>Optional AI enhancement via Google Gemini</li>
              <li>Batch generation (5, 10, 25, or 50 identities at once)</li>
              <li>Quick presets (Tech Founder, Student, Digital Nomad, etc.)</li>
              <li>Temporary disposable email via Mail.tm</li>
              <li>Export to JSON, CSV, TXT, or PDF</li>
              <li>Dark and light theme support</li>
              <li>Local storage — all data stays on your device</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Tech Stack</h2>
            <div className="grid grid-cols-2 gap-2 ml-2">
              <span>Next.js 16</span>
              <span>React 19</span>
              <span>TypeScript 5</span>
              <span>Tailwind CSS 4</span>
              <span>Framer Motion</span>
              <span>Lucide Icons</span>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Open Source</h2>
            <p>
              Identity Creator is free and open-source software, released under the MIT License. You
              are welcome to contribute, report issues, or fork the project for your own use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Legal</h2>
            <div className="flex flex-col gap-2 ml-2">
              <Link
                href="/privacy"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Privacy Policy</span>
              </Link>
              <Link
                href="/terms"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Terms of Service</span>
              </Link>
              <a
                href="https://github.com/11nawid/identity-creator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on GitHub</span>
              </a>
            </div>
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
