'use client';

import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onGenerate: () => void;
  onAdvancedToggle: () => void;
  showAdvanced: boolean;
  isGenerating: boolean;
}

export function Hero({ onGenerate, onAdvancedToggle, showAdvanced, isGenerating }: HeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="px-4 sm:px-6 pt-8 pb-6 max-w-7xl mx-auto w-full"
    >
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Create a synthetic identity
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Generate realistic fictional profiles for testing, prototypes, development, and creative projects.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Identity'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAdvancedToggle}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              showAdvanced
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Advanced
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
