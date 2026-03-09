import OpenAI from 'openai';
import type {
  Document,
  PainPoint,
  Cluster,
  Idea,
  Scorecard,
  PRD,
  Project,
  AIReview,
  GTMAsset,
  FeedbackItem,
  LearningReport,
  RubricWeights,
} from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runMarketScan(
  sources: string[],
  keywords: string[]
): Promise<Document[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a market intelligence agent specialized in discovering pain points and opportunities in online communities and publications. Your job is to simulate scanning multiple sources for signals relevant to given keywords and return structured document data representing what you found.

Return a JSON object with a "documents" array. Each document should be realistic and detailed, representing content that would actually be found on these sources discussing the given keywords.`,
      },
      {
        role: 'user',
        content: `Scan these sources: ${sources.join(', ')}
Keywords to focus on: ${keywords.join(', ')}

Generate 3-5 realistic document objects representing pain-point-rich content found across these sources. Each document should have:
- id (generate unique string)
- sourceId (use "src-scan-1")
- sourceName (which source it's from)
- title (realistic post/article title)
- content (300-500 word realistic content with real pain signals)
- url (realistic URL)
- publishedAt (recent ISO date)
- tags (5-8 relevant tags)
- segment ("B2B" | "B2C" | "both")

Focus on finding genuine business pain points and unmet needs. Make the content rich with evidence and specific details.`,
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content || '{"documents":[]}');
  return data.documents || [];
}

export async function extractPainPoints(document: Document): Promise<PainPoint[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a pain point extraction specialist. You read market research content and extract structured, actionable pain points that represent genuine unmet needs. You are rigorous about evidence — every pain point must be grounded in what the source actually says.

Return a JSON object with a "painPoints" array. Be precise and use direct quotes from the content as evidence.`,
      },
      {
        role: 'user',
        content: `Extract all pain points from this document:

Title: ${document.title}
Content: ${document.content}
Source: ${document.sourceName}
Segment: ${document.segment}

For each pain point extract:
- id (generate unique string like "pp-extracted-1")
- documentId: "${document.id}"
- role (specific job title/role experiencing this pain)
- statement (clear, specific pain statement — what they cannot do or what takes too long)
- context (when/why this pain occurs)
- workaround (what they currently do instead)
- evidenceQuote (direct quote from the content)
- severity (1-5, based on frequency, cost, urgency of pain)
- segment ("B2B" | "B2C" | "both")

Extract 2-4 distinct pain points. Be specific and action-oriented.`,
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content || '{"painPoints":[]}');
  return data.painPoints || [];
}

export async function generateIdeas(
  cluster: Cluster,
  painPoints: PainPoint[]
): Promise<Idea[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a startup ideation expert who specializes in generating viable, differentiated product and service ideas based on validated market pain points. You think deeply about positioning, differentiation, and go-to-market strategy. You generate ideas that are specific, actionable, and grounded in the evidence provided.

Return a JSON object with an "ideas" array.`,
      },
      {
        role: 'user',
        content: `Generate 3-4 startup ideas for this opportunity cluster:

Cluster: ${cluster.name}
Theme: ${cluster.theme}
Frequency: ${cluster.frequency}/100
Urgency: ${cluster.urgency}/100
Trend: ${cluster.trend}

Pain Points:
${painPoints.map((pp) => `- [${pp.role}] ${pp.statement} (severity: ${pp.severity}/5)`).join('\n')}

For each idea generate:
- id (generate unique string like "idea-gen-1")
- clusterId: "${cluster.id}"
- clusterName: "${cluster.name}"
- type ("saas" | "service" | "automation" | "hybrid")
- title (compelling product name + one-liner)
- description (200-300 words: what it is, who it's for, core workflow)
- mvpScope (specific MVP feature set, 100-150 words)
- positioning (one sentence brand position)
- differentiation (what makes it genuinely different from alternatives)
- status: "draft"
- createdAt: "${new Date().toISOString()}"

Generate ideas with different approaches (at least one pure SaaS, one automation, one service or hybrid). Each should be genuinely differentiated.`,
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content || '{"ideas":[]}');
  return data.ideas || [];
}

export async function scoreIdea(
  idea: Idea,
  cluster: Cluster,
  weights: RubricWeights
): Promise<Scorecard> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an expert startup analyst and idea evaluator. You score startup ideas against a structured rubric with weighted criteria. You provide rigorous, evidence-based scoring with specific rationale. You identify real risks and flag them clearly.

Return a JSON object with the scorecard data.`,
      },
      {
        role: 'user',
        content: `Score this startup idea against the rubric:

IDEA:
Title: ${idea.title}
Type: ${idea.type}
Description: ${idea.description}
MVP Scope: ${idea.mvpScope}
Positioning: ${idea.positioning}
Differentiation: ${idea.differentiation}

CONTEXT:
Cluster: ${cluster.name}
Frequency: ${cluster.frequency}/100
Urgency: ${cluster.urgency}/100
Trend: ${cluster.trend}

RUBRIC WEIGHTS (max points per category):
- marketSize: ${weights.marketSize} points max
- feasibility: ${weights.feasibility} points max
- timeToValue: ${weights.timeToValue} points max
- riskLevel: ${weights.riskLevel} points max (higher = lower risk)
- strategicFit: ${weights.strategicFit} points max
- differentiation: ${weights.differentiation} points max

Total max: 100 points

Return:
{
  "id": "sc-generated-1",
  "ideaId": "${idea.id}",
  "scores": {
    "marketSize": <number 0-${weights.marketSize}>,
    "feasibility": <number 0-${weights.feasibility}>,
    "timeToValue": <number 0-${weights.timeToValue}>,
    "riskLevel": <number 0-${weights.riskLevel}>,
    "strategicFit": <number 0-${weights.strategicFit}>,
    "differentiation": <number 0-${weights.differentiation}>
  },
  "totalScore": <sum of all scores>,
  "rationale": "<200-word rationale explaining key scoring decisions>",
  "riskFlags": ["<specific risk 1>", "<specific risk 2>", ...],
  "rubricVersion": "1.0",
  "createdAt": "${new Date().toISOString()}"
}`,
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content || '{}');
  return data as Scorecard;
}

export async function generatePRD(idea: Idea, scorecard: Scorecard): Promise<PRD> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a senior product manager and startup strategist. You write comprehensive, actionable PRDs (Product Requirements Documents) that guide development teams from validated ideas to buildable products. Your PRDs are specific, detailed, and grounded in market evidence.

Return a JSON object with the PRD structure.`,
      },
      {
        role: 'user',
        content: `Generate a complete PRD for this validated startup idea:

IDEA:
Title: ${idea.title}
Type: ${idea.type}
Description: ${idea.description}
MVP Scope: ${idea.mvpScope}
Positioning: ${idea.positioning}
Differentiation: ${idea.differentiation}

SCORECARD:
Total Score: ${scorecard.totalScore}/100
Rationale: ${scorecard.rationale}
Risk Flags: ${scorecard.riskFlags.join(', ')}

Return this JSON structure:
{
  "problem": "<specific, quantified problem statement, 150-200 words>",
  "icp": "<detailed ICP — demographics, job, tools, pain frequency, willingness to pay, 150 words>",
  "solution": "<clear solution description connecting to problem, 200 words>",
  "mvpScope": "<specific MVP feature list, 150 words>",
  "differentiation": "<competitive differentiation with named alternatives, 100 words>",
  "pricingHypothesis": "<pricing tiers with rationale and ROI calculations, 150 words>",
  "gtmPlan": "<phased GTM plan phases 1-4, 200 words>",
  "metrics": ["<metric 1>", "<metric 2>", ...], (6-8 specific, measurable metrics)
  "risks": ["<risk 1>", "<risk 2>", ...], (4-6 specific risks)
  "userStories": [
    {
      "id": "us-gen-1",
      "role": "<user role>",
      "want": "<what they want to do>",
      "so": "<business reason>",
      "acceptanceCriteria": ["<criterion 1>", ...],
      "priority": "must" | "should" | "could"
    }
  ] (4-6 user stories with detailed acceptance criteria)
}`,
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content || '{}');
  return data as PRD;
}

export async function reviewStep(
  stepName: string,
  input: unknown,
  output: unknown
): Promise<AIReview> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an independent AI quality reviewer in a startup idea pipeline. Your role is to critically evaluate the output of each pipeline step and provide an honest, actionable review. You are rigorous, specific, and constructive. You score quality 0-100 and make clear recommendations.

Pipeline steps you review: market-scan, pain-extraction, cluster-analysis, idea-generation, idea-scoring, prd-generation, gtm-generation, feedback-synthesis.

Return a JSON object with the review.`,
      },
      {
        role: 'user',
        content: `Review this pipeline step output:

STEP: ${stepName}

INPUT:
${JSON.stringify(input, null, 2).slice(0, 2000)}

OUTPUT:
${JSON.stringify(output, null, 2).slice(0, 2000)}

Evaluate:
1. Quality and accuracy of the output given the input
2. Completeness — are all expected fields present and detailed?
3. Consistency — does the output logically follow from the input?
4. Actionability — can a team act on this output?
5. Risk of errors or hallucinations

Return:
{
  "score": <0-100 quality score>,
  "summary": "<2-3 sentence honest assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...], (2-4 specific strengths)
  "weaknesses": ["<weakness 1>", ...], (1-3 specific weaknesses or concerns)
  "recommendation": "proceed" | "revise" | "reject"
}`,
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content || '{}');
  return data as AIReview;
}

export async function generateGTMAssets(project: Project): Promise<GTMAsset[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a B2B marketing strategist and copywriter who creates high-converting go-to-market materials. You write compelling landing pages, campaign plans, and outreach sequences that are specific to the product and target audience. You don't use generic templates — every asset is tailored.

Return a JSON object with a "assets" array.`,
      },
      {
        role: 'user',
        content: `Generate GTM assets for this approved project:

Project: ${project.ideaTitle}
Problem: ${project.prd.problem}
ICP: ${project.prd.icp}
Solution: ${project.prd.solution}
Differentiation: ${project.prd.differentiation}
Pricing: ${project.prd.pricingHypothesis}

Generate 3 GTM assets:
1. Landing page hero + value prop copy (type: "landing-page")
2. Email/LinkedIn outreach sequence 5 touches (type: "outreach")
3. Content marketing campaign plan (type: "campaign")

For each asset:
- id: "gtm-gen-<n>"
- projectId: "${project.id}"
- type: <as specified above>
- title: <descriptive title>
- content: <full asset content, well-formatted with headers, 400-600 words>
- status: "draft"
- createdAt: "${new Date().toISOString()}"`,
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content || '{"assets":[]}');
  return data.assets || [];
}

export async function synthesizeFeedback(
  feedback: FeedbackItem[]
): Promise<LearningReport> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a product learning and improvement analyst. You synthesize user feedback, support tickets, and user research into actionable learning reports that drive product improvement. You identify patterns, prioritize issues, and propose experiments.

Return a JSON object with the learning report.`,
      },
      {
        role: 'user',
        content: `Synthesize this feedback into a weekly learning report:

FEEDBACK ITEMS:
${feedback
  .map(
    (f) =>
      `[${f.sentiment.toUpperCase()}] Source: ${f.source}
Content: ${f.content}
Tags: ${f.tags.join(', ')}`
  )
  .join('\n\n')}

Return:
{
  "id": "lr-generated-1",
  "weekOf": "${new Date().toISOString().split('T')[0]}",
  "keyFindings": ["<finding 1>", ...], (4-6 specific, evidence-backed findings)
  "improvements": ["<improvement 1>", ...], (3-5 specific actionable improvements with priority)
  "experiments": ["<experiment 1>", ...], (2-4 A/B tests or experiments to run)
  "roadmapItems": ["<roadmap item 1>", ...], (4-6 Q-tagged roadmap items)
  "createdAt": "${new Date().toISOString()}"
}`,
      },
    ],
  });

  const data = JSON.parse(response.choices[0].message.content || '{}');
  return data as LearningReport;
}
