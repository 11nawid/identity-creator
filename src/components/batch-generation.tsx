'use client';

import { useState } from 'react';
import { SyntheticIdentity, GeneratorConfig } from '@/types';
import { useToast } from '@/lib/toast-context';
import { generateBatchAI } from '@/lib/generator';
import { saveCreatedIdentities } from '@/lib/active-identity-store';
import { ensureWorkingEmails } from '@/lib/temp-mailbox';
import { Users, Eye, Copy, Save, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { exportIdentity } from '@/lib/export';

interface BatchGenerationProps {
  config: GeneratorConfig;
  onView: (identity: SyntheticIdentity) => void;
  onSave: (identity: SyntheticIdentity) => void;
}

export function BatchGeneration({ config, onView, onSave }: BatchGenerationProps) {
  const [count, setCount] = useState<5 | 10 | 25 | 50>(5);
  const [profiles, setProfiles] = useState<SyntheticIdentity[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { addToast } = useToast();

  const counts: (5 | 10 | 25 | 50)[] = [5, 10, 25, 50];

  const generate = async () => {
    setIsGenerating(true);
    try {
      const original = await generateBatchAI(config, count);
      const batch = await ensureWorkingEmails(original, 2);
      const workingEmails = batch.filter((b, i) => b.email !== original[i].email).length;
      setProfiles(batch);
      saveCreatedIdentities(batch);
      setShowResults(true);
      addToast(
        workingEmails === batch.length
          ? `${batch.length} profiles generated with working inboxes`
          : `${batch.length} profiles generated (${workingEmails} working inboxes)`,
      );
    } catch (err) {
      console.error('Batch error:', err);
      addToast('Batch generation failed. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Generate Multiple</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Generate multiple synthetic profiles at once.
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          {counts.map((c) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCount(c)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                count === c
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-muted-foreground/50'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generate}
          disabled={isGenerating}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          <Users className="h-4 w-4" />
          {isGenerating ? 'Generating...' : `Generate ${count} Profiles`}
        </motion.button>

        <AnimatePresence>
          {showResults && profiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 max-h-80 overflow-y-auto"
            >
              {profiles.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 group hover:border-muted-foreground/30 transition-colors"
                >
                  <Image
                    src={p.avatarUrl}
                    alt={`${p.displayName} (synthetic)`}
                    width={32}
                    height={32}
                    className="rounded-lg bg-muted shrink-0"
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">@{p.online.username}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView(p)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(p, null, 2)); addToast('Profile copied'); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onSave(p)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setProfiles(prev => prev.filter(x => x.id !== p.id));
                        addToast('Profile removed from batch');
                      }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => exportIdentity(p, 'json')} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
