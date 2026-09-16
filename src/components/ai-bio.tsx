'use client';

import { useState } from 'react';
import { SyntheticIdentity } from '@/types';
import { useToast } from '@/lib/toast-context';
import { generateBioAI, generateBiography } from '@/lib/generator';
import { Sparkles, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIBioProps {
  identity: SyntheticIdentity;
}

type BioType = 'short' | 'professional' | 'social' | 'about';

const BIO_TYPES: { id: BioType; label: string }[] = [
  { id: 'short', label: 'Short Bio' },
  { id: 'professional', label: 'Professional' },
  { id: 'social', label: 'Social Bio' },
  { id: 'about', label: 'About Me' },
];

export function AIBio({ identity }: AIBioProps) {
  const [activeType, setActiveType] = useState<BioType>('short');
  const [customBio, setCustomBio] = useState<string | null>(null);
  const [prevId, setPrevId] = useState(identity.id);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  if (prevId !== identity.id) {
    setPrevId(identity.id);
    setCustomBio(null);
  }

  const bio = customBio ?? (identity.bio || generateBiography(identity, activeType));

  const regenerate = async (type: BioType) => {
    setActiveType(type);
    setIsLoading(true);
    try {
      const generated = await generateBioAI(identity, type);
      setCustomBio(generated);
      addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} biography generated`);
    } catch {
      setCustomBio(generateBiography(identity, type));
      addToast('Generated biography');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Biography</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Detailed background biography tailored to career and interests.
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {BIO_TYPES.map((bt) => (
            <motion.button
              key={bt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => regenerate(bt.id)}
              disabled={isLoading}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                activeType === bt.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              {bt.label}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={bio + String(isLoading)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-lg bg-muted p-4 text-sm leading-relaxed text-foreground min-h-[5rem]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-xs py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating biography...
            </div>
          ) : (
            bio
          )}
        </motion.div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              navigator.clipboard.writeText(bio);
              addToast('Biography copied to clipboard');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-muted-foreground/50 hover:text-foreground"
          >
            <Copy className="h-3 w-3" />
            Copy
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => regenerate(activeType)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-muted-foreground/50 hover:text-foreground disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Refresh
          </motion.button>
        </div>
      </div>
    </div>
  );
}
