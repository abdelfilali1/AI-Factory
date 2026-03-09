import { NextRequest, NextResponse } from 'next/server';
import { runMarketScan } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { sources, keywords } = await req.json();

    if (!sources || !keywords) {
      return NextResponse.json({ error: 'Missing sources or keywords' }, { status: 400 });
    }

    const startTime = Date.now();
    const documents = await runMarketScan(sources, keywords);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      documents,
      audit: {
        agentName: 'Market Scanner',
        action: 'SCAN_SOURCES',
        inputSummary: `Sources: ${sources.join(', ')}. Keywords: ${keywords.join(', ')}`,
        outputSummary: `Found ${documents.length} documents`,
        latencyMs,
      },
    });
  } catch (error) {
    console.error('Market scan error:', error);
    return NextResponse.json(
      { error: 'Market scan failed', details: String(error) },
      { status: 500 }
    );
  }
}
