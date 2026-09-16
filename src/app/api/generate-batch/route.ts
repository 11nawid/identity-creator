import { NextResponse } from 'next/server';
import { generate, isAiConfigured } from '@/lib/gemini';
import { ensureMatchingCoordinates } from '@/lib/geocoding';
import { buildAllPlatformUsernames } from '@/lib/username-checker';
import { generateLocalBatch } from '@/lib/local-generator';
import { COUNTRY_META, CONTINENT_COUNTRIES } from '@/data';
import {
  GeneratorConfig,
  SyntheticIdentity,
  AvatarStyle,
  ProfileType,
  Gender,
} from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateAvatarUrl(seed: string, style: AvatarStyle): string {
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

function extractJsonArray(text: string): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(text.trim());
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      const firstArrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (firstArrayKey) return parsed[firstArrayKey];
    }
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') {
          const firstArrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
          if (firstArrayKey) return parsed[firstArrayKey];
        }
      } catch {}
    }
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        const parsed = JSON.parse(text.slice(firstBracket, lastBracket + 1));
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
  }
  return [];
}

async function generateSingleBatch(config: GeneratorConfig, batchCount: number): Promise<SyntheticIdentity[]> {
  let targetCountry = config.country !== 'random' ? config.country : null;
  if (!targetCountry && config.continent !== 'random') {
    const pool = CONTINENT_COUNTRIES[config.continent] || [];
    if (pool.length > 0) {
      targetCountry = pool[Math.floor(Math.random() * pool.length)];
    }
  }
  if (!targetCountry) {
    targetCountry = COUNTRY_META[Math.floor(Math.random() * COUNTRY_META.length)].value;
  }
  const countryMeta = COUNTRY_META.find((c) => c.value === targetCountry) || COUNTRY_META[0];
  const minAge = config.ageRange?.[0] || 22;
  const maxAge = config.ageRange?.[1] || 45;

  const prompt = `Generate a JSON array of exactly ${batchCount} distinct, realistic synthetic person profiles in ${countryMeta.label} (${countryMeta.countryCode}).
Target Age Range: ${minAge} to ${maxAge}
${config.gender ? `Gender: ${config.gender}` : 'Vary genders naturally'}
Profile Type: ${config.profileType && config.profileType !== 'random' ? config.profileType : 'AI Auto: Choose diverse appropriate careers and roles matching their age range.'}
${config.seniorityLevel && config.seniorityLevel !== 'auto' ? `Desired Seniority: ${config.seniorityLevel}` : ''}
${config.educationLevel && config.educationLevel !== 'auto' ? `Desired Education: ${config.educationLevel}` : ''}
${config.personalityTone && config.personalityTone !== 'auto' ? `Lifestyle Tone: ${config.personalityTone}` : ''}
${config.maritalStatus && config.maritalStatus !== 'auto' ? `Marital Status: ${config.maritalStatus}` : ''}
${config.industry && config.industry !== 'random' ? `Career Industry: ${config.industry}` : ''}
${config.incomeBracket && config.incomeBracket !== 'auto' ? `Income Bracket: ${config.incomeBracket}` : ''}
${config.favoriteCuisine && config.favoriteCuisine !== 'random' ? `Favorite Cuisine: ${config.favoriteCuisine}` : ''}
${config.musicGenre && config.musicGenre !== 'random' ? `Music Genre: ${config.musicGenre}` : ''}
${config.interests && config.interests !== 'random' ? `Primary Hobby: ${config.interests}` : ''}
${config.petPreference && config.petPreference !== 'random' ? `Pet Preference: ${config.petPreference}` : ''}
${config.zodiacSign && config.zodiacSign !== 'random' ? `Zodiac Sign: ${config.zodiacSign}` : ''}

CRITICAL: Every identity MUST include REAL cities, physical street addresses, and EXACT real matching coordinates (lat/lng) in ${countryMeta.label}.

Return ONLY a JSON array with ${batchCount} items matching this schema:
[
  {
    "firstName": "string",
    "lastName": "string",
    "displayName": "string",
    "gender": "male" | "female",
    "dateOfBirth": "YYYY-MM-DD",
    "age": number,
    "nationality": "${countryMeta.label}",
    "languages": ["string"],
    "timezone": "${countryMeta.timezone}",
    "email": "string",
    "location": {
      "country": "${countryMeta.label}",
      "countryCode": "${countryMeta.countryCode}",
      "region": "string",
      "city": "string",
      "postalCode": "string",
      "street": "string",
      "coordinates": { "lat": number, "lng": number }
    },
    "online": {
      "username": "string",
      "usernameVariations": ["string"],
      "displayName": "string",
      "creatorHandle": "@string",
      "developerHandle": "string.dev",
      "gamingHandle": "string",
      "usernameStatus": "available"
    },
    "professional": {
      "job": "string",
      "industry": "string",
      "experience": "string",
      "skills": ["string", "string"],
      "education": "string",
      "company": "string",
      "department": "string"
    },
    "contact": {
      "phone": "string",
      "emergencyContact": { "name": "string", "relationship": "string", "phone": "string" }
    },
    "physical": {
      "bloodType": "string",
      "height": "string",
      "weight": "string",
      "eyeColor": "string",
      "hairColor": "string",
      "maritalStatus": "string"
    },
    "financial": {
      "creditScore": number,
      "creditRating": "string",
      "currency": { "code": "USD", "symbol": "$", "name": "US Dollar" },
      "annualSalary": "string",
      "bankName": "string",
      "accountNumberMasked": "string"
    },
    "digital": {
      "ipv4": "string",
      "macAddress": "string",
      "userAgent": "string",
      "cryptoWallet": "string"
    },
    "lifestyle": {
      "zodiacSign": "string",
      "favoriteQuote": "string",
      "favoriteCuisine": "string",
      "musicGenre": "string",
      "pet": "string"
    },
    "educationDetails": {
      "institution": "string",
      "degree": "string",
      "graduationYear": number,
      "certifications": ["string"]
    },
    "governmentIds": {
      "nationalIdMasked": "string",
      "passportMasked": "string",
      "driverLicense": "string"
    },
    "interests": ["string", "string"],
    "bio": "string",
    "profileType": "developer"
  }
]`;

  const raw = await generate(prompt, 1, 4);
  const items = extractJsonArray(raw);

  const results: SyntheticIdentity[] = [];

  for (let i = 0; i < items.length; i++) {
    const parsed = items[i];
    if (!parsed || !parsed.firstName) continue;

    const loc = (parsed.location as Record<string, unknown>) || {};
    const aiCoords = (loc.coordinates as { lat?: number; lng?: number }) || undefined;

    const verifiedCoordinates = await ensureMatchingCoordinates(
      {
        street: String(loc.street || ''),
        city: String(loc.city || ''),
        region: String(loc.region || ''),
        country: String(loc.country || countryMeta.label),
      },
      aiCoords
    );

    const pType = (parsed.profileType as ProfileType) || 'developer';
    const avatarStyle: AvatarStyle =
      config.avatarStyle && config.avatarStyle !== 'random'
        ? (config.avatarStyle as AvatarStyle)
        : pType === 'gamer'
        ? 'gaming'
        : 'minimal';
    const seed = `${parsed.firstName}-${parsed.lastName}-${Date.now()}-${i}`;

    const contactRaw = (parsed.contact as Record<string, unknown>) || {};
    const emerRaw = (contactRaw.emergencyContact as Record<string, unknown>) || {};
    const physRaw = (parsed.physical as Record<string, unknown>) || {};
    const finRaw = (parsed.financial as Record<string, unknown>) || {};
    const curRaw = (finRaw.currency as Record<string, unknown>) || {};
    const digRaw = (parsed.digital as Record<string, unknown>) || {};
    const lifeRaw = (parsed.lifestyle as Record<string, unknown>) || {};
    const eduRaw = (parsed.educationDetails as Record<string, unknown>) || {};
    const govRaw = (parsed.governmentIds as Record<string, unknown>) || {};

    const fName = String(parsed.firstName);
    const lName = String(parsed.lastName);
    const dName = String(parsed.displayName || `${fName} ${lName}`);
    const jTitle = String((parsed.professional as Record<string, unknown>)?.job || 'Specialist');
    const cCompany = String((parsed.professional as Record<string, unknown>)?.company || 'Horizon Global');
    const cCity = String(loc.city || 'City');
    const cCountry = String(loc.country || countryMeta.label);

    const platformUsernames = await buildAllPlatformUsernames({
      firstName: fName,
      lastName: lName,
      displayName: dName,
      job: jTitle,
      company: cCompany,
      city: cCity,
      country: cCountry,
    });

    results.push({
      id: `ai-batch-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
      firstName: fName,
      lastName: lName,
      displayName: dName,
      gender: (parsed.gender as Gender) || 'male',
      dateOfBirth: String(parsed.dateOfBirth || '1995-05-15'),
      age: Number(parsed.age) || 28,
      nationality: String(parsed.nationality || countryMeta.label),
      languages: Array.isArray(parsed.languages) ? parsed.languages.map(String) : [countryMeta.language],
      timezone: String(parsed.timezone || countryMeta.timezone),
      email: String(parsed.email || `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`),
      location: {
        country: cCountry,
        countryCode: String(loc.countryCode || countryMeta.countryCode),
        region: String(loc.region || 'Region'),
        city: cCity,
        postalCode: String(loc.postalCode || '10001'),
        street: String(loc.street || '100 Main St'),
        coordinates: verifiedCoordinates,
      },
      online: {
        username: String((parsed.online as Record<string, unknown>)?.username || `${fName.toLowerCase()}${lName.toLowerCase()}`),
        usernameVariations: Array.isArray((parsed.online as Record<string, unknown>)?.usernameVariations)
          ? ((parsed.online as Record<string, unknown>).usernameVariations as string[]).map(String)
          : [`${fName.toLowerCase()}_${lName.toLowerCase()}`],
        displayName: String((parsed.online as Record<string, unknown>)?.displayName || dName),
        creatorHandle: String((parsed.online as Record<string, unknown>)?.creatorHandle || `@${fName.toLowerCase()}`),
        developerHandle: String((parsed.online as Record<string, unknown>)?.developerHandle || `${fName.toLowerCase()}.dev`),
        gamingHandle: String((parsed.online as Record<string, unknown>)?.gamingHandle || `${fName.toLowerCase()}G`),
        usernameStatus: 'available',
        platforms: platformUsernames,
      },
      professional: {
        job: jTitle,
        industry: String((parsed.professional as Record<string, unknown>)?.industry || 'Technology'),
        experience: String((parsed.professional as Record<string, unknown>)?.experience || '4 years'),
        skills: Array.isArray((parsed.professional as Record<string, unknown>)?.skills)
          ? ((parsed.professional as Record<string, unknown>).skills as string[]).map(String)
          : ['Analytical Skills'],
        education: String((parsed.professional as Record<string, unknown>)?.education || 'Bachelor Degree'),
        company: String((parsed.professional as Record<string, unknown>)?.company || 'Horizon Global'),
        department: String((parsed.professional as Record<string, unknown>)?.department || 'Operations'),
      },
      contact: {
        phone: String(contactRaw.phone || '+1 (555) 345-6789'),
        emergencyContact: {
          name: String(emerRaw.name || 'Emergency Contact'),
          relationship: String(emerRaw.relationship || 'Spouse'),
          phone: String(emerRaw.phone || '+1 (555) 765-4321'),
        },
      },
      physical: {
        bloodType: String(physRaw.bloodType || 'A+'),
        height: String(physRaw.height || '176 cm / 5\'9"'),
        weight: String(physRaw.weight || '71 kg / 156 lbs'),
        eyeColor: String(physRaw.eyeColor || 'Brown'),
        hairColor: String(physRaw.hairColor || 'Brown'),
        maritalStatus: String(physRaw.maritalStatus || 'Single'),
      },
      financial: {
        creditScore: Number(finRaw.creditScore) || 730,
        creditRating: String(finRaw.creditRating || 'Good'),
        currency: {
          code: String(curRaw.code || 'USD'),
          symbol: String(curRaw.symbol || '$'),
          name: String(curRaw.name || 'US Dollar'),
        },
        annualSalary: String(finRaw.annualSalary || '$80,000 / year'),
        bankName: String(finRaw.bankName || 'Capital Trust Bank'),
        accountNumberMasked: String(finRaw.accountNumberMasked || '**** 3912'),
      },
      digital: {
        ipv4: String(digRaw.ipv4 || '198.51.100.55'),
        macAddress: String(digRaw.macAddress || '3C:5A:B4:7D:9E:11'),
        userAgent: String(digRaw.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0'),
        cryptoWallet: String(digRaw.cryptoWallet || '0x49A...28f1'),
      },
      lifestyle: {
        zodiacSign: String(lifeRaw.zodiacSign || 'Leo'),
        favoriteQuote: String(lifeRaw.favoriteQuote || 'Make it simple, but significant.'),
        favoriteCuisine: String(lifeRaw.favoriteCuisine || 'Italian'),
        musicGenre: String(lifeRaw.musicGenre || 'Electronic'),
        pet: String(lifeRaw.pet || 'None'),
      },
      educationDetails: {
        institution: String(eduRaw.institution || 'State University'),
        degree: String(eduRaw.degree || 'Bachelor Degree'),
        graduationYear: Number(eduRaw.graduationYear) || (new Date().getFullYear() - 4),
        certifications: Array.isArray(eduRaw.certifications) ? eduRaw.certifications.map(String) : ['Professional Certificate'],
      },
      governmentIds: {
        nationalIdMasked: String(govRaw.nationalIdMasked || 'XXX-XX-3918'),
        passportMasked: String(govRaw.passportMasked || 'P7391****'),
        driverLicense: String(govRaw.driverLicense || 'DL-482019'),
      },
      interests: Array.isArray(parsed.interests) ? parsed.interests.map(String) : ['Reading', 'Travel'],
      bio: String(parsed.bio || `${parsed.firstName} is a professional based in ${loc.city || 'the area'}.`),
      profileType: pType,
      avatarStyle,
      avatarUrl: generateAvatarUrl(seed, avatarStyle),
      createdAt: new Date().toISOString(),
    });
  }

  return results;
}

export async function POST(req: Request) {
  let config: GeneratorConfig = {
    country: 'random',
    continent: 'random',
    nameStyle: 'any',
    ageRange: [22, 45],
    gender: 'random',
    language: 'random',
    timezone: 'random',
    profileType: 'random',
  };
  let requestedCount = 5;
  try {
    const body: { config?: GeneratorConfig; count?: number } = await req.json();
    if (body.config) config = body.config;
    requestedCount = body.count ?? 5;

    const targetCount = Math.min(Math.max(1, requestedCount), 50);

    if (!isAiConfigured()) {
      return NextResponse.json(await generateLocalBatch(config, targetCount));
    }

    const chunkSize = 5;
    const chunkCount = Math.ceil(targetCount / chunkSize);
    const chunkPromises = [];

    for (let i = 0; i < chunkCount; i++) {
      const currentChunkSize = Math.min(chunkSize, targetCount - i * chunkSize);
      chunkPromises.push(generateSingleBatch(config, currentChunkSize));
    }

    const chunkResults = await Promise.all(chunkPromises);
    const identities = chunkResults.flat();

    return NextResponse.json(identities);
  } catch (error) {
    console.error('Error in /api/generate-batch:', error);
    try {
      return NextResponse.json(await generateLocalBatch(config, Math.min(Math.max(1, requestedCount), 50)));
    } catch {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to generate batch' },
        { status: 500 }
      );
    }
  }
}
