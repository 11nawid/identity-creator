export type Country =
  | 'united-states'
  | 'canada'
  | 'united-kingdom'
  | 'germany'
  | 'france'
  | 'japan'
  | 'australia'
  | 'brazil'
  | 'india'
  | 'netherlands'
  | 'sweden'
  | 'south-korea'
  | 'spain'
  | 'italy'
  | 'mexico'
  | 'afghanistan'
  | 'china'
  | 'russia'
  | 'iran'
  | 'turkey'
  | 'saudi-arabia'
  | 'palestine'
  | 'nigeria'
  | 'south-africa'
  | 'argentina'
  | 'new-zealand'
  // Europe
  | 'portugal'
  | 'ireland'
  | 'austria'
  | 'switzerland'
  | 'belgium'
  | 'denmark'
  | 'norway'
  | 'finland'
  | 'poland'
  | 'czechia'
  | 'greece'
  | 'hungary'
  | 'ukraine'
  | 'romania'
  | 'iceland'
  | 'croatia'
  // Asia
  | 'indonesia'
  | 'thailand'
  | 'vietnam'
  | 'philippines'
  | 'malaysia'
  | 'singapore'
  | 'pakistan'
  | 'bangladesh'
  | 'sri-lanka'
  | 'nepal'
  | 'taiwan'
  | 'hong-kong'
  | 'mongolia'
  | 'cambodia'
  | 'myanmar'
  | 'uzbekistan'
  | 'kazakhstan'
  // Middle East
  | 'united-arab-emirates'
  | 'qatar'
  | 'kuwait'
  | 'oman'
  | 'bahrain'
  | 'israel'
  | 'jordan'
  | 'iraq'
  | 'lebanon'
  // Africa
  | 'egypt'
  | 'morocco'
  | 'algeria'
  | 'tunisia'
  | 'kenya'
  | 'ethiopia'
  | 'ghana'
  | 'tanzania'
  | 'uganda'
  | 'senegal'
  | 'ivory-coast'
  | 'cameroon'
  | 'zimbabwe'
  | 'angola'
  | 'rwanda'
  | 'zambia'
  | 'mozambique'
  // North America & Caribbean
  | 'cuba'
  | 'jamaica'
  | 'guatemala'
  | 'panama'
  | 'costa-rica'
  | 'dominican-republic'
  // South America
  | 'colombia'
  | 'chile'
  | 'peru'
  | 'venezuela'
  | 'ecuador'
  | 'uruguay'
  | 'bolivia'
  | 'paraguay'
  // Oceania
  | 'fiji'
  | 'papua-new-guinea'
  | 'samoa'
  | 'tonga'
  | 'vanuatu';

export type Continent =
  | 'north-america'
  | 'south-america'
  | 'europe'
  | 'asia'
  | 'middle-east'
  | 'africa'
  | 'oceania';

export type Gender = 'male' | 'female';

export type NameStyle =
  | 'western'
  | 'european'
  | 'asian'
  | 'middle-eastern'
  | 'latin-american'
  | 'african'
  | 'oceanic'
  | 'mixed'
  | 'any';

export type ProfileType =
  | 'developer'
  | 'designer'
  | 'creator'
  | 'gamer'
  | 'student'
  | 'professional'
  | 'traveler'
  | 'test-user'
  | 'writer'
  | 'scientist'
  | 'artist'
  | 'musician'
  | 'chef'
  | 'entrepreneur'
  | 'educator'
  | 'engineer'
  | 'healthcare'
  | 'legal'
  | 'marketer'
  | 'journalist'
  | 'photographer'
  | 'athlete'
  | 'data-scientist'
  | 'nurse'
  | 'pilot'
  | 'architect'
  | 'accountant'
  | 'consultant'
  | 'sales'
  | 'cybersecurity'
  | 'fitness-trainer'
  | 'barista'
  | 'translator'
  | 'mechanic'
  | 'electrician'
  | 'carpenter'
  | 'veterinarian'
  | 'realtor';

export type AvatarStyle =
  | 'minimal'
  | 'cartoon'
  | 'illustration'
  | 'pixel'
  | 'professional'
  | 'gaming';

export type UsernameStatus = 'available' | 'taken' | 'checking' | 'unknown';

export interface PlatformUsername {
  platform: string;
  category: 'social' | 'developer' | 'gaming' | 'professional' | 'creative' | 'productivity' | 'messaging' | 'other';
  username: string;
  status: UsernameStatus;
  profileUrl: string;
  checkUrl?: string;
  bio?: string;
  checkedAt?: string;
  detail?: string;
}

export type SeniorityLevel = 'auto' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'unemployed';

export type EducationLevelFilter =
  | 'auto'
  | 'high-school'
  | 'some-college'
  | 'trade'
  | 'associate'
  | 'certification'
  | 'bachelor'
  | 'master'
  | 'doctorate';

export type PersonalityTone =
  | 'auto'
  | 'techie'
  | 'creative'
  | 'corporate'
  | 'academic'
  | 'adventurous'
  | 'minimalist'
  | 'sporty'
  | 'family'
  | 'eco'
  | 'luxury'
  | 'spiritual'
  | 'humorous'
  | 'chill';
export type GenerationMode = 'normal' | 'basic' | 'advanced';

export type MaritalStatusFilter =
  | 'auto'
  | 'single'
  | 'married'
  | 'in-relationship'
  | 'engaged'
  | 'divorced'
  | 'widowed';

export type IncomeBracket = 'auto' | 'low' | 'lower-middle' | 'middle' | 'upper-middle' | 'high';

export type IndustryFilter = string;

export interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  postalCode: string;
  street: string;
  coordinates: { lat: number; lng: number };
}

export interface OnlineIdentity {
  username: string;
  usernameVariations: string[];
  displayName: string;
  creatorHandle: string;
  developerHandle: string;
  gamingHandle: string;
  usernameStatus: UsernameStatus;
  platforms?: PlatformUsername[];
}

export interface ProfessionalData {
  job: string;
  industry: string;
  experience: string;
  skills: string[];
  education: string;
  company: string;
  department: string;
}

export interface ContactData {
  phone: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface PhysicalData {
  bloodType: string;
  height: string;
  weight: string;
  eyeColor: string;
  hairColor: string;
  maritalStatus: string;
}

export interface FinancialData {
  creditScore: number;
  creditRating: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  annualSalary: string;
  bankName: string;
  accountNumberMasked: string;
}

export interface DigitalSecurity {
  ipv4: string;
  macAddress: string;
  userAgent: string;
  cryptoWallet: string;
}

export interface LifestyleData {
  zodiacSign: string;
  favoriteQuote: string;
  favoriteCuisine: string;
  musicGenre: string;
  pet: string;
}

export interface EducationDetails {
  institution: string;
  degree: string;
  graduationYear: number;
  certifications: string[];
}

export interface GovernmentIds {
  nationalIdMasked: string;
  passportMasked: string;
  driverLicense: string;
}

export interface SyntheticIdentity {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  nationality: string;
  languages: string[];
  timezone: string;
  email: string;
  location: LocationData;
  online: OnlineIdentity;
  professional: ProfessionalData;
  contact: ContactData;
  physical: PhysicalData;
  financial: FinancialData;
  digital: DigitalSecurity;
  lifestyle: LifestyleData;
  educationDetails: EducationDetails;
  governmentIds: GovernmentIds;
  interests: string[];
  bio: string;
  profileType: ProfileType;
  avatarStyle: AvatarStyle;
  avatarUrl: string;
  createdAt: string;
}

export interface GeneratorConfig {
  country: Country | 'random';
  continent: Continent | 'random';
  nameStyle: NameStyle;
  ageRange: [number, number];
  gender: Gender | 'random';
  language: string;
  timezone: string;
  profileType: ProfileType | 'random';
  seniorityLevel?: SeniorityLevel;
  educationLevel?: EducationLevelFilter;
  personalityTone?: PersonalityTone;
  maritalStatus?: MaritalStatusFilter;
  industry?: IndustryFilter;
  incomeBracket?: IncomeBracket;
  favoriteCuisine?: string;
  musicGenre?: string;
  interests?: string;
  petPreference?: string;
  zodiacSign?: string;
  avatarStyle?: AvatarStyle | 'random';
  mode?: GenerationMode;
}

export interface BatchOptions {
  count: 5 | 10 | 25 | 50;
}

export type ExportFormat = 'json' | 'csv' | 'txt' | 'pdf';

export type NavTab = 'dashboard' | 'create' | 'identities' | 'saved' | 'settings';

export type IdentityDetailTab =
  | 'personal'
  | 'location'
  | 'career'
  | 'financial'
  | 'physical'
  | 'digital'
  | 'lifestyle'
  | 'ids'
  | 'inbox';

export type ToastType = 'success' | 'error' | 'info';