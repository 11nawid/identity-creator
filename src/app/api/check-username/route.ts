import { NextResponse } from 'next/server';
import { ALL_PLATFORMS, verifyUsernameOnPlatform } from '@/lib/username-checker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { platform: platformName, username }: { platform: string; username: string } = await req.json();

    if (!platformName || !username) {
      return NextResponse.json(
        { error: 'Platform and username are required' },
        { status: 400 }
      );
    }

    const platformConfig = ALL_PLATFORMS.find(
      (p) => p.name.toLowerCase() === platformName.toLowerCase()
    );

    if (!platformConfig) {
      return NextResponse.json(
        { error: `Platform '${platformName}' is not supported` },
        { status: 404 }
      );
    }

    const result = await verifyUsernameOnPlatform(platformConfig, username);

    return NextResponse.json({
      platform: platformConfig.name,
      username,
      status: result.status,
      detail: result.detail,
      profileUrl: platformConfig.profileUrl(username),
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/check-username:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Check failed' },
      { status: 500 }
    );
  }
}
