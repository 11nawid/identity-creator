import { NextResponse } from 'next/server';
import { generate, isAiConfigured } from '@/lib/gemini';
import { ensureMatchingCoordinates } from '@/lib/geocoding';
import { buildAllPlatformUsernames } from '@/lib/username-checker';
import { generateLocalSection } from '@/lib/local-generator';
import {
  SyntheticIdentity,
  AvatarStyle,
  IdentityDetailTab,
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
  return `https://api.dicebear.com/9.x/${styleMap[style] || 'lorelei'}/svg?seed=${encodeURIComponent(seed)}`;
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
  let section: IdentityDetailTab | undefined;
  let identity: SyntheticIdentity | undefined;
  try {
    const body = (await req.json()) as {
      section: IdentityDetailTab;
      identity: SyntheticIdentity;
    };
    section = body?.section;
    identity = body?.identity;

    if (!section || !identity) {
      return NextResponse.json(
        { error: 'Section and identity are required' },
        { status: 400 }
      );
    }

    if (!isAiConfigured()) {
      return NextResponse.json({ slice: await generateLocalSection(section, identity) });
    }

    const country = identity.location?.country || 'United States';
    const countryCode = identity.location?.countryCode || 'US';
    const gender = identity.gender || 'neutral';
    const age = identity.age || 30;

    let slice: Partial<SyntheticIdentity> = {};

    switch (section) {
      case 'personal': {
        const prompt = `Generate new authentic personal details for an individual in ${country}.
Gender: ${gender}
Target Age: ${age}
Current Name: ${identity.firstName} ${identity.lastName}

Respond ONLY with a valid JSON object:
{
  "firstName": "string (culturally accurate)",
  "lastName": "string (culturally accurate)",
  "displayName": "string (First Last)",
  "dob": "YYYY-MM-DD",
  "age": ${age},
  "languages": ["string", "string"],
  "contact": {
    "phone": "string (valid national/international format for ${country})",
    "emergencyContact": {
      "name": "string",
      "relationship": "string",
      "phone": "string"
    }
  },
  "bio": "string (2-3 realistic sentences highlighting persona)"
}`;

        const text = await generate(prompt);
        const data = extractJson(text) || {};

        const firstName = String(data.firstName || 'Alex');
        const lastName = String(data.lastName || 'Morgan');
        const displayName = String(data.displayName || `${firstName} ${lastName}`);
        const avatarUrl = generateAvatarUrl(
          `${firstName}_${lastName}`,
          identity.avatarStyle || 'illustration'
        );

        const contactRaw = (data.contact as Record<string, unknown>) || {};
        const emerRaw =
          (contactRaw.emergencyContact as Record<string, unknown>) || {};

        slice = {
          firstName,
          lastName,
          displayName,
          dateOfBirth: String(data.dob || identity.dateOfBirth),
          age: Number(data.age) || age,
          languages: Array.isArray(data.languages)
            ? (data.languages as string[]).map(String)
            : identity.languages,
          contact: {
            phone: String(contactRaw.phone || identity.contact.phone),
            emergencyContact: {
              name: String(emerRaw.name || identity.contact.emergencyContact.name),
              relationship: String(
                emerRaw.relationship ||
                  identity.contact.emergencyContact.relationship
              ),
              phone: String(
                emerRaw.phone || identity.contact.emergencyContact.phone
              ),
            },
          },
          avatarUrl,
          bio: String(data.bio || identity.bio),
        };
        break;
      }

      case 'location': {
        const prompt = `Generate a new realistic, real-world residential address located in ${country} (${countryCode}).
Respond ONLY with a valid JSON object:
{
  "street": "string (real-sounding street name and building number in ${country})",
  "city": "string (real city in ${country})",
  "region": "string (state / province / county)",
  "postalCode": "string (valid postal code format for ${country})",
  "timezone": "string (e.g. America/New_York or valid IANA timezone)"
}`;

        const text = await generate(prompt);
        const data = extractJson(text) || {};

        const street = String(data.street || '452 Highland Ave');
        const city = String(data.city || 'Chicago');
        const region = String(data.region || 'Illinois');
        const postalCode = String(data.postalCode || '60601');
        const timezone = String(data.timezone || identity.timezone);

        const coords = await ensureMatchingCoordinates(
          { street, city, region, country },
          undefined
        );

        slice = {
          timezone,
          location: {
            ...identity.location,
            street,
            city,
            region,
            postalCode,
            coordinates: coords,
          },
        };
        break;
      }

      case 'career': {
        const prompt = `Generate updated professional and educational credentials for a ${age}-year-old ${identity.profileType} living in ${country}.
Respond ONLY with a valid JSON object:
{
  "professional": {
    "job": "string",
    "industry": "string",
    "experience": "string",
    "skills": ["string", "string", "string", "string"],
    "education": "string",
    "company": "string",
    "department": "string"
  },
  "educationDetails": {
    "institution": "string",
    "degree": "string",
    "graduationYear": ${Math.max(1980, new Date().getFullYear() - (age - 22))},
    "certifications": ["string", "string"]
  }
}`;

        const text = await generate(prompt);
        const data = extractJson(text) || {};

        const profRaw = (data.professional as Record<string, unknown>) || {};
        const eduRaw = (data.educationDetails as Record<string, unknown>) || {};

        slice = {
          professional: {
            job: String(profRaw.job || 'Senior Consultant'),
            industry: String(profRaw.industry || 'Technology'),
            experience: String(profRaw.experience || `${Math.max(1, age - 22)} years`),
            skills: Array.isArray(profRaw.skills)
              ? (profRaw.skills as string[]).map(String)
              : ['Project Management', 'Data Analysis'],
            education: String(profRaw.education || "Bachelor's Degree"),
            company: String(profRaw.company || 'Enterprise Systems Ltd'),
            department: String(profRaw.department || 'Operations'),
          },
          educationDetails: {
            institution: String(eduRaw.institution || 'State University'),
            degree: String(eduRaw.degree || 'Bachelor of Science'),
            graduationYear:
              Number(eduRaw.graduationYear) ||
              Math.max(1980, new Date().getFullYear() - (age - 22)),
            certifications: Array.isArray(eduRaw.certifications)
              ? (eduRaw.certifications as string[]).map(String)
              : ['Certified Professional'],
          },
        };
        break;
      }

      case 'financial': {
        const currCode = identity.financial?.currency?.code || 'USD';
        const prompt = `Generate new authentic financial details for an individual in ${country} with currency ${currCode}.
Respond ONLY with a valid JSON object:
{
  "annualSalary": "string (e.g. $88,000 / year or formatted in local currency)",
  "creditScore": 735,
  "creditRating": "Good",
  "bankName": "string (a prominent real bank operating in ${country})",
  "accountNumberMasked": "string (e.g. **** 4918 or masked IBAN)"
}`;

        const text = await generate(prompt);
        const data = extractJson(text) || {};

        slice = {
          financial: {
            ...identity.financial,
            annualSalary: String(
              data.annualSalary || identity.financial?.annualSalary || '$75,000 / year'
            ),
            creditScore: Number(data.creditScore) || 720,
            creditRating: String(data.creditRating || 'Good'),
            bankName: String(
              data.bankName || identity.financial?.bankName || 'Metro Bank'
            ),
            accountNumberMasked: String(
              data.accountNumberMasked || '**** 6721'
            ),
          },
        };
        break;
      }

      case 'physical': {
        const prompt = `Generate realistic physical attributes for an individual (${gender}, ${age} years old).
Respond ONLY with a valid JSON object:
{
  "bloodType": "string (e.g. O+, A+, B+, AB+)",
  "height": "string (e.g. 178 cm / 5'10\\")",
  "weight": "string (e.g. 72 kg / 158 lbs)",
  "eyeColor": "string",
  "hairColor": "string",
  "maritalStatus": "string (Single, Married, Divorced, or In a Relationship)"
}`;

        const text = await generate(prompt);
        const data = extractJson(text) || {};

        slice = {
          physical: {
            bloodType: String(data.bloodType || 'O+'),
            height: String(data.height || "175 cm / 5'9\""),
            weight: String(data.weight || '70 kg / 154 lbs'),
            eyeColor: String(data.eyeColor || 'Brown'),
            hairColor: String(data.hairColor || 'Brown'),
            maritalStatus: String(data.maritalStatus || 'Single'),
          },
        };
        break;
      }

      case 'digital': {
        const cleanFirst = identity.firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanLast = identity.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const randSeed = Math.floor(100 + Math.random() * 899);

        const prompt = `Generate fresh online identity handles and technical digital security identifiers for ${identity.firstName} ${identity.lastName} working as a ${identity.professional?.job || 'Specialist'}.
Respond ONLY with a valid JSON object:
{
  "username": "string (unique authentic username e.g. ${cleanFirst}_${cleanLast}${randSeed} or ${cleanFirst}.${cleanLast}${randSeed})",
  "usernameVariations": [
    "string",
    "string",
    "string",
    "string"
  ],
  "creatorHandle": "string (e.g. @${cleanFirst}${cleanLast}_create)",
  "developerHandle": "string (e.g. ${cleanFirst}${cleanLast}.dev)",
  "gamingHandle": "string (e.g. ${cleanFirst}${cleanLast}Gamer)",
  "ipv4": "string (valid public IPv4 address)",
  "macAddress": "string (valid MAC address uppercase XX:XX:XX:XX:XX:XX)",
  "userAgent": "string (modern Windows or Mac browser UA string)",
  "cryptoWallet": "string (abbreviated Ethereum address e.g. 0x...)"
}`;

        const text = await generate(prompt);
        const data = extractJson(text) || {};

        const newUsername = String(
          data.username || `${cleanFirst}_${cleanLast}${randSeed}`
        );
        const newVariations =
          Array.isArray(data.usernameVariations) && data.usernameVariations.length > 0
            ? (data.usernameVariations as string[]).map(String)
            : [
                `${cleanFirst}_${cleanLast}${randSeed}`,
                `${cleanFirst}.${cleanLast}_pro`,
                `${cleanFirst}${cleanLast}${randSeed}`,
                `${cleanFirst}_${cleanLast}_official`,
              ];
        const newCreatorHandle = String(
          data.creatorHandle || `@${cleanFirst}_${cleanLast}`
        );
        const newDevHandle = String(
          data.developerHandle || `${cleanFirst}${cleanLast}.dev`
        );
        const newGamingHandle = String(
          data.gamingHandle || `${cleanFirst}${cleanLast}Gamer`
        );

        const refreshedPlatforms = await buildAllPlatformUsernames({
          firstName: identity.firstName,
          lastName: identity.lastName,
          displayName: identity.displayName,
          job: identity.professional?.job || 'Specialist',
          company: identity.professional?.company || 'Nexus Global',
          city: identity.location?.city || 'New York',
          country: identity.location?.country || 'United States',
        });

        slice = {
          digital: {
            ipv4: String(data.ipv4 || '198.51.100.54'),
            macAddress: String(data.macAddress || '3C:52:82:1A:4F:9E'),
            userAgent: String(
              data.userAgent ||
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            ),
            cryptoWallet: String(data.cryptoWallet || '0x4f8...b721'),
          },
          online: {
            username: newUsername,
            usernameVariations: newVariations,
            displayName: identity.displayName,
            creatorHandle: newCreatorHandle,
            developerHandle: newDevHandle,
            gamingHandle: newGamingHandle,
            usernameStatus: 'available',
            platforms: refreshedPlatforms,
          },
        };
        break;
      }

      case 'lifestyle': {
        const prompt = `Generate fresh lifestyle and leisure details for an individual.
Respond ONLY with a valid JSON object:
{
  "zodiacSign": "string",
  "favoriteQuote": "string (inspiring, realistic quote)",
  "favoriteCuisine": "string",
  "musicGenre": "string",
  "pet": "string",
  "interests": ["string", "string", "string", "string"]
}`;

        const text = await generate(prompt);
        const data = extractJson(text) || {};

        slice = {
          lifestyle: {
            zodiacSign: String(data.zodiacSign || 'Sagittarius'),
            favoriteQuote: String(
              data.favoriteQuote || 'Simplicity is the soul of efficiency.'
            ),
            favoriteCuisine: String(data.favoriteCuisine || 'Mediterranean'),
            musicGenre: String(data.musicGenre || 'Ambient / Indie'),
            pet: String(data.pet || 'Golden Retriever'),
          },
          interests: Array.isArray(data.interests)
            ? (data.interests as string[]).map(String)
            : ['Photography', 'Travel', 'Cycling', 'Cooking'],
        };
        break;
      }

      case 'ids': {
        const prompt = `Generate realistic synthetic government identification numbers for ${country} (${countryCode}).
Respond ONLY with a valid JSON object:
{
  "nationalIdMasked": "string (realistic national ID or SSN format masked with X)",
  "passportMasked": "string (realistic passport format masked with *)",
  "driverLicense": "string (realistic driver license format)"
}`;

        const text = await generate(prompt);
        const data = extractJson(text) || {};

        slice = {
          governmentIds: {
            nationalIdMasked: String(data.nationalIdMasked || 'XXX-XX-4912'),
            passportMasked: String(data.passportMasked || 'P8249****'),
            driverLicense: String(data.driverLicense || 'DL-839201'),
          },
        };
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown section' }, { status: 400 });
    }

    return NextResponse.json({ slice });
  } catch (error) {
    console.error('Error in /api/generate-section:', error);
    if (section && identity) {
      try {
        return NextResponse.json({ slice: await generateLocalSection(section, identity) });
      } catch {
        // fall through to error response
      }
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to regenerate section',
      },
      { status: 500 }
    );
  }
}
