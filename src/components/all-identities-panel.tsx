'use client';

import { useState, useMemo } from 'react';
import { SyntheticIdentity } from '@/types';
import { useToast } from '@/lib/toast-context';
import { useProfileStore } from '@/lib/use-profile-store';
import { exportIdentity } from '@/lib/export';
import {
  Search,
  Copy,
  Download,
  Trash2,
  Bookmark,
  BookmarkCheck,
  User,
  MapPin,
  ChevronRight,
  PlusCircle,
  FileDown,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface AllIdentitiesPanelProps {
  identities: SyntheticIdentity[];
  onView: (identity: SyntheticIdentity) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onCreateNew: () => void;
}

export function AllIdentitiesPanel({
  identities,
  onView,
  onDelete,
  onClearAll,
  onCreateNew,
}: AllIdentitiesPanelProps) {
  const { addToast } = useToast();
  const { savedProfiles, saveIdentity, deleteIdentity: removeSaved } = useProfileStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const isSaved = (id: string) => savedProfiles.some((p) => p.id === id);

  const toggleSave = (identity: SyntheticIdentity) => {
    if (isSaved(identity.id)) {
      removeSaved(identity.id);
      addToast('Removed from Saved Profiles', 'info');
    } else {
      saveIdentity(identity);
      addToast('Added to Saved Profiles', 'success');
    }
  };

  const copyProfileJson = (p: SyntheticIdentity) => {
    navigator.clipboard.writeText(JSON.stringify(p, null, 2));
    addToast('Profile JSON copied to clipboard');
  };

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    for (const item of identities) {
      if (item.location?.country) set.add(item.location.country);
    }
    return Array.from(set).sort();
  }, [identities]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    for (const item of identities) {
      if (item.profileType) set.add(item.profileType);
    }
    return Array.from(set).sort();
  }, [identities]);

  const filteredIdentities = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return identities.filter((item) => {
      if (query) {
        const matchesName = item.displayName?.toLowerCase().includes(query);
        const matchesUser = item.online?.username?.toLowerCase().includes(query);
        const matchesJob = item.professional?.job?.toLowerCase().includes(query);
        const matchesCompany = item.professional?.company?.toLowerCase().includes(query);
        const matchesCity = item.location?.city?.toLowerCase().includes(query);
        const matchesCountry = item.location?.country?.toLowerCase().includes(query);
        const matchesEmail = item.email?.toLowerCase().includes(query);
        const matchesPhone = item.contact?.phone?.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesUser &&
          !matchesJob &&
          !matchesCompany &&
          !matchesCity &&
          !matchesCountry &&
          !matchesEmail &&
          !matchesPhone
        ) {
          return false;
        }
      }

      if (selectedCountry !== 'all' && item.location?.country !== selectedCountry) {
        return false;
      }

      if (selectedType !== 'all' && item.profileType !== selectedType) {
        return false;
      }

      if (selectedGender !== 'all' && item.gender !== selectedGender) {
        return false;
      }

      return true;
    });
  }, [identities, searchTerm, selectedCountry, selectedType, selectedGender]);

  const exportAllJson = () => {
    if (identities.length === 0) return;
    const blob = new Blob([JSON.stringify(identities, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthetic-identities-all-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported all ${identities.length} profiles to JSON`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-24 sm:pb-16 w-full space-y-4 sm:space-y-6">
      {/* Native App Style Filter Bar (Clean Search & Controls) */}
      {identities.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pb-2 border-b border-border/80">
          {/* Native Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, username, career, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface border border-border/80 rounded-xl placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Aligned Filter Chips / Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Gender Segmented Tabs */}
            <div className="flex items-center rounded-xl bg-surface border border-border/80 p-0.5 shrink-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'male', label: 'Male' },
                { id: 'female', label: 'Female' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGender(g.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedGender === g.id
                      ? 'bg-foreground text-background font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Country Filter Chip */}
            {availableCountries.length > 0 && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-surface border border-border/80 rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-foreground shrink-0 cursor-pointer"
              >
                <option value="all">All Countries ({availableCountries.length})</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Reset Filters button */}
            {(searchTerm || selectedCountry !== 'all' || selectedType !== 'all' || selectedGender !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCountry('all');
                  setSelectedType('all');
                  setSelectedGender('all');
                }}
                className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 rounded-xl bg-surface border border-border/80 shrink-0 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            )}

            {/* Desktop Export & Create Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0 pl-1">
              <button
                onClick={exportAllJson}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover active:scale-95 transition-all"
                title="Export all identities to JSON"
              >
                <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Export</span>
              </button>

              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-1 rounded-xl bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Create</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Identities Grid */}
      {identities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 sm:p-12 text-center space-y-3 my-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <User className="h-5 w-5" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground">No identities created yet</h3>
        </div>
      ) : filteredIdentities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 sm:p-12 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">No identities match your criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCountry('all');
              setSelectedType('all');
              setSelectedGender('all');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredIdentities.map((item) => {
                const bookmarked = isSaved(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => onView(item)}
                    className="group relative rounded-2xl border border-border bg-surface p-5 hover:border-foreground/30 hover:shadow-md transition-all cursor-pointer space-y-3.5"
                  >
                    {/* Header info */}
                    <div className="flex items-start gap-3.5">
                      <Image
                        src={item.avatarUrl}
                        alt={`${item.displayName} avatar`}
                        width={48}
                        height={48}
                        className="rounded-xl border border-border bg-muted shrink-0 object-cover"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-sm text-foreground truncate group-hover:underline">
                            {item.displayName}
                          </p>
                          <span className="text-[10px] font-bold uppercase rounded bg-muted px-1.5 py-0.5 text-muted-foreground shrink-0">
                            {item.location.countryCode}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          @{item.online.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.professional.job}
                        </p>
                      </div>
                    </div>

                    {/* Meta tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-[160px]">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        {item.location.city}, {item.location.country}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                        {item.profileType.replace('-', ' ')}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                        {item.gender}
                      </span>
                    </div>

                    {/* Bottom toolbar */}
                    <div className="flex items-center justify-between border-t border-border-subtle pt-3 text-xs">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <span className="sm:hidden inline-flex items-center gap-1 font-medium text-foreground text-xs">
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </span>

                      <div className="hidden sm:flex items-center gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(item);
                          }}
                          className={`p-1.5 rounded-md transition-colors ${
                            bookmarked
                              ? 'text-foreground hover:bg-muted'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          title={bookmarked ? 'Saved to Bookmarks' : 'Save / Bookmark'}
                        >
                          {bookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5 fill-foreground text-foreground" />
                          ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyProfileJson(item);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Copy JSON"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportIdentity(item, 'json');
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Download JSON"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                          title="Delete from history"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(item);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
