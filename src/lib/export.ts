import { SyntheticIdentity, ExportFormat } from '@/types';

export function identityToJSON(identity: SyntheticIdentity): string {
  return JSON.stringify(
    {
      syntheticIdentity: identity,
      disclaimer:
        'SYNTHETIC PROFILE — For testing, development, and prototyping only. Do not use to impersonate real people.',
    },
    null,
    2
  );
}

export function identityToCSV(identity: SyntheticIdentity): string {
  const headers = [
    'full_name',
    'username',
    'first_name',
    'last_name',
    'email',
    'phone',
    'age',
    'date_of_birth',
    'gender',
    'nationality',
    'languages',
    'timezone',
    'country',
    'region',
    'city',
    'postal_code',
    'street',
    'latitude',
    'longitude',
    'job',
    'industry',
    'experience',
    'company',
    'department',
    'education',
    'skills',
    'blood_type',
    'height',
    'weight',
    'marital_status',
    'annual_salary',
    'credit_score',
    'bank_name',
    'ipv4',
    'mac_address',
    'zodiac_sign',
    'institution',
    'degree',
    'graduation_year',
    'certifications',
    'national_id',
    'passport_number',
    'driver_license',
    'interests',
    'profile_type',
    'created_at',
  ];

  const row = [
    identity.displayName,
    identity.online.username,
    identity.firstName,
    identity.lastName,
    identity.email,
    identity.contact?.phone || '',
    identity.age,
    identity.dateOfBirth,
    identity.gender,
    identity.nationality,
    identity.languages.join('; '),
    identity.timezone,
    identity.location.country,
    identity.location.region,
    identity.location.city,
    identity.location.postalCode,
    identity.location.street,
    identity.location.coordinates.lat,
    identity.location.coordinates.lng,
    identity.professional.job,
    identity.professional.industry,
    identity.professional.experience,
    identity.professional.company,
    identity.professional.department,
    identity.professional.education,
    identity.professional.skills.join('; '),
    identity.physical?.bloodType || '',
    identity.physical?.height || '',
    identity.physical?.weight || '',
    identity.physical?.maritalStatus || '',
    identity.financial?.annualSalary || '',
    identity.financial?.creditScore || '',
    identity.financial?.bankName || '',
    identity.digital?.ipv4 || '',
    identity.digital?.macAddress || '',
    identity.lifestyle?.zodiacSign || '',
    identity.educationDetails?.institution || '',
    identity.educationDetails?.degree || '',
    identity.educationDetails?.graduationYear || '',
    identity.educationDetails?.certifications?.join('; ') || '',
    identity.governmentIds?.nationalIdMasked || '',
    identity.governmentIds?.passportMasked || '',
    identity.governmentIds?.driverLicense || '',
    identity.interests.join('; '),
    identity.profileType,
    identity.createdAt,
  ];

  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  return [headers.map(escape).join(','), row.map(escape).join(',')].join('\n');
}

export function identityToTXT(identity: SyntheticIdentity): string {
  return `SYNTHETIC IDENTITY PROFILE
===========================

PERSONAL INFORMATION
--------------------
Full Name: ${identity.displayName}
First / Last Name: ${identity.firstName} ${identity.lastName}
Gender: ${identity.gender}
Date of Birth: ${identity.dateOfBirth} (${identity.age} years old)
Nationality: ${identity.nationality}
Languages: ${identity.languages.join(', ')}
Timezone: ${identity.timezone}

CONTACT & EMERGENCY
-------------------
Phone: ${identity.contact?.phone || '—'}
Email: ${identity.email}
Emergency Contact: ${identity.contact?.emergencyContact?.name || '—'} (${identity.contact?.emergencyContact?.relationship || '—'}) - ${identity.contact?.emergencyContact?.phone || '—'}

PHYSICAL DEMOGRAPHICS
---------------------
Blood Type: ${identity.physical?.bloodType || '—'}
Height / Weight: ${identity.physical?.height || '—'} / ${identity.physical?.weight || '—'}
Eye / Hair Color: ${identity.physical?.eyeColor || '—'} / ${identity.physical?.hairColor || '—'}
Marital Status: ${identity.physical?.maritalStatus || '—'}

LOCATION & COORDINATES
----------------------
Street Address: ${identity.location.street}
City, Region: ${identity.location.city}, ${identity.location.region}
Postal Code: ${identity.location.postalCode}
Country: ${identity.location.country} (${identity.location.countryCode})
Coordinates: Latitude ${identity.location.coordinates.lat}, Longitude ${identity.location.coordinates.lng}

PROFESSIONAL CAREER
-------------------
Job Title: ${identity.professional.job}
Company: ${identity.professional.company}
Department: ${identity.professional.department}
Industry: ${identity.professional.industry}
Experience: ${identity.professional.experience}
Education: ${identity.professional.education}
Skills: ${identity.professional.skills.join(', ')}

FINANCIAL PROFILE
-----------------
Annual Salary: ${identity.financial?.annualSalary || '—'}
Credit Score: ${identity.financial?.creditScore || '—'} (${identity.financial?.creditRating || '—'})
Bank: ${identity.financial?.bankName || '—'}
Account / IBAN: ${identity.financial?.accountNumberMasked || '—'}
Currency: ${identity.financial?.currency?.name || '—'} (${identity.financial?.currency?.code || '—'})

EDUCATION & CREDENTIALS
-----------------------
Institution: ${identity.educationDetails?.institution || '—'}
Degree: ${identity.educationDetails?.degree || '—'} (Class of ${identity.educationDetails?.graduationYear || '—'})
Certifications: ${identity.educationDetails?.certifications?.join(', ') || '—'}

DIGITAL & SECURITY
------------------
IPv4 Address: ${identity.digital?.ipv4 || '—'}
MAC Address: ${identity.digital?.macAddress || '—'}
Crypto Wallet: ${identity.digital?.cryptoWallet || '—'}
User Agent: ${identity.digital?.userAgent || '—'}

LIFESTYLE & PREFERENCES
-----------------------
Zodiac Sign: ${identity.lifestyle?.zodiacSign || '—'}
Personal Motto: "${identity.lifestyle?.favoriteQuote || '—'}"
Favorite Cuisine: ${identity.lifestyle?.favoriteCuisine || '—'}
Music Preference: ${identity.lifestyle?.musicGenre || '—'}
Pet: ${identity.lifestyle?.pet || '—'}
Interests: ${identity.interests.join(', ')}

OFFICIAL IDENTIFICATION (SYNTHETIC)
-----------------------------------
National ID / SSN: ${identity.governmentIds?.nationalIdMasked || '—'}
Passport: ${identity.governmentIds?.passportMasked || '—'}
Driver License: ${identity.governmentIds?.driverLicense || '—'}

ONLINE IDENTITY
---------------
Username: @${identity.online.username}
Variations: ${identity.online.usernameVariations.join(', ')}
Creator Handle: ${identity.online.creatorHandle}
Developer Handle: ${identity.online.developerHandle}
Gaming Handle: ${identity.online.gamingHandle}

BIOGRAPHY
---------
${identity.bio}

-------------------------------------------------------------------------------
Created: ${identity.createdAt}
DISCLAIMER: This is a synthetic profile generated for software testing,
development, design mockups, and prototyping. Not a real person.`;
}

export function identityToPDF(identity: SyntheticIdentity): string {
  const content = identityToTXT(identity);
  const lines = content.split('\n');
  const maxY = 760;
  const lineHeight = 18;

  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const commands: string[] = [];
  let y = 780;

  const sections: { text: string; bold: boolean }[] = [];
  for (const line of lines) {
    if (line.trim() === '') continue;
    const isHeader = /^[A-Z\s&()]{4,}$/.test(line.trim()) || line.startsWith('---') || line.startsWith('===');
    const isTitle = line.startsWith('SYNTHETIC IDENTITY');
    sections.push({ text: line, bold: isHeader || isTitle });
  }

  let page = 1;
  const addPage = () => {
    commands.push(`/Helv 8 Tf BT 40 ${maxY} Td (${esc(`Identity Creator — ${identity.displayName} (Page ${page})`)}) Tj ET`);
    page++;
  };

  addPage();

  for (const section of sections) {
    const font = section.bold ? '/Helv-Bold 9 Tf' : '/Helv 8 Tf';
    if (y < 40) {
      y = maxY;
      addPage();
    }
    commands.push(`${font} BT 40 ${y} Td (${esc(section.text)}) Tj ET`);
    y -= lineHeight;
  }

  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /Helv 5 0 R /Helv-Bold 6 0 R >> >> >>
endobj
4 0 obj
<< /Length ${commands.join(' ').length} >>
stream
${commands.join('\n')}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f
trailer
<< /Size 7 /Root 1 0 R >>
startxref
0
%%EOF`;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
}

export function getExportBlob(identity: SyntheticIdentity, format: ExportFormat): ExportResult {
  const base = identity.online.username;
  switch (format) {
    case 'json':
      return {
        blob: new Blob([identityToJSON(identity)], { type: 'application/json' }),
        filename: `${base}.identity.json`,
      };
    case 'csv':
      return {
        blob: new Blob(['\uFEFF' + identityToCSV(identity)], { type: 'text/csv;charset=utf-8' }),
        filename: `${base}.identity.csv`,
      };
    case 'txt':
      return {
        blob: new Blob([identityToTXT(identity)], { type: 'text/plain;charset=utf-8' }),
        filename: `${base}.identity.txt`,
      };
    case 'pdf':
      return {
        blob: new Blob([identityToPDF(identity)], { type: 'application/pdf' }),
        filename: `${base}.identity.pdf`,
      };
  }
}

export function exportIdentity(identity: SyntheticIdentity, format: ExportFormat) {
  const { blob, filename } = getExportBlob(identity, format);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportIdentities(identities: SyntheticIdentity[], format: ExportFormat) {
  if (format === 'json') {
    const payload = {
      syntheticIdentities: identities.map((i) => ({
        ...i,
        disclaimer:
          'SYNTHETIC PROFILES — For testing, development, and prototyping only. Do not use to impersonate real people.',
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synthetic-identities.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'csv') {
    if (identities.length === 0) return;
    const csvContent = identities.map((i) => identityToCSV(i)).join('\n\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synthetic-identities.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  identities.forEach((identity, idx) => {
    setTimeout(() => exportIdentity(identity, format), idx * 150);
  });
}