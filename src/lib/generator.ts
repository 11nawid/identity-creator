import {
  SyntheticIdentity,
  GeneratorConfig,
  AvatarStyle,
} from '@/types';

export function generateAvatarUrl(seed: string, style: AvatarStyle): string {
  const styleMap: Record<AvatarStyle, string> = {
    minimal: 'initials',
    cartoon: 'avataaars',
    illustration: 'lorelei',
    pixel: 'pixel-art',
    professional: 'notionists',
    gaming: 'bottts',
  };
  return `https://api.dicebear.com/9.x/${styleMap[style]}/svg?seed=${encodeURIComponent(seed)}`;
}

export function regenerateAvatar(identity: SyntheticIdentity, style: AvatarStyle): SyntheticIdentity {
  const newUrl = generateAvatarUrl(`${identity.firstName}-${identity.lastName}-${identity.id}`, style);
  return { ...identity, avatarStyle: style, avatarUrl: newUrl };
}

/**
 * Quick client-side biography generator for immediate display or offline fallback
 */
export function generateBiography(
  identity: SyntheticIdentity,
  type: 'short' | 'professional' | 'social' | 'about'
): string {
  const name = identity.displayName;
  const job = identity.professional.job;
  const company = identity.professional.company;
  const city = identity.location.city;
  const country = identity.location.country;
  const skills = identity.professional.skills.slice(0, 3).join(', ');
  const interests = identity.interests.slice(0, 2).join(' and ');

  switch (type) {
    case 'short':
      return `${name} is a dedicated ${job.toLowerCase()} based in ${city}, ${country}. Passionate about innovation and creating impactful solutions.`;
    case 'professional':
      return `${name} is a seasoned ${job.toLowerCase()} at ${company} in ${city}, ${country}. With a strong background in ${skills.toLowerCase()}, they lead impactful initiatives and drive technical excellence across multidisciplinary teams.`;
    case 'social':
      return `Hey! I'm ${identity.firstName} — ${job} at ${company}. Love exploring ${interests.toLowerCase()} and building the future. Let's connect!`;
    case 'about':
      return `${name} is a ${identity.age}-year-old ${job.toLowerCase()} based in ${city}, ${country}. Outside of professional work, they actively pursue ${interests.toLowerCase()} and continuous learning.`;
    default:
      return identity.bio;
  }
}

export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
  country: 'random',
  continent: 'random',
  nameStyle: 'any',
  ageRange: [22, 45],
  gender: 'random',
  language: 'random',
  timezone: 'random',
  profileType: 'random',
  seniorityLevel: 'auto',
  educationLevel: 'auto',
  personalityTone: 'auto',
  maritalStatus: 'auto',
  industry: 'random',
  incomeBracket: 'auto',
  favoriteCuisine: 'random',
  musicGenre: 'random',
  interests: 'random',
  petPreference: 'random',
  zodiacSign: 'random',
  avatarStyle: 'random',
};

/**
 * Generate identity by calling the AI route
 */
export async function generateIdentityAI(
  config?: Partial<GeneratorConfig>
): Promise<SyntheticIdentity> {
  const mergedConfig: GeneratorConfig = {
    ...DEFAULT_GENERATOR_CONFIG,
    ...config,
  };

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mergedConfig),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to generate AI identity`);
  }

  return await res.json();
}

/**
 * Batch generate identities by calling the AI route
 */
export async function generateBatchAI(config: GeneratorConfig, count: number): Promise<SyntheticIdentity[]> {
  const res = await fetch('/api/generate-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, count }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to generate batch identities`);
  }

  return await res.json();
}

/**
 * Generate biography using AI
 */
export async function generateBioAI(
  identity: SyntheticIdentity,
  type: 'short' | 'professional' | 'social' | 'about'
): Promise<string> {
  const res = await fetch('/api/generate-bio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity, type }),
  });

  if (!res.ok) {
    // Fallback to local structured bio if API call fails
    return generateBiography(identity, type);
  }

  const data = await res.json();
  return data.bio || generateBiography(identity, type);
}