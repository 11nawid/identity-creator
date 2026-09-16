import { randomBytes } from 'crypto';

/**
 * Mail.tm integration — native `fetch`, no SDKs.
 *
 * End-to-end workflow:
 *   1. createMailSession() → GET /api/domains, picks an active domain
 *   2. generates random username/password → POST /api/accounts
 *   3. POST /api/token → JWT Bearer token
 *   4. session.getMessages() / waitForMessage() → GET /api/messages
 *
 * Always run on the server (Next.js route handlers) so credentials never
 * leave the machine.
 */

export const MAILTM_BASE_URL = 'https://api.mail.tm';
const API = MAILTM_BASE_URL;

// ── Errors ────────────────────────────────────────────────────────────────────

export class MailTmError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'MailTmError';
    this.status = status;
    this.code = code;
  }
}

// ── Types (subset of the Hydra API) ───────────────────────────────────────────

export interface MailTmDomain {
  '@id': string;
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailTmAccount {
  '@id': string;
  '@type': string;
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailTmToken {
  token: string;
  id: string;
}

export interface MailTmAddress {
  address: string;
  name: string;
}

export interface MailTmMessageSummary {
  '@id': string;
  id: string;
  accountId: number;
  msgid: string;
  from: MailTmAddress;
  to: MailTmAddress[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MailTmMessage extends MailTmMessageSummary {
  cc: MailTmAddress[];
  bcc: MailTmAddress[];
  flagged: boolean;
  verifications: string[];
  retention: boolean;
  retentionDate: string | null;
  text: string[];
  html: string[];
  attachments: unknown[];
}

export interface MailTmMessageList {
  totalItems: number;
  messages: MailTmMessageSummary[];
}

// ── Transport ─────────────────────────────────────────────────────────────────

interface FetchOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  token?: string;
  timeoutMs?: number;
  retries?: number;
}

/**
 * Low-level JSON transport with timeout + idempotent retry on 429/5xx.
 * Throws `MailTmError` with a normalized status/code on failure.
 */
async function mailtmFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    timeoutMs = 15_000,
    retries = 0,
  } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let attempt = 0;
  while (true) {
    let response: Response;
    try {
      response = await fetch(`${API}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      throw new MailTmError(
        isAbort ? `Mail.tm request timed out after ${timeoutMs}ms` : `Network error: ${String(err)}`,
        isAbort ? 408 : 502,
        'NETWORK'
      );
    }

    if (response.status === 204) return undefined as T;

    let payload: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (response.status === 429 && attempt < retries) {
      const retryAfter = Number(response.headers.get('retry-after')) || 1000;
      await new Promise((r) => setTimeout(r, retryAfter));
      attempt += 1;
      continue;
    }

    if (response.status >= 500 && attempt < retries) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && 'message' in payload
          ? String((payload as { message: string }).message)
          : `Mail.tm ${method} ${path} failed (HTTP ${response.status})`;
      throw new MailTmError(message, response.status, `HTTP_${response.status}`);
    }

    return payload as T;
  }
}

// ── Domain selection ──────────────────────────────────────────────────────────

export type MailTmHydraCollection<T> = { 'hydra:member'?: T[]; 'hydra:totalItems'?: number };

/** Normalize a Hydra envelope vs a bare resource array (API negotiates both). */
function toArray<T>(data: MailTmHydraCollection<T> | T[] | undefined | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.['hydra:member'] ?? [];
}

/** GET /api/domains → active domains, public ones preferred. */
export async function fetchActiveDomains(timeoutMs = 15_000): Promise<MailTmDomain[]> {
  try {
    const data = await mailtmFetch<MailTmHydraCollection<MailTmDomain> | MailTmDomain[]>(
      '/domains',
      { timeoutMs, retries: 2 }
    );
    return toArray(data)
      .filter((d) => d.isActive && d.domain)
      .sort((a, b) => Number(a.isPrivate) - Number(b.isPrivate));
  } catch (err) {
    if (err instanceof MailTmError) throw err;
    throw new MailTmError('Could not fetch Mail.tm domains', 500);
  }
}

/** Pick the first active domain (public preferred), with optional allow-list. */
export async function pickActiveDomain(
  preferredDomains?: string[],
  timeoutMs = 15_000
): Promise<MailTmDomain> {
  const domains = await fetchActiveDomains(timeoutMs);
  const candidates = preferredDomains?.length
    ? domains.filter((d) => preferredDomains.some((p) => d.domain === p.toLowerCase()))
    : domains;

  const picked = candidates[0] ?? domains[0];
  if (!picked) {
    throw new MailTmError('Mail.tm returned no active domains', 503, 'NO_DOMAINS');
  }
  return picked;
}

// ── Credential generation ─────────────────────────────────────────────────────

const USERNAME_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789_';
const PASSWORD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function randomString(length: number, alphabet: string): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export interface MailTmCredentials {
  username: string;
  password: string;
  address: string;
}

/** Generate a username/password pair for a given domain. */
export function generateCredentials(domain: string): MailTmCredentials {
  const username = randomString(8 + Math.floor(Math.random() * 5), USERNAME_ALPHABET);
  const password = randomString(16, PASSWORD_ALPHABET);
  return { username, password, address: `${username}@${domain}` };
}

// ── Account + auth ────────────────────────────────────────────────────────────

/** POST /api/accounts → ephemeral mailbox. */
export async function createAccount(
  address: string,
  password: string,
  timeoutMs = 15_000
): Promise<MailTmAccount> {
  try {
    return await mailtmFetch<MailTmAccount>('/accounts', {
      method: 'POST',
      body: { address, password },
      timeoutMs,
      retries: 1,
    });
  } catch (err) {
    if (err instanceof MailTmError && err.status === 422) {
      throw new MailTmError(
        `Mail.tm rejected the account (address may already exist): ${address}`,
        422,
        'ACCOUNT_CONFLICT'
      );
    }
    if (err instanceof MailTmError) throw err;
    throw new MailTmError('Could not create Mail.tm account', 500);
  }
}

/** POST /api/token → JWT Bearer token. */
export async function createToken(
  address: string,
  password: string,
  timeoutMs = 15_000
): Promise<MailTmToken> {
  try {
    return await mailtmFetch<MailTmToken>('/token', {
      method: 'POST',
      body: { address, password },
      timeoutMs,
      retries: 1,
    });
  } catch (err) {
    if (err instanceof MailTmError && (err.status === 401 || err.status === 400)) {
      throw new MailTmError(`Mail.tm authentication failed for ${address}`, err.status, 'AUTH_FAILED');
    }
    if (err instanceof MailTmError) throw err;
    throw new MailTmError('Could not authenticate with Mail.tm', 500);
  }
}

/** DELETE /api/accounts/{id} — release the mailbox. */
export async function deleteAccount(
  token: string,
  accountId: string | number,
  timeoutMs = 15_000
): Promise<void> {
  try {
    await mailtmFetch<void>(`/accounts/${accountId}`, { method: 'DELETE', token, timeoutMs });
  } catch (err) {
    if (err instanceof MailTmError && err.status === 404) return;
    throw err;
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────

/** GET /api/messages → summaries (newest first). */
export async function fetchMessages(
  token: string,
  options: { page?: number; perPage?: number } = {},
  timeoutMs = 15_000
): Promise<MailTmMessageList> {
  const { page = 1, perPage = 30 } = options;
  const query = `?page=${page}&perPage=${perPage}`;
  const data = await mailtmFetch<MailTmHydraCollection<MailTmMessageSummary> | MailTmMessageSummary[]>(
    `/messages${query}`,
    { token, timeoutMs, retries: 2 }
  ).catch((err: unknown) => {
    throw err instanceof MailTmError
      ? err
      : new MailTmError('Could not fetch Mail.tm messages', 500);
  });

  const messages = toArray(data);
  const totalItems = !Array.isArray(data)
    ? Number(data?.['hydra:totalItems']) || messages.length
    : messages.length;

  return { totalItems, messages };
}

/** GET /api/messages/{id} → full message with text/html bodies. */
export async function getMessage(
  token: string,
  messageId: string,
  timeoutMs = 15_000
): Promise<MailTmMessage> {
  try {
    return await mailtmFetch<MailTmMessage>(`/messages/${messageId}`, {
      token,
      timeoutMs,
      retries: 2,
    });
  } catch (err) {
    if (err instanceof MailTmError && err.status === 404) {
      throw new MailTmError(`Message ${messageId} no longer exists`, 404, 'MESSAGE_NOT_FOUND');
    }
    if (err instanceof MailTmError) throw err;
    throw new MailTmError('Could not fetch Mail.tm message', 500);
  }
}

// ── High-level session ────────────────────────────────────────────────────────

export interface MailTmSessionOptions {
  /** Restrict domain selection to this allow-list (optional). */
  preferredDomains?: string[];
  timeoutMs?: number;
}

export interface MailTmSession {
  /** Full address, e.g. `abc123xyz@mailto.com`. */
  emailAddress: string;
  username: string;
  password: string;
  domain: string;
  accountId: string;
  /** JWT Bearer token for authenticated calls. */
  jwtToken: string;
  createdAt: string;

  /** Latest inbox summaries (newest first). */
  getMessages: () => Promise<MailTmMessageList>;

  /** Fetch a specific full message by id. */
  getMessageById: (messageId: string) => Promise<MailTmMessage>;

  /**
   * Poll the inbox until a new message matching `predicate` arrives.
   * Times out after `timeoutMs` (default 60s).
   */
  waitForMessage: (options?: {
    timeoutMs?: number;
    pollIntervalMs?: number;
    predicate?: (message: MailTmMessageSummary) => boolean;
  }) => Promise<MailTmMessageSummary>;

  /** Delete the temporary mailbox. */
  delete: () => Promise<void>;
}

/**
 * One-shot factory: creates a mailbox, authenticates, and returns a session
 * object bundling the credentials, JWT, and message helpers.
 */
export async function createMailSession(
  options: MailTmSessionOptions = {}
): Promise<MailTmSession> {
  const { preferredDomains, timeoutMs } = options;

  try {
    // 1. Domain
    const domain = await pickActiveDomain(preferredDomains, timeoutMs);

    // 2. Credentials + account
    const { username, password, address } = generateCredentials(domain.domain);
    const account = await createAccount(address, password, timeoutMs);

    // 3. JWT
    const token = await createToken(address, password, timeoutMs);

    // 4. Message helpers (dedupe by id)
    const seenIds = new Set<string>();

    const getMessages = async (): Promise<MailTmMessageList> => {
      const { totalItems, messages } = await fetchMessages(token.token, {}, timeoutMs);
      messages.forEach((m) => seenIds.add(m.id));
      return { totalItems, messages };
    };

    const getMessageById = async (messageId: string): Promise<MailTmMessage> =>
      getMessage(token.token, messageId, timeoutMs);

    const waitForMessage = async (opts: {
      timeoutMs?: number;
      pollIntervalMs?: number;
      predicate?: (message: MailTmMessageSummary) => boolean;
    } = {}): Promise<MailTmMessageSummary> => {
      const deadline = Date.now() + (opts.timeoutMs ?? 60_000);
      const interval = opts.pollIntervalMs ?? 3_000;
      const predicate = opts.predicate ?? (() => true);

      while (Date.now() < deadline) {
        const { messages } = await fetchMessages(token.token, {}, timeoutMs);
        const match = messages.find((m) => !seenIds.has(m.id) && predicate(m));
        if (match) {
          seenIds.add(match.id);
          return match;
        }
        await new Promise((r) => setTimeout(r, interval));
      }

      throw new MailTmError(
        `No new message within ${opts.timeoutMs ?? 60_000}ms`,
        408,
        'TIMEOUT'
      );
    };

    const remove = async (): Promise<void> => {
      await deleteAccount(token.token, account.id, timeoutMs);
    };

    return {
      emailAddress: address,
      username,
      password,
      domain: domain.domain,
      accountId: account.id,
      jwtToken: token.token,
      createdAt: new Date().toISOString(),
      getMessages,
      getMessageById,
      waitForMessage,
      delete: remove,
    };
  } catch (err) {
    if (err instanceof MailTmError) throw err;
    throw new MailTmError(`Mail.tm session setup failed: ${String(err)}`, 500);
  }
}