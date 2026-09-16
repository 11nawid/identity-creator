'use client';

import { useState } from 'react';
import {
  GeneratorConfig,
  Country,
  Continent,
  Gender,
  ProfileType,
  NameStyle,
  SeniorityLevel,
  EducationLevelFilter,
  PersonalityTone,
  MaritalStatusFilter,
  AvatarStyle,
} from '@/types';
import {
  COUNTRIES,
  CONTINENTS,
  NAME_STYLES,
  GENDERS,
  PROFILE_TYPES,
  LANGUAGES,
  TIMEZONES,
  AVATAR_STYLES,
} from '@/data';
import {
  CUISINES,
  MUSIC_GENRES,
  PETS,
  ZODIAC_SIGNS,
  INTERESTS,
} from '@/data/offline';
import {
  Globe2,
  Map,
  User,
  Calendar,
  Languages,
  Clock,
  Shuffle,
  ChevronDown,
  Sparkles,
  Zap,
  GraduationCap,
  Award,
  Heart,
  Smile,
  Code2,
  Palette,
  Video,
  Gamepad2,
  BriefcaseBusiness,
  Plane,
  FlaskConical,
  PenLine,
  Microscope,
  Brush,
  Music,
  ChefHat,
  Rocket,
  Presentation,
  Cpu,
  HeartPulse,
  Scale,
  Megaphone,
  Newspaper,
  Camera,
  Dumbbell,
  Database,
  Stethoscope,
  Building,
  Calculator,
  Lightbulb,
  TrendingUp,
  Shield,
  Coffee,
  Wrench,
  Hammer,
  PawPrint,
  Home,
  Wallet,
  Utensils,
  Image as ImageIcon,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface GeneratorControlsProps {
  config: GeneratorConfig;
  onConfigChange: (config: GeneratorConfig) => void;
  showAdvanced: boolean;
}

const PROFILE_ICONS: Record<ProfileType, React.ReactNode> = {
  developer: <Code2 className="h-4 w-4" />,
  designer: <Palette className="h-4 w-4" />,
  creator: <Video className="h-4 w-4" />,
  gamer: <Gamepad2 className="h-4 w-4" />,
  student: <GraduationCap className="h-4 w-4" />,
  professional: <BriefcaseBusiness className="h-4 w-4" />,
  traveler: <Plane className="h-4 w-4" />,
  'test-user': <FlaskConical className="h-4 w-4" />,
  writer: <PenLine className="h-4 w-4" />,
  scientist: <Microscope className="h-4 w-4" />,
  artist: <Brush className="h-4 w-4" />,
  musician: <Music className="h-4 w-4" />,
  chef: <ChefHat className="h-4 w-4" />,
  entrepreneur: <Rocket className="h-4 w-4" />,
  educator: <Presentation className="h-4 w-4" />,
  engineer: <Cpu className="h-4 w-4" />,
  healthcare: <HeartPulse className="h-4 w-4" />,
  legal: <Scale className="h-4 w-4" />,
  marketer: <Megaphone className="h-4 w-4" />,
  journalist: <Newspaper className="h-4 w-4" />,
  photographer: <Camera className="h-4 w-4" />,
  athlete: <Dumbbell className="h-4 w-4" />,
  'data-scientist': <Database className="h-4 w-4" />,
  nurse: <Stethoscope className="h-4 w-4" />,
  pilot: <Plane className="h-4 w-4" />,
  architect: <Building className="h-4 w-4" />,
  accountant: <Calculator className="h-4 w-4" />,
  consultant: <Lightbulb className="h-4 w-4" />,
  sales: <TrendingUp className="h-4 w-4" />,
  cybersecurity: <Shield className="h-4 w-4" />,
  'fitness-trainer': <Dumbbell className="h-4 w-4" />,
  barista: <Coffee className="h-4 w-4" />,
  translator: <Languages className="h-4 w-4" />,
  mechanic: <Wrench className="h-4 w-4" />,
  electrician: <Zap className="h-4 w-4" />,
  carpenter: <Hammer className="h-4 w-4" />,
  veterinarian: <PawPrint className="h-4 w-4" />,
  realtor: <Home className="h-4 w-4" />,
};

const PRESETS: {
  id: string;
  label: string;
  emoji: string;
  apply: (cfg: GeneratorConfig) => GeneratorConfig;
}[] = [
  {
    id: 'founder',
    label: 'Tech Founder',
    emoji: '🚀',
    apply: (cfg) => ({
      ...cfg,
      ageRange: [28, 42],
      profileType: 'entrepreneur',
      seniorityLevel: 'executive',
      personalityTone: 'techie',
      educationLevel: 'bachelor',
    }),
  },
  {
    id: 'student',
    label: 'Student',
    emoji: '🎒',
    apply: (cfg) => ({
      ...cfg,
      ageRange: [19, 23],
      profileType: 'student',
      seniorityLevel: 'entry',
      personalityTone: 'academic',
      educationLevel: 'high-school',
      maritalStatus: 'single',
    }),
  },
  {
    id: 'nomad',
    label: 'Digital Nomad',
    emoji: '🌍',
    apply: (cfg) => ({
      ...cfg,
      ageRange: [24, 35],
      profileType: 'traveler',
      seniorityLevel: 'mid',
      personalityTone: 'adventurous',
    }),
  },
  {
    id: 'executive',
    label: 'Corporate Exec',
    emoji: '💼',
    apply: (cfg) => ({
      ...cfg,
      ageRange: [42, 60],
      profileType: 'professional',
      seniorityLevel: 'executive',
      personalityTone: 'corporate',
      educationLevel: 'master',
    }),
  },
  {
    id: 'artist',
    label: 'Creative Artist',
    emoji: '🎨',
    apply: (cfg) => ({
      ...cfg,
      ageRange: [22, 38],
      profileType: 'artist',
      seniorityLevel: 'mid',
      personalityTone: 'creative',
    }),
  },
  {
    id: 'doctor',
    label: 'Healthcare Pro',
    emoji: '🩺',
    apply: (cfg) => ({
      ...cfg,
      ageRange: [28, 52],
      profileType: 'healthcare',
      seniorityLevel: 'senior',
      personalityTone: 'academic',
      educationLevel: 'doctorate',
    }),
  },
];

const SENIORITY_OPTIONS: { value: SeniorityLevel; label: string }[] = [
  { value: 'auto', label: 'Auto (Age Dependent)' },
  { value: 'entry', label: 'Junior / Entry-Level' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior Specialist' },
  { value: 'lead', label: 'Team Lead / Principal' },
  { value: 'executive', label: 'Executive / Director / Founder' },
];

const EDUCATION_OPTIONS: { value: EducationLevelFilter; label: string }[] = [
  { value: 'auto', label: 'Auto (Role Dependent)' },
  { value: 'high-school', label: 'High School' },
  { value: 'some-college', label: 'Some College' },
  { value: 'trade', label: 'Trade / Vocational' },
  { value: 'associate', label: "Associate's Degree" },
  { value: 'certification', label: 'Professional Certification' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate / PhD' },
];

const TONE_OPTIONS: { value: PersonalityTone; label: string }[] = [
  { value: 'auto', label: 'Auto (Balanced)' },
  { value: 'techie', label: 'Technical & Modern' },
  { value: 'creative', label: 'Creative & Expressive' },
  { value: 'corporate', label: 'Corporate & Formal' },
  { value: 'academic', label: 'Academic & Analytical' },
  { value: 'adventurous', label: 'Active & Dynamic' },
  { value: 'minimalist', label: 'Minimalist & Clean' },
  { value: 'sporty', label: 'Sporty & Energetic' },
  { value: 'family', label: 'Family-Oriented' },
  { value: 'eco', label: 'Eco-Conscious' },
  { value: 'luxury', label: 'Luxury & Refined' },
  { value: 'spiritual', label: 'Spiritual & Mindful' },
  { value: 'humorous', label: 'Humorous & Quirky' },
  { value: 'chill', label: 'Relaxed & Low-Key' },
];

const MARITAL_OPTIONS: { value: MaritalStatusFilter; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'in-relationship', label: 'In a Relationship' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

const INCOME_OPTIONS: { value: string; label: string }[] = [
  { value: 'auto', label: 'Auto (Role Dependent)' },
  { value: 'low', label: 'Low' },
  { value: 'lower-middle', label: 'Lower Middle' },
  { value: 'middle', label: 'Middle' },
  { value: 'upper-middle', label: 'Upper Middle' },
  { value: 'high', label: 'High' },
];

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Government',
  'Retail',
  'Media',
  'Food & Beverage',
  'Automotive',
  'Energy',
  'Real Estate',
  'Arts & Culture',
  'Sports & Fitness',
  'Legal',
  'Logistics',
  'Telecom',
  'Tourism',
  'Agriculture',
];

function SelectField({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 pr-8 text-sm font-medium transition-colors hover:border-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-muted-foreground/50 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function AgeRangeSlider({
  config,
  onConfigChange,
}: {
  config: GeneratorConfig;
  onConfigChange: (c: GeneratorConfig) => void;
}) {
  const min = Math.min(config.ageRange[0], 79);
  const max = Math.max(config.ageRange[1], min + 1);

  const setPresetAge = (newMin: number, newMax: number) => {
    onConfigChange({ ...config, ageRange: [newMin, newMax] });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Calendar className="h-3 w-3" />
          Age Range: {min}–{max} yrs
        </label>
        <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
          {max - min + 1} yr span
        </span>
      </div>

      <div className="px-1 space-y-1">
        <input
          type="range"
          min={16}
          max={80}
          value={min}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            onConfigChange({ ...config, ageRange: [v, Math.max(max, v + 1)] });
          }}
          className="w-full accent-foreground cursor-pointer"
          aria-label="Minimum age"
        />
        <input
          type="range"
          min={16}
          max={80}
          value={max}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            onConfigChange({ ...config, ageRange: [Math.min(min, v - 1), v] });
          }}
          className="w-full accent-foreground -mt-1.5 cursor-pointer"
          aria-label="Maximum age"
        />
      </div>

      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
        {[
          { label: 'Young (18–24)', min: 18, max: 24 },
          { label: 'Prime (25–36)', min: 25, max: 36 },
          { label: 'Mid (37–50)', min: 37, max: 50 },
          { label: 'Senior (51–70)', min: 51, max: 70 },
        ].map((bracket) => (
          <button
            key={bracket.label}
            onClick={() => setPresetAge(bracket.min, bracket.max)}
            className={`px-2 py-1 text-[10px] rounded border whitespace-nowrap transition-colors ${
              min === bracket.min && max === bracket.max
                ? 'bg-foreground text-background border-foreground font-medium'
                : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {bracket.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GeneratorControls({ config, onConfigChange, showAdvanced }: GeneratorControlsProps) {
  const [profileTypeOpen, setProfileTypeOpen] = useState(true);

  const randomize = () => {
    onConfigChange({
      ...config,
      continent: 'random',
      country: 'random',
      nameStyle: 'any',
      gender: Math.random() > 0.5 ? 'male' : 'female',
      ageRange: [18, 65],
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
    });
  };

  const selectedProfile = config.profileType === 'random' ? null : config.profileType;

  return (
    <div className="space-y-5">
      {/* Quick Presets Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Zap className="h-3 w-3 text-amber-500" />
            Presets
          </span>
          <button
            onClick={randomize}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Shuffle className="h-3 w-3" />
            Reset
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((p) => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfigChange(p.apply(config))}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-all truncate"
            >
              <span>{p.emoji}</span>
              <span className="truncate">{p.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Primary Configuration */}
      <div className="space-y-3 pt-3 border-t border-border-subtle">
        <SelectField
          icon={<Map className="h-3 w-3" />}
          label="Continent"
          value={config.continent}
          options={[{ value: 'random', label: 'Any / Random' }, ...CONTINENTS]}
          onChange={(v) => onConfigChange({ ...config, continent: v as Continent | 'random' })}
        />
        <SelectField
          icon={<User className="h-3 w-3" />}
          label="Gender"
          value={config.gender}
          options={[{ value: 'random', label: 'Any / Random' }, ...GENDERS.map((g) => ({ value: g.value, label: g.label }))]}
          onChange={(v) => onConfigChange({ ...config, gender: v as Gender | 'random' })}
        />
        <AgeRangeSlider config={config} onConfigChange={onConfigChange} />
      </div>

      {/* Smart Advanced Filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 pt-4 border-t border-border-subtle"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              icon={<Globe2 className="h-3 w-3" />}
              label="Country"
              value={config.country}
              options={[
                { value: 'random', label: 'Random Country' },
                ...COUNTRIES.map((c) => ({ value: c.value, label: `${c.flag} ${c.label}` })),
              ]}
              onChange={(v) => onConfigChange({ ...config, country: v as Country | 'random' })}
            />
            <SelectField
              icon={<Languages className="h-3 w-3" />}
              label="Name Style"
              value={config.nameStyle}
              options={NAME_STYLES.map((s) => ({ value: s.value, label: s.label }))}
              onChange={(v) => onConfigChange({ ...config, nameStyle: v as NameStyle })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              icon={<Award className="h-3 w-3" />}
              label="Career Seniority"
              value={config.seniorityLevel || 'auto'}
              options={SENIORITY_OPTIONS}
              onChange={(v) => onConfigChange({ ...config, seniorityLevel: v as SeniorityLevel })}
            />
            <SelectField
              icon={<GraduationCap className="h-3 w-3" />}
              label="Target Education"
              value={config.educationLevel || 'auto'}
              options={EDUCATION_OPTIONS}
              onChange={(v) => onConfigChange({ ...config, educationLevel: v as EducationLevelFilter })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              icon={<Smile className="h-3 w-3" />}
              label="Lifestyle Tone"
              value={config.personalityTone || 'auto'}
              options={TONE_OPTIONS}
              onChange={(v) => onConfigChange({ ...config, personalityTone: v as PersonalityTone })}
            />
            <SelectField
              icon={<Heart className="h-3 w-3" />}
              label="Marital Status"
              value={config.maritalStatus || 'auto'}
              options={MARITAL_OPTIONS}
              onChange={(v) => onConfigChange({ ...config, maritalStatus: v as MaritalStatusFilter })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              icon={<Languages className="h-3 w-3" />}
              label="Language"
              value={config.language}
              options={[{ value: 'random', label: 'Native / Auto' }, ...LANGUAGES.map((l) => ({ value: l, label: l }))]}
              onChange={(v) => onConfigChange({ ...config, language: v })}
            />
            <SelectField
              icon={<Clock className="h-3 w-3" />}
              label="Timezone"
              value={config.timezone}
              options={[{ value: 'random', label: 'Local / Auto' }, ...TIMEZONES.map((t) => ({ value: t, label: t }))]}
              onChange={(v) => onConfigChange({ ...config, timezone: v })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              icon={<ImageIcon className="h-3 w-3" />}
              label="Avatar / Profile Style"
              value={config.avatarStyle || 'random'}
              options={[{ value: 'random', label: 'Auto (Random)' }, ...AVATAR_STYLES.map((a) => ({ value: a.value, label: a.label }))]}
              onChange={(v) => onConfigChange({ ...config, avatarStyle: v as AvatarStyle | 'random' })}
            />
            <SelectField
              icon={<BriefcaseBusiness className="h-3 w-3" />}
              label="Career Industry"
              value={config.industry || 'random'}
              options={[{ value: 'random', label: 'Auto (Role Dependent)' }, ...INDUSTRIES.map((i) => ({ value: i, label: i }))]}
              onChange={(v) => onConfigChange({ ...config, industry: v })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              icon={<Wallet className="h-3 w-3" />}
              label="Income Bracket"
              value={config.incomeBracket || 'auto'}
              options={INCOME_OPTIONS}
              onChange={(v) => onConfigChange({ ...config, incomeBracket: v as GeneratorConfig['incomeBracket'] })}
            />
            <SelectField
              icon={<Utensils className="h-3 w-3" />}
              label="Favorite Cuisine"
              value={config.favoriteCuisine || 'random'}
              options={[{ value: 'random', label: 'Random' }, ...CUISINES.map((c) => ({ value: c, label: c }))]}
              onChange={(v) => onConfigChange({ ...config, favoriteCuisine: v })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              icon={<Music className="h-3 w-3" />}
              label="Music Genre"
              value={config.musicGenre || 'random'}
              options={[{ value: 'random', label: 'Random' }, ...MUSIC_GENRES.map((m) => ({ value: m, label: m }))]}
              onChange={(v) => onConfigChange({ ...config, musicGenre: v })}
            />
            <SelectField
              icon={<Star className="h-3 w-3" />}
              label="Primary Hobby"
              value={config.interests || 'random'}
              options={[{ value: 'random', label: 'Random' }, ...INTERESTS.map((i) => ({ value: i, label: i }))]}
              onChange={(v) => onConfigChange({ ...config, interests: v })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              icon={<PawPrint className="h-3 w-3" />}
              label="Pet Preference"
              value={config.petPreference || 'random'}
              options={[{ value: 'random', label: 'Random' }, ...PETS.map((p) => ({ value: p, label: p }))]}
              onChange={(v) => onConfigChange({ ...config, petPreference: v })}
            />
            <SelectField
              icon={<Sparkles className="h-3 w-3" />}
              label="Zodiac Sign"
              value={config.zodiacSign || 'random'}
              options={[{ value: 'random', label: 'Random' }, ...ZODIAC_SIGNS.map((z) => ({ value: z, label: z }))]}
              onChange={(v) => onConfigChange({ ...config, zodiacSign: v })}
            />
          </div>

          {/* Profile Type Selector with AI Auto Option */}
          <div className="pt-2">
            <button
              onClick={() => setProfileTypeOpen((v) => !v)}
              className="flex w-full items-center justify-between py-1 text-sm font-semibold text-foreground"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Profile Role / Career
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  profileTypeOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {profileTypeOpen && (
              <div className="mt-2 space-y-2">
                {/* Highlighted Auto Decided Card */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onConfigChange({ ...config, profileType: 'random' })}
                  className={`w-full flex items-center justify-between rounded-lg border p-2.5 transition-all text-left ${
                    selectedProfile === null
                      ? 'border-foreground bg-foreground text-background shadow-sm'
                      : 'border-border bg-surface text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4" />
                    <div className="text-xs font-semibold">Auto (Recommended)</div>
                  </div>
                  {selectedProfile === null && (
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-background text-foreground px-2 py-0.5 rounded font-bold">
                      Active
                    </span>
                  )}
                </motion.button>

                {/* Grid of Specific Profile Types */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                  {PROFILE_TYPES.map((pt) => (
                    <motion.button
                      key={pt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onConfigChange({ ...config, profileType: pt.value })}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[11px] font-medium transition-all ${
                        selectedProfile === pt.value
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-surface text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                      }`}
                    >
                      {PROFILE_ICONS[pt.value as ProfileType]}
                      <span className="truncate">{pt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}