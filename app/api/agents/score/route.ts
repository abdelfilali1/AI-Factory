import { NextRequest, NextResponse } from 'next/server';
import { scoreIdea, reviewStep } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { idea, cluster, weights } = await req.json();

    if (!idea || !cluster || !weights) {
      return NextResponse.json({ error: 'Missing idea, cluster, or weights' }, { status: 400 });
    }

    const startTime = Date.now();
    const scorecard = await scoreIdea(idea, cluster, weights);
    const aiReview = await reviewStep('idea-scoring', { idea, cluster, weights }, scorecard);
    const latencyMs = Date.now() - startTime;

    // Attach AI review to scorecard
    const scorecardWithReview = { ...scorecard, aiReview };

    return NextResponse.json({
      scorecard: scorecardWithReview,
      aiReview,
      audit: {
        agentName: 'Idea Scorer',
        action: 'SCORE_IDEA',
        inputSummary: `Idea: "${idea.title}". Rubric v1.0.`,
        outputSummary: `Score: ${scorecard.totalScore}/100. ${scorecard.riskFlags.length} risk flags. Review: ${aiReview.recommendation}`,
        latencyMs,
      },
    });
  } catch (error) {
    console.error('Score idea error:', error);
    return NextResponse.json(
      { error: 'Scoring failed', details: String(error) },
      { status: 500 }
    );
  }
}
