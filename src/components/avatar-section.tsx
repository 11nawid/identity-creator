'use client';

import { SyntheticIdentity, AvatarStyle } from '@/types';
import { AVATAR_STYLES } from '@/data';
import { RefreshCw, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AvatarSectionProps {
  identity: SyntheticIdentity;
  onStyleChange: (style: AvatarStyle) => void;
  onRegenerate: () => void;
}

export function AvatarSection({ identity, onStyleChange, onRegenerate }: AvatarSectionProps) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Synthetic Avatar</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Fictional avatar for this synthetic identity.
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex justify-center">
          <motion.div
            key={identity.avatarUrl}
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="relative"
          >
            <Image
              src={identity.avatarUrl}
              alt={`${identity.displayName} avatar (synthetic)`}
              width={120}
              height={120}
              className="rounded-2xl bg-muted"
              unoptimized
            />
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-muted-foreground/50 hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </motion.button>
        </div>

        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Style</p>
          <div className="grid grid-cols-3 gap-1.5">
            {AVATAR_STYLES.map((style) => (
              <motion.button
                key={style.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStyleChange(style.value)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                  identity.avatarStyle === style.value
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
                }`}
              >
                {style.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
