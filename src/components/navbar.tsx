'use client';

import { useTheme } from '@/lib/theme-context';
import { NavTab } from '@/types';
import {
  Search,
  Moon,
  Sun,
  Settings,
  User,
  Fingerprint,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onSearchOpen: () => void;
}

export function Navbar({ activeTab, onTabChange, onSearchOpen }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  const tabs: { id: NavTab; label: string; href: string }[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/' },
    { id: 'create', label: 'Create', href: '/create' },
    { id: 'identities', label: 'Identities', href: '/identities' },
    { id: 'saved', label: 'Saved', href: '/saved' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ];

  return (
    <header className="hidden sm:block sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => onTabChange('dashboard')}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
              <Fingerprint className="h-4 w-4 text-background" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Identity Creator
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="nav-tab"
                    className="absolute inset-0 rounded-md bg-muted"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSearchOpen}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Search profiles"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => onTabChange('saved')}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Profile"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
