import { PlatformUsername, UsernameStatus } from '@/types';

// ── User-Agent pool ───────────────────────────────────────────────────────────
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
];

export function browserHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'DNT': '1',
    ...extra,
  };
}

export async function get(
  url: string,
  timeout = 8000,
  extraHeaders: Record<string, string> = {}
): Promise<Response> {
  // Shared fetch with subtle throttle (50ms - 250ms)
  await new Promise((r) => setTimeout(r, Math.random() * 200 + 50));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      headers: browserHeaders(extraHeaders),
      signal: controller.signal,
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }
}

export interface CheckResult {
  platform: string;
  status: UsernameStatus;
  detail: string;
}

function abortText(e: unknown): string {
  if (e instanceof Error) {
    if (e.name === 'AbortError' || e.message.includes('abort')) return 'Timed out';
    return e.message.slice(0, 60);
  }
  return String(e).slice(0, 60);
}

// ── Per-platform checkers (the 9 core platforms) ─────────────────────────────

/** Instagram: JSON API → HTML body scan → honest 'unknown' if walled. */
export async function checkInstagram(username: string): Promise<CheckResult> {
  try {
    const api = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          ...browserHeaders(),
          'Accept': 'application/json',
          'x-ig-app-id': '936619743392459',
        },
        signal: AbortSignal.timeout(7000),
      }
    );
    if (api.status === 200) {
      try {
        const data = (await api.json()) as { data?: { user?: unknown } };
        if (data?.data?.user === null) {
          return { platform: 'Instagram', status: 'available', detail: 'API: user not found' };
        }
        if (data?.data?.user) {
          return { platform: 'Instagram', status: 'taken', detail: 'API: account found' };
        }
      } catch {}
    }
  } catch {
    /* fall through to HTML check */
  }

  try {
    const r = await get(`https://www.instagram.com/${encodeURIComponent(username)}/`, 9000);
    const body = (await r.text()).toLowerCase();
    if (
      r.status === 404 ||
      body.includes('sorry, this page isn') ||
      body.includes("this page isn't available") ||
      body.includes('the link you followed may be broken')
    ) {
      return { platform: 'Instagram', status: 'available', detail: 'HTTP/body: page not found' };
    }
    if (body.includes('"followers"') || body.includes(`"username":"${username.toLowerCase()}"`)) {
      return { platform: 'Instagram', status: 'taken', detail: 'Body: profile found' };
    }
    return { platform: 'Instagram', status: 'unknown', detail: 'Login wall, cannot confirm' };
  } catch (e) {
    return { platform: 'Instagram', status: 'unknown', detail: abortText(e) };
  }
}

/** YouTube: nonexistent channels respond HTTP 404; existing respond 200. */
export async function checkYouTube(username: string): Promise<CheckResult> {
  try {
    const r = await get(`https://www.youtube.com/@${encodeURIComponent(username)}`, 9000);
    if (r.status === 404) {
      return { platform: 'YouTube', status: 'available', detail: 'HTTP 404' };
    }
    if (r.status === 200) {
      const body = (await r.text()).toLowerCase();
      if (body.includes('this channel doesn')) {
        return { platform: 'YouTube', status: 'available', detail: 'Body: channel not found' };
      }
      return { platform: 'YouTube', status: 'taken', detail: 'HTTP 200' };
    }
    return { platform: 'YouTube', status: 'unknown', detail: `HTTP ${r.status}` };
  } catch (e) {
    return { platform: 'YouTube', status: 'unknown', detail: abortText(e) };
  }
}

/** X (Twitter): nonexistent accounts respond HTTP 404; existing respond 200. */
export async function checkX(username: string): Promise<CheckResult> {
  try {
    const r = await get(`https://x.com/${encodeURIComponent(username)}`, 9000);
    if (r.status === 404) {
      return { platform: 'X', status: 'available', detail: 'HTTP 404' };
    }
    if (r.status === 200) {
      const body = (await r.text()).toLowerCase();
      if (body.includes("this account doesn")) {
        return { platform: 'X', status: 'available', detail: 'Body: account not found' };
      }
      return { platform: 'X', status: 'taken', detail: 'HTTP 200' };
    }
    return { platform: 'X', status: 'unknown', detail: `HTTP ${r.status}` };
  } catch (e) {
    return { platform: 'X', status: 'unknown', detail: abortText(e) };
  }
}

/** Threads: body signals only; login walls result in honest 'unknown'. */
export async function checkThreads(username: string): Promise<CheckResult> {
  try {
    const r = await get(`https://www.threads.net/@${encodeURIComponent(username)}`, 9000);
    const body = (await r.text()).toLowerCase();
    if (
      r.status === 404 ||
      body.includes("this page doesn't exist") ||
      body.includes('page not found')
    ) {
      return { platform: 'Threads', status: 'available', detail: 'Body: page not found' };
    }
    if (
      body.includes(`"username":"${username.toLowerCase()}"`) ||
      body.includes(`"user":{"username":"${username.toLowerCase()}"`)
    ) {
      return { platform: 'Threads', status: 'taken', detail: 'Body: profile found' };
    }
    return { platform: 'Threads', status: 'unknown', detail: 'Wall/redirect, cannot confirm' };
  } catch (e) {
    return { platform: 'Threads', status: 'unknown', detail: abortText(e) };
  }
}

/** LinkedIn: blocks datacenter IPs (HTTP 999); otherwise body signals work. */
export async function checkLinkedIn(username: string): Promise<CheckResult> {
  try {
    const r = await get(`https://www.linkedin.com/in/${encodeURIComponent(username)}/`, 9000);
    if (r.status === 404) {
      return { platform: 'LinkedIn', status: 'available', detail: 'HTTP 404' };
    }
    if (r.status === 200) {
      const body = (await r.text()).toLowerCase();
      if (
        body.includes("we couldn't find that person") ||
        body.includes("this page doesn't exist") ||
        body.includes('page not found')
      ) {
        return { platform: 'LinkedIn', status: 'available', detail: 'Body: profile not found' };
      }
      if (body.includes('voyager') || body.includes('publicprofile') || body.includes('og:title')) {
        return { platform: 'LinkedIn', status: 'taken', detail: 'Body: profile found' };
      }
      return { platform: 'LinkedIn', status: 'unknown', detail: 'Login wall, cannot confirm' };
    }
    return {
      platform: 'LinkedIn',
      status: 'unknown',
      detail: r.status === 999 ? 'Blocked (HTTP 999)' : `HTTP ${r.status}`,
    };
  } catch (e) {
    return { platform: 'LinkedIn', status: 'unknown', detail: abortText(e) };
  }
}

/** Telegram: title is "telegram: contact @" (free) vs "telegram: view @" (taken). */
export async function checkTelegram(username: string): Promise<CheckResult> {
  try {
    const r = await get(`https://t.me/${encodeURIComponent(username)}`, 8000);
    const body = (await r.text()).toLowerCase();
    if (r.status === 404 || body.includes('tgme_page_not_found')) {
      return { platform: 'Telegram', status: 'available', detail: 'HTTP 404' };
    }
    if (body.includes('telegram: view @')) {
      return { platform: 'Telegram', status: 'taken', detail: 'Body: profile found' };
    }
    if (body.includes('telegram: contact @')) {
      return { platform: 'Telegram', status: 'available', detail: 'Body: username free' };
    }
    return { platform: 'Telegram', status: 'unknown', detail: `HTTP ${r.status}` };
  } catch (e) {
    return { platform: 'Telegram', status: 'unknown', detail: abortText(e) };
  }
}

/** GitHub: public REST API returns 404 for free usernames, 200 for taken. */
export async function checkGitHub(username: string): Promise<CheckResult> {
  try {
    const r = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { 'User-Agent': 'python:usercheck:v2.0', 'Accept': 'application/vnd.github+json' },
      signal: AbortSignal.timeout(8000),
    });
    if (r.status === 404) {
      return { platform: 'GitHub', status: 'available', detail: 'API 404' };
    }
    if (r.status === 200) {
      return { platform: 'GitHub', status: 'taken', detail: 'API 200' };
    }
    const html = await get(`https://github.com/${encodeURIComponent(username)}`, 8000);
    if (html.status === 404) {
      return { platform: 'GitHub', status: 'available', detail: 'HTML 404' };
    }
    if (html.status === 200) {
      return { platform: 'GitHub', status: 'taken', detail: 'HTML 200' };
    }
    return { platform: 'GitHub', status: 'unknown', detail: `HTTP ${r.status}` };
  } catch (e) {
    return { platform: 'GitHub', status: 'unknown', detail: abortText(e) };
  }
}

/** Snapchat: body signals only; most networks wall it → honest 'unknown'. */
export async function checkSnapchat(username: string): Promise<CheckResult> {
  try {
    const r = await get(`https://www.snapchat.com/add/${encodeURIComponent(username)}`, 9000);
    const body = (await r.text()).toLowerCase();
    if (
      r.status === 404 ||
      body.includes('does not exist') ||
      body.includes('page not found')
    ) {
      return { platform: 'Snapchat', status: 'available', detail: 'Body: profile not found' };
    }
    if (
      body.includes('views') ||
      body.includes('"score"') ||
      body.includes(`"username":"${username.toLowerCase()}"`)
    ) {
      return { platform: 'Snapchat', status: 'taken', detail: 'Body: profile found' };
    }
    return { platform: 'Snapchat', status: 'unknown', detail: 'Wall/redirect, cannot confirm' };
  } catch (e) {
    return { platform: 'Snapchat', status: 'unknown', detail: abortText(e) };
  }
}

/** Discord: no public username-availability API exists. */
export async function checkDiscord(): Promise<CheckResult> {
  return {
    platform: 'Discord',
    status: 'unknown',
    detail: 'No public availability API',
  };
}

// ── Platform registry (only the 9 core platforms) ────────────────────────────

export interface PlatformConfig {
  name: string;
  category:
    | 'social'
    | 'developer'
    | 'gaming'
    | 'professional'
    | 'creative'
    | 'productivity'
    | 'messaging'
    | 'other';
  urlTpl: string;
  profileUrl: (username: string) => string;
  checkFn?: (username: string) => Promise<CheckResult>;
  formatUsername?: (base: string) => string;
  platformBio?: (identity: {
    name: string;
    job: string;
    company: string;
    city: string;
    country: string;
  }) => string;
}

const PRIORITY_ORDER: Record<string, number> = {
  Instagram: 1,
  YouTube: 2,
  X: 3,
  Threads: 4,
  LinkedIn: 5,
  Telegram: 6,
  GitHub: 7,
  Discord: 8,
  Snapchat: 9,
};

export function getPlatformPriority(platformName: string): number {
  return PRIORITY_ORDER[platformName] ?? 100;
}

export const ALL_PLATFORMS: PlatformConfig[] = [
  {
    name: 'Instagram',
    category: 'social',
    urlTpl: 'https://www.instagram.com/{u}/',
    profileUrl: (u) => 'https://www.instagram.com/' + u + '/',
    checkFn: checkInstagram,
    platformBio: (i) => i.job + ' • Living in ' + i.city + ' 📍',
  },
  {
    name: 'YouTube',
    category: 'creative',
    urlTpl: 'https://www.youtube.com/@{u}',
    profileUrl: (u) => 'https://www.youtube.com/@' + u,
    checkFn: checkYouTube,
    platformBio: (i) => 'Official channel of ' + i.name + '. Educational and deep-dive content.',
  },
  {
    name: 'X',
    category: 'social',
    urlTpl: 'https://x.com/{u}',
    profileUrl: (u) => 'https://x.com/' + u,
    checkFn: checkX,
    platformBio: (i) => i.job + ' @ ' + i.company + '. Tweeting about industry, tech, and craft.',
  },
  {
    name: 'Threads',
    category: 'social',
    urlTpl: 'https://www.threads.net/@{u}',
    profileUrl: (u) => 'https://www.threads.net/@' + u,
    checkFn: checkThreads,
    platformBio: (i) => i.job + ' • Daily ideas and discussions.',
  },
  {
    name: 'LinkedIn',
    category: 'professional',
    urlTpl: 'https://www.linkedin.com/in/{u}/',
    profileUrl: (u) => 'https://www.linkedin.com/in/' + u + '/',
    checkFn: checkLinkedIn,
    platformBio: (i) => i.job + ' at ' + i.company + ' | ' + i.city + ', ' + i.country,
  },
  {
    name: 'Telegram',
    category: 'messaging',
    urlTpl: 'https://t.me/{u}',
    profileUrl: (u) => 'https://t.me/' + u,
    checkFn: checkTelegram,
    platformBio: (i) => i.job + ' at ' + i.company + ' • ' + i.city + ', ' + i.country,
  },
  {
    name: 'GitHub',
    category: 'developer',
    urlTpl: 'https://github.com/{u}',
    profileUrl: (u) => 'https://github.com/' + u,
    checkFn: checkGitHub,
    platformBio: (i) => i.job + ' at ' + i.company + '. Building modern applications.',
  },
  {
    name: 'Discord',
    category: 'messaging',
    urlTpl: 'https://discord.com/users/{u}',
    profileUrl: (u) => 'https://discord.com/users/' + u,
    checkFn: checkDiscord,
    platformBio: (i) => i.job + ' at ' + i.company + ' • ' + i.city + ', ' + i.country,
  },
  {
    name: 'Snapchat',
    category: 'social',
    urlTpl: 'https://www.snapchat.com/add/{u}',
    profileUrl: (u) => 'https://www.snapchat.com/add/' + u,
    checkFn: checkSnapchat,
    platformBio: (i) => i.job + ' sharing insights and daily journey.',
  },
];

export function formatUsernameForPlatform(
  platformName: string,
  firstName: string,
  lastName: string
): string {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');

  switch (platformName) {
    case 'GitHub':
    case 'LinkedIn':
      return cleanFirst + '-' + cleanLast;
    case 'X':
    case 'Instagram':
    case 'Threads':
    case 'Telegram':
    case 'Discord':
      return cleanFirst + '_' + cleanLast;
    case 'Snapchat':
      return cleanFirst + cleanLast;
    default:
      return cleanFirst + cleanLast;
  }
}

/** Check a single platform for a username */
export async function verifyUsernameOnPlatform(
  platform: PlatformConfig,
  username: string
): Promise<CheckResult> {
  const clean = username.trim();

  // If custom checker exists, use it
  if (platform.checkFn) {
    return await platform.checkFn(clean);
  }

  // Otherwise, use standard simple HTTP check: 200 = taken, 404 = available
  const targetUrl = platform.urlTpl.replace('{u}', encodeURIComponent(clean));
  try {
    const r = await get(targetUrl);
    if (r.status === 200) {
      return { platform: platform.name, status: 'taken', detail: 'HTTP 200' };
    }
    if (r.status === 404) {
      return { platform: platform.name, status: 'available', detail: 'HTTP 404' };
    }
    return { platform: platform.name, status: 'unknown', detail: `HTTP ${r.status}` };
  } catch (e: unknown) {
    return { platform: platform.name, status: 'unknown', detail: abortText(e) };
  }
}

const STATUS_PRIORITY: Record<UsernameStatus, number> = {
  available: 0,
  unknown: 1,
  checking: 2,
  taken: 3,
};

/**
 * Find a username for a platform that is genuinely verified available.
 * Never fabricates 'available' — if nothing verifies, the best-effort
 * candidate is returned with its honest status.
 */
export async function findAvailableUsernameForPlatform(
  platform: PlatformConfig,
  _baseUsername: string,
  firstName: string,
  lastName: string,
  profession?: string
): Promise<{ username: string; status: UsernameStatus; detail: string }> {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanProf = (profession || 'dev')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);

  const sep = platform.name === 'GitHub' ? '-' : '_';
  const randNum = Math.floor(100 + Math.random() * 899);
  const randNum2 = Math.floor(10 + Math.random() * 89);

  const candidates: string[] = [
    formatUsernameForPlatform(platform.name, firstName, lastName),
    cleanFirst + sep + cleanLast + '_' + cleanProf,
    cleanFirst + sep + cleanLast + randNum,
    cleanFirst + cleanLast + randNum,
    cleanFirst + sep + cleanLast + '_' + randNum2,
    cleanFirst + cleanLast + randNum2,
  ];

  // X handles are capped at 15 characters
  if (platform.name === 'X') {
    for (let i = 0; i < candidates.length; i++) {
      candidates[i] = candidates[i].slice(0, 15);
    }
  }

  let best: { username: string; status: UsernameStatus; detail: string } | null = null;

  for (let i = 0; i < Math.min(candidates.length, 5); i++) {
    const res = await verifyUsernameOnPlatform(platform, candidates[i]);

    // Discord-style platforms can never verify: take the first formatted handle.
    if (i === 0 && res.status === 'unknown') {
      best = { username: candidates[i], status: 'unknown', detail: res.detail };
      break;
    }

    if (!best || STATUS_PRIORITY[res.status] < STATUS_PRIORITY[best.status]) {
      best = { username: candidates[i], status: res.status, detail: res.detail };
    }

    if (res.status === 'available') {
      return { username: candidates[i], status: 'available', detail: res.detail };
    }
  }

  return (
    best || {
      username: cleanFirst + '_' + cleanLast + randNum,
      status: 'unknown',
      detail: 'Unverified',
    }
  );
}

/** Concurrent scanner (9 platforms) */
export async function checkUsernameAcrossAllPlatforms(
  username: string,
  workers = 9
): Promise<CheckResult[]> {
  const cleanUser = username.trim();
  if (!cleanUser) return [];

  const results: CheckResult[] = [];
  const queue = [...ALL_PLATFORMS];

  const worker = async () => {
    while (queue.length > 0) {
      const platform = queue.shift();
      if (!platform) break;
      const res = await verifyUsernameOnPlatform(platform, cleanUser);
      results.push(res);
    }
  };

  const pool = Array.from({ length: Math.min(workers, ALL_PLATFORMS.length) }, () => worker());
  await Promise.all(pool);

  results.sort((a, b) => {
    const pA = getPlatformPriority(a.platform);
    const pB = getPlatformPriority(b.platform);
    if (pA !== pB) return pA - pB;
    return a.platform.localeCompare(b.platform);
  });

  return results;
}

/** Build full platform list for a new identity (9 core platforms) */
export async function buildAllPlatformUsernames(
  identity: {
    firstName: string;
    lastName: string;
    displayName: string;
    job: string;
    company: string;
    city: string;
    country: string;
  },
  workers = 9
): Promise<PlatformUsername[]> {
  const queue = [...ALL_PLATFORMS];
  const results: PlatformUsername[] = [];

  const worker = async () => {
    while (queue.length > 0) {
      const platform = queue.shift();
      if (!platform) break;

      const defaultHandle = formatUsernameForPlatform(
        platform.name,
        identity.firstName,
        identity.lastName
      );

      const { username, status, detail } = await findAvailableUsernameForPlatform(
        platform,
        defaultHandle,
        identity.firstName,
        identity.lastName,
        identity.job
      );

      const bio = platform.platformBio
        ? platform.platformBio({
            name: identity.displayName,
            job: identity.job,
            company: identity.company,
            city: identity.city,
            country: identity.country,
          })
        : identity.job + ' at ' + identity.company + ' • ' + identity.city + ', ' + identity.country;

      results.push({
        platform: platform.name,
        category: platform.category,
        username,
        status,
        detail,
        profileUrl: platform.profileUrl(username),
        checkUrl: platform.urlTpl.replace('{u}', encodeURIComponent(username)),
        bio,
        checkedAt: new Date().toISOString(),
      });
    }
  };

  const pool = Array.from({ length: Math.min(workers, ALL_PLATFORMS.length) }, () => worker());
  await Promise.all(pool);

  results.sort((a, b) => {
    const pA = getPlatformPriority(a.platform);
    const pB = getPlatformPriority(b.platform);
    if (pA !== pB) return pA - pB;
    return a.platform.localeCompare(b.platform);
  });

  return results;
}