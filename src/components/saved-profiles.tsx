'use client';

import { SyntheticIdentity } from '@/types';
import { useToast } from '@/lib/toast-context';
import { Eye, Copy, Download, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { exportIdentity } from '@/lib/export';
import { EmptyState } from '@/components/empty-state';

interface SavedViewProps {
  savedProfiles: SyntheticIdentity[];
  onView: (identity: SyntheticIdentity) => void;
  onDelete: (id: string) => void;
  onCreateIdentity: () => void;
}

export function SavedProfilesPanel({
  savedProfiles,
  onView,
  onDelete,
  onCreateIdentity,
}: SavedViewProps) {
  const { addToast } = useToast();

  const copyProfile = (p: SyntheticIdentity) => {
    navigator.clipboard.writeText(JSON.stringify(p, null, 2));
    addToast('Profile copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-24 sm:pb-16 w-full space-y-4">
      <div className="pb-3 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Saved Profiles</h1>
            {savedProfiles.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono font-semibold text-muted-foreground">
                {savedProfiles.length}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block mt-0.5">
            {savedProfiles.length === 0
              ? 'Your bookmarked profiles appear here.'
              : `${savedProfiles.length} saved persona${savedProfiles.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      {savedProfiles.length === 0 ? (
        <EmptyState
          title="No saved identities yet"
          description="Bookmark your favorite synthetic profiles to keep them handy."
          actionLabel="Create Identity"
          onAction={onCreateIdentity}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <AnimatePresence>
            {savedProfiles.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', bounce: 0.2 }}
                className="group relative rounded-xl border border-border bg-surface p-4 sm:p-5 hover:border-foreground/30 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                onClick={() => onView(p)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <Image
                    src={p.avatarUrl}
                    alt={`${p.displayName} avatar`}
                    width={48}
                    height={48}
                    className="rounded-xl bg-muted shrink-0"
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate group-hover:underline">{p.displayName}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">@{p.online.username}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.professional.job}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {p.location.city}, {p.location.country}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                    {p.profileType.replace('-', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(p);
                      }}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Open Details Page"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyProfile(p);
                      }}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Copy JSON"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportIdentity(p, 'json');
                      }}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Download JSON"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(p.id);
                      }}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}