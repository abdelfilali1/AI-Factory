import { NextRequest, NextResponse } from 'next/server';
import { extractPainPoints, reviewStep } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { document } = await req.json();

    if (!document) {
      return NextResponse.json({ error: 'Missing document' }, { status: 400 });
    }

    const startTime = Date.now();
    const painPoints = await extractPainPoints(document);
    const aiReview = await reviewStep('pain-extraction', document, painPoints);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      painPoints,
      aiReview,
      audit: {
        agentName: 'Pain Point Extractor',
        action: 'EXTRACT_PAIN_POINTS',
        inputSummary: `Document: "${document.title}" (${document.id})`,
        outputSummary: `${painPoints.length} pain points extracted. AI review score: ${aiReview.score}/100`,
        latencyMs,
      },
    });
  } catch (error) {
    console.error('Extract pain points error:', error);
    return NextResponse.json(
      { error: 'Extraction failed', details: String(error) },
      { status: 500 }
    );
  }
}
