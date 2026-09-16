'use client';

import { SyntheticIdentity } from '@/types';
import { useToast } from '@/lib/toast-context';
import {
  Mail,
  MapPin,
  Globe2,
  BriefcaseBusiness,
  Clock,
  ShieldCheck,
  Copy,
  Save,
  RefreshCw,
  AtSign,
  Phone,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExportMenu } from '@/components/export-menu';

interface IdentityCardProps {
  identity: SyntheticIdentity;
  onRegenerate: () => void;
  onSave: () => void;
}

function InfoRow({ icon, label, value, onCopy }: { icon: React.ReactNode; label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted hover:text-foreground"
        title="Copy"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function IdentityCard({ identity, onRegenerate, onSave }: IdentityCardProps) {
  const { addToast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      <div className="px-6 pt-5 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Profile Details
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-start gap-4">
          <motion.div
            key={identity.avatarUrl}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="relative shrink-0"
          >
            <Image
              src={identity.avatarUrl}
              alt={`${identity.displayName} avatar (synthetic)`}
              width={80}
              height={80}
              className="rounded-xl bg-muted"
              unoptimized
            />
          </motion.div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-lg font-semibold tracking-tight">{identity.displayName}</h3>
            <p className="text-sm text-muted-foreground font-mono">@{identity.online.username}</p>
            <p className="text-sm font-medium mt-0.5">{identity.professional.job}</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {identity.location.city}, {identity.location.country}
            </p>
            {/* Quick Status Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {identity.financial?.annualSalary && (
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono font-medium text-foreground">
                  {identity.financial.annualSalary}
                </span>
              )}
              {identity.financial?.creditScore && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-medium">
                  CS: {identity.financial.creditScore}
                </span>
              )}
              {identity.physical?.bloodType && (
                <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-medium">
                  {identity.physical.bloodType}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border-subtle">
          {identity.contact?.phone && (
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={identity.contact.phone}
              onCopy={() => copyToClipboard(identity.contact.phone, 'Phone')}
            />
          )}
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={identity.email}
            onCopy={() => copyToClipboard(identity.email, 'Email')}
          />
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={`${identity.location.city}, ${identity.location.country}`}
            onCopy={() => copyToClipboard(`${identity.location.city}, ${identity.location.country}`, 'Location')}
          />
          <InfoRow
            icon={<Globe2 className="h-4 w-4" />}
            label="Languages"
            value={identity.languages.join(' · ')}
            onCopy={() => copyToClipboard(identity.languages.join(', '), 'Languages')}
          />
          <InfoRow
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            label="Occupation"
            value={identity.professional.job}
            onCopy={() => copyToClipboard(identity.professional.job, 'Occupation')}
          />
          <InfoRow
            icon={<Clock className="h-4 w-4" />}
            label="Timezone"
            value={identity.timezone}
            onCopy={() => copyToClipboard(identity.timezone, 'Timezone')}
          />
          <InfoRow
            icon={<AtSign className="h-4 w-4" />}
            label="Username"
            value={identity.online.username}
            onCopy={() => copyToClipboard(identity.online.username, 'Username')}
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border-subtle flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <Save className="h-4 w-4" />
          Save
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRegenerate}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-muted-foreground/50 hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </motion.button>
        <ExportMenu identity={identity} />
      </div>
    </motion.div>
  );
}
