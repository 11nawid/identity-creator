import { NextResponse } from 'next/server';
import { generate, isAiConfigured } from '@/lib/gemini';
import { ensureMatchingCoordinates } from '@/lib/geocoding';
import { buildAllPlatformUsernames } from '@/lib/username-checker';
import { generateLocalIdentity } from '@/lib/local-generator';
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

function extractJson(text: string): Record<string, unknown> | null {
  const clean = text.trim();
  try {
    return JSON.parse(clean);
  } catch {}

  const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch {}
  }

  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    let sliced = clean.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(sliced);
    } catch {
      sliced = sliced.replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(sliced);
      } catch {}
    }
  }
  return null;
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
  try {
    config = await req.json();

    if (!isAiConfigured()) {
      return NextResponse.json(await generateLocalIdentity(config));
    }

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
    const gender: Gender =
      config.gender && config.gender !== 'random'
        ? config.gender
        : Math.random() > 0.5
        ? 'male'
        : 'female';
    const minAge = config.ageRange?.[0] || 22;
    const maxAge = config.ageRange?.[1] || 45;
    const avgAge = Math.floor((minAge + maxAge) / 2);

    const profileTypeRequested = config.profileType && config.profileType !== 'random' ? config.profileType : 'auto';
    const seniority = config.seniorityLevel && config.seniorityLevel !== 'auto' ? config.seniorityLevel : null;
    const educationFilter = config.educationLevel && config.educationLevel !== 'auto' ? config.educationLevel : null;
    const tone = config.personalityTone && config.personalityTone !== 'auto' ? config.personalityTone : null;
    const maritalStatusFilter = config.maritalStatus && config.maritalStatus !== 'auto' ? config.maritalStatus : null;

    const prompt = `Generate a realistic synthetic person profile in JSON with rich, comprehensive information.
Location: ${countryMeta.label} (${countryMeta.countryCode})
Gender: ${gender}
Target Age Range: ${minAge} to ${maxAge} (approx ${avgAge} years old)
Requested Profile Type: ${profileTypeRequested === 'auto' ? 'AI AUTO-DECIDE: Choose the most authentic, logical profile type and occupation based on their age (' + avgAge + '), education, and location. For young (18-23), consider student, junior dev, creator, or apprentice. For mid-career (28-45), consider senior dev, manager, designer, researcher, or entrepreneur. For older (48+), consider director, executive, professor, consultant, or specialist.' : profileTypeRequested}
${seniority ? `Desired Seniority Level: ${seniority}` : ''}
${educationFilter ? `Desired Education Level: ${educationFilter}` : ''}
${tone ? `Personality/Lifestyle Tone: ${tone}` : ''}
${maritalStatusFilter ? `Marital Status Preference: ${maritalStatusFilter}` : ''}
${config.industry && config.industry !== 'random' ? `Career Industry: ${config.industry}` : ''}
${config.incomeBracket && config.incomeBracket !== 'auto' ? `Income Bracket: ${config.incomeBracket}` : ''}
${config.favoriteCuisine && config.favoriteCuisine !== 'random' ? `Favorite Cuisine: ${config.favoriteCuisine}` : ''}
${config.musicGenre && config.musicGenre !== 'random' ? `Music Genre: ${config.musicGenre}` : ''}
${config.interests && config.interests !== 'random' ? `Primary Hobby / Interest: ${config.interests}` : ''}
${config.petPreference && config.petPreference !== 'random' ? `Pet Preference: ${config.petPreference}` : ''}
${config.zodiacSign && config.zodiacSign !== 'random' ? `Zodiac Sign: ${config.zodiacSign}` : ''}
${config.language && config.language !== 'random' ? `Language: ${config.language}` : `Native Language: ${countryMeta.language}`}
${config.timezone && config.timezone !== 'random' ? `Timezone: ${config.timezone}` : `Timezone: ${countryMeta.timezone}`}

CRITICAL REQUIREMENTS:
1. Physical Location & Coordinates: Provide a REAL physical street address, real city, real postal code, and EXACT matching geographic coordinates ("lat" and "lng") for this city in ${countryMeta.label}.
2. Provide all 25+ detailed synthetic identity fields as requested in the JSON schema below.
3. Keep all numbers, formatting, and details authentic to ${countryMeta.label}.

Return ONLY a valid raw JSON object adhering STRICTLY to this schema (no markdown, no other text):
{
  "firstName": "string",
  "lastName": "string",
  "displayName": "string",
  "gender": "${gender}",
  "dateOfBirth": "YYYY-MM-DD",
  "age": number,
  "nationality": "${countryMeta.label}",
  "languages": ["string", "string"],
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
    "usernameVariations": ["string", "string", "string"],
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
    "skills": ["string", "string", "string"],
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
    "certifications": ["string", "string"]
  },
  "governmentIds": {
    "nationalIdMasked": "string",
    "passportMasked": "string",
    "driverLicense": "string"
  },
  "interests": ["string", "string", "string"],
  "bio": "string",
  "profileType": "developer"
}`;

    const rawAIResponse = await generate(prompt, 1, 4);
    const parsed = extractJson(rawAIResponse);
    const data: Record<string, unknown> = parsed || {};

    let firstName = String(data.firstName || '');
    let lastName = String(data.lastName || '');
    if ((!firstName || !lastName) && data.displayName) {
      const parts = String(data.displayName).trim().split(/\s+/);
      firstName = firstName || parts[0] || 'Alex';
      lastName = lastName || parts.slice(1).join(' ') || 'Morgan';
    } else if ((!firstName || !lastName) && data.name) {
      const parts = String(data.name).trim().split(/\s+/);
      firstName = firstName || parts[0] || 'Alex';
      lastName = lastName || parts.slice(1).join(' ') || 'Morgan';
    }
    if (!firstName) firstName = gender === 'female' ? 'Elena' : 'Marcus';
    if (!lastName) lastName = 'Vance';

    const loc = (data.location as Record<string, unknown>) || {};
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

    const chosenProfileType: ProfileType =
      (data.profileType as ProfileType) ||
      (config.profileType !== 'random' ? config.profileType : 'professional');

    const avatarStyle: AvatarStyle =
      config.avatarStyle && config.avatarStyle !== 'random'
        ? (config.avatarStyle as AvatarStyle)
        : chosenProfileType === 'gamer'
        ? 'gaming'
        : 'minimal';
    const seed = `${firstName}-${lastName}-${Date.now()}`;
    const avatarUrl = generateAvatarUrl(seed, avatarStyle);

    const contactRaw = (data.contact as Record<string, unknown>) || {};
    const emerRaw = (contactRaw.emergencyContact as Record<string, unknown>) || {};
    const physRaw = (data.physical as Record<string, unknown>) || {};
    const finRaw = (data.financial as Record<string, unknown>) || {};
    const curRaw = (finRaw.currency as Record<string, unknown>) || {};
    const digRaw = (data.digital as Record<string, unknown>) || {};
    const lifeRaw = (data.lifestyle as Record<string, unknown>) || {};
    const eduRaw = (data.educationDetails as Record<string, unknown>) || {};
    const govRaw = (data.governmentIds as Record<string, unknown>) || {};

    const jobTitle = String((data.professional as Record<string, unknown>)?.job || 'Specialist');
    const companyName = String((data.professional as Record<string, unknown>)?.company || 'Nexus Global');
    const cityName = String(loc.city || 'Capital');
    const countryName = String(loc.country || countryMeta.label);
    const displayName = String(data.displayName || `${firstName} ${lastName}`);

    const verifiedPlatforms = await buildAllPlatformUsernames({
      firstName,
      lastName,
      displayName,
      job: jobTitle,
      company: companyName,
      city: cityName,
      country: countryName,
    });

    const identity: SyntheticIdentity = {
      id: `ai-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      firstName,
      lastName,
      displayName,
      gender: (data.gender as Gender) || gender,
      dateOfBirth: String(data.dateOfBirth || '1996-06-15'),
      age: Number(data.age) || avgAge,
      nationality: String(data.nationality || countryMeta.label),
      languages: Array.isArray(data.languages) ? data.languages.map(String) : [countryMeta.language],
      timezone: String(data.timezone || countryMeta.timezone),
      email: String(data.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`),
      location: {
        country: countryName,
        countryCode: String(loc.countryCode || countryMeta.countryCode),
        region: String(loc.region || 'Metropolitan'),
        city: cityName,
        postalCode: String(loc.postalCode || '10001'),
        street: String(loc.street || '100 Main Street'),
        coordinates: verifiedCoordinates,
      },
      online: {
        username: String((data.online as Record<string, unknown>)?.username || `${firstName.toLowerCase()}${lastName.toLowerCase()}`),
        usernameVariations: Array.isArray((data.online as Record<string, unknown>)?.usernameVariations)
          ? ((data.online as Record<string, unknown>).usernameVariations as string[]).map(String)
          : [`${firstName.toLowerCase()}_${lastName.toLowerCase()}`, `${firstName.toLowerCase()}.${lastName.toLowerCase()}`],
        displayName: String((data.online as Record<string, unknown>)?.displayName || displayName),
        creatorHandle: String((data.online as Record<string, unknown>)?.creatorHandle || `@${firstName.toLowerCase()}`),
        developerHandle: String((data.online as Record<string, unknown>)?.developerHandle || `${firstName.toLowerCase()}.dev`),
        gamingHandle: String((data.online as Record<string, unknown>)?.gamingHandle || `${firstName.toLowerCase()}Gamer`),
        usernameStatus: (data.online as Record<string, unknown>)?.usernameStatus === 'taken' ? 'taken' : 'available',
        platforms: verifiedPlatforms,
      },
      professional: {
        job: String((data.professional as Record<string, unknown>)?.job || 'Specialist'),
        industry: String((data.professional as Record<string, unknown>)?.industry || 'Technology'),
        experience: String((data.professional as Record<string, unknown>)?.experience || '5 years'),
        skills: Array.isArray((data.professional as Record<string, unknown>)?.skills)
          ? ((data.professional as Record<string, unknown>).skills as string[]).map(String)
          : ['Critical Thinking', 'Problem Solving'],
        education: String((data.professional as Record<string, unknown>)?.education || 'Bachelor Degree'),
        company: String((data.professional as Record<string, unknown>)?.company || 'Nexus Global'),
        department: String((data.professional as Record<string, unknown>)?.department || 'Operations'),
      },
      contact: {
        phone: String(contactRaw.phone || '+1 (555) 234-5678'),
        emergencyContact: {
          name: String(emerRaw.name || 'Emergency Contact'),
          relationship: String(emerRaw.relationship || 'Spouse'),
          phone: String(emerRaw.phone || '+1 (555) 987-6543'),
        },
      },
      physical: {
        bloodType: String(physRaw.bloodType || 'O+'),
        height: String(physRaw.height || '175 cm / 5\'9"'),
        weight: String(physRaw.weight || '70 kg / 154 lbs'),
        eyeColor: String(physRaw.eyeColor || 'Brown'),
        hairColor: String(physRaw.hairColor || 'Dark Brown'),
        maritalStatus: String(physRaw.maritalStatus || 'Single'),
      },
      financial: {
        creditScore: Number(finRaw.creditScore) || 720,
        creditRating: String(finRaw.creditRating || 'Good'),
        currency: {
          code: String(curRaw.code || 'USD'),
          symbol: String(curRaw.symbol || '$'),
          name: String(curRaw.name || 'US Dollar'),
        },
        annualSalary: String(finRaw.annualSalary || '$85,000 / year'),
        bankName: String(finRaw.bankName || 'First National Bank'),
        accountNumberMasked: String(finRaw.accountNumberMasked || '**** 8842'),
      },
      digital: {
        ipv4: String(digRaw.ipv4 || '198.51.100.42'),
        macAddress: String(digRaw.macAddress || '4A:2B:6C:8D:1E:3F'),
        userAgent: String(digRaw.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'),
        cryptoWallet: String(digRaw.cryptoWallet || '0x71C...49b2'),
      },
      lifestyle: {
        zodiacSign: String(lifeRaw.zodiacSign || 'Gemini'),
        favoriteQuote: String(lifeRaw.favoriteQuote || 'Simplicity is the soul of efficiency.'),
        favoriteCuisine: String(lifeRaw.favoriteCuisine || 'Mediterranean'),
        musicGenre: String(lifeRaw.musicGenre || 'Ambient / Indie'),
        pet: String(lifeRaw.pet || 'None'),
      },
      educationDetails: {
        institution: String(eduRaw.institution || 'State University'),
        degree: String(eduRaw.degree || 'Bachelor of Science'),
        graduationYear: Number(eduRaw.graduationYear) || (new Date().getFullYear() - 5),
        certifications: Array.isArray(eduRaw.certifications) ? eduRaw.certifications.map(String) : ['Certified Professional'],
      },
      governmentIds: {
        nationalIdMasked: String(govRaw.nationalIdMasked || 'XXX-XX-8491'),
        passportMasked: String(govRaw.passportMasked || 'P8249****'),
        driverLicense: String(govRaw.driverLicense || 'DL-930281'),
      },
      interests: Array.isArray(data.interests) ? data.interests.map(String) : ['Technology', 'Travel', 'Photography'],
      bio: String(data.bio || `${firstName} is a professional living in ${loc.city || 'the city'}.`),
      profileType: chosenProfileType,
      avatarStyle,
      avatarUrl,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(identity);
  } catch (error) {
    console.error('Error in /api/generate:', error);
    try {
      return NextResponse.json(await generateLocalIdentity(config));
    } catch {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to generate identity' },
        { status: 500 }
      );
    }
  }
}
