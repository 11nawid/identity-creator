'use client';

import { SyntheticIdentity } from '@/types';
import { X, Mail, MapPin, Globe2, Clock, BriefcaseBusiness, ShieldCheck, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface ProfileDetailModalProps {
  identity: SyntheticIdentity | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between group">
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted"
      >
        {copied ? <Copy className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}

export function ProfileDetailModal({ identity, onClose }: ProfileDetailModalProps) {
  if (!identity) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', bounce: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-surface border-b border-border flex items-center justify-between px-5 py-3.5 z-10">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Profile Details
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Image
              src={identity.avatarUrl}
              alt={`${identity.displayName} avatar (synthetic)`}
              width={72}
              height={72}
              className="rounded-xl bg-muted"
              unoptimized
            />
            <div>
              <h3 className="text-lg font-semibold tracking-tight">{identity.displayName}</h3>
              <p className="text-sm text-muted-foreground font-mono">@{identity.online.username}</p>
              <p className="text-sm font-medium mt-0.5">{identity.professional.job}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{identity.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{identity.location.city}, {identity.location.country}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Globe2 className="h-4 w-4 text-muted-foreground" />
              <span>{identity.languages.join(' · ')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
              <span>{identity.professional.job} at {identity.professional.company}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{identity.timezone}</span>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-5 space-y-2.5">
            <h4 className="text-sm font-semibold mb-3">Extended Profile Details</h4>
            {identity.contact?.phone && <DetailRow label="Phone" value={identity.contact.phone} />}
            <DetailRow label="Age" value={`${identity.age} (born ${identity.dateOfBirth})`} />
            <DetailRow label="Nationality" value={identity.nationality} />
            <DetailRow label="Street" value={identity.location.street} />
            <DetailRow label="Postal Code" value={identity.location.postalCode} />
            <DetailRow
              label="Coordinates"
              value={`${identity.location.coordinates.lat}, ${identity.location.coordinates.lng}`}
            />
            {identity.physical?.bloodType && (
              <DetailRow
                label="Physical Traits"
                value={`Type ${identity.physical.bloodType} · ${identity.physical.height} · ${identity.physical.weight}`}
              />
            )}
            {identity.financial?.annualSalary && (
              <DetailRow
                label="Compensation & Credit"
                value={`${identity.financial.annualSalary} · Credit Score: ${identity.financial.creditScore}`}
              />
            )}
            {identity.educationDetails?.institution && (
              <DetailRow
                label="Alma Mater"
                value={`${identity.educationDetails.degree} at ${identity.educationDetails.institution}`}
              />
            )}
            {identity.digital?.ipv4 && <DetailRow label="Synthetic IP" value={identity.digital.ipv4} />}
            <DetailRow label="Company" value={identity.professional.company} />
            <DetailRow label="Department" value={identity.professional.department} />
          </div>

          <div className="border-t border-border-subtle pt-4">
            <h4 className="text-sm font-semibold mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {identity.professional.skills.map((s) => (
                <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-border-subtle pt-4">
            <h4 className="text-sm font-semibold mb-2">Interests</h4>
            <div className="flex flex-wrap gap-1.5">
              {identity.interests.map((i) => (
                <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  {i}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}