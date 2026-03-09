import { NextRequest, NextResponse } from 'next/server';
import { generateIdeas, reviewStep } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { cluster, painPoints } = await req.json();

    if (!cluster || !painPoints) {
      return NextResponse.json({ error: 'Missing cluster or painPoints' }, { status: 400 });
    }

    const startTime = Date.now();
    const ideas = await generateIdeas(cluster, painPoints);
    const aiReview = await reviewStep('idea-generation', { cluster, painPoints }, ideas);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      ideas,
      aiReview,
      audit: {
        agentName: 'Idea Generator',
        action: 'GENERATE_IDEAS',
        inputSummary: `Cluster: "${cluster.name}". ${painPoints.length} pain points.`,
        outputSummary: `${ideas.length} ideas generated. AI review: ${aiReview.score}/100 — ${aiReview.recommendation}`,
        latencyMs,
      },
    });
  } catch (error) {
    console.error('Generate ideas error:', error);
    return NextResponse.json(
      { error: 'Idea generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
