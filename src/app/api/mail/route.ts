import { NextResponse } from 'next/server';
import {
  createMailSession,
  fetchMessages,
  getMessage,
  deleteAccount,
  createToken,
  MailTmError,
} from '@/lib/mailtm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action?: string;
      preferredDomains?: string[];
      timeoutMs?: number;
      token?: string;
      accountId?: string | number;
      messageId?: string;
      address?: string;
      password?: string;
    };
    const action = body.action;

    switch (action) {
      case 'create': {
        if (body.preferredDomains && !Array.isArray(body.preferredDomains)) {
          return badRequest('preferredDomains must be an array of domain strings');
        }
        const session = await createMailSession({
          preferredDomains: body.preferredDomains,
          timeoutMs: body.timeoutMs,
        });
        return NextResponse.json({
          emailAddress: session.emailAddress,
          username: session.username,
          password: session.password,
          domain: session.domain,
          accountId: session.accountId,
          jwtToken: session.jwtToken,
          createdAt: session.createdAt,
        });
      }

      case 'login': {
        if (typeof body.address !== 'string' || typeof body.password !== 'string') {
          return badRequest('address and password are required');
        }
        try {
          const token = await createToken(body.address, body.password, body.timeoutMs);
          return NextResponse.json({ emailAddress: body.address, jwtToken: token.token });
        } catch (err) {
          if (err instanceof MailTmError && (err.status === 401 || err.status === 400)) {
            return NextResponse.json({ error: err.message, code: 'AUTH_FAILED' }, { status: 401 });
          }
          throw err;
        }
      }

      case 'messages': {
        if (!body.token) return badRequest('token is required');
        const result = await fetchMessages(body.token, {}, body.timeoutMs);
        return NextResponse.json(result);
      }

      case 'message': {
        if (!body.token) return unauthorized('token is required');
        if (!body.messageId) return badRequest('messageId is required');
        const message = await getMessage(body.token, body.messageId, body.timeoutMs);
        return NextResponse.json(message);
      }

      case 'delete': {
        if (!body.token) return unauthorized('token is required');
        if (body.accountId === undefined) return badRequest('accountId is required');
        await deleteAccount(body.token, body.accountId, body.timeoutMs);
        return NextResponse.json({ deleted: true, accountId: body.accountId });
      }

      default:
        return badRequest(
          `Unknown action '${action ?? ''}'. Use create | login | messages | message | delete`
        );
    }
  } catch (error) {
    console.error('Error in /api/mail:', error);
    const message = error instanceof Error ? error.message : 'Mail.tm request failed';
    const status = error instanceof Error && 'status' in error ? Number((error as { status?: unknown }).status) : 500;
    return NextResponse.json(
      { error: message, code: error instanceof Error && 'code' in error ? (error as { code?: string }).code : undefined },
      { status: status >= 400 && status <= 599 ? status : 500 }
    );
  }
}