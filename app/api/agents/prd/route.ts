import { NextRequest, NextResponse } from 'next/server';
import { generatePRD, reviewStep } from '@/lib/openai';
import { generateId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { idea, scorecard } = await req.json();

    if (!idea || !scorecard) {
      return NextResponse.json({ error: 'Missing idea or scorecard' }, { status: 400 });
    }

    const startTime = Date.now();
    const prd = await generatePRD(idea, scorecard);
    const aiReview = await reviewStep('prd-generation', { idea, scorecard }, prd);
    const latencyMs = Date.now() - startTime;

    // Attach AI review to PRD
    const prdWithReview = { ...prd, aiReview };

    const projectId = generateId('proj');
    const project = {
      id: projectId,
      ideaId: idea.id,
      ideaTitle: idea.title,
      prd: prdWithReview,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      project,
      projectId,
      prd: prdWithReview,
      aiReview,
      audit: {
        agentName: 'PRD Generator',
        action: 'GENERATE_PRD',
        inputSummary: `Idea: "${idea.title}". Scorecard: ${scorecard.totalScore}/100.`,
        outputSummary: `PRD generated. ${prd.userStories?.length || 0} user stories. Review: ${aiReview.score}/100 — ${aiReview.recommendation}`,
        latencyMs,
      },
    });
  } catch (error) {
    console.error('PRD generation error:', error);
    return NextResponse.json(
      { error: 'PRD generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
