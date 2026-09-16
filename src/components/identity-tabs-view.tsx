'use client';

import { useState, useEffect, useRef } from 'react';
import { SyntheticIdentity, IdentityDetailTab } from '@/types';
import { useToast } from '@/lib/toast-context';
import { useProfileStore } from '@/lib/use-profile-store';
import { exportIdentity } from '@/lib/export';
import { ensureWorkingMailbox } from '@/lib/temp-mailbox';
import {
  User,
  MapPin,
  BriefcaseBusiness,
  CreditCard,
  Activity,
  Cpu,
  Sparkles,
  Shield,
  Copy,
  Bookmark,
  BookmarkCheck,
  Download,
  Share2,
  ExternalLink,
  HeartHandshake,
  GraduationCap,
  Wrench,
  Tag,
  Check,
  RefreshCw,
  AtSign,
  Inbox,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformUsernames } from '@/components/platform-usernames';
import { TempMailPanel } from '@/components/temp-mail-panel';
import { setActiveIdentity } from '@/lib/active-identity-store';

interface IdentityTabsViewProps {
  identity: SyntheticIdentity;
  onRegenerate?: () => void;
}

const TABS: { id: IdentityDetailTab; label: string; icon: React.ReactNode }[] = [
  { id: 'personal', label: 'Personal', icon: <User className="h-4 w-4" /> },
  { id: 'location', label: 'Location', icon: <MapPin className="h-4 w-4" /> },
  { id: 'career', label: 'Career', icon: <BriefcaseBusiness className="h-4 w-4" /> },
  { id: 'financial', label: 'Finance', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'physical', label: 'Physical', icon: <Activity className="h-4 w-4" /> },
  { id: 'digital', label: 'Digital', icon: <Cpu className="h-4 w-4" /> },
  { id: 'lifestyle', label: 'Lifestyle', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'ids', label: 'IDs & Docs', icon: <Shield className="h-4 w-4" /> },
  { id: 'inbox', label: 'Inbox', icon: <Inbox className="h-4 w-4" /> },
];

function FieldCard({
  label,
  value,
  subtext,
  isMono = false,
  badge,
}: {
  label: string;
  value: string | number | undefined | null;
  subtext?: string;
  isMono?: boolean;
  badge?: string;
}) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const displayVal = value !== undefined && value !== null && value !== '' ? String(value) : '—';

  const handleCopy = () => {
    navigator.clipboard.writeText(displayVal);
    setCopied(true);
    addToast(`${label} copied`);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={handleCopy}
      className="group relative rounded-xl border border-border bg-surface p-3.5 sm:p-4 transition-all hover:border-foreground/20 hover:bg-surface-hover active:scale-[0.99] cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {badge && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-muted-foreground">
                {badge}
              </span>
            )}
          </div>
          <p
            className={`text-sm sm:text-base font-semibold leading-snug text-foreground truncate ${
              isMono ? 'font-mono text-xs sm:text-sm' : ''
            }`}
            title={displayVal}
          >
            {displayVal}
          </p>
          {subtext && <p className="text-[11px] sm:text-xs text-muted-foreground">{subtext}</p>}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-60 sm:opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
          title="Copy value"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export function IdentityTabsView({ identity: initialIdentity, onRegenerate }: IdentityTabsViewProps) {
  const [identity, setIdentity] = useState<SyntheticIdentity>(initialIdentity);
  const [activeTab, setActiveTab] = useState<IdentityDetailTab>('personal');
  const [regeneratingTab, setRegeneratingTab] = useState<string | null>(null);
  const { savedProfiles, saveIdentity, updateIdentity, deleteIdentity } = useProfileStore();
  const { addToast } = useToast();

  const isSaved = savedProfiles.some((p) => p.id === identity.id);

  const handleSaveToggle = () => {
    if (isSaved) {
      deleteIdentity(identity.id);
      addToast('Profile removed from saved', 'info');
    } else {
      saveIdentity(identity);
      addToast('Profile saved successfully');
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(identity, null, 2));
    addToast('Full profile JSON copied');
  };

  // When a temporary mailbox is created, its address becomes the identity's
  // real primary email so one working inbox is shown everywhere.
  const handleEmailChange = (email: string) => {
    const updated = { ...identity, email };
    setIdentity(updated);
    setActiveIdentity(updated);
    if (isSaved) updateIdentity(identity.id, { email });
    addToast('Primary email set to working mailbox');
  };

  const handleEmailChangeRef = useRef<(email: string) => void>(() => {});
  useEffect(() => {
    handleEmailChangeRef.current = handleEmailChange;
  });

  // Guarantee the identity always has a real, working primary email: reuse the
  // persisted mailbox for this identity, or auto-create one (once) if missing.
  useEffect(() => {
    if (!identity.id) return;
    let cancelled = false;
    (async () => {
      // Defer to the microtask queue so no setState runs synchronously in the
      // effect body (react-hooks/set-state-in-effect).
      await Promise.resolve();
      if (cancelled) return;
      try {
        const mailbox = await ensureWorkingMailbox(identity.id);
        if (!cancelled && mailbox.emailAddress && mailbox.emailAddress !== identity.email) {
          handleEmailChangeRef.current(mailbox.emailAddress);
        }
      } catch {
        // Mail.tm is unavailable right now; the email stays as-is and the
        // Inbox tab offers a manual retry.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [identity.id, identity.email]);

  // Section-specific single tab regenerator
  const regenerateTabSection = async (tab: IdentityDetailTab) => {
    setRegeneratingTab(tab);
    try {
      const res = await fetch('/api/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: tab, identity }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = { ...identity, ...data.slice };
        setIdentity(updated);
        setActiveIdentity(updated);
        addToast(`${tab.charAt(0).toUpperCase() + tab.slice(1)} details regenerated`);
      } else {
        addToast('Regeneration failed', 'error');
      }
    } catch {
      addToast('Regeneration failed', 'error');
    } finally {
      setRegeneratingTab(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Header Banner */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src={identity.avatarUrl}
                alt={identity.displayName}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-border bg-muted object-cover shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-foreground text-[9px] sm:text-[10px] font-bold text-background uppercase shadow-xs">
                {identity.location.countryCode}
              </span>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                  {identity.displayName}
                </h1>
                <span className="rounded-full bg-foreground/10 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-foreground capitalize">
                  {identity.profileType}
                </span>
                <span className="rounded-full border border-border px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs text-muted-foreground font-mono">
                  {identity.age} y/o • {identity.gender}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-muted-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-foreground">{identity.professional.job}</span>
                <span>•</span>
                <span>{identity.professional.company}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{identity.location.city}, {identity.location.country}</span>
              </p>

              <p className="hidden sm:block text-xs font-mono text-muted-foreground/80 truncate">
                @{identity.online.username} • {identity.email}
              </p>
            </div>
          </div>

          {/* Quick Actions Row - On mobile only Regenerate is shown, no export or save */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2 sm:pt-0 sm:border-t-0 overflow-x-auto no-scrollbar">
            <button
              onClick={handleSaveToggle}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition-all active:scale-95 ${
                isSaved
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-border bg-background hover:bg-muted text-foreground'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-4 w-4" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={() => exportIdentity(identity, 'json')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-muted active:scale-95 transition-all"
              title="Download JSON"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-muted active:scale-95 transition-all"
              title="Copy Profile JSON"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Copy</span>
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-background hover:bg-foreground/90 active:scale-95 transition-all shrink-0 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        </div>

        {identity.bio && (
          <div className="mt-3.5 sm:mt-5 rounded-xl border border-border-subtle bg-muted/40 p-3 sm:p-4 text-xs sm:text-sm leading-relaxed text-foreground/90">
            <p className="font-serif italic">&ldquo;{identity.bio}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Sticky Native App Category Navigation Tabs */}
      <div className="sticky top-0 sm:top-14 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-2 bg-background/90 backdrop-blur-xl border-b border-border/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors active:scale-95 shrink-0 ${
                isActive
                  ? 'text-background font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="identity-tab-active-pill"
                  className="absolute inset-0 rounded-xl bg-foreground -z-10 shadow-xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          {/* TAB 1: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="hidden sm:flex items-center justify-between pb-1 border-b border-border/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personal Details
                </div>
                <button
                  onClick={() => regenerateTabSection('personal')}
                  disabled={regeneratingTab === 'personal'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Regenerate only personal details"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingTab === 'personal' ? 'animate-spin' : ''}`} />
                  {regeneratingTab === 'personal' ? 'Regenerating...' : 'Regenerate Personal'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                <FieldCard label="Full Name" value={identity.displayName} />
                <FieldCard label="First Name" value={identity.firstName} />
                <FieldCard label="Last Name" value={identity.lastName} />
                <FieldCard label="Date of Birth" value={identity.dateOfBirth} />
                <FieldCard label="Age" value={`${identity.age} years old`} />
                <FieldCard label="Gender" value={identity.gender} />
                <FieldCard label="Nationality" value={identity.nationality} />
                <FieldCard label="Languages" value={identity.languages.join(', ')} />
                <FieldCard label="Timezone" value={identity.timezone} isMono />
              </div>

              {/* Emergency Contact */}
              {identity.contact && (
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-rose-500" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Contact & Emergency Numbers
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                    <FieldCard label="Primary Phone" value={identity.contact.phone} isMono />
                    <FieldCard label="Primary Email" value={identity.email} isMono />
                    <FieldCard
                      label="Emergency Contact"
                      value={identity.contact.emergencyContact?.name}
                      subtext={`${identity.contact.emergencyContact?.relationship} • ${identity.contact.emergencyContact?.phone}`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LOCATION & MAP */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div className="hidden sm:flex items-center justify-between pb-1 border-b border-border/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Location & Map Details
                </div>
                <button
                  onClick={() => regenerateTabSection('location')}
                  disabled={regeneratingTab === 'location'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Regenerate only location and map details"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingTab === 'location' ? 'animate-spin' : ''}`} />
                  {regeneratingTab === 'location' ? 'Regenerating...' : 'Regenerate Location'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                <FieldCard label="Street Address" value={identity.location.street} />
                <FieldCard label="City" value={identity.location.city} />
                <FieldCard label="State / Region" value={identity.location.region} />
                <FieldCard label="Postal Code" value={identity.location.postalCode} isMono />
                <FieldCard label="Country" value={`${identity.location.country} (${identity.location.countryCode})`} />
                <FieldCard label="Country Code" value={identity.location.countryCode} isMono />
              </div>

              {/* Interactive Coordinates Map Box */}
              <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    Geographic Coordinates
                  </h3>
                  <a
                    href={`https://www.google.com/maps?q=${identity.location.coordinates.lat},${identity.location.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline"
                  >
                    View on Google Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldCard
                    label="Latitude"
                    value={identity.location.coordinates.lat}
                    isMono
                    badge="GPS"
                  />
                  <FieldCard
                    label="Longitude"
                    value={identity.location.coordinates.lng}
                    isMono
                    badge="GPS"
                  />
                </div>

                <div className="rounded-lg overflow-hidden border border-border h-64 w-full bg-muted flex items-center justify-center relative">
                  <iframe
                    title="Location Preview"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${identity.location.coordinates.lat},${identity.location.coordinates.lng}&z=14&output=embed`}
                    className="w-full h-full filter contrast-105"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAREER & EDUCATION */}
          {activeTab === 'career' && (
            <div className="space-y-6">
              <div className="hidden sm:flex items-center justify-between pb-1 border-b border-border/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Career & Education Details
                </div>
                <button
                  onClick={() => regenerateTabSection('career')}
                  disabled={regeneratingTab === 'career'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Regenerate only career and education details"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingTab === 'career' ? 'animate-spin' : ''}`} />
                  {regeneratingTab === 'career' ? 'Regenerating...' : 'Regenerate Career'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                <FieldCard label="Job Title" value={identity.professional.job} />
                <FieldCard label="Company" value={identity.professional.company} />
                <FieldCard label="Department" value={identity.professional.department} />
                <FieldCard label="Industry" value={identity.professional.industry} />
                <FieldCard label="Years of Experience" value={identity.professional.experience} />
                <FieldCard label="Profile Archetype" value={identity.profileType} />
              </div>

              {/* Skills */}
              <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  Professional Skills & Competencies
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {identity.professional.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              {identity.educationDetails && (
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Higher Education & Credentials
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                    <FieldCard
                      label="Degree Program"
                      value={identity.educationDetails.degree}
                    />
                    <FieldCard
                      label="Institution"
                      value={identity.educationDetails.institution}
                    />
                    <FieldCard
                      label="Graduation Year"
                      value={identity.educationDetails.graduationYear}
                      isMono
                    />
                  </div>

                  {identity.educationDetails.certifications &&
                    identity.educationDetails.certifications.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                          Licenses & Certifications
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {identity.educationDetails.certifications.map((cert) => (
                            <span
                              key={cert}
                              className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FINANCIAL & BANKING */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="hidden sm:flex items-center justify-between pb-1 border-b border-border/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Financial & Banking Details
                </div>
                <button
                  onClick={() => regenerateTabSection('financial')}
                  disabled={regeneratingTab === 'financial'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Regenerate only financial and banking details"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingTab === 'financial' ? 'animate-spin' : ''}`} />
                  {regeneratingTab === 'financial' ? 'Regenerating...' : 'Regenerate Financial'}
                </button>
              </div>
              {identity.financial ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  <FieldCard
                    label="Annual Salary"
                    value={identity.financial.annualSalary}
                    badge={identity.financial.currency.code}
                  />
                  <FieldCard
                    label="Credit Score"
                    value={identity.financial.creditScore}
                    subtext={identity.financial.creditRating}
                    badge={identity.financial.creditRating}
                  />
                  <FieldCard label="Primary Bank" value={identity.financial.bankName} />
                  <FieldCard
                    label="Currency"
                    value={`${identity.financial.currency.name} (${identity.financial.currency.symbol})`}
                  />
                  <FieldCard
                    label="Masked IBAN / Account"
                    value={identity.financial.accountNumberMasked}
                    isMono
                  />
                  <FieldCard
                    label="Payment Currency Code"
                    value={identity.financial.currency.code}
                    isMono
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No financial data available.</p>
              )}
            </div>
          )}

          {/* TAB 5: PHYSICAL & BIO */}
          {activeTab === 'physical' && (
            <div className="space-y-6">
              <div className="hidden sm:flex items-center justify-between pb-1 border-b border-border/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Physical & Biological Attributes
                </div>
                <button
                  onClick={() => regenerateTabSection('physical')}
                  disabled={regeneratingTab === 'physical'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Regenerate only physical attributes"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingTab === 'physical' ? 'animate-spin' : ''}`} />
                  {regeneratingTab === 'physical' ? 'Regenerating...' : 'Regenerate Physical'}
                </button>
              </div>
              {identity.physical ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  <FieldCard label="Height" value={identity.physical.height} />
                  <FieldCard label="Weight" value={identity.physical.weight} />
                  <FieldCard label="Blood Type" value={identity.physical.bloodType} badge="Medical" />
                  <FieldCard label="Eye Color" value={identity.physical.eyeColor} />
                  <FieldCard label="Hair Color" value={identity.physical.hairColor} />
                  <FieldCard label="Marital Status" value={identity.physical.maritalStatus} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No physical attributes available.</p>
              )}
            </div>
          )}

          {/* TAB 6: DIGITAL & SECURITY */}
          {activeTab === 'digital' && (
            <div className="space-y-4">
              <div className="hidden sm:flex items-center justify-between pb-1 border-b border-border/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Digital Profile & Security
                </div>
                <button
                  onClick={() => regenerateTabSection('digital')}
                  disabled={regeneratingTab === 'digital'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Regenerate only digital profile and network details"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingTab === 'digital' ? 'animate-spin' : ''}`} />
                  {regeneratingTab === 'digital' ? 'Regenerating...' : 'Regenerate Digital'}
                </button>
              </div>

              {/* Online Handles & Identity */}
              {identity.online && (
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <AtSign className="h-4 w-4 text-muted-foreground" />
                      Online Handles & Identity
                    </h3>
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 capitalize">
                      {identity.online.usernameStatus || 'available'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    <FieldCard
                      label="Primary Username"
                      value={`@${identity.online.username}`}
                      isMono
                    />
                    <FieldCard
                      label="Developer Handle"
                      value={identity.online.developerHandle}
                      isMono
                    />
                    <FieldCard
                      label="Gaming Handle"
                      value={identity.online.gamingHandle}
                      isMono
                    />
                    <FieldCard
                      label="Creator Handle"
                      value={identity.online.creatorHandle}
                      isMono
                    />
                  </div>

                  {identity.online.usernameVariations && identity.online.usernameVariations.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-border/50">
                      <p className="text-xs font-medium uppercase text-muted-foreground tracking-wider">
                        Available Handle Variations
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {identity.online.usernameVariations.map((v) => (
                          <span
                            key={v}
                            className="rounded-md border border-border bg-muted/60 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-mono text-foreground"
                          >
                            @{v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {identity.digital && (
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    Network & Technical Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                    <FieldCard label="IPv4 Address" value={identity.digital.ipv4} isMono />
                    <FieldCard label="MAC Address" value={identity.digital.macAddress} isMono />
                    <FieldCard
                      label="Crypto Wallet (Public Key)"
                      value={identity.digital.cryptoWallet}
                      isMono
                    />
                    <FieldCard
                      label="Client User-Agent"
                      value={identity.digital.userAgent}
                      isMono
                    />
                  </div>
                </div>
              )}

              {/* 9 core platforms — realtime availability checker & roster */}
              <PlatformUsernames
                platforms={identity.online.platforms}
                identity={identity}
              />
            </div>
          )}

          {/* TAB 7: LIFESTYLE & HOBBIES */}
          {activeTab === 'lifestyle' && (
            <div className="space-y-6">
              <div className="hidden sm:flex items-center justify-between pb-1 border-b border-border/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lifestyle & Interests
                </div>
                <button
                  onClick={() => regenerateTabSection('lifestyle')}
                  disabled={regeneratingTab === 'lifestyle'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Regenerate only lifestyle and hobby details"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingTab === 'lifestyle' ? 'animate-spin' : ''}`} />
                  {regeneratingTab === 'lifestyle' ? 'Regenerating...' : 'Regenerate Lifestyle'}
                </button>
              </div>
              {identity.lifestyle && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  <FieldCard label="Zodiac Sign" value={identity.lifestyle.zodiacSign} />
                  <FieldCard label="Pet / Companion" value={identity.lifestyle.pet} />
                  <FieldCard label="Favorite Cuisine" value={identity.lifestyle.favoriteCuisine} />
                  <FieldCard label="Music Preference" value={identity.lifestyle.musicGenre} />
                </div>
              )}

              {identity.lifestyle?.favoriteQuote && (
                <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-2">
                  <p className="text-xs uppercase font-medium text-muted-foreground tracking-wider">
                    Personal Motto / Favorite Quote
                  </p>
                  <p className="text-sm font-serif italic text-foreground">
                    &ldquo;{identity.lifestyle.favoriteQuote}&rdquo;
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Interests & Leisure Activities
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {identity.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: IDENTIFICATION */}
          {activeTab === 'ids' && (
            <div className="space-y-6">
              <div className="hidden sm:flex items-center justify-between pb-1 border-b border-border/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Government Identification
                </div>
                <button
                  onClick={() => regenerateTabSection('ids')}
                  disabled={regeneratingTab === 'ids'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors disabled:opacity-50"
                  title="Regenerate only government identification documents"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingTab === 'ids' ? 'animate-spin' : ''}`} />
                  {regeneratingTab === 'ids' ? 'Regenerating...' : 'Regenerate IDs'}
                </button>
              </div>
              {identity.governmentIds ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
                  <FieldCard
                    label="National ID / SSN"
                    value={identity.governmentIds.nationalIdMasked}
                    isMono
                  />
                  <FieldCard
                    label="Passport Number"
                    value={identity.governmentIds.passportMasked}
                    isMono
                  />
                  <FieldCard
                    label="Driver License"
                    value={identity.governmentIds.driverLicense}
                    isMono
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No identification records found.</p>
              )}
            </div>
          )}

          {/* TAB 9: INBOX */}
          {activeTab === 'inbox' && (
            <TempMailPanel identityId={identity.id} onEmailChange={handleEmailChange} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}