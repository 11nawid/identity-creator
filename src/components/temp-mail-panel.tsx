'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Inbox,
  RefreshCw,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  AtSign,
  ChevronLeft,
  Paperclip,
  ShieldCheck,
  MailPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/lib/toast-context';
import {
  createTempMailbox,
  loadStoredMailbox as loadStored,
  saveStoredMailbox,
  clearStoredMailbox as clearStored,
  mailApiCall as apiCall,
  type StoredMailbox,
  type MailSession,
} from '@/lib/temp-mailbox';
import type { MailTmMessage, MailTmMessageSummary } from '@/lib/mailtm';

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

interface TempMailPanelProps {
  identityId: string;
  onEmailChange?: (email: string) => void;
}

export function TempMailPanel({ identityId, onEmailChange }: TempMailPanelProps) {
  const { addToast } = useToast();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<MailSession | null>(null);
  const [messages, setMessages] = useState<MailTmMessageSummary[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selected, setSelected] = useState<MailTmMessage | null>(null);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Restore the persisted mailbox for this identity and re-authenticate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Defer to the microtask queue so no setState runs synchronously in the
      // effect body (enforced by react-hooks/set-state-in-effect).
      await Promise.resolve();
      if (cancelled) return;
      const stored = loadStored(identityId);
      if (stored) {
        try {
          const token = await apiCall<{ jwtToken: string }>('login', {
            address: stored.emailAddress,
            password: stored.password,
          });
          if (!cancelled) setSession({ ...stored, jwtToken: token.jwtToken });
        } catch {
          clearStored(identityId);
        }
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [identityId]);

  const recoverSession = useCallback(async (): Promise<boolean> => {
    const stored = loadStored(identityId);
    if (!stored) return false;
    try {
      const token = await apiCall<{ jwtToken: string }>('login', {
        address: stored.emailAddress,
        password: stored.password,
      });
      setSession({ ...stored, jwtToken: token.jwtToken });
      return true;
    } catch {
      return false;
    }
  }, [identityId]);

  const fetchInbox = useCallback(
    async (silent = false) => {
      if (!session) return;
      if (!silent) setRefreshing(true);
      try {
        const inbox = await apiCall<{ totalItems: number; messages: MailTmMessageSummary[] }>(
          'messages',
          { token: session.jwtToken }
        );
        setMessages(inbox.messages ?? []);
        setTotalItems(inbox.totalItems ?? inbox.messages?.length ?? 0);
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (status === 401 || status === 404) {
          // JWT may have expired — recover with stored credentials.
          const recovered = await recoverSession();
          if (!recovered) {
            clearStored(identityId);
            setSession(null);
            setMessages([]);
            setTotalItems(0);
            setSelected(null);
            if (!silent) addToast('Mailbox expired — create a new one', 'info');
          }
        } else if (!silent) {
          addToast(err instanceof Error ? err.message : 'Could not refresh inbox', 'error');
        }
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [session, recoverSession, identityId, addToast]
  );

  const createMailbox = async () => {
    setCreating(true);
    try {
      const created = await createTempMailbox();
      const stored: StoredMailbox = {
        emailAddress: created.emailAddress,
        username: created.username,
        password: created.password,
        accountId: created.accountId,
        domain: created.domain,
        createdAt: created.createdAt,
      };
      saveStoredMailbox(identityId, stored);
      setSession(created);
      setMessages([]);
      setTotalItems(0);
      setSelected(null);
      onEmailChange?.(created.emailAddress);
      addToast(`Mailbox created: ${created.emailAddress}`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not create mailbox', 'error');
    } finally {
      setCreating(false);
    }
  };

  const openMessage = async (id: string) => {
    if (!session) return;
    setOpening(id);
    try {
      const message = await apiCall<MailTmMessage>('message', {
        token: session.jwtToken,
        messageId: id,
      });
      setSelected(message);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not open message', 'error');
    } finally {
      setOpening(null);
    }
  };

  const deleteMailbox = async () => {
    if (!session) return;
    if (!window.confirm('Delete this temporary mailbox? Its address and inbox will be removed.')) {
      return;
    }
    setDeleting(true);
    try {
      await apiCall('delete', { token: session.jwtToken, accountId: session.accountId });
      clearStored(identityId);
      setSession(null);
      setMessages([]);
      setTotalItems(0);
      setSelected(null);
      addToast('Mailbox deleted');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Could not delete mailbox', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard`);
  };

  // Fetch inbox immediately when a session is active, then poll every 15s.
  useEffect(() => {
    if (!session) return;
    let stopped = false;
    const t0 = setTimeout(() => {
      if (!stopped) void fetchInbox(true);
    }, 0);
    const t = setInterval(() => {
      if (!stopped) void fetchInbox(true);
    }, 15_000);
    return () => {
      stopped = true;
      clearTimeout(t0);
      clearInterval(t);
    };
  }, [session, fetchInbox]);

  const bodyHtml = selected?.html?.[0];
  const bodyText = selected?.text?.[0];

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Temporary Mailbox</h3>
          <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mail.tm
          </span>
        </div>
        {session && (
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => fetchInbox()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              title="Refresh inbox"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={deleteMailbox}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              title="Delete mailbox"
            >
              {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              Delete
            </motion.button>
          </div>
        )}
      </div>

      <div className="p-5">
        {!ready ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading mailbox...
          </div>
        ) : !session ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <MailPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-base font-semibold text-foreground">No temporary mailbox yet</h4>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create an ephemeral inbox to receive verification emails, signup codes, and test mail.
              Its address becomes this identity&apos;s real primary email (shown in the Personal tab
              and profile banner), kept and reused until you delete it.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createMailbox}
              disabled={creating}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailPlus className="h-4 w-4" />}
              {creating ? 'Creating mailbox...' : 'Create Temporary Mailbox'}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border-subtle bg-muted/40 p-3 min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <AtSign className="h-3 w-3" /> Email Address
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-foreground truncate" title={session.emailAddress}>
                    {session.emailAddress}
                  </span>
                  <button
                    onClick={() => copy(session.emailAddress, 'Email address')}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Copy address"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-muted/40 p-3 min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <KeyRound className="h-3 w-3" /> Password
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-foreground truncate">
                    {showPassword ? session.password : '••••••••••••••••'}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setShowPassword((v) => !v)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => copy(session.password, 'Password')}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Copy password"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              This is now this identity&apos;s primary email. The address is reused for this identity
              until you delete it. Mail.tm removes inactive mailboxes automatically.
            </div>

            {/* Message list */}
            {selected ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <button
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to inbox
                </button>
                <div className="rounded-lg border border-border-subtle p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold text-foreground break-words">{selected.subject || '(no subject)'}</h4>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {selected.from?.name ? `${selected.from.name} <${selected.from.address}>` : selected.from?.address || 'Unknown sender'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTime(selected.createdAt)}</span>
                  </div>

                  {bodyHtml ? (
                    <iframe
                      title={`Email from ${selected.from?.address ?? ''}`}
                      className="mt-4 h-[420px] w-full rounded-lg border border-border-subtle bg-white"
                      srcDoc={bodyHtml}
                      sandbox=""
                    />
                  ) : bodyText ? (
                    <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border-subtle bg-muted/40 p-4 text-sm text-foreground">
                      {bodyText}
                    </pre>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">This message has no readable body.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Inbox</span>
                  <span>{totalItems} message{totalItems === 1 ? '' : 's'}</span>
                </div>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-subtle py-12 text-center">
                    <MailPlus className="mb-2 h-5 w-5 text-muted-foreground/60" />
                    <p className="text-sm font-medium text-foreground">No messages yet</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Send an email to {session.emailAddress} — it appears here within seconds.
                    </p>
                    <button
                      onClick={() => copy(session.emailAddress, 'Email address')}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Copy className="h-3 w-3" /> Copy address
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    <AnimatePresence initial={false}>
                      {messages.map((m) => (
                        <motion.li
                          key={m.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <button
                            onClick={() => openMessage(m.id)}
                            disabled={opening === m.id}
                            className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-60 ${
                              m.seen ? 'border-border-subtle' : 'border-border bg-muted/30'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {!m.seen && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" title="Unread" />}
                                  <span className="truncate text-sm font-semibold text-foreground">
                                    {m.from?.name || m.from?.address || 'Unknown sender'}
                                  </span>
                                </div>
                                <p className="mt-0.5 truncate text-sm text-foreground">{m.subject || '(no subject)'}</p>
                                {m.intro && <p className="mt-0.5 truncate text-xs text-muted-foreground">{m.intro}</p>}
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-[11px] text-muted-foreground">{formatTime(m.createdAt)}</span>
                                  {m.hasAttachments && (
                                    <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                                      <Paperclip className="h-2.5 w-2.5" /> attachment
                                    </span>
                                  )}
                                </div>
                              </div>
                              {opening === m.id && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
                            </div>
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}