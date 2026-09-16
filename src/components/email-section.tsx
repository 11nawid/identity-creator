'use client';

import { SyntheticIdentity } from '@/types';
import { useToast } from '@/lib/toast-context';
import { Mail, Copy, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EmailSectionProps {
  identity: SyntheticIdentity;
  onRegenerate: () => void;
}

export function EmailSection({ identity, onRegenerate }: EmailSectionProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(identity.email);
    setCopied(true);
    addToast('Email copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Test Email</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Synthetic test email address.
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Test Data</span>
        </div>

        <motion.div
          key={identity.email}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-muted px-4 py-3 flex items-center justify-between"
        >
          <span className="text-sm font-mono font-medium">{identity.email}</span>
        </motion.div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyEmail}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-muted-foreground/50 hover:text-foreground"
          >
            {copied ? <Copy className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-muted-foreground/50 hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </motion.button>
        </div>
      </div>
    </div>
  );
}
