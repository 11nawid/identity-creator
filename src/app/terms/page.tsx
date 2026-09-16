'use client';

import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { useProfileStore } from '@/lib/use-profile-store';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
            <FileText className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last updated: September 17, 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Acceptance of Terms</h2>
            <p>
              By accessing or using Identity Creator, you agree to be bound by these Terms of Service.
              If you do not agree, do not use the application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Description of Service</h2>
            <p>
              Identity Creator is an open-source tool that generates synthetic (fictional) identities
              for use in software testing, prototyping, development, and creative projects. All data
              generated is entirely fictional and not connected to any real person.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Intended Use</h2>
            <p>This tool is designed for:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Software development and testing</li>
              <li>UI/UX prototyping and mockups</li>
              <li>Database seeding for development</li>
              <li>Educational and creative purposes</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Prohibited Use</h2>
            <p>You agree not to use generated identities to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Impersonate real individuals</li>
              <li>Conduct fraud, phishing, or any illegal activity</li>
              <li>Evade identity verification systems for malicious purposes</li>
              <li>Spam or create fake accounts on platforms to harm others</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Open Source</h2>
            <p>
              Identity Creator is released under the MIT License. You are free to use, modify, and
              distribute this software in accordance with the license terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Disclaimer of Warranties</h2>
            <p>
              This software is provided &quot;as is&quot; without warranty of any kind, express or
              implied, including but not limited to the warranties of merchantability, fitness for a
              particular purpose, and noninfringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Limitation of Liability</h2>
            <p>
              In no event shall the authors or contributors be liable for any claim, damages, or other
              liability arising from the use of this software or the data it generates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Third-Party Services</h2>
            <p>
              Optional integrations (Google Gemini API, Mail.tm) are subject to their own terms of
              service. Use of these services is at your own discretion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Changes to Terms</h2>
            <p>
              These terms may be updated from time to time. Continued use of the application after
              changes constitutes acceptance of the new terms.
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
