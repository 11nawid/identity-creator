import { NextResponse } from 'next/server';
import { generate, isAiConfigured } from '@/lib/gemini';
import { generateLocalBio } from '@/lib/local-generator';
import { SyntheticIdentity } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let identity: SyntheticIdentity | undefined;
  let type: 'short' | 'professional' | 'social' | 'about' = 'short';
  try {
    const body = await req.json();
    identity = body?.identity;
    type = body?.type === 'short' || body?.type === 'professional' || body?.type === 'social' || body?.type === 'about' ? body.type : 'short';

    if (!identity) {
      return NextResponse.json({ error: 'Identity required' }, { status: 400 });
    }

    if (!isAiConfigured()) {
      return NextResponse.json({ bio: generateLocalBio(identity, type) });
    }

    const prompt = `Write a compelling synthetic person biography for the following profile:
Name: ${identity.displayName}
Job Title: ${identity.professional.job}
Company: ${identity.professional.company} (${identity.professional.industry})
Experience: ${identity.professional.experience}
Education: ${identity.professional.education}
Location: ${identity.location.city}, ${identity.location.region}, ${identity.location.country}
Key Skills: ${identity.professional.skills.join(', ')}
Interests: ${identity.interests.join(', ')}
Bio Style/Format Requested: ${type.toUpperCase()}

Instructions for format:
- If "SHORT": 1-2 concise, punchy sentences summarizing who they are and where they are based.
- If "PROFESSIONAL": 1 well-crafted executive paragraph highlighting their career achievements, specialization, and credentials.
- If "SOCIAL": Casual, friendly social media intro (e.g. Twitter/Bluesky/LinkedIn bio) with natural conversational tone.
- If "ABOUT": 2-3 engaging storytelling sentences describing their background, passions, and personal philosophy.

Return ONLY the raw bio text. Do NOT include quotation marks, labels, markdown blocks, or commentary.`;

    const raw = await generate(prompt, 1, 4);
    // Clean any leading/trailing quotes or markdown
    const cleaned = raw.replace(/^["']|["']$/g, '').trim();

    return NextResponse.json({ bio: cleaned });
  } catch (error) {
    console.error('Error in /api/generate-bio:', error);
    if (identity) {
      return NextResponse.json({ bio: generateLocalBio(identity, type) });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate biography' },
      { status: 500 }
    );
  }
}
