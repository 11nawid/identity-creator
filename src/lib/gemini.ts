import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface GeminiConfig {
  retry_attempts: number;
  retry_delay_sec: number;
  request_timeout_sec: number;
  gemini_bl: string;
  auth_user: string | null;
  xsrf_token: string | null;
  default_model: string;
  cookie_file: string | null;
  proxy: string | null;
  log_requests: boolean;
  temporary_chats: boolean;
  api_key: string | null;
  api_model: string | null;
}

export const DEFAULT_CONFIG: GeminiConfig = {
  retry_attempts: 3,
  retry_delay_sec: 2,
  request_timeout_sec: 60,
  gemini_bl: 'boq_assistant-bard-web-server_20260716.08_p0',
  auth_user: null,
  xsrf_token: null,
  default_model: 'gemini-3.6-flash',
  cookie_file: null,
  proxy: null,
  log_requests: false,
  temporary_chats: false,
  api_key: null,
  api_model: 'gemini-3.7-flash',
};

let cachedConfig: GeminiConfig | null = null;

export function getConfig(): GeminiConfig {
  if (cachedConfig) return cachedConfig;

  const config: GeminiConfig = { ...DEFAULT_CONFIG };
  const configPath = path.join(process.cwd(), 'config.json');

  if (fs.existsSync(configPath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      Object.assign(config, raw);
    } catch {
      // Use defaults if config cannot be parsed
    }
  }

  if (process.env.GEMINI_BL) config.gemini_bl = process.env.GEMINI_BL;
  if (process.env.GEMINI_PROXY) config.proxy = process.env.GEMINI_PROXY;
  if (process.env.GEMINI_COOKIE_FILE) config.cookie_file = process.env.GEMINI_COOKIE_FILE;
  if (process.env.GEMINI_DEFAULT_MODEL) config.default_model = process.env.GEMINI_DEFAULT_MODEL;
  if (process.env.GEMINI_API_KEY) config.api_key = process.env.GEMINI_API_KEY;
  if (process.env.GEMINI_MODEL) config.api_model = process.env.GEMINI_MODEL;

  cachedConfig = config;
  return config;
}

export function isAiConfigured(): boolean {
  if (getConfig().api_key) return true;
  return Boolean(loadCookie().sapisid);
}

export function makeSapisidHash(sapisid: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('sha1');
  hash.update(`${ts} ${sapisid} https://gemini.google.com`);
  return `SAPISIDHASH ${ts}_${hash.digest('hex')}`;
}

let cookieCache = { cookieStr: '', sapisid: null as string | null, mtime: 0 };

export function loadCookie(cookieFilePath?: string | null): { cookieStr: string; sapisid: string | null } {
  const cookieFile = cookieFilePath || getConfig().cookie_file;
  if (!cookieFile || !fs.existsSync(/*turbopackIgnore: true*/ cookieFile)) {
    return { cookieStr: '', sapisid: null };
  }

  try {
    const mtime = fs.statSync(/*turbopackIgnore: true*/ cookieFile).mtimeMs;
    if (mtime === cookieCache.mtime && cookieCache.cookieStr) {
      return { cookieStr: cookieCache.cookieStr, sapisid: cookieCache.sapisid };
    }

    const content = fs.readFileSync(/*turbopackIgnore: true*/ cookieFile, 'utf8').trim();
    let cookieStr = '';
    let sapisid: string | null = null;

    if (content.startsWith('{')) {
      const data = JSON.parse(content);
      cookieStr = data.cookie || '';
      sapisid = data.sapisid || '';
    } else {
      cookieStr = content;
      const pairs: Record<string, string> = {};
      cookieStr.split('; ').forEach((p) => {
        if (p.includes('=')) {
          const [key, ...val] = p.split('=');
          pairs[key.trim()] = val.join('=').trim();
        }
      });
      sapisid = pairs['SAPISID'] || '';
    }

    cookieCache = { cookieStr, sapisid: sapisid || null, mtime };
    return { cookieStr, sapisid: sapisid || null };
  } catch {
    return { cookieStr: cookieCache.cookieStr, sapisid: cookieCache.sapisid };
  }
}

export function buildHeaders(): Record<string, string> {
  const config = getConfig();
  const authUser = config.auth_user;
  const accountPrefixValue = authUser ? `/u/${authUser}` : '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Origin: 'https://gemini.google.com',
    Referer: `https://gemini.google.com${accountPrefixValue}/app`,
    'X-Same-Domain': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  };

  if (authUser) {
    headers['X-Goog-AuthUser'] = String(authUser);
  }

  const { cookieStr, sapisid } = loadCookie();
  if (cookieStr) {
    headers['Cookie'] = cookieStr;
  }
  if (sapisid) {
    headers['Authorization'] = makeSapisidHash(sapisid);
  }

  return headers;
}

export function buildPayload(
  prompt: string,
  modelId: number = 1,
  thinkMode: number = 4
): string {
  const config = getConfig();
  const inner = new Array(102).fill(null);

  inner[0] = [prompt, 0, null, null, null, null, 0];
  inner[1] = ['en'];
  inner[2] = ['', '', '', null, null, null, null, null, null, ''];
  inner[6] = [0];
  inner[7] = 1;
  inner[10] = 1;
  inner[11] = 0;
  inner[17] = [[thinkMode]];
  inner[18] = 0;
  inner[27] = 1;
  inner[30] = [4];

  if (config.temporary_chats) {
    inner[41] = [1];
    inner[45] = 1;
  } else {
    inner[41] = [2];
  }

  inner[53] = 0;
  inner[59] = crypto.randomUUID();
  inner[61] = [];
  inner[68] = 1;
  inner[79] = modelId;

  const outer = [null, JSON.stringify(inner)];
  const params = new URLSearchParams();
  params.append('f.req', JSON.stringify(outer));

  if (config.xsrf_token) {
    params.append('at', config.xsrf_token);
  }

  return params.toString();
}

export function getUrl(): string {
  const config = getConfig();
  const reqid = Math.floor(Date.now() / 1000) % 1000000;
  const authUser = config.auth_user;
  const accountPrefixValue = authUser ? `/u/${authUser}` : '';
  return `https://gemini.google.com${accountPrefixValue}/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=${config.gemini_bl}&hl=en&_reqid=${reqid}&rt=c`;
}

export function extractTextsFromLine(line: string): string[] {
  if (!line.includes('"wrb.fr"')) {
    return [];
  }
  try {
    const jsonStart = line.indexOf('[[');
    if (jsonStart === -1) return [];
    const arr = JSON.parse(line.slice(jsonStart));
    const innerStr = arr[0]?.[2];
    if (!innerStr || innerStr.length < 50) return [];
    const inner = JSON.parse(innerStr);
    if (!Array.isArray(inner) || inner.length <= 4 || !inner[4]) return [];

    const texts: string[] = [];
    for (const part of inner[4]) {
      if (Array.isArray(part) && part.length > 1 && part[1] && Array.isArray(part[1])) {
        for (const t of part[1]) {
          if (typeof t === 'string' && t) {
            texts.push(t);
          }
        }
      }
    }
    return texts;
  } catch {
    return [];
  }
}

export function cleanText(text: string): string {
  let cleaned = text;

  // Strip code execution metadata & card URLs
  cleaned = cleaned.replace(/```(?:python|javascript|text)\?code_(?:reference|stdout)&code_event_index=\d+\n[\s\S]*?```\n?/g, '');
  cleaned = cleaned.replace(/http:\/\/googleusercontent\.com\/card_content\/\d+\n?/g, '');

  // Strip Gemini container tags
  cleaned = cleaned.replace(/<\/?(?:Sequence|Step|ElicitationsGroup|Elicitation|FollowUp|Image|ContextualQuery)[^>]*>/gi, '');

  return cleaned.trim();
}

export function extractResponseText(raw: string): string {
  const bardErrMatch = raw.match(/BardErrorInfo\s*\[(\d+)\]/);
  if (bardErrMatch) {
    throw new Error(`Gemini upstream rejected request: BardErrorInfo [${bardErrMatch[1]}]`);
  }

  let lastText = '';
  const lines = raw.split('\n');
  for (const line of lines) {
    for (const t of extractTextsFromLine(line)) {
      if (t.length > lastText.length) {
        lastText = t;
      }
    }
  }
  return cleanText(lastText);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate text using the official Gemini REST API (requires GEMINI_API_KEY).
 * This path sends your prompt only to the public developer API and never
 * touches your browser session credentials.
 */
export async function generateOfficial(
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  const config = getConfig();
  const model = config.api_model || 'gemini-3.7-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let lastErr: unknown = null;
  const attempts = Math.max(1, config.retry_attempts || 3);
  const delayMs = Math.max(500, (config.retry_delay_sec || 2) * 1000);

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (signal?.aborted) {
      throw new Error('Request aborted');
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.api_key as string,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        const snippet = detail.slice(0, 300);
        throw new Error(
          `AI API request failed: HTTP ${response.status} ${response.statusText}${
            snippet ? ` - ${snippet}` : ''
          }`
        );
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts;
      if (Array.isArray(parts)) {
        const text = parts
          .map((p: { text?: string }) => p?.text || '')
          .join('')
          .trim();
        if (text) {
          return text;
        }
      }
      throw new Error('Empty response from AI API');
    } catch (e: unknown) {
      lastErr = e;
      if (signal?.aborted || (e as { name?: string })?.name === 'AbortError') {
        throw e;
      }
      if (attempt < attempts - 1) {
        await sleep(delayMs);
      }
    }
  }

  throw lastErr;
}

/**
 * Generate text using the free Gemini web service
 */
export async function generate(
  prompt: string,
  modelId: number = 1,
  thinkMode: number = 4,
  signal?: AbortSignal
): Promise<string> {
  const config = getConfig();

  if (config.api_key) {
    return generateOfficial(prompt, signal);
  }

  if (!loadCookie().sapisid) {
    throw new Error(
      'No AI provider configured. Set GEMINI_API_KEY (recommended) or provide a cookie_file containing a SAPISID value for the legacy web connector. See README for details.'
    );
  }

  const body = buildPayload(prompt, modelId, thinkMode);
  const url = getUrl();
  const headers = buildHeaders();

  let lastErr: unknown = null;
  const attempts = Math.max(1, config.retry_attempts || 3);
  const delayMs = Math.max(500, (config.retry_delay_sec || 2) * 1000);

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (signal?.aborted) {
      throw new Error('Request aborted');
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal,
      });

      if (!response.ok) {
        throw new Error(`Gemini request failed: HTTP ${response.status} ${response.statusText}`);
      }

      const raw = await response.text();
      const extracted = extractResponseText(raw);
      if (!extracted) {
        throw new Error('Empty response from Gemini');
      }
      return extracted;
    } catch (e: unknown) {
      lastErr = e;
      if (signal?.aborted || (e as { name?: string })?.name === 'AbortError') {
        throw e;
      }
      if (attempt < attempts - 1) {
        await sleep(delayMs);
      }
    }
  }

  throw lastErr;
}
