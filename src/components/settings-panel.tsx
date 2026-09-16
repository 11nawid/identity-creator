'use client';

import { useTheme } from '@/lib/theme-context';
import { Moon, Sun, Trash2, Info, Download, Shield, FileText, Fingerprint } from 'lucide-react';
import { SyntheticIdentity } from '@/types';
import { exportIdentities } from '@/lib/export';
import { useToast } from '@/lib/toast-context';
import Link from 'next/link';

interface SettingsPanelProps {
  savedProfiles: SyntheticIdentity[];
  onClearAll: () => void;
}

export function SettingsPanel({ savedProfiles, onClearAll }: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-24 sm:pb-16 w-full space-y-4 sm:space-y-6">
      <div className="pb-3 sm:pb-4 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block mt-0.5">Manage preferences, appearance, and exported data.</p>
      </div>

      <div className="space-y-3.5 sm:space-y-4">
        <div className="rounded-2xl border border-border bg-surface shadow-xs">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-subtle">
            <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Currently {theme === 'dark' ? 'dark' : 'light'} mode
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-border px-3.5 py-2 text-xs sm:text-sm font-medium transition-all hover:border-muted-foreground/50 hover:text-foreground active:scale-95"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-xs">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-subtle">
            <h3 className="text-sm font-semibold text-foreground">Data</h3>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Saved Profiles</p>
                <p className="text-xs text-muted-foreground">
                  {savedProfiles.length} saved
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (savedProfiles.length === 0) {
                      addToast('No profiles to export', 'info');
                      return;
                    }
                    exportIdentities(savedProfiles, 'json');
                    addToast('Export complete');
                  }}
                  disabled={savedProfiles.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium transition-all hover:border-muted-foreground/50 disabled:opacity-40 active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
                <button
                  onClick={() => {
                    onClearAll();
                    addToast('All profiles deleted', 'info');
                  }}
                  disabled={savedProfiles.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-destructive transition-all hover:border-destructive/50 disabled:opacity-40 active:scale-95"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:block rounded-2xl border border-border bg-surface shadow-xs">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-subtle">
            <h3 className="text-sm font-semibold">About</h3>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Identity Generator generates complete, realistic profiles for testing, application development,
                database seeding, and user interface prototypes.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-xs">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-subtle">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
          </div>
          <div className="p-4 sm:p-5 space-y-1">
            <Link
              href="/about"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Fingerprint className="h-4 w-4 shrink-0" />
              <span>About</span>
            </Link>
            <Link
              href="/privacy"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Privacy Policy</span>
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Terms of Service</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}