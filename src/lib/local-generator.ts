import {
  SyntheticIdentity,
  GeneratorConfig,
  Gender,
  ProfileType,
  AvatarStyle,
  IdentityDetailTab,
  SeniorityLevel,
  EducationLevelFilter,
} from '@/types';
import {
  COUNTRY_META,
  CONTINENT_COUNTRIES,
} from '@/data';
import { generateBiography } from '@/lib/generator';
import { KNOWN_LOCATIONS } from '@/lib/geocoding';
import {
  ALL_PLATFORMS,
  findAvailableUsernameForPlatform,
  formatUsernameForPlatform,
  getPlatformPriority,
} from '@/lib/username-checker';
import {
  COUNTRY_PROFILES,
  NAME_BANKS,
  PROFESSION_BANKS,
  BLOOD_TYPES,
  EYE_COLORS,
  HAIR_COLORS,
  MARITAL_STATUSES,
  ZODIAC_SIGNS,
  QUOTES,
  CUISINES,
  MUSIC_GENRES,
  PETS,
  INTERESTS,
  USER_AGENTS,
  COMPANY_SUFFIXES,
  ONLINE_FLOURISHES,
} from '@/data/offline';

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(arr: T[]): T => arr[rand(arr.length)];
const pad4 = (n: number) => String(n).padStart(4, '0');

function fillPattern(pattern: string): string {
  return pattern
    .split('')
    .map((ch) => {
      if (ch === '#') return String(rand(10));
      if (ch === 'A') return String.fromCharCode(65 + rand(26));
      if (ch === 'a') return String.fromCharCode(97 + rand(26));
      return ch;
    })
    .join('');
}

function resolveProfileType(config: Partial<GeneratorConfig>, age: number): ProfileType {
  if (config.profileType && config.profileType !== 'random') return config.profileType;
  if (age <= 24) {
    return pick(['student', 'student', 'creator', 'gamer', 'test-user', 'athlete', 'musician'] as ProfileType[]);
  }
  return pick([
    'developer', 'developer', 'designer', 'professional', 'professional', 'entrepreneur',
    'engineer', 'marketer', 'data-scientist', 'educator', 'healthcare', 'writer',
  ] as ProfileType[]);
}

function seniorityPrefix(seniority: SeniorityLevel | undefined): { prefix: string; exp: string } {
  switch (seniority) {
    case 'entry':
      return { prefix: 'Junior ', exp: `${1 + rand(2)} years` };
    case 'senior':
      return { prefix: 'Senior ', exp: `${6 + rand(5)} years` };
    case 'lead':
      return { prefix: 'Lead ', exp: `${8 + rand(5)} years` };
    case 'executive':
      return { prefix: 'Head of ', exp: `${12 + rand(8)} years` };
    case 'unemployed':
      return { prefix: '', exp: 'Currently exploring new opportunities' };
    default:
      return { prefix: '', exp: `${3 + rand(6)} years` };
  }
}

function resolveEducation(
  level: EducationLevelFilter | undefined,
  bank: { degrees: string[]; certifications: string[] }
): { education: string; degree: string; certifications: string[]; graduated: boolean } {
  const degree = pick(bank.degrees);
  switch (level) {
    case 'high-school':
      return {
        education: 'High School Diploma',
        degree: 'High School Diploma',
        certifications: [],
        graduated: true,
      };
    case 'some-college':
      return {
        education: 'Some College (No Degree)',
        degree: 'Some College',
        certifications: [],
        graduated: false,
      };
    case 'trade':
      return {
        education: 'Vocational Training / Apprenticeship',
        degree: 'Trade Certification',
        certifications: bank.certifications.slice(0, 1),
        graduated: true,
      };
    case 'associate':
      return {
        education: 'Associate Degree',
        degree: 'Associate Degree',
        certifications: bank.certifications.slice(0, 1),
        graduated: true,
      };
    case 'certification':
      return {
        education: `Professional Certification (${pick(bank.certifications)} and ${pick(bank.certifications)})`,
        degree: 'Professional Certification',
        certifications: bank.certifications.slice(0, 2),
        graduated: true,
      };
    case 'master':
      return {
        education: degree.replace(/Bachelor.*|Bsc|BTech|Associate|Diploma|PhD|BEng|BSN|BA |BCom|BMus|MEd|MBA/, 'Master'),
        degree: 'Master Degree',
        certifications: bank.certifications.slice(0, 2),
        graduated: true,
      };
    case 'doctorate':
      return {
        education: 'Doctorate (PhD)',
        degree: 'Doctorate',
        certifications: bank.certifications.slice(0, 2),
        graduated: true,
      };
    default:
      return {
        education: degree,
        degree,
        certifications: bank.certifications.slice(0, 2),
        graduated: true,
      };
  }
}

function genPhoneForCountryLabel(countryLabel: string): string {
  const country = COUNTRY_META.find((c) => c.label === countryLabel);
  const profile = country
    ? (COUNTRY_PROFILES[country.value as keyof typeof COUNTRY_PROFILES] as { callingCode: string } | undefined)
    : undefined;
  return genPhoneWithCode(profile?.callingCode || '+1');
}

function genPhoneWithCode(callingCode: string): string {
  const code = callingCode || '+1';
  const area = String(100 + rand(900));
  const mid = String(100 + rand(900));
  const end = pad4(rand(10000));
  return `${code} ${area} ${mid}-${end}`;
}

function genEmail(first: string, last: string): string {
  const domains = ['gmail.com', 'outlook.com', 'proton.me', 'mail.com', 'icloud.com'];
  return `${first.toLowerCase()}.${last.toLowerCase()}${rand(2) ? '' : rand(99)}@${pick(domains)}`;
}

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const MAC_VENDORS = ['00:1A:2B', '3C:22:FB', '88:63:DF', '8C:79:F5', 'B8:27:EB', '50:C7:BF', '3C:8A:1F', '7C:B3:7B', '34:E6:AD', '70:3A:CB', '00:50:56', '00:0C:29'];

function randHex(len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += '0123456789abcdef'[rand(16)];
  return s;
}

function base58Str(len: number): string {
  let s = '';
  for (let i = 0; i < len; i++) s += BASE58[rand(BASE58.length)];
  return s;
}

function genPublicIpv4(): string {
  // Realistic public IPv4: stays out of private/reserved/documentation ranges
  while (true) {
    const a = 1 + rand(223);
    if ([0, 10, 100, 127, 169, 172, 192, 198, 203, 224].includes(a)) continue;
    const b = 1 + rand(254);
    const c = 1 + rand(254);
    const d = 1 + rand(253);
    return `${a}.${b}.${c}.${d}`;
  }
}

function genCryptoWallet(): string {
  const coin = pick(['Ethereum', 'Bitcoin', 'Tron', 'Solana']);
  switch (coin) {
    case 'Ethereum':
      return `0x${randHex(40)}`;
    case 'Bitcoin':
      return Math.random() > 0.5 ? `1${base58Str(26)}` : `bc1q${base58Str(30)}`;
    case 'Tron':
      return `T${base58Str(33)}`;
    case 'Solana':
      return base58Str(44);
    default:
      return `0x${randHex(40)}`;
  }
}

function genDigital() {
  return {
    ipv4: genPublicIpv4(),
    macAddress: pick(MAC_VENDORS) + randHex(6).toUpperCase().replace(/(..)/g, ':$1'),
    userAgent: pick(USER_AGENTS),
    cryptoWallet: genCryptoWallet(),
  };
}

function maskId(prefix?: string): string {
  const num = `XXX-XX-${String(rand(10000)).padStart(4, '0')}`;
  return prefix ? `${num} (${prefix})` : num;
}

function avatarUrl(seed: string, style: AvatarStyle): string {
  const styleMap: Record<AvatarStyle, string> = {
    minimal: 'initials',
    cartoon: 'avataaars',
    illustration: 'lorelei',
    pixel: 'pixel-art',
    professional: 'notionists',
    gaming: 'bottts',
  };
  return `https://api.dicebear.com/9.x/${styleMap[style] || 'initials'}/svg?seed=${encodeURIComponent(seed)}`;
}

async function localCoordinates(city: string, countryLabel: string) {
  const cityKey = `${city.toLowerCase()}, ${countryLabel.toLowerCase()}`;
  const countryKey = countryLabel.toLowerCase();
  const base = KNOWN_LOCATIONS[cityKey] || KNOWN_LOCATIONS[countryKey] || { lat: 37.7749, lng: -122.4194 };
  return {
    lat: parseFloat((base.lat + (Math.random() - 0.5) * 0.01).toFixed(4)),
    lng: parseFloat((base.lng + (Math.random() - 0.5) * 0.01).toFixed(4)),
  };
}

function onlineUsernames(first: string, last: string) {
  const f = first.toLowerCase().replace(/[^a-z0-9]/g, '');
  const l = last.toLowerCase().replace(/[^a-z0-9]/g, '');
  const base = `${f}.${l}`;
  const flourish = Math.random() > 0.5 ? pick(ONLINE_FLOURISHES) : '';
  const username = `${base}${flourish}${flourish ? '' : rand(90) + 10}`;
  return {
    username,
    usernameVariations: [
      `${f}_${l}`,
      `${f}.${l}${rand(90) + 10}`,
      `${f}${l}`,
      `${f}${l}${Math.random().toString().slice(2, 5)}`,
    ],
    creatorHandle: `@${f}_${l}`,
    developerHandle: `${f}${l}.dev`,
    gamingHandle: `${f}${l}${rand(2) ? 'Gamer' : 'GG'}`,
  };
}

export type HandleStatus = 'available' | 'taken' | 'unknown';

interface PlatformResult {
  platform: string;
  category: (typeof ALL_PLATFORMS)[number]['category'];
  username: string;
  status: HandleStatus;
  profileUrl: string;
  checkUrl: string;
  bio: string;
  checkedAt: string;
}

async function buildPlatformHandles(
  firstName: string,
  lastName: string,
  displayName: string,
  job: string,
  company: string,
  city: string,
  country: string
): Promise<PlatformResult[]> {
  const results: PlatformResult[] = [];
  const queue = [...ALL_PLATFORMS];
  const baseHandle = `${firstName}.${lastName}`;

  // Verify every platform concurrently (worker pool) so each username kept is
  // genuinely checked live. Platforms that confirm availability keep the free
  // variant; anything that cannot be confirmed is labelled honestly.
  const worker = async () => {
    while (queue.length > 0) {
      const cfg = queue.shift();
      if (!cfg) break;
      try {
        const { username, status } = await findAvailableUsernameForPlatform(cfg, baseHandle, firstName, lastName, job);
        results.push({
          platform: cfg.name,
          category: cfg.category,
          username,
          status: status === 'available' ? 'available' : status === 'taken' ? 'taken' : 'unknown',
          profileUrl: cfg.profileUrl(username),
          checkUrl: cfg.urlTpl.replace('{u}', encodeURIComponent(username)),
          bio: `${job} at ${company} • ${city}, ${country}`,
          checkedAt: new Date().toISOString(),
        });
      } catch {
        const fallback = formatUsernameForPlatform(cfg.name, firstName, lastName);
        results.push({
          platform: cfg.name,
          category: cfg.category,
          username: fallback,
          status: 'unknown',
          profileUrl: cfg.profileUrl(fallback),
          checkUrl: cfg.urlTpl.replace('{u}', encodeURIComponent(fallback)),
          bio: `${job} at ${company} • ${city}, ${country}`,
          checkedAt: new Date().toISOString(),
        });
      }
    }
  };

  const workers = Array.from({ length: 9 }, () => worker());
  await Promise.all(workers);

  results.sort((a, b) => {
    const pA = getPlatformPriority(a.platform);
    const pB = getPlatformPriority(b.platform);
    if (pA !== pB) return pA - pB;
    return a.platform.localeCompare(b.platform);
  });
  return results;
}

export async function generateLocalIdentity(
  config: Partial<GeneratorConfig>,
  usedNames: Set<string> = new Set()
): Promise<SyntheticIdentity> {
  let countryMeta = COUNTRY_META[rand(COUNTRY_META.length)];
  const targetCountry = config.country !== 'random' && config.country ? (config.country as string) : null;
  if (targetCountry) {
    countryMeta = COUNTRY_META.find((c) => c.value === targetCountry) || countryMeta;
  } else if (config.continent !== 'random' && config.continent) {
    const pool = CONTINENT_COUNTRIES[config.continent] || [];
    if (pool.length > 0) {
      countryMeta = COUNTRY_META.find((c) => c.value === pool[rand(pool.length)]) || countryMeta;
    }
  }

  const countryLabel = countryMeta.label;
  const profile = COUNTRY_PROFILES[countryMeta.value];
  const nameBank = NAME_BANKS[countryMeta.style] || NAME_BANKS.any;
  const gender: Gender = config.gender && config.gender !== 'random' ? config.gender : Math.random() > 0.5 ? 'male' : 'female';
  const firstName = pick(nameBank[gender]);
  const lastName = pick(nameBank.last);
  const displayName = `${firstName} ${lastName}`;

  const minAge = config.ageRange?.[0] || 22;
  const maxAge = config.ageRange?.[1] || 45;
  const age = Math.min(minAge, maxAge) + rand(Math.max(1, Math.abs(maxAge - minAge) + 1));
  const seniority = config.seniorityLevel && config.seniorityLevel !== 'auto' ? config.seniorityLevel : undefined;
  const { prefix, exp } = seniorityPrefix(seniority);
  const profileType = resolveProfileType(config, age);
  const prof = PROFESSION_BANKS[profileType];
  const ed = resolveEducation(
    config.educationLevel && config.educationLevel !== 'auto' ? config.educationLevel : undefined,
    prof
  );
  const job = `${prefix}${pick(prof.titles)}`;
  const company = `${pick(prof.companies)}${rand(2) ? ` ${pick(COMPANY_SUFFIXES)}` : ''}`;
  const graduationYear = ed.graduated ? Math.max(1990, new Date().getFullYear() - (age - 22) - rand(2)) : new Date().getFullYear();
  const city = pick(profile.cities);
  const region = pick(profile.regions);
  const street = `${1 + rand(180)} ${pick(profile.streets)}`;
  const postalCode = fillPattern(profile.postalPattern);
  const timezone = countryMeta.timezone;
  const coordinates = await localCoordinates(city, countryLabel);
  const dateOfBirth = new Date(
    new Date().setFullYear(new Date().getFullYear() - age, rand(12), 1 + rand(28))
  )
    .toISOString()
    .slice(0, 10);
  const maritalStatusMap: Record<string, string> = {
    'single': 'Single',
    'married': 'Married',
    'in-relationship': 'In a Relationship',
    'engaged': 'Engaged',
    'divorced': 'Divorced',
    'widowed': 'Widowed',
  };
  const maritalStatus =
    config.maritalStatus && config.maritalStatus !== 'auto'
      ? maritalStatusMap[config.maritalStatus] || 'Single'
      : pick(MARITAL_STATUSES);
  const skillCount = 3 + rand(2);
  const online = onlineUsernames(firstName, lastName);
  const avatarStyle: AvatarStyle =
    config.avatarStyle && config.avatarStyle !== 'random'
      ? (config.avatarStyle as AvatarStyle)
      : profileType === 'gamer' || (config.avatarStyle === 'random' && Math.random() > 0.7)
        ? 'gaming'
        : randomAvatarStyle();
  const cuisine =
    config.favoriteCuisine && config.favoriteCuisine !== 'random'
      ? config.favoriteCuisine
      : pick(CUISINES);
  const musicGenre =
    config.musicGenre && config.musicGenre !== 'random'
      ? config.musicGenre
      : pick(MUSIC_GENRES);
  const pet =
    config.petPreference && config.petPreference !== 'random'
      ? config.petPreference
      : pick(PETS);
  const zodiac =
    config.zodiacSign && config.zodiacSign !== 'random'
      ? config.zodiacSign
      : pick(ZODIAC_SIGNS);
  const interests =
    config.interests && config.interests !== 'random'
      ? [config.interests, ...shuffle(INTERESTS.filter((i) => i !== config.interests)).slice(0, 2 + rand(2))]
      : shuffle([...INTERESTS]).slice(0, 3 + rand(2));
  const industry =
    config.industry && config.industry !== 'random'
      ? config.industry
      : pick(prof.industries);

  const identity: SyntheticIdentity = {
    id: `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    firstName,
    lastName,
    displayName,
    gender,
    dateOfBirth,
    age,
    nationality: countryLabel,
    languages: [countryMeta.language, pick(['English', countryMeta.language])],
    timezone,
    email: genEmail(firstName, lastName),
    location: {
      country: countryLabel,
      countryCode: countryMeta.countryCode,
      region,
      city,
      postalCode,
      street,
      coordinates,
    },
    online: {
      ...online,
      displayName,
      usernameStatus: 'available',
    },
    professional: {
      job,
      industry,
      experience: exp,
      skills: shuffle([...prof.skills]).slice(0, skillCount),
      education: ed.education,
      company,
      department: prof.department,
    },
    contact: {
      phone: genPhoneWithCode(profile.callingCode),
      emergencyContact: {
        name: `${pick(nameBank[gender === 'male' ? 'female' : 'male'])} ${pick(nameBank.last)}`,
        relationship: pick(['Spouse', 'Sibling', 'Parent', 'Partner']),
        phone: genPhoneWithCode(profile.callingCode),
      },
    },
    physical: {
      bloodType: pick(BLOOD_TYPES),
      height: gender === 'male' ? `${168 + rand(17)} cm / ${feetInches(168 + rand(17))}` : `${155 + rand(15)} cm / ${feetInches(155 + rand(15))}`,
      weight: gender === 'male' ? `${62 + rand(22)} kg / ${Math.round((62 + rand(22)) * 2.2046)} lbs` : `${52 + rand(18)} kg / ${Math.round((52 + rand(18)) * 2.2046)} lbs`,
      eyeColor: pick(EYE_COLORS),
      hairColor: pick(HAIR_COLORS),
      maritalStatus: maritalStatus,
    },
    financial: {
      creditScore: 600 + rand(220),
      creditRating: '',
      currency: profile.currency,
      annualSalary: salaryFor(job, profile.currency.symbol, config.incomeBracket),
      bankName: pick(profile.banks),
      accountNumberMasked: `**** ${pad4(rand(10000))}`,
    },
    digital: genDigital(),
    lifestyle: {
      zodiacSign: zodiac,
      favoriteQuote: pick(QUOTES),
      favoriteCuisine: cuisine,
      musicGenre: musicGenre,
      pet: pet,
    },
    educationDetails: {
      institution: `${city} ${pick(['State University', 'Institute of Technology', 'University', 'Community College'])}`,
      degree: ed.education,
      graduationYear,
      certifications: ed.certifications,
    },
    governmentIds: {
      nationalIdMasked: maskId(countryMeta.countryCode),
      passportMasked: `P${String(rand(9000) + 1000)}****`,
      driverLicense: `DL-${rand(900000) + 100000}`,
    },
    interests: interests,
    bio: '',
    profileType,
    avatarStyle,
    avatarUrl: '',
    createdAt: new Date().toISOString(),
  };

  identity.bio = generateBiography(identity, 'about');
  identity.financial.creditRating =
    identity.financial.creditScore >= 750
      ? 'Excellent'
      : identity.financial.creditScore >= 650
        ? 'Good'
        : 'Fair';
  identity.avatarUrl = avatarUrl(`${firstName}-${lastName}-${Date.now()}`, avatarStyle);
  identity.online.platforms = await buildPlatformHandles(
    firstName,
    lastName,
    displayName,
    job,
    company,
    city,
    countryLabel
  );

  if (usedNames.has(displayName.toLowerCase()) && usedNames.size < 20) {
    return generateLocalIdentity(config, usedNames);
  }
  usedNames.add(displayName.toLowerCase());
  return identity;
}

function randomAvatarStyle(): AvatarStyle {
  return pick(['minimal', 'cartoon', 'illustration', 'professional', 'pixel'] as AvatarStyle[]);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function feetInches(cm: number): string {
  const inches = cm / 2.54;
  return `${Math.floor(inches / 12)}'${Math.round(inches % 12)}"`;
}

function salaryFor(job: string, symbol: string, incomeBracket?: string): string {
  const senior = /Senior|Lead|Head|Executive|Director/i.test(job);
  const junior = /Junior|Intern/i.test(job);
  const bracket = incomeBracket && incomeBracket !== 'auto' ? incomeBracket : null;
  const baseMultiplier = bracket === 'low' ? 0.55
    : bracket === 'lower-middle' ? 0.75
      : bracket === 'upper-middle' ? 1.35
        : bracket === 'high' ? 1.8
          : 1;
  const base = Math.floor((senior ? 100 : junior ? 55 : 72) * (90 + rand(40)) / 100 * baseMultiplier);
  return `${symbol}${base},000 / year`;
}

export async function generateLocalBatch(
  config: Partial<GeneratorConfig>,
  count: number
): Promise<SyntheticIdentity[]> {
  const used = new Set<string>();
  const results: SyntheticIdentity[] = [];
  for (let i = 0; i < count; i++) {
    results.push(await generateLocalIdentity(config, used));
  }
  return results;
}

export function generateLocalBio(
  identity: SyntheticIdentity,
  type: 'short' | 'professional' | 'social' | 'about'
): string {
  return generateBiography(identity, type);
}

export async function generateLocalSection(
  section: IdentityDetailTab,
  identity: SyntheticIdentity
): Promise<Partial<SyntheticIdentity>> {
  switch (section) {
    case 'personal': {
      const countryMeta = COUNTRY_META.find((c) => c.label === identity.location.country) || COUNTRY_META[0];
      const nameBank = NAME_BANKS[countryMeta.style] || NAME_BANKS.any;
      const gender: Gender = identity.gender;
      const firstName = pick(nameBank[gender]);
      const lastName = pick(nameBank.last);
      const age = identity.age + (Math.random() > 0.5 ? 1 : -1);
      const displayName = `${firstName} ${lastName}`;
      return {
        firstName,
        lastName,
        displayName,
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - age, rand(12), 1 + rand(28)))
          .toISOString()
          .slice(0, 10),
        age,
        languages: identity.languages,
        contact: {
          phone: genPhoneForCountryLabel(identity.location.country),
          emergencyContact: {
            ...identity.contact.emergencyContact,
            name: `${pick(nameBank[gender === 'male' ? 'female' : 'male'])} ${pick(nameBank.last)}`,
          },
        },
        avatarUrl: avatarUrl(`${firstName}-${lastName}-${Date.now()}`, identity.avatarStyle || 'illustration'),
      };
    }
    case 'location': {
      const countryMeta = COUNTRY_META.find((c) => c.label === identity.location.country) || COUNTRY_META[0];
      const profile = COUNTRY_PROFILES[countryMeta.value];
      const city = pick(profile.cities);
      const region = pick(profile.regions);
      const street = `${1 + rand(180)} ${pick(profile.streets)}`;
      const postalCode = fillPattern(profile.postalPattern);
      return {
        timezone: countryMeta.timezone,
        location: {
          ...identity.location,
          city,
          region,
          street,
          postalCode,
          coordinates: await localCoordinates(city, identity.location.country),
        },
      };
    }
    case 'career': {
      const prof = PROFESSION_BANKS[identity.profileType] || PROFESSION_BANKS.developer;
      const ed = resolveEducation(undefined, prof);
      const job = pick(prof.titles);
      const company = pick(prof.companies);
      return {
        professional: {
          ...identity.professional,
          job,
          industry: pick(prof.industries),
          experience: `${80 + rand(48)} months`,
          skills: shuffle([...prof.skills]).slice(0, 4),
          education: ed.education,
          company,
          department: prof.department,
        },
        educationDetails: {
          institution: `${identity.location.city} ${pick(['State University', 'Institute of Technology', 'University'])}`,
          degree: ed.education,
          graduationYear: Math.max(1990, new Date().getFullYear() - (identity.age - 22) - rand(2)),
          certifications: ed.certifications,
        },
      };
    }
    case 'financial': {
      const profile = COUNTRY_PROFILES[identity.location.country as keyof typeof COUNTRY_PROFILES];
      const currency = profile?.currency || { code: 'USD', symbol: '$', name: 'US Dollar' };
      const creditScore = 600 + rand(220);
      return {
        financial: {
          ...identity.financial,
          annualSalary: salaryFor(identity.professional.job, currency.symbol),
          creditScore,
          creditRating: creditScore >= 750 ? 'Excellent' : creditScore >= 700 ? 'Good' : 'Fair',
          currency,
          bankName: pick(profile?.banks || ['Metro Bank']),
          accountNumberMasked: `**** ${pad4(rand(10000))}`,
        },
      };
    }
    case 'physical': {
      return {
        physical: {
          bloodType: pick(BLOOD_TYPES),
          height: identity.gender === 'male' ? `${168 + rand(17)} cm / ${feetInches(168 + rand(17))}` : `${155 + rand(15)} cm / ${feetInches(155 + rand(15))}`,
          weight: identity.gender === 'male' ? `${62 + rand(22)} kg / ${Math.round((62 + rand(22)) * 2.2046)} lbs` : `${52 + rand(18)} kg / ${Math.round((52 + rand(18)) * 2.2046)} lbs`,
          eyeColor: pick(EYE_COLORS),
          hairColor: pick(HAIR_COLORS),
          maritalStatus: pick(MARITAL_STATUSES),
        },
      };
    }
    case 'digital': {
      return {
        digital: genDigital(),
        online: {
          ...identity.online,
          ...onlineUsernames(identity.firstName, identity.lastName),
          usernameStatus: 'available',
          platforms: await buildPlatformHandles(
            identity.firstName,
            identity.lastName,
            identity.displayName,
            identity.professional.job,
            identity.professional.company,
            identity.location.city,
            identity.location.country
          ),
        },
      };
    }
case 'lifestyle': {
      return {
        lifestyle: {
          zodiacSign: pick(ZODIAC_SIGNS),
          favoriteQuote: pick(QUOTES),
          favoriteCuisine: pick(CUISINES),
          musicGenre: pick(MUSIC_GENRES),
          pet: pick(PETS),
        },
      };
    }
    case 'ids': {
      return {
        governmentIds: {
          nationalIdMasked: maskId(identity.location.countryCode),
          passportMasked: `P${String(rand(9000) + 1000)}****`,
          driverLicense: `DL-${rand(900000) + 100000}`,
        },
      };
    }
    default:
      return {};
  }
}