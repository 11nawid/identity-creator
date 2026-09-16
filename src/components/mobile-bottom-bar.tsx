'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Users, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function MobileBottomBar() {
  const pathname = usePathname();

  const isHomeActive = pathname === '/';
  const isCreateActive = pathname === '/create';
  const isIdentitiesActive = pathname === '/identities' || pathname?.startsWith('/identity/');

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Sparkles,
      isActive: isHomeActive,
    },
    {
      label: 'Create',
      href: '/create',
      icon: PlusCircle,
      isActive: isCreateActive,
    },
    {
      label: 'Identities',
      href: '/identities',
      icon: Users,
      isActive: isIdentitiesActive,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border/80 bg-background/95 backdrop-blur-2xl px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] transition-all shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_28px_rgba(0,0,0,0.4)]"
    >
      <div className="grid grid-cols-3 items-center gap-1.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-center gap-1 py-2 px-2 rounded-2xl transition-all active:scale-95 focus:outline-hidden ${
                active
                  ? 'bg-foreground text-background font-semibold shadow-xs'
                  : 'bg-surface border border-border/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-xs tracking-tight whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
