'use client';

import { SyntheticIdentity, UsernameStatus } from '@/types';
import { useToast } from '@/lib/toast-context';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface UsernameSectionProps {
  identity: SyntheticIdentity;
}

export function UsernameSection({ identity }: UsernameSectionProps) {
  const { addToast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyUsername = (username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedId(username);
    addToast('Username copied to clipboard');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const statusConfig: Record<UsernameStatus, { label: string; className: string }> = {
    available: { label: 'Available', className: 'bg-success/10 text-success' },
    taken: { label: 'Taken', className: 'bg-destructive/10 text-destructive' },
    checking: { label: 'Checking', className: 'bg-warning/10 text-warning' },
    unknown: { label: 'Unknown', className: 'bg-muted text-muted-foreground' },
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Username Generator</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Multiple username suggestions for this identity.
        </p>
      </div>

      <div className="p-5 space-y-2">
        {identity.online.usernameVariations.map((username, idx) => {
          const status = idx === 0 ? identity.online.usernameStatus : (['available', 'unknown', 'taken'] as UsernameStatus[])[idx % 3];
          const config = statusConfig[status];
          const isCopied = copiedId === username;

          return (
            <motion.div
              key={username}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 group hover:border-muted-foreground/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-medium">{username}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${config.className}`}>
                  {config.label}
                </span>
              </div>
              <button
                onClick={() => copyUsername(username)}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted hover:text-foreground"
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
