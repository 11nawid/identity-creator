'use client';

import type { SyntheticIdentity } from '@/types';

/**
 * Client-side temp-mailbox persistence + creation helpers.
 * One working mailbox per identity, persisted in localStorage and reused.
 * The Mail.tm API itself is only ever touched by the server (/api/mail).
 */

export interface StoredMailbox {
  emailAddress: string;
  username: string;
  password: string;
  accountId: string;
  domain: string;
  createdAt: string;
}

export interface MailSession extends StoredMailbox {
  jwtToken: string;
}

export const mailboxStorageKey = (identityId: string) => `identity-mailbox:${identityId}`;

export function loadStoredMailbox(identityId: string): StoredMailbox | null {
  try {
    const raw = localStorage.getItem(mailboxStorageKey(identityId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMailbox;
    if (!parsed.emailAddress || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredMailbox(identityId: string, mailbox: StoredMailbox): void {
  try {
    localStorage.setItem(mailboxStorageKey(identityId), JSON.stringify(mailbox));
  } catch {
    /* storage unavailable — session stays in memory only */
  }
}

export function clearStoredMailbox(identityId: string): void {
  try {
    localStorage.removeItem(mailboxStorageKey(identityId));
  } catch {
    /* ignore */
  }
}

export async function mailApiCall<T>(action: string, extra: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch('/api/mail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...extra }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error: string }).error)
        : `Request failed (HTTP ${res.status})`;
    throw Object.assign(new Error(message), { status: res.status });
  }
  return data as T;
}

/** Create a brand-new Mail.tm mailbox (server-side) and return the session. */
export async function createTempMailbox(): Promise<MailSession> {
  return mailApiCall<MailSession>('create');
}

/** Retry mailbox creation on transient/unreliable status (429/5xx/network). */
async function createMailboxWithRetry(attempts = 4): Promise<MailSession> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await createTempMailbox();
    } catch (err) {
      lastErr = err;
      const status =
        err instanceof Error ? Number((err as { status?: unknown }).status) : undefined;
      const retriable = status === 429 || (typeof status === 'number' && status >= 500) || Number.isNaN(status);
      if (!retriable || attempt === attempts - 1) break;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
    }
  }
  throw lastErr;
}

/** In-flight dedupe so concurrent calls for the same identity create once. */
const inflight = new Map<string, Promise<StoredMailbox>>();

/**
 * Return the persisted mailbox for an identity, creating + persisting one on
 * first use. This is what guarantees an identity always has a real, working
 * primary email even if the user never visits the Inbox tab.
 */
export function ensureWorkingMailbox(identityId: string): Promise<StoredMailbox> {
  const existing = loadStoredMailbox(identityId);
  if (existing) return Promise.resolve(existing);

  let pending = inflight.get(identityId);
  if (pending) return pending;

  pending = (async () => {
    const session = await createMailboxWithRetry();
    const stored: StoredMailbox = {
      emailAddress: session.emailAddress,
      username: session.username,
      password: session.password,
      accountId: session.accountId,
      domain: session.domain,
      createdAt: session.createdAt,
    };
    saveStoredMailbox(identityId, stored);
    return stored;
  })().finally(() => inflight.delete(identityId));
  inflight.set(identityId, pending);
  return pending;
}

/**
 * Ensure an identity carries a real, working primary email: reuse (or create)
 * its Mail.tm mailbox. If Mail.tm is unreachable the synthetic email is kept
 * so generation never blocks on the mail provider.
 */
export async function ensureWorkingEmail(identity: SyntheticIdentity): Promise<SyntheticIdentity> {
  return (await ensureWorkingEmails([identity], 1))[0];
}

/**
 * Run ensureWorkingEmail across many identities with limited concurrency
 * (generation-time mailbox creation must not hammer the Mail.tm API or stall
 * batch generation). Per-identity failures fall back to the synthetic email.
 */
export async function ensureWorkingEmails(
  identities: SyntheticIdentity[],
  concurrency = 2,
): Promise<SyntheticIdentity[]> {
  const results = new Array<SyntheticIdentity>(identities.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < identities.length) {
      const i = cursor++;
      const identity = identities[i];
      let working = identity;
      try {
        const mailbox = await ensureWorkingMailbox(identity.id);
        if (mailbox.emailAddress && mailbox.emailAddress !== identity.email) {
          working = { ...identity, email: mailbox.emailAddress };
        }
      } catch {
        /* keep the synthetic email — working inbox is available via the Inbox tab */
      }
      results[i] = working;
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, identities.length) }, () => worker()),
  );
  return results;
}