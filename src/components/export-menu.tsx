'use client';

import { SyntheticIdentity, ExportFormat } from '@/types';
import { useToast } from '@/lib/toast-context';
import { FileJson, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { exportIdentity } from '@/lib/export';

interface ExportMenuProps {
  identity: SyntheticIdentity;
}

export function ExportMenu({ identity }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { format: 'json', label: 'JSON', icon: <FileJson className="h-4 w-4" /> },
    { format: 'csv', label: 'CSV', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { format: 'txt', label: 'TXT', icon: <FileText className="h-4 w-4" /> },
    { format: 'pdf', label: 'PDF', icon: <FileDown className="h-4 w-4" /> },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-muted-foreground/50 hover:text-foreground"
      >
        <FileDown className="h-3.5 w-3.5" />
        Export
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-surface shadow-lg z-50 overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.format}
                onClick={() => {
                  exportIdentity(identity, opt.format);
                  addToast(`Exported as ${opt.format.toUpperCase()}`);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors"
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
