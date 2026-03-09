import { NextRequest, NextResponse } from 'next/server';
import { reviewStep } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { stepName, input, output } = await req.json();

    if (!stepName || input === undefined || output === undefined) {
      return NextResponse.json({ error: 'Missing stepName, input, or output' }, { status: 400 });
    }

    const startTime = Date.now();
    const aiReview = await reviewStep(stepName, input, output);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      aiReview,
      latencyMs,
    });
  } catch (error) {
    console.error('Review step error:', error);
    return NextResponse.json(
      { error: 'Review failed', details: String(error) },
      { status: 500 }
    );
  }
}
