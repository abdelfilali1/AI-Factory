import { NextRequest, NextResponse } from 'next/server';
import { generateGTMAssets } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { project } = await req.json();

    if (!project) {
      return NextResponse.json({ error: 'Missing project' }, { status: 400 });
    }

    const startTime = Date.now();
    const assets = await generateGTMAssets(project);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      assets,
      audit: {
        agentName: 'GTM Generator',
        action: 'GENERATE_GTM',
        inputSummary: `Project: "${project.ideaTitle}" (${project.id})`,
        outputSummary: `${assets.length} GTM assets generated. All pending approval.`,
        latencyMs,
      },
    });
  } catch (error) {
    console.error('GTM generation error:', error);
    return NextResponse.json(
      { error: 'GTM generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
