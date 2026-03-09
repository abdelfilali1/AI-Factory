import { NextRequest, NextResponse } from 'next/server';
import { synthesizeFeedback } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { feedback } = await req.json();

    if (!feedback || !Array.isArray(feedback)) {
      return NextResponse.json({ error: 'Missing or invalid feedback array' }, { status: 400 });
    }

    const startTime = Date.now();
    const report = await synthesizeFeedback(feedback);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      report,
      audit: {
        agentName: 'Feedback Synthesizer',
        action: 'SYNTHESIZE_FEEDBACK',
        inputSummary: `${feedback.length} feedback items. Sentiments: ${feedback.map((f: { sentiment: string }) => f.sentiment).join(', ')}`,
        outputSummary: `Learning report generated. ${report.keyFindings?.length || 0} findings, ${report.improvements?.length || 0} improvements, ${report.experiments?.length || 0} experiments.`,
        latencyMs,
      },
    });
  } catch (error) {
    console.error('Feedback synthesis error:', error);
    return NextResponse.json(
      { error: 'Synthesis failed', details: String(error) },
      { status: 500 }
    );
  }
}
