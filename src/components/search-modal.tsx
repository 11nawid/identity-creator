'use client';

import { SyntheticIdentity } from '@/types';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProfiles: SyntheticIdentity[];
  onSelect: (identity: SyntheticIdentity) => void;
}

export function SearchModal({ isOpen, onClose, savedProfiles, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filtered = query.trim()
    ? savedProfiles.filter(
        (p) =>
          p.displayName.toLowerCase().includes(query.toLowerCase()) ||
          p.online.username.toLowerCase().includes(query.toLowerCase()) ||
          p.location.country.toLowerCase().includes(query.toLowerCase()) ||
          p.professional.job.toLowerCase().includes(query.toLowerCase()) ||
          p.profileType.toLowerCase().includes(query.toLowerCase())
      )
    : savedProfiles;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -16 }}
          transition={{ type: 'spring', bounce: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-4 rounded-xl border border-border bg-surface shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved identities..."
              className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
            />
            <button onClick={onClose} className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No identities found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {query ? 'Try a different search term' : 'Generate and save some identities first'}
                </p>
              </div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left"
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
                    <p className="text-xs text-muted-foreground truncate">
                      @{p.online.username} · {p.professional.job}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {p.location.country}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-border-subtle flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">ESC</kbd>
              to close
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
