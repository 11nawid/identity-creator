'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { PlatformUsername, UsernameStatus, SyntheticIdentity } from '@/types';
import {
  ALL_PLATFORMS,
  getPlatformPriority,
  formatUsernameForPlatform,
} from '@/lib/username-checker';
import { RealPlatformIcon } from '@/components/real-platform-icon';

interface PlatformUsernamesProps {
  platforms?: PlatformUsername[];
  identity: SyntheticIdentity;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'social', label: 'Social' },
  { id: 'developer', label: 'Developer' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'professional', label: 'Professional' },
  { id: 'creative', label: 'Creative' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'other', label: 'Other' },
] as const;

export function PlatformUsernames({ platforms: initialPlatforms, identity }: PlatformUsernamesProps) {
  // Ensure we have all platforms represented with verified availability
  const baseList: PlatformUsername[] = useMemo(() => {
    const existingMap = new Map<string, PlatformUsername>();
    (initialPlatforms || []).forEach((p) => existingMap.set(p.platform.toLowerCase(), p));

    const list = ALL_PLATFORMS.map((cfg) => {
      const found = existingMap.get(cfg.name.toLowerCase());
      if (found) {
        return {
          ...found,
          profileUrl: cfg.profileUrl(found.username),
        };
      }

const fallbackHandle = formatUsernameForPlatform(
        cfg.name,
        identity.firstName,
        identity.lastName
      );

      return {
        platform: cfg.name,
        category: cfg.category,
        username: fallbackHandle,
        status: 'unknown' as UsernameStatus,
        profileUrl: cfg.profileUrl(fallbackHandle),
        checkUrl: cfg.urlTpl.replace('{u}', encodeURIComponent(fallbackHandle)),
        bio: `${identity.professional?.job || 'Professional'} at ${identity.professional?.company || 'Company'} • ${identity.location?.city || ''}, ${identity.location?.country || ''}`,
        checkedAt: new Date().toISOString(),
      };
    });

    list.sort((a, b) => {
      const pA = getPlatformPriority(a.platform);
      const pB = getPlatformPriority(b.platform);
      if (pA !== pB) return pA - pB;
      return a.platform.localeCompare(b.platform);
    });

    return list;
  }, [initialPlatforms, identity]);

const [platformList, setPlatformList] = useState<PlatformUsername[]>(() => baseList);
  const [prevBase, setPrevBase] = useState(baseList);

  if (prevBase !== baseList) {
    setPrevBase(baseList);
    setPlatformList(baseList);
  }

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkingPlatforms, setCheckingPlatforms] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  // Filtered platforms
  const filteredPlatforms = useMemo(() => {
    return platformList.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        item.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [platformList, activeCategory, searchQuery]);

  // Status stats
  const stats = useMemo(() => {
    const available = platformList.filter((p) => p.status === 'available').length;
    const taken = platformList.filter((p) => p.status === 'taken').length;
    const unknown = platformList.filter((p) => p.status === 'unknown' || !p.status).length;
    return { available, taken, unknown, total: platformList.length };
  }, [platformList]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const recheckSingle = async (platformName: string, username: string) => {
    setCheckingPlatforms((prev) => ({ ...prev, [platformName]: true }));
    try {
      const res = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformName, username }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlatformList((prev) =>
          prev.map((item) =>
            item.platform.toLowerCase() === platformName.toLowerCase()
              ? {
                  ...item,
                  status: data.status,
                  detail: data.detail,
                  profileUrl: data.profileUrl || item.profileUrl,
                  checkedAt: data.checkedAt || new Date().toISOString(),
                }
              : item
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingPlatforms((prev) => ({ ...prev, [platformName]: false }));
    }
  };

  const handleCheckAll = async () => {
    if (isCheckingAll) return;
    setIsCheckingAll(true);

    const all = [...platformList];
    const chunkSize = 6;
    for (let i = 0; i < all.length; i += chunkSize) {
      const chunk = all.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((item) => recheckSingle(item.platform, item.username))
      );
    }

    setIsCheckingAll(false);
  };

return (
    <div className="space-y-3 pt-2">
      {/* Minimal clean header bar */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Platforms</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {stats.available}/{stats.total} available{stats.taken > 0 ? ` • ${stats.taken} taken` : ''}
          </span>
        </div>

        <button
          onClick={handleCheckAll}
          disabled={isCheckingAll}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-[11px] font-medium text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isCheckingAll ? 'animate-spin' : ''}`} />
          {isCheckingAll ? 'Verifying...' : 'Re-check All'}
        </button>
      </div>

      {/* Filter and Search Bar: ultra clean & compact */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search platforms or usernames..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'bg-foreground text-background'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean Minimal Platform Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredPlatforms.map((item) => {
          const isChecking = Boolean(checkingPlatforms[item.platform]);
          const isCopied = copiedKey === `handle-${item.platform}`;

          return (
            <div
              key={item.platform}
              className="group flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-surface/80 hover:border-border hover:bg-surface transition-colors"
            >
              {/* Left: Icon + Platform & Username */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex-shrink-0 w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center border border-border/40 overflow-hidden">
                  <RealPlatformIcon name={item.platform} className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {item.platform}
                    </span>
                    {/* Status dot */}
                    {isChecking ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
                    ) : item.status === 'available' ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" title={item.detail ? `Available: ${item.detail}` : 'Available'} />
                    ) : item.status === 'taken' ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" title={item.detail ? `Taken: ${item.detail}` : 'Taken'} />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500/50 flex-shrink-0" title={item.detail ? `Unknown: ${item.detail}` : 'Unchecked'} />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono truncate">
                    <span>@{item.username}</span>
                    {item.detail && (
                      <span className="text-[10px] text-muted-foreground/60 font-sans truncate">
                        • {item.detail}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions (Copy handle, view external, recheck) */}
              <div className="flex items-center gap-0.5 ml-2">
                <button
                  onClick={() => handleCopy(`@${item.username}`, `handle-${item.platform}`)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Copy handle"
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>

                <button
                  onClick={() => recheckSingle(item.platform, item.username)}
                  disabled={isChecking}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                  title={`Re-check @${item.username} on ${item.platform}`}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                </button>

                <a
                  href={item.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Open profile"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlatforms.length === 0 && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No platforms found.
        </div>
      )}
    </div>
  );
}
