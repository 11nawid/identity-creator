import { Country, Continent, Gender, ProfileType, NameStyle, AvatarStyle } from '@/types';
import { EXTRA_COUNTRY_META } from '@/data/extra-countries';

export type CountryMeta = {
  value: Country;
  label: string;
  flag: string;
  countryCode: string;
  continent: Continent;
  style: NameStyle;
  language: string;
  timezone: string;
};

const BASE_COUNTRY_META: CountryMeta[] = [
  { value: 'united-states', label: 'United States', flag: '🇺🇸', countryCode: 'US', continent: 'north-america', style: 'western', language: 'English', timezone: 'America/New_York' },
  { value: 'canada', label: 'Canada', flag: '🇨🇦', countryCode: 'CA', continent: 'north-america', style: 'western', language: 'English', timezone: 'America/Toronto' },
  { value: 'mexico', label: 'Mexico', flag: '🇲🇽', countryCode: 'MX', continent: 'north-america', style: 'latin-american', language: 'Spanish', timezone: 'America/Mexico_City' },
  { value: 'brazil', label: 'Brazil', flag: '🇧🇷', countryCode: 'BR', continent: 'south-america', style: 'latin-american', language: 'Portuguese', timezone: 'America/Sao_Paulo' },
  { value: 'argentina', label: 'Argentina', flag: '🇦🇷', countryCode: 'AR', continent: 'south-america', style: 'latin-american', language: 'Spanish', timezone: 'America/Argentina/Buenos_Aires' },
  { value: 'united-kingdom', label: 'United Kingdom', flag: '🇬🇧', countryCode: 'GB', continent: 'europe', style: 'western', language: 'English', timezone: 'Europe/London' },
  { value: 'germany', label: 'Germany', flag: '🇩🇪', countryCode: 'DE', continent: 'europe', style: 'european', language: 'German', timezone: 'Europe/Berlin' },
  { value: 'france', label: 'France', flag: '🇫🇷', countryCode: 'FR', continent: 'europe', style: 'european', language: 'French', timezone: 'Europe/Paris' },
  { value: 'netherlands', label: 'Netherlands', flag: '🇳🇱', countryCode: 'NL', continent: 'europe', style: 'european', language: 'Dutch', timezone: 'Europe/Amsterdam' },
  { value: 'sweden', label: 'Sweden', flag: '🇸🇪', countryCode: 'SE', continent: 'europe', style: 'european', language: 'Swedish', timezone: 'Europe/Stockholm' },
  { value: 'spain', label: 'Spain', flag: '🇪🇸', countryCode: 'ES', continent: 'europe', style: 'latin-american', language: 'Spanish', timezone: 'Europe/Madrid' },
  { value: 'italy', label: 'Italy', flag: '🇮🇹', countryCode: 'IT', continent: 'europe', style: 'european', language: 'Italian', timezone: 'Europe/Rome' },
  { value: 'russia', label: 'Russia', flag: '🇷🇺', countryCode: 'RU', continent: 'europe', style: 'asian', language: 'Russian', timezone: 'Europe/Moscow' },
  { value: 'afghanistan', label: 'Afghanistan', flag: '🇦🇫', countryCode: 'AF', continent: 'asia', style: 'asian', language: 'Dari', timezone: 'Asia/Kabul' },
  { value: 'china', label: 'China', flag: '🇨🇳', countryCode: 'CN', continent: 'asia', style: 'asian', language: 'Mandarin', timezone: 'Asia/Shanghai' },
  { value: 'india', label: 'India', flag: '🇮🇳', countryCode: 'IN', continent: 'asia', style: 'asian', language: 'Hindi', timezone: 'Asia/Kolkata' },
  { value: 'japan', label: 'Japan', flag: '🇯🇵', countryCode: 'JP', continent: 'asia', style: 'asian', language: 'Japanese', timezone: 'Asia/Tokyo' },
  { value: 'south-korea', label: 'South Korea', flag: '🇰🇷', countryCode: 'KR', continent: 'asia', style: 'asian', language: 'Korean', timezone: 'Asia/Seoul' },
  { value: 'iran', label: 'Iran', flag: '🇮🇷', countryCode: 'IR', continent: 'middle-east', style: 'middle-eastern', language: 'Persian', timezone: 'Asia/Tehran' },
  { value: 'turkey', label: 'Turkey', flag: '🇹🇷', countryCode: 'TR', continent: 'middle-east', style: 'middle-eastern', language: 'Turkish', timezone: 'Europe/Istanbul' },
  { value: 'saudi-arabia', label: 'Saudi Arabia', flag: '🇸🇦', countryCode: 'SA', continent: 'middle-east', style: 'middle-eastern', language: 'Arabic', timezone: 'Asia/Riyadh' },
  { value: 'palestine', label: 'Palestine', flag: '🇵🇸', countryCode: 'PS', continent: 'middle-east', style: 'middle-eastern', language: 'Arabic', timezone: 'Asia/Hebron' },
  { value: 'nigeria', label: 'Nigeria', flag: '🇳🇬', countryCode: 'NG', continent: 'africa', style: 'african', language: 'English', timezone: 'Africa/Lagos' },
  { value: 'south-africa', label: 'South Africa', flag: '🇿🇦', countryCode: 'ZA', continent: 'africa', style: 'african', language: 'English', timezone: 'Africa/Johannesburg' },
  { value: 'australia', label: 'Australia', flag: '🇦🇺', countryCode: 'AU', continent: 'oceania', style: 'western', language: 'English', timezone: 'Australia/Sydney' },
  { value: 'new-zealand', label: 'New Zealand', flag: '🇳🇿', countryCode: 'NZ', continent: 'oceania', style: 'oceanic', language: 'English', timezone: 'Pacific/Auckland' },
];

export const COUNTRY_META: CountryMeta[] = [...BASE_COUNTRY_META, ...EXTRA_COUNTRY_META];

export const COUNTRIES: { value: Country; label: string; flag: string }[] = COUNTRY_META.map(
  ({ value, label, flag }) => ({ value, label, flag })
);

export const CONTINENT_LABELS: Record<Continent, string> = {
  'north-america': 'North America',
  'south-america': 'South America',
  europe: 'Europe',
  asia: 'Asia',
  'middle-east': 'Middle East',
  africa: 'Africa',
  oceania: 'Oceania',
};

export const CONTINENTS: { value: Continent; label: string }[] = (
  Object.keys(CONTINENT_LABELS) as Continent[]
).map((value) => ({ value, label: CONTINENT_LABELS[value] }));

export const CONTINENT_COUNTRIES: Record<Continent, Country[]> = (() => {
  const map = {} as Record<Continent, Country[]>;
  for (const c of COUNTRY_META) {
    (map[c.continent] = map[c.continent] || []).push(c.value);
  }
  return map;
})();

export const STYLE_LABELS: Record<NameStyle, string> = {
  western: 'Western',
  european: 'European',
  asian: 'Asian',
  'middle-eastern': 'Middle Eastern',
  'latin-american': 'Latin American',
  african: 'African',
  oceanic: 'Oceanic',
  mixed: 'Mixed',
  any: 'Any',
};

export const NAME_STYLES: { value: NameStyle; label: string }[] = (
  Object.keys(STYLE_LABELS) as NameStyle[]
).map((value) => ({ value, label: STYLE_LABELS[value] }));

export const NAME_STYLE_COUNTRIES: Record<NameStyle, Country[]> = (() => {
  const map = {} as Record<NameStyle, Country[]>;
  for (const c of COUNTRY_META) {
    (map[c.style] = map[c.style] || []).push(c.value);
  }
  map.mixed = COUNTRY_META.map((c) => c.value);
  map.any = COUNTRY_META.map((c) => c.value);
  return map;
})();

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const PROFILE_TYPES: { value: ProfileType; label: string; icon: string }[] = [
  { value: 'developer', label: 'Developer', icon: 'Code2' },
  { value: 'designer', label: 'Designer', icon: 'Palette' },
  { value: 'creator', label: 'Creator', icon: 'Video' },
  { value: 'gamer', label: 'Gamer', icon: 'Gamepad2' },
  { value: 'student', label: 'Student', icon: 'GraduationCap' },
  { value: 'professional', label: 'Professional', icon: 'BriefcaseBusiness' },
  { value: 'traveler', label: 'Traveler', icon: 'Plane' },
  { value: 'test-user', label: 'Test User', icon: 'FlaskConical' },
  { value: 'writer', label: 'Writer', icon: 'PenLine' },
  { value: 'scientist', label: 'Scientist', icon: 'Microscope' },
  { value: 'artist', label: 'Artist', icon: 'Brush' },
  { value: 'musician', label: 'Musician', icon: 'Music' },
  { value: 'chef', label: 'Chef', icon: 'ChefHat' },
  { value: 'entrepreneur', label: 'Entrepreneur', icon: 'Rocket' },
  { value: 'educator', label: 'Educator', icon: 'Presentation' },
  { value: 'engineer', label: 'Engineer', icon: 'Cpu' },
  { value: 'healthcare', label: 'Healthcare', icon: 'HeartPulse' },
  { value: 'legal', label: 'Legal', icon: 'Scale' },
  { value: 'marketer', label: 'Marketer', icon: 'Megaphone' },
  { value: 'journalist', label: 'Journalist', icon: 'Newspaper' },
  { value: 'photographer', label: 'Photographer', icon: 'Camera' },
  { value: 'athlete', label: 'Athlete', icon: 'Dumbbell' },
  { value: 'data-scientist', label: 'Data Scientist', icon: 'Database' },
  { value: 'nurse', label: 'Nurse', icon: 'Stethoscope' },
  { value: 'pilot', label: 'Pilot', icon: 'Plane' },
  { value: 'architect', label: 'Architect', icon: 'Building' },
  { value: 'accountant', label: 'Accountant', icon: 'Calculator' },
  { value: 'consultant', label: 'Consultant', icon: 'Lightbulb' },
  { value: 'sales', label: 'Sales Rep', icon: 'TrendingUp' },
  { value: 'cybersecurity', label: 'Cybersecurity', icon: 'Shield' },
  { value: 'fitness-trainer', label: 'Fitness Coach', icon: 'Dumbbell' },
  { value: 'barista', label: 'Barista', icon: 'Coffee' },
  { value: 'translator', label: 'Translator', icon: 'Languages' },
  { value: 'mechanic', label: 'Mechanic', icon: 'Wrench' },
  { value: 'electrician', label: 'Electrician', icon: 'Zap' },
  { value: 'carpenter', label: 'Carpenter', icon: 'Hammer' },
  { value: 'veterinarian', label: 'Veterinarian', icon: 'PawPrint' },
  { value: 'realtor', label: 'Realtor', icon: 'Home' },
];

export const AVATAR_STYLES: { value: AvatarStyle; label: string }[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'pixel', label: 'Pixel' },
  { value: 'professional', label: 'Professional' },
  { value: 'gaming', label: 'Gaming' },
];

export const LANGUAGES = [...new Set(COUNTRY_META.map((c) => c.language))].sort();

export const TIMEZONES = [...new Set(COUNTRY_META.map((c) => c.timezone))].sort();
