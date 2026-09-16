'use client';

import { useState } from 'react';
import { SyntheticIdentity } from '@/types';
import { useToast } from '@/lib/toast-context';
import {
  User,
  MapPin,
  Globe2,
  BriefcaseBusiness,
  ChevronDown,
  Copy,
  ShieldCheck,
  Wrench,
  Tag,
  Phone,
  CreditCard,
  Activity,
  Cpu,
  Sparkles,
  GraduationCap,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoSectionsProps {
  identity: SyntheticIdentity;
}

function Section({
  icon,
  title,
  badge,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-surface-hover"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </div>
          <span className="text-sm font-semibold">{title}</span>
          {badge && (
            <span className="text-[10px] bg-muted text-muted-foreground font-mono px-2 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-2 space-y-2.5 border-t border-border-subtle">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  value,
  suffix,
  isMono = false,
}: {
  label: string;
  value: string | number | undefined;
  suffix?: string;
  isMono?: boolean;
}) {
  const { addToast } = useToast();
  const displayVal = value !== undefined && value !== null ? String(value) : '—';
  const fullValue = suffix ? `${displayVal}${suffix}` : displayVal;

  return (
    <div className="flex items-center justify-between group py-0.5">
      <div className="min-w-0 pr-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-sm font-medium truncate ${isMono ? 'font-mono text-xs' : ''}`}>
          {displayVal}
          {suffix}
        </p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(fullValue);
          addToast(`${label} copied`);
        }}
        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted hover:text-foreground shrink-0"
        title="Copy"
      >
        <Copy className="h-3 w-3" />
      </button>
    </div>
  );
}

export function InfoSections({ identity }: InfoSectionsProps) {
  return (
    <div className="space-y-3">
      {/* 1. Personal */}
      <Section
        icon={<User className="h-3.5 w-3.5" />}
        title="Personal Profile"
        defaultOpen
      >
        <Field label="Full Legal Name" value={identity.displayName} />
        <Field label="First Name" value={identity.firstName} />
        <Field label="Last Name" value={identity.lastName} />
        <Field label="Date of Birth" value={identity.dateOfBirth} />
        <Field label="Age" value={String(identity.age)} suffix=" years old" />
        <Field label="Nationality" value={identity.nationality} />
        <Field label="Languages" value={identity.languages.join(', ')} />
        <Field label="Timezone" value={identity.timezone} />
      </Section>

      {/* 2. Contact & Emergency */}
      {identity.contact && (
        <Section
          icon={<Phone className="h-3.5 w-3.5" />}
          title="Contact & Emergency"
          defaultOpen
        >
          <Field label="Primary Phone" value={identity.contact.phone} isMono />
          <Field label="Primary Email" value={identity.email} isMono />
          <div className="pt-2 border-t border-border-subtle/50">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <HeartHandshake className="h-3 w-3" />
              Emergency Contact
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/40 p-2.5 rounded-lg">
              <Field label="Contact Name" value={identity.contact.emergencyContact?.name} />
              <Field label="Relationship" value={identity.contact.emergencyContact?.relationship} />
              <Field label="Emergency Phone" value={identity.contact.emergencyContact?.phone} isMono />
            </div>
          </div>
        </Section>
      )}

      {/* 3. Physical & Demographics */}
      {identity.physical && (
        <Section
          icon={<Activity className="h-3.5 w-3.5" />}
          title="Physical & Demographics"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Blood Type" value={identity.physical.bloodType} />
            <Field label="Marital Status" value={identity.physical.maritalStatus} />
            <Field label="Height" value={identity.physical.height} />
            <Field label="Weight" value={identity.physical.weight} />
            <Field label="Eye Color" value={identity.physical.eyeColor} />
            <Field label="Hair Color" value={identity.physical.hairColor} />
          </div>
        </Section>
      )}

      {/* 4. Location & Coordinates */}
      <Section
        icon={<MapPin className="h-3.5 w-3.5" />}
        title="Location & Coordinates"
      >
        <Field label="Street Address" value={identity.location.street} />
        <Field label="City" value={identity.location.city} />
        <Field label="Region / State" value={identity.location.region} />
        <Field label="Postal Code" value={identity.location.postalCode} />
        <Field label="Country" value={`${identity.location.country} (${identity.location.countryCode})`} />
        <div className="bg-muted/40 p-2.5 rounded-lg mt-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Exact Geographic Coordinates
            </p>
            <p className="text-xs font-mono font-medium">
              Latitude: {identity.location.coordinates.lat} | Longitude: {identity.location.coordinates.lng}
            </p>
          </div>
          <a
            href={`https://www.google.com/maps?q=${identity.location.coordinates.lat},${identity.location.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-foreground underline hover:opacity-75"
          >
            Open Map ↗
          </a>
        </div>
      </Section>

      {/* 5. Financial & Banking */}
      {identity.financial && (
        <Section
          icon={<CreditCard className="h-3.5 w-3.5" />}
          title="Financial & Banking"
          badge={`Score: ${identity.financial.creditScore}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Annual Compensation" value={identity.financial.annualSalary} />
            <Field
              label="Credit Score"
              value={`${identity.financial.creditScore} (${identity.financial.creditRating})`}
            />
            <Field label="Primary Bank" value={identity.financial.bankName} />
            <Field
              label="Currency"
              value={`${identity.financial.currency.name} (${identity.financial.currency.code} ${identity.financial.currency.symbol})`}
            />
            <Field label="Masked Account / IBAN" value={identity.financial.accountNumberMasked} isMono />
          </div>
        </Section>
      )}

      {/* 6. Professional & Career */}
      <Section
        icon={<BriefcaseBusiness className="h-3.5 w-3.5" />}
        title="Professional Career"
        badge={identity.profileType}
      >
        <Field label="Job Title" value={identity.professional.job} />
        <Field label="Company" value={identity.professional.company} />
        <Field label="Department" value={identity.professional.department} />
        <Field label="Industry" value={identity.professional.industry} />
        <Field label="Experience" value={identity.professional.experience} />
        <Field label="Education" value={identity.professional.education} />
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Core Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {identity.professional.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
              >
                <Wrench className="h-3 w-3 text-muted-foreground" />
                {s}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* 7. Education & Certifications */}
      {identity.educationDetails && (
        <Section
          icon={<GraduationCap className="h-3.5 w-3.5" />}
          title="Education & Credentials"
        >
          <Field label="Alma Mater / Institution" value={identity.educationDetails.institution} />
          <Field label="Degree & Major" value={identity.educationDetails.degree} />
          <Field label="Graduation Year" value={String(identity.educationDetails.graduationYear)} />
          {identity.educationDetails.certifications && identity.educationDetails.certifications.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Professional Certifications
              </p>
              <div className="flex flex-wrap gap-1.5">
                {identity.educationDetails.certifications.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-md bg-foreground/10 px-2 py-0.5 text-xs font-medium"
                  >
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* 8. Online Identity */}
      <Section
        icon={<Globe2 className="h-3.5 w-3.5" />}
        title="Online Identity & Handles"
      >
        <Field label="Primary Username" value={identity.online.username} isMono />
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            Username Variations
          </p>
          <div className="flex flex-wrap gap-1.5">
            {identity.online.usernameVariations.map((u) => (
              <span key={u} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-mono">
                {u}
              </span>
            ))}
          </div>
        </div>
        <Field label="Public Display Name" value={identity.online.displayName} />
        <Field label="Social Creator Handle" value={identity.online.creatorHandle} isMono />
        <Field label="Developer Handle" value={identity.online.developerHandle} isMono />
        <Field label="Gaming Tag" value={identity.online.gamingHandle} isMono />
      </Section>

      {/* 9. Digital & Security */}
      {identity.digital && (
        <Section
          icon={<Cpu className="h-3.5 w-3.5" />}
          title="Digital & Security Profile"
        >
          <div className="space-y-2">
            <Field label="Synthetic IPv4" value={identity.digital.ipv4} isMono />
            <Field label="Hardware MAC Address" value={identity.digital.macAddress} isMono />
            <Field label="Crypto Wallet (Public Key)" value={identity.digital.cryptoWallet} isMono />
            <Field label="Device User Agent" value={identity.digital.userAgent} isMono />
          </div>
        </Section>
      )}

      {/* 10. Lifestyle & Preferences */}
      {identity.lifestyle && (
        <Section
          icon={<Sparkles className="h-3.5 w-3.5" />}
          title="Lifestyle & Preferences"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Zodiac Astrological Sign" value={identity.lifestyle.zodiacSign} />
            <Field label="Pet / Companion" value={identity.lifestyle.pet} />
            <Field label="Favorite Cuisine" value={identity.lifestyle.favoriteCuisine} />
            <Field label="Music Preference" value={identity.lifestyle.musicGenre} />
          </div>
          <div className="pt-2">
            <Field label="Personal Motto / Favorite Quote" value={identity.lifestyle.favoriteQuote} />
          </div>
          <div className="space-y-1.5 pt-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Hobbies & Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {identity.interests.map((i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {i}
                </span>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* 11. Official IDs */}
      {identity.governmentIds && (
        <Section
          icon={<Shield className="h-3.5 w-3.5" />}
          title="Identification"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="National ID / SSN" value={identity.governmentIds.nationalIdMasked} isMono />
            <Field label="Passport Number" value={identity.governmentIds.passportMasked} isMono />
            <Field label="Driver License" value={identity.governmentIds.driverLicense} isMono />
          </div>
        </Section>
      )}
    </div>
  );
}
