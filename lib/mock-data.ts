import type {
  Source,
  Document,
  PainPoint,
  Cluster,
  Idea,
  Scorecard,
  Project,
  Approval,
  AuditEntry,
  GTMAsset,
  FeedbackItem,
  LearningReport,
  RubricWeights,
} from './types';

export const sources: Source[] = [
  {
    id: 'src-1',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    type: 'rss',
    enabled: true,
    compliant: true,
    addedAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'src-2',
    name: 'Reddit r/entrepreneur',
    url: 'https://www.reddit.com/r/entrepreneur/.rss',
    type: 'rss',
    enabled: true,
    compliant: true,
    addedAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'src-3',
    name: 'Product Hunt',
    url: 'https://www.producthunt.com',
    type: 'web',
    enabled: true,
    compliant: true,
    addedAt: '2025-01-11T09:00:00Z',
  },
  {
    id: 'src-4',
    name: 'G2 Reviews',
    url: 'https://www.g2.com',
    type: 'web',
    enabled: false,
    compliant: true,
    addedAt: '2025-01-12T10:00:00Z',
  },
  {
    id: 'src-5',
    name: 'Indie Hackers',
    url: 'https://www.indiehackers.com/feed.rss',
    type: 'rss',
    enabled: true,
    compliant: true,
    addedAt: '2025-01-13T11:00:00Z',
  },
  {
    id: 'src-6',
    name: 'Manual Upload',
    url: '',
    type: 'manual',
    enabled: true,
    compliant: true,
    addedAt: '2025-01-14T12:00:00Z',
  },
];

export const documents: Document[] = [
  {
    id: 'doc-1',
    sourceId: 'src-1',
    sourceName: 'Hacker News',
    title: 'Agencies struggle with client reporting automation — my 6 months of pain',
    content:
      'I run a 12-person digital marketing agency and our biggest time sink is creating weekly/monthly client reports. We pull data from Google Analytics, Meta Ads, Salesforce, and about 7 other tools, manually paste it into Google Slides, write the narrative, and send. This takes us 3-4 hours per client per month. We have 40 clients. Do the math. I\'ve tried Databox, AgencyAnalytics, and DashThis — none of them nail the narrative layer. The data aggregation is fine, but telling a coherent story to the client that connects the numbers to their business goals? That\'s still 100% manual.',
    url: 'https://news.ycombinator.com/item?id=12345',
    publishedAt: '2025-02-01T14:00:00Z',
    tags: ['reporting', 'automation', 'agency', 'B2B'],
    segment: 'B2B',
  },
  {
    id: 'doc-2',
    sourceId: 'src-2',
    sourceName: 'Reddit r/entrepreneur',
    title: 'Solopreneurs overwhelmed by tax prep complexity — annual nightmare thread',
    content:
      'Every year this thread appears and every year 500+ solopreneurs share the same story: spending 20-40 hours on taxes, paying $2k-$5k for accountants who don\'t understand online business income, confusion around quarterly estimates, S-corp elections, home office deductions, and international income. The tools that exist (TurboTax self-employed, QuickBooks) are designed for traditional businesses and don\'t handle subscription revenue, affiliate income, digital product sales, and course revenue gracefully. The mental overhead is killing productivity in Q1.',
    url: 'https://reddit.com/r/entrepreneur/comments/tax2025',
    publishedAt: '2025-01-28T10:00:00Z',
    tags: ['taxes', 'solopreneur', 'finance', 'B2C'],
    segment: 'B2C',
  },
  {
    id: 'doc-3',
    sourceId: 'src-5',
    sourceName: 'Indie Hackers',
    title: 'How I spent 80% of my time repurposing content instead of creating it',
    content:
      'I\'ve been building in public for 18 months. Here\'s the dirty secret: I spend more time reformatting content than creating it. One podcast episode becomes a Twitter thread, LinkedIn post, newsletter section, YouTube short script, and blog post. Each requires different tone, length, format. I\'ve tried Repurpose.io and Taplio — they\'re clunky and the AI output requires heavy editing. What I really want is a tool that understands my voice and brand style, not generic AI slop. The market for "creator operations" is underserved.',
    url: 'https://indiehackers.com/post/content-repurposing-pain',
    publishedAt: '2025-02-05T09:00:00Z',
    tags: ['content', 'repurposing', 'creator', 'B2C'],
    segment: 'both',
  },
  {
    id: 'doc-4',
    sourceId: 'src-3',
    sourceName: 'Product Hunt',
    title: 'Meeting overload: why knowledge workers lose 40% of their week to meetings',
    content:
      'Product review discussion: Loom\'s new AI feature got 800 upvotes but the comments reveal the real pain. "I don\'t need a summary, I need action items automatically created in my project management tool." "Otter.ai gives me transcripts but nothing connects to my CRM." The gap between meeting intelligence and workflow integration is massive. People want meetings to auto-generate follow-ups, update Notion/Linear tickets, send personalized follow-up emails, and flag commitments. Existing tools stop at transcription.',
    url: 'https://producthunt.com/discussions/meeting-ai',
    publishedAt: '2025-01-25T15:00:00Z',
    tags: ['meetings', 'productivity', 'automation', 'B2B'],
    segment: 'B2B',
  },
  {
    id: 'doc-5',
    sourceId: 'src-4',
    sourceName: 'G2 Reviews',
    title: 'AgencyAnalytics reviews reveal critical narrative gap in reporting tools',
    content:
      'Analysis of 340 recent G2 reviews for AgencyAnalytics reveals consistent pattern: users rate data aggregation 4.2/5 but narrative generation 2.1/5. Top negative keywords: "still have to write it myself", "templates too generic", "no brand voice", "clients don\'t understand raw charts". Agency owners want reports that explain what changed, why it matters, and what the agency plans to do about it — in the client\'s language, not industry jargon. This narrative intelligence gap appears across all reporting tools in the category.',
    url: 'https://g2.com/products/agencyanalytics/reviews',
    publishedAt: '2025-02-03T11:00:00Z',
    tags: ['reporting', 'narrative', 'agency', 'B2B'],
    segment: 'B2B',
  },
  {
    id: 'doc-6',
    sourceId: 'src-2',
    sourceName: 'Reddit r/entrepreneur',
    title: 'The B2B sales process for agencies is broken — manual CRM hell',
    content:
      'Running a design agency, our sales process is embarrassing. Leads come from LinkedIn, referrals, cold email. We track them in a mix of Notion, HubSpot free tier, and sticky notes. The problem isn\'t a CRM — it\'s that every prospect interaction requires manual data entry. LinkedIn conversation → manual CRM update. Email thread → manual summary. Proposal sent → manual follow-up reminder. A salesperson spends 60-90 minutes per day just on admin. We tried Salesforce, too complex. HubSpot, too expensive at scale. Pipedrive, missing AI. Nobody has cracked AI-native CRM for service businesses.',
    url: 'https://reddit.com/r/entrepreneur/comments/agencycrm',
    publishedAt: '2025-01-30T16:00:00Z',
    tags: ['CRM', 'sales', 'agency', 'automation'],
    segment: 'B2B',
  },
  {
    id: 'doc-7',
    sourceId: 'src-1',
    sourceName: 'Hacker News',
    title: 'Ask HN: How do you handle financial forecasting as a bootstrapped founder?',
    content:
      'Thread with 280 comments. Common themes: Excel is still the tool most use but it breaks constantly. SaaS forecasting tools assume VC-backed growth curves. Bootstrappers need different metrics: runway, break-even, MRR by cohort, cash flow with realistic seasonal adjustments. Several founders mention spending entire weekends building financial models only to have them break when they update revenue assumptions. "I need a tool that thinks like a bootstrapper, not a startup CFO." ProfitWell and Baremetrics are loved for metrics but not for forward-looking modeling.',
    url: 'https://news.ycombinator.com/item?id=67890',
    publishedAt: '2025-02-07T08:00:00Z',
    tags: ['finance', 'forecasting', 'bootstrapped', 'founder'],
    segment: 'B2C',
  },
  {
    id: 'doc-8',
    sourceId: 'src-6',
    sourceName: 'Manual Upload',
    title: 'Internal research: Customer interviews with 25 content creators, Jan 2025',
    content:
      'Internal interview synthesis from 25 content creators across YouTube, podcasting, and newsletters. Key findings: 1) Average creator spends 4.2 hours/week repurposing each piece of content. 2) All use at least 3-4 platforms requiring different format. 3) AI tools help but "the output doesn\'t sound like me." 4) Brand consistency across platforms is major concern. 5) Biggest desire: a tool that learns their voice from existing content and auto-repurposes new content maintaining that voice. Willingness to pay: $49-$149/month for a tool that saves 3+ hours/week.',
    url: '',
    publishedAt: '2025-01-15T09:00:00Z',
    tags: ['content', 'creator', 'voice', 'repurposing'],
    segment: 'both',
  },
];

export const painPoints: PainPoint[] = [
  {
    id: 'pp-1',
    documentId: 'doc-1',
    role: 'Agency Owner',
    statement: 'Generating narrative client reports takes 3-4 hours per client per month and cannot be automated with current tools',
    context: 'Managing 40 clients simultaneously; data lives in 7+ disconnected tools; report involves both data synthesis and strategic narrative',
    workaround: 'Manually copy-pasting data into Google Slides, then writing narrative by hand. Some agencies hire a dedicated "reporting VA" at $2k/month.',
    evidenceQuote: 'The data aggregation is fine, but telling a coherent story to the client that connects the numbers to their business goals? That\'s still 100% manual.',
    severity: 5,
    segment: 'B2B',
    clusterId: 'cl-1',
    createdAt: '2025-02-01T15:00:00Z',
  },
  {
    id: 'pp-2',
    documentId: 'doc-5',
    role: 'Agency Account Manager',
    statement: 'All reporting tools lack the ability to generate branded narrative explanations that translate data into client-relevant business language',
    context: 'Using AgencyAnalytics for data aggregation; clients increasingly demand insights not just numbers; brand voice consistency required',
    workaround: 'Copy AI/ChatGPT to write narrative manually; still requires 1-2 hours of editing per report to match brand voice.',
    evidenceQuote: 'Users rate data aggregation 4.2/5 but narrative generation 2.1/5. Top negative: "still have to write it myself", "templates too generic", "no brand voice"',
    severity: 4,
    segment: 'B2B',
    clusterId: 'cl-1',
    createdAt: '2025-02-03T12:00:00Z',
  },
  {
    id: 'pp-3',
    documentId: 'doc-1',
    role: 'Agency Operations Manager',
    statement: 'No tool integrates all 7+ agency data sources AND generates contextual narratives, forcing costly manual processes',
    context: 'Google Analytics, Meta Ads, Salesforce, LinkedIn Ads, Google Ads, SEMrush, client-specific tools all separate',
    workaround: 'Zapier + Google Sheets + manual aggregation. Some agencies use Supermetrics ($300/month) for data only.',
    evidenceQuote: 'We pull data from Google Analytics, Meta Ads, Salesforce, and about 7 other tools, manually paste it into Google Slides, write the narrative.',
    severity: 4,
    segment: 'B2B',
    clusterId: 'cl-1',
    createdAt: '2025-02-01T16:00:00Z',
  },
  {
    id: 'pp-4',
    documentId: 'doc-2',
    role: 'Solopreneur / Freelancer',
    statement: 'Tax preparation for online businesses with mixed income types (subscriptions, affiliates, digital products) takes 20-40 hours annually',
    context: 'Multiple income streams across different platforms; international sales; home office; complex deduction landscape',
    workaround: 'Paying $2k-$5k for accountants, spending weekends manually categorizing transactions, using spreadsheets to track income by type.',
    evidenceQuote: 'Spending 20-40 hours on taxes, paying $2k-$5k for accountants who don\'t understand online business income, confusion around quarterly estimates.',
    severity: 4,
    segment: 'B2C',
    clusterId: 'cl-2',
    createdAt: '2025-01-28T11:00:00Z',
  },
  {
    id: 'pp-5',
    documentId: 'doc-7',
    role: 'Bootstrapped Founder',
    statement: 'Financial forecasting tools assume VC-backed growth models, leaving bootstrappers without accurate runway and break-even modeling',
    context: 'Bootstrapped SaaS or service business; need to model conservative and realistic scenarios; cash flow is critical',
    workaround: 'Custom Excel models that break when updated; spending entire weekends on financial modeling instead of product building.',
    evidenceQuote: 'I need a tool that thinks like a bootstrapper, not a startup CFO. ProfitWell and Baremetrics are loved for metrics but not for forward-looking modeling.',
    severity: 3,
    segment: 'B2C',
    clusterId: 'cl-2',
    createdAt: '2025-02-07T09:00:00Z',
  },
  {
    id: 'pp-6',
    documentId: 'doc-3',
    role: 'Content Creator / Solopreneur',
    statement: 'Repurposing a single piece of content for 4+ platforms takes 4+ hours due to format and tone differences, and AI tools don\'t maintain creator voice',
    context: 'Creating long-form content (podcast/YouTube) requiring adaptation to Twitter, LinkedIn, newsletter, blog, Shorts — each with different optimal format',
    workaround: 'Manual reformatting for each platform; light use of Repurpose.io and Taplio but heavy editing required; some hire VAs at $15-25/hr.',
    evidenceQuote: 'I spend more time reformatting content than creating it... What I really want is a tool that understands my voice and brand style, not generic AI slop.',
    severity: 4,
    segment: 'both',
    clusterId: 'cl-3',
    createdAt: '2025-02-05T10:00:00Z',
  },
  {
    id: 'pp-7',
    documentId: 'doc-8',
    role: 'Content Creator',
    statement: 'No current AI content tool maintains consistent brand voice across platforms after learning from creator\'s existing content library',
    context: 'Average creator spends 4.2 hours/week repurposing; consistency across platforms critical for brand; existing tools produce generic output',
    workaround: 'Creating detailed style guides and pasting them into ChatGPT prompts each time; still requires significant editing.',
    evidenceQuote: 'AI tools help but "the output doesn\'t sound like me." Brand consistency across platforms is major concern.',
    severity: 5,
    segment: 'both',
    clusterId: 'cl-3',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'pp-8',
    documentId: 'doc-4',
    role: 'Knowledge Worker / Team Lead',
    statement: 'Meeting transcription tools stop at summaries — no automatic workflow integration to create tasks, update CRM, or send follow-ups',
    context: 'Using Otter.ai or Fireflies for transcription but manually transferring action items to Linear/Notion/CRM after every meeting',
    workaround: 'Copy-pasting from transcripts into project tools; spending 15-30 minutes post-meeting on admin tasks; some use Zapier with mixed results.',
    evidenceQuote: 'I don\'t need a summary, I need action items automatically created in my project management tool. Otter.ai gives me transcripts but nothing connects to my CRM.',
    severity: 4,
    segment: 'B2B',
    clusterId: 'cl-4',
    createdAt: '2025-01-25T16:00:00Z',
  },
  {
    id: 'pp-9',
    documentId: 'doc-4',
    role: 'Sales Manager',
    statement: 'Post-meeting follow-up personalization requires 20-30 minutes per prospect as no tool auto-generates context-aware follow-ups from meeting content',
    context: 'Sales meetings with prospects; need to reference specific pain points discussed, commitments made, next steps agreed upon',
    workaround: 'Reviewing meeting transcript manually, writing personalized follow-up from scratch; some use templates that feel impersonal.',
    evidenceQuote: 'People want meetings to auto-generate follow-ups, update Notion/Linear tickets, send personalized follow-up emails, and flag commitments.',
    severity: 3,
    segment: 'B2B',
    clusterId: 'cl-4',
    createdAt: '2025-01-25T17:00:00Z',
  },
  {
    id: 'pp-10',
    documentId: 'doc-6',
    role: 'Agency Sales Director',
    statement: 'Agency CRM management requires 60-90 minutes of daily manual data entry as no tool intelligently syncs LinkedIn, email, and proposal data',
    context: 'Leads from LinkedIn DMs, email, referrals; need to track interactions without copy-pasting; proposal and contract status tracking',
    workaround: 'Splitting time between HubSpot free tier and Notion; manually typing summaries of conversations; using BCC to Salesforce which loses context.',
    evidenceQuote: 'Every prospect interaction requires manual data entry. LinkedIn conversation → manual CRM update. Email thread → manual summary.',
    severity: 4,
    segment: 'B2B',
    createdAt: '2025-01-30T17:00:00Z',
  },
];

export const clusters: Cluster[] = [
  {
    id: 'cl-1',
    name: 'Client Reporting Automation',
    theme: 'Agencies and client-facing teams spend excessive time on manual reporting that requires both data aggregation and narrative intelligence',
    painPointIds: ['pp-1', 'pp-2', 'pp-3'],
    frequency: 87,
    urgency: 92,
    trend: 'rising',
    status: 'validated',
    createdAt: '2025-02-04T10:00:00Z',
  },
  {
    id: 'cl-2',
    name: 'Solo Business Finance Management',
    theme: 'Solopreneurs and bootstrapped founders lack tools designed for their specific financial complexity: mixed income, international, bootstrapped modeling',
    painPointIds: ['pp-4', 'pp-5'],
    frequency: 72,
    urgency: 68,
    trend: 'stable',
    status: 'validated',
    createdAt: '2025-02-08T10:00:00Z',
  },
  {
    id: 'cl-3',
    name: 'Content Repurposing at Scale',
    theme: 'Content creators spend majority of time reformatting content across platforms rather than creating, and AI tools fail to preserve creator voice',
    painPointIds: ['pp-6', 'pp-7'],
    frequency: 79,
    urgency: 74,
    trend: 'rising',
    status: 'validated',
    createdAt: '2025-02-06T10:00:00Z',
  },
  {
    id: 'cl-4',
    name: 'Meeting Intelligence & Follow-through',
    theme: 'Meeting tools capture conversation but don\'t close the loop with automated workflow actions, follow-ups, and CRM updates',
    painPointIds: ['pp-8', 'pp-9'],
    frequency: 65,
    urgency: 71,
    trend: 'stable',
    status: 'pending',
    createdAt: '2025-01-26T10:00:00Z',
  },
];

export const ideas: Idea[] = [
  {
    id: 'idea-1',
    clusterId: 'cl-1',
    clusterName: 'Client Reporting Automation',
    type: 'saas',
    title: 'NarrateIQ — AI-Powered Client Report Narrator',
    description:
      'A SaaS platform that connects to all major agency data sources (Google Analytics, Meta Ads, Salesforce, LinkedIn Ads, SEMrush) and uses AI to generate complete, branded client reports with narrative intelligence. The AI learns each agency\'s voice, each client\'s goals, and generates monthly reports that explain what happened, why it matters, and what actions will be taken. One-click generation, client-branded PDF output.',
    mvpScope:
      'Google Analytics + Meta Ads integration, narrative generation with GPT-4o, custom brand voice training (5 sample reports), PDF export, white-label client portal, agency dashboard for 10 client slots.',
    positioning: 'The first reporting tool that writes like your best account manager',
    differentiation: 'Narrative intelligence layer + brand voice learning + seamless multi-source aggregation in one workflow. Competitors only do data, not story.',
    status: 'shortlisted',
    createdAt: '2025-02-05T10:00:00Z',
  },
  {
    id: 'idea-2',
    clusterId: 'cl-1',
    clusterName: 'Client Reporting Automation',
    type: 'automation',
    title: 'ReportFlow — Automated Report Assembly Pipeline',
    description:
      'A workflow automation tool specifically for agencies that automatically pulls data from all sources weekly, assembles it into agency-defined templates, and triggers human review before sending. Less AI narrative, more reliable automation with human oversight.',
    mvpScope:
      'Webhook integrations with top 5 data sources, template builder, scheduled data pulls, human-in-the-loop approval before send, email delivery, Slack notifications.',
    positioning: 'Eliminate the data gathering burden; focus your team on the insights',
    differentiation: 'Human-in-the-loop design makes it trustworthy for client-facing output. Not full AI, reliable workflow.',
    status: 'draft',
    createdAt: '2025-02-05T11:00:00Z',
  },
  {
    id: 'idea-3',
    clusterId: 'cl-2',
    clusterName: 'Solo Business Finance Management',
    type: 'saas',
    title: 'SoloBooks — Finance Intelligence for Online Entrepreneurs',
    description:
      'An AI-powered financial management tool built specifically for solopreneurs, consultants, and online business owners. Handles complex income types (subscriptions, affiliates, courses, digital products, international), auto-categorizes transactions with online business context, generates quarterly tax estimates, and provides bootstrapper-specific financial forecasting (runway, break-even, scenario planning).',
    mvpScope:
      'Bank/Stripe/PayPal sync, smart categorization for online income types, quarterly tax estimate calculator, basic cash flow forecasting, expense tracking with home office logic, Stripe MRR dashboard.',
    positioning: 'The financial brain built for how you actually make money online',
    differentiation: 'Deep domain knowledge of online business income types vs. generic tools. Tax logic specifically for solopreneurs. Bootstrapper forecasting, not VC growth models.',
    status: 'shortlisted',
    createdAt: '2025-02-09T10:00:00Z',
  },
  {
    id: 'idea-4',
    clusterId: 'cl-3',
    clusterName: 'Content Repurposing at Scale',
    type: 'saas',
    title: 'VoiceClone Studio — Voice-First Content Repurposing',
    description:
      'An AI content repurposing platform that first trains on a creator\'s existing content library to build a unique voice model, then auto-generates platform-optimized versions of new content that authentically sound like the creator. Supports podcasts, YouTube, newsletters, Twitter/X, LinkedIn, blog posts, and YouTube Shorts scripts.',
    mvpScope:
      'Voice model training on 10+ existing content pieces, YouTube/podcast transcript input, auto-generation for Twitter thread, LinkedIn post, newsletter section, blog post. Platform tone guidelines built-in.',
    positioning: 'Finally, AI content that actually sounds like you',
    differentiation: 'Creator-specific voice model vs. generic AI. Learns YOUR style from YOUR content. Not just prompting ChatGPT.',
    status: 'shortlisted',
    createdAt: '2025-02-07T10:00:00Z',
  },
  {
    id: 'idea-5',
    clusterId: 'cl-4',
    clusterName: 'Meeting Intelligence & Follow-through',
    type: 'automation',
    title: 'MeetLoop — Meeting-to-Workflow Automation',
    description:
      'A meeting intelligence tool that doesn\'t stop at transcription. MeetLoop automatically extracts action items, decisions, and commitments from meeting transcripts, then routes them to the right tools: Linear tasks, Notion pages, HubSpot deals, personalized follow-up emails. Integrates with Zoom, Google Meet, and Microsoft Teams.',
    mvpScope:
      'Zoom/Google Meet integration, transcript processing, action item extraction, Linear + Notion integration, follow-up email draft generation, commitment tracking dashboard.',
    positioning: 'From meeting to done — automatically',
    differentiation: 'Action completion vs. transcription. Only tool that closes the loop between meeting and workflow. Native integrations not Zapier.',
    status: 'draft',
    createdAt: '2025-01-27T10:00:00Z',
  },
  {
    id: 'idea-6',
    clusterId: 'cl-2',
    clusterName: 'Solo Business Finance Management',
    type: 'service',
    title: 'FounderCFO — AI-Augmented CFO Service for Bootstrappers',
    description:
      'A hybrid service: AI-powered financial analysis + human CFO advisor on retainer. The AI handles continuous monitoring, anomaly detection, monthly reports, and scenario modeling. A human CFO reviews quarterly, provides strategic advice, and handles edge cases. Targets $50k-$500k ARR bootstrapped businesses who can\'t afford a full-time CFO.',
    mvpScope:
      'AI financial dashboard, monthly AI-generated financial summary, quarterly 90-min CFO video call, tax estimate alerts, runway warnings, 2-year scenario modeling.',
    positioning: 'CFO-level intelligence at VA-level pricing',
    differentiation: 'Human + AI hybrid fills trust gap. Service model removes onboarding friction. Strategic advice AI can\'t fully replace.',
    status: 'draft',
    createdAt: '2025-02-09T11:00:00Z',
  },
];

export const scorecards: Scorecard[] = [
  {
    id: 'sc-1',
    ideaId: 'idea-1',
    scores: {
      marketSize: 18,
      feasibility: 16,
      timeToValue: 13,
      riskLevel: 12,
      strategicFit: 14,
      differentiation: 13,
    },
    totalScore: 86,
    rationale:
      'NarrateIQ addresses a massive and growing pain in the agency market. The narrative intelligence layer is genuinely novel. High feasibility given mature LLM capabilities. Risk is in sales cycles for agencies and data integration complexity. Strong strategic fit with AI-powered B2B SaaS trend.',
    riskFlags: [
      'Agency sales cycles can be 3-6 months',
      'Data integration maintenance overhead for 7+ APIs',
      'High churn risk if narrative quality disappoints',
    ],
    rubricVersion: '1.0',
    aiReview: {
      score: 88,
      summary: 'Strong market opportunity with clear pain validated across multiple sources. The narrative intelligence differentiation is compelling and defensible. Execution risk is moderate given API dependency.',
      strengths: [
        'Clear and validated pain point with strong evidence',
        'Genuine technology differentiation vs. existing solutions',
        'Strong willingness-to-pay signals from target segment',
        'Growing market with established spending patterns',
      ],
      weaknesses: [
        'High API dependency creates maintenance burden',
        'Brand voice learning requires significant onboarding investment',
        'Competitive risk from AgencyAnalytics adding AI features',
      ],
      recommendation: 'proceed',
    },
    createdAt: '2025-02-06T10:00:00Z',
  },
  {
    id: 'sc-2',
    ideaId: 'idea-2',
    scores: {
      marketSize: 14,
      feasibility: 17,
      timeToValue: 14,
      riskLevel: 13,
      strategicFit: 11,
      differentiation: 9,
    },
    totalScore: 78,
    rationale:
      'ReportFlow is more feasible but less differentiated. The automation-first approach reduces AI risk but also reduces the value proposition. Likely to be commoditized quickly. Better as a feature of NarrateIQ than a standalone product.',
    riskFlags: [
      'Low differentiation creates commoditization risk',
      'Zapier + existing tools can replicate core functionality',
      'Limited moat — easy to copy',
    ],
    rubricVersion: '1.0',
    aiReview: {
      score: 72,
      summary: 'Viable but undifferentiated. The market exists but the solution does not provide sufficient competitive moat. Recommend positioning as part of a broader platform rather than standalone.',
      strengths: [
        'High feasibility and faster time to market',
        'Lower technical risk than full AI approach',
        'Clear workflow automation market exists',
      ],
      weaknesses: [
        'Insufficient differentiation from Zapier workflows',
        'No defensible moat or proprietary technology',
        'Does not solve the narrative intelligence gap users actually want',
      ],
      recommendation: 'revise',
    },
    createdAt: '2025-02-06T11:00:00Z',
  },
  {
    id: 'sc-3',
    ideaId: 'idea-3',
    scores: {
      marketSize: 16,
      feasibility: 15,
      timeToValue: 14,
      riskLevel: 11,
      strategicFit: 13,
      differentiation: 14,
    },
    totalScore: 83,
    rationale:
      'SoloBooks targets a large and underserved segment. The online-business-specific angle is compelling. Tax and finance are high-value categories with strong willingness to pay. Risk is regulatory complexity and trust in financial tools.',
    riskFlags: [
      'Financial tools require high trust and compliance awareness',
      'Tax advice regulatory gray area',
      'Stripe/bank API maintenance significant',
      'High customer support needs for financial edge cases',
    ],
    rubricVersion: '1.0',
    aiReview: {
      score: 81,
      summary: 'Well-positioned for a real gap in the market. The solopreneur segment is large and growing. Financial management is a high-value category with strong retention if done well.',
      strengths: [
        'Large and growing target market (25M+ solopreneurs in US alone)',
        'Clear differentiation from generic financial tools',
        'High willingness to pay in financial category',
        'Strong retention potential if core value delivered',
      ],
      weaknesses: [
        'Regulatory complexity around tax advice',
        'High trust bar to overcome for financial data',
        'Competitive risk from established players (QuickBooks, Wave)',
      ],
      recommendation: 'proceed',
    },
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'sc-4',
    ideaId: 'idea-4',
    scores: {
      marketSize: 17,
      feasibility: 14,
      timeToValue: 12,
      riskLevel: 11,
      strategicFit: 14,
      differentiation: 15,
    },
    totalScore: 83,
    rationale:
      'VoiceClone Studio has strong differentiation with the voice model training. Creator economy is massive and growing. Risk is in voice model quality — it must actually sound like the creator or churn will be high. Time to value is longer due to training data requirements.',
    riskFlags: [
      'Voice quality must be exceptional or product fails',
      'Training data requirement creates onboarding friction',
      'Creator market has low willingness to pay vs. business markets',
      'Taplio, Repurpose.io have distribution and pricing power',
    ],
    rubricVersion: '1.0',
    aiReview: {
      score: 80,
      summary: 'Innovative approach to a validated pain. Creator voice preservation is a genuine differentiation. Main risk is execution quality — voice models must be convincingly authentic.',
      strengths: [
        'Genuine technical innovation with voice model training',
        'Clear and validated pain with strong evidence from interviews',
        'Large creator economy market',
        'Premium positioning enables higher pricing',
      ],
      weaknesses: [
        'Technical complexity of convincing voice modeling',
        'Onboarding friction from training data requirement',
        'Creator market price sensitivity challenges unit economics',
      ],
      recommendation: 'proceed',
    },
    createdAt: '2025-02-08T10:00:00Z',
  },
  {
    id: 'sc-5',
    ideaId: 'idea-5',
    scores: {
      marketSize: 15,
      feasibility: 16,
      timeToValue: 13,
      riskLevel: 12,
      strategicFit: 12,
      differentiation: 12,
    },
    totalScore: 80,
    rationale:
      'MeetLoop addresses a real pain and the workflow integration angle is differentiated. Risk is the crowded meeting intelligence space with well-funded competitors. The integration-first approach is a valid wedge.',
    riskFlags: [
      'Crowded market: Otter.ai, Fireflies, Gong, Chorus all well-funded',
      'Integration maintenance with Zoom/Meet APIs',
      'Enterprise features required for B2B sales cycles',
    ],
    rubricVersion: '1.0',
    aiReview: {
      score: 77,
      summary: 'Solid idea with clear market validation but faces significant competitive pressure. Integration depth is the key differentiator — must execute this exceptionally well.',
      strengths: [
        'Clear differentiation from transcription-only competitors',
        'Strong enterprise willingness to pay',
        'Integration network effects create switching costs',
      ],
      weaknesses: [
        'Highly competitive market with well-funded players',
        'Enterprise sales cycle challenges for early stage',
        'Integration maintenance is ongoing operational burden',
      ],
      recommendation: 'proceed',
    },
    createdAt: '2025-01-28T10:00:00Z',
  },
  {
    id: 'sc-6',
    ideaId: 'idea-6',
    scores: {
      marketSize: 13,
      feasibility: 14,
      timeToValue: 11,
      riskLevel: 10,
      strategicFit: 12,
      differentiation: 11,
    },
    totalScore: 71,
    rationale:
      'FounderCFO has merit but the service component limits scalability. Hybrid model creates operational complexity. Better positioned as premium tier within SoloBooks than standalone.',
    riskFlags: [
      'Human component limits scalability',
      'Finding and managing CFO advisors is operational overhead',
      'Higher price point narrows addressable market',
    ],
    rubricVersion: '1.0',
    aiReview: {
      score: 68,
      summary: 'Interesting hybrid model but scalability concerns are real. Recommend exploring as premium tier within a product rather than standalone service business.',
      strengths: [
        'Human + AI hybrid builds trust in sensitive financial domain',
        'Premium positioning justifies higher price',
        'Clear ICP and strong willingness to pay signals',
      ],
      weaknesses: [
        'Service component caps margin and scale',
        'Advisor quality control is ongoing operational challenge',
        'Narrow addressable market at premium price point',
      ],
      recommendation: 'revise',
    },
    createdAt: '2025-02-10T11:00:00Z',
  },
];

export const projects: Project[] = [
  {
    id: 'proj-1',
    ideaId: 'idea-1',
    ideaTitle: 'NarrateIQ — AI-Powered Client Report Narrator',
    prd: {
      problem:
        'Digital marketing agencies spend 3-4 hours per client per month manually creating reports that combine data from 7+ sources and require narrative intelligence to connect metrics to business goals. At 40 clients, this represents 120-160 hours per month of high-skilled labor on a process that should be automated. Existing tools solve data aggregation but not the narrative layer — the most valuable and differentiating part of agency reporting.',
      icp:
        'Digital marketing agency owner/ops manager running a 5-50 person agency with 10-100 clients. Current tech stack includes Google Analytics, Meta Ads, Google Ads, and at least 2-3 other data sources. Monthly billing $2k-$20k per client. Currently spending 3+ hours per client on reporting. Tech-forward but not developers.',
      solution:
        'NarrateIQ is an AI-powered reporting platform that (1) integrates with all major agency data sources via authenticated connections, (2) learns each agency\'s reporting voice and style from sample reports, (3) generates complete client reports monthly or weekly with narrative that explains what changed, why it matters, and what the agency recommends, and (4) delivers via white-labeled client portal or branded PDF.',
      mvpScope:
        'Google Analytics 4 + Meta Ads Manager integration (covers 80% of agency data needs). Narrative generation using GPT-4o with agency voice training from 5+ sample reports. White-label PDF export with custom logo/colors. Agency dashboard for up to 10 client slots. Basic client portal (read-only). One-click report generation. Email delivery.',
      differentiation:
        'NarrateIQ is the only reporting tool that generates complete narrative reports — not just data visualizations. The AI learns each agency\'s voice and each client\'s goals to write reports that read like they were written by a skilled account manager. Competitors (AgencyAnalytics, DashThis, Databox) provide excellent data aggregation but require agencies to write all narrative manually.',
      pricingHypothesis:
        'Starter: $199/month (up to 10 clients, 2 integrations). Growth: $499/month (up to 40 clients, unlimited integrations, voice training). Agency: $999/month (unlimited clients, white-label, team seats, API access). Annual discount 20%. Agencies currently spend $2k+/month on reporting VAs — NarrateIQ offers 5-10x ROI at Growth tier.',
      gtmPlan:
        'Phase 1: 10 agency beta partners recruited from HN/Reddit/agency communities. Charge $0 for beta, gather intensive feedback. Phase 2: ProductHunt launch + agency founder community outreach. Phase 3: Content marketing targeting agency owners (SEO, LinkedIn, YouTube). Phase 4: Agency partnership program with referral incentives. Phase 5: API tier for agency software vendors.',
      metrics: [
        'MRR growth rate (target: 20% MoM in first 6 months)',
        'Time saved per client per month (target: 3 hours)',
        'Report quality score (agency rates 1-5, target: 4.5+)',
        'Churn rate (target: <5% monthly)',
        'Net Promoter Score (target: 60+)',
        'Time to first report generated (target: <30 minutes after onboarding)',
        'Integration success rate (target: >95% successful data pulls)',
      ],
      risks: [
        'Data integration reliability: APIs change, rate limits, authentication failures',
        'Narrative quality: AI output must be good enough agencies trust it with clients',
        'Agency sales cycles: 3-6 month enterprise cycles slow growth',
        'Competitive response: AgencyAnalytics or Databox adding AI narrative feature',
        'Data privacy: Agencies share client data — compliance requirements (GDPR, SOC 2)',
      ],
      userStories: [
        {
          id: 'us-1',
          role: 'agency owner',
          want: 'connect my Google Analytics and Meta Ads accounts to NarrateIQ',
          so: 'the platform can automatically pull my client performance data without manual exports',
          acceptanceCriteria: [
            'OAuth flow for Google Analytics 4 completes in under 2 minutes',
            'OAuth flow for Meta Ads Manager completes in under 2 minutes',
            'Data sync runs automatically and shows last-synced timestamp',
            'Error state clearly explains connection issues',
            'Multiple client ad accounts selectable per client',
          ],
          priority: 'must',
        },
        {
          id: 'us-2',
          role: 'agency account manager',
          want: 'upload 5 sample reports to train the AI on my agency\'s writing style',
          so: 'all generated reports sound like they were written by our team',
          acceptanceCriteria: [
            'Upload accepts PDF and DOCX files',
            'Processing confirmation shown within 30 seconds',
            'Training completes within 10 minutes',
            'Test generation available after training',
            'Voice training settings adjustable (formal/casual, technical/simple)',
          ],
          priority: 'must',
        },
        {
          id: 'us-3',
          role: 'agency owner',
          want: 'generate a complete monthly report for a client with one click',
          so: 'I can save 3+ hours of manual work per client per month',
          acceptanceCriteria: [
            'Report generation completes in under 5 minutes',
            'Report includes: executive summary, channel performance, month-over-month comparisons, narrative explanations, next month recommendations',
            'All data from connected sources included automatically',
            'Agency branding applied (logo, colors, fonts)',
            'Human review step before finalizing',
          ],
          priority: 'must',
        },
        {
          id: 'us-4',
          role: 'agency account manager',
          want: 'export client reports as branded PDFs or share via client portal',
          so: 'clients receive professional reports through their preferred channel',
          acceptanceCriteria: [
            'PDF export generates within 30 seconds',
            'Client portal accessible via unique link without login',
            'Email delivery with custom subject/message',
            'Report versioning (v1, v2 after revisions)',
          ],
          priority: 'must',
        },
        {
          id: 'us-5',
          role: 'agency owner',
          want: 'see a dashboard showing report status for all my clients',
          so: 'I can manage the reporting workflow across my entire client base',
          acceptanceCriteria: [
            'List of all clients with last report date',
            'Status indicators: generated, pending review, sent',
            'Quick actions: generate, review, send',
            'Monthly reporting calendar view',
          ],
          priority: 'should',
        },
      ],
      aiReview: {
        score: 91,
        summary: 'Exceptionally well-structured PRD with clear problem definition, validated ICP, and realistic MVP scope. Pricing model shows strong ROI alignment. User stories are detailed and testable.',
        strengths: [
          'Problem statement is quantified and compelling',
          'ICP is specific and clearly validated by research',
          'MVP scope is focused and achievable',
          'Pricing model demonstrates clear ROI for buyer',
          'User stories have concrete acceptance criteria',
        ],
        weaknesses: [
          'GTM plan could be more specific about content strategy',
          'Risk section could include mitigation strategies',
        ],
        recommendation: 'proceed',
      },
    },
    status: 'approved',
    createdAt: '2025-02-08T10:00:00Z',
  },
  {
    id: 'proj-2',
    ideaId: 'idea-3',
    ideaTitle: 'SoloBooks — Finance Intelligence for Online Entrepreneurs',
    prd: {
      problem:
        'Solopreneurs and online entrepreneurs with mixed income types (subscriptions, affiliates, digital products, courses, international sales) struggle with financial management tools designed for traditional businesses. This results in 20-40 hours annually on tax prep, $2k-$5k in accountant fees, inaccurate financial forecasting, and ongoing confusion about deductions, quarterly estimates, and cash flow.',
      icp:
        'Solopreneur or small online business owner generating $50k-$500k annually from digital products, consulting, courses, or SaaS. Uses Stripe, Gumroad, or similar payment processors. Works from home. Files as self-employed or S-corp. Currently uses Excel or a generic accounting tool that doesn\'t fit their business model.',
      solution:
        'SoloBooks is a financial intelligence platform specifically designed for online business income complexity. It auto-categorizes all income types, calculates quarterly tax estimates with online-business-specific logic, provides bootstrapper-focused financial forecasting, and generates year-end summaries that make tax filing straightforward.',
      mvpScope:
        'Bank account + Stripe + PayPal sync. Smart transaction categorization trained on online business income types. Quarterly tax estimate calculator (federal + state). Basic cash flow dashboard. Monthly financial summary generation. Export to CSV for accountant.',
      differentiation:
        'Built specifically for online business income complexity. Not a stripped-down enterprise tool.',
      pricingHypothesis: 'Solo: $29/month. Business: $79/month. Annual discount 20%.',
      gtmPlan: 'SEO content targeting solopreneur finance keywords. Indie Hackers, Reddit, Twitter communities.',
      metrics: [
        'MRR growth',
        'Tax estimate accuracy vs. actual',
        'Hours saved on tax prep',
        'NPS score',
      ],
      risks: [
        'Regulatory risk around tax advice',
        'Trust barrier for financial data',
        'Competition from established players',
      ],
      userStories: [],
      aiReview: undefined,
    },
    status: 'draft',
    createdAt: '2025-02-11T10:00:00Z',
  },
];

export const approvals: Approval[] = [
  {
    id: 'appr-1',
    entityType: 'cluster',
    entityId: 'cl-4',
    entityTitle: 'Meeting Intelligence & Follow-through',
    stage: 'Stage B — Cluster Validation',
    status: 'pending',
    createdAt: '2025-01-26T11:00:00Z',
  },
  {
    id: 'appr-2',
    entityType: 'idea',
    entityId: 'idea-4',
    entityTitle: 'VoiceClone Studio — Voice-First Content Repurposing',
    stage: 'Stage C — Idea Shortlisting',
    status: 'pending',
    createdAt: '2025-02-08T11:00:00Z',
  },
  {
    id: 'appr-3',
    entityType: 'project',
    entityId: 'proj-1',
    entityTitle: 'NarrateIQ PRD',
    stage: 'Stage E — PRD Approval',
    status: 'approved',
    actor: 'Abdel (Founder)',
    notes: 'PRD is excellent. Approved for development planning.',
    createdAt: '2025-02-08T12:00:00Z',
    resolvedAt: '2025-02-09T09:00:00Z',
  },
  {
    id: 'appr-4',
    entityType: 'idea',
    entityId: 'idea-5',
    entityTitle: 'MeetLoop — Meeting-to-Workflow Automation',
    stage: 'Stage C — Idea Shortlisting',
    status: 'rejected',
    actor: 'Abdel (Founder)',
    notes: 'Market too crowded with Otter.ai, Fireflies, Gong. Not our focus area.',
    createdAt: '2025-01-28T11:00:00Z',
    resolvedAt: '2025-01-29T10:00:00Z',
  },
  {
    id: 'appr-5',
    entityType: 'gtm',
    entityId: 'gtm-1',
    entityTitle: 'NarrateIQ Landing Page Copy',
    stage: 'Stage G — GTM Approval',
    status: 'pending',
    createdAt: '2025-02-12T10:00:00Z',
  },
];

export const auditEntries: AuditEntry[] = [
  {
    id: 'audit-1',
    agentId: 'agent-scanner',
    agentName: 'Market Scanner',
    action: 'SCAN_SOURCES',
    entityType: 'document',
    entityId: 'doc-1',
    inputSummary: 'Sources: HN, Reddit. Keywords: agency reporting, client reports, automation',
    outputSummary: 'Found 8 documents, 3 high-relevance signals in agency reporting category',
    tokensUsed: 4230,
    latencyMs: 3420,
    createdAt: '2025-02-01T14:00:00Z',
  },
  {
    id: 'audit-2',
    agentId: 'agent-extractor',
    agentName: 'Pain Point Extractor',
    action: 'EXTRACT_PAIN_POINTS',
    entityType: 'painPoint',
    entityId: 'pp-1',
    inputSummary: 'Document: "Agencies struggle with client reporting automation" (doc-1)',
    outputSummary: '3 pain points extracted: severity 5, 4, 4. Roles: Agency Owner, Account Manager, Operations Manager',
    tokensUsed: 1890,
    latencyMs: 2100,
    createdAt: '2025-02-01T15:00:00Z',
  },
  {
    id: 'audit-3',
    agentId: 'agent-clusterer',
    agentName: 'Cluster Analyzer',
    action: 'CREATE_CLUSTER',
    entityType: 'cluster',
    entityId: 'cl-1',
    inputSummary: '3 pain points around agency reporting automation',
    outputSummary: 'Created cluster "Client Reporting Automation" — frequency: 87, urgency: 92, trend: rising',
    tokensUsed: 2340,
    latencyMs: 1980,
    createdAt: '2025-02-04T10:00:00Z',
  },
  {
    id: 'audit-4',
    agentId: 'agent-ideator',
    agentName: 'Idea Generator',
    action: 'GENERATE_IDEAS',
    entityType: 'idea',
    entityId: 'idea-1',
    inputSummary: 'Cluster: Client Reporting Automation. 3 pain points. Requested 3 ideas.',
    outputSummary: '2 ideas generated: NarrateIQ (SaaS), ReportFlow (Automation). Both viable, NarrateIQ higher differentiation.',
    tokensUsed: 5670,
    latencyMs: 8920,
    createdAt: '2025-02-05T10:00:00Z',
  },
  {
    id: 'audit-5',
    agentId: 'agent-scorer',
    agentName: 'Idea Scorer',
    action: 'SCORE_IDEA',
    entityType: 'scorecard',
    entityId: 'sc-1',
    inputSummary: 'Idea: NarrateIQ. Rubric v1.0. Weights: market 20, feasibility 20, ttv 15, risk 15, strategic 15, diff 15',
    outputSummary: 'Score: 86/100. All dimensions above threshold. 3 risk flags. Recommendation: proceed.',
    tokensUsed: 3210,
    latencyMs: 4530,
    createdAt: '2025-02-06T10:00:00Z',
  },
  {
    id: 'audit-6',
    agentId: 'agent-reviewer',
    agentName: 'AI Reviewer',
    action: 'REVIEW_STEP',
    entityType: 'scorecard',
    entityId: 'sc-1',
    inputSummary: 'Step: idea-scoring. Input: NarrateIQ idea. Output: scorecard sc-1',
    outputSummary: 'Review score: 88/100. Recommendation: proceed. 4 strengths, 3 weaknesses identified.',
    tokensUsed: 2890,
    latencyMs: 3200,
    createdAt: '2025-02-06T10:05:00Z',
  },
  {
    id: 'audit-7',
    agentId: 'agent-prd',
    agentName: 'PRD Generator',
    action: 'GENERATE_PRD',
    entityType: 'project',
    entityId: 'proj-1',
    inputSummary: 'Idea: NarrateIQ. Scorecard: sc-1. Full context provided.',
    outputSummary: 'PRD generated: 5 sections, 5 user stories, pricing model, GTM plan. AI review score: 91/100.',
    tokensUsed: 8920,
    latencyMs: 12400,
    createdAt: '2025-02-08T10:00:00Z',
  },
  {
    id: 'audit-8',
    agentId: 'agent-gtm',
    agentName: 'GTM Generator',
    action: 'GENERATE_GTM',
    entityType: 'gtmAsset',
    entityId: 'gtm-1',
    inputSummary: 'Project: NarrateIQ (proj-1). Status: approved. Full PRD available.',
    outputSummary: '3 GTM assets generated: landing page, campaign plan, outreach sequence. All pending approval.',
    tokensUsed: 7340,
    latencyMs: 9870,
    createdAt: '2025-02-12T10:00:00Z',
  },
];

export const gtmAssets: GTMAsset[] = [
  {
    id: 'gtm-1',
    projectId: 'proj-1',
    type: 'landing-page',
    title: 'NarrateIQ Landing Page — Hero & Value Prop',
    content: `# NarrateIQ Landing Page Copy

## Hero Section
**Headline:** Your Agency Reports, Written By AI. Reviewed By You. Loved By Clients.

**Subheadline:** Stop spending 3 hours per client writing monthly reports. NarrateIQ connects your data sources, learns your agency's voice, and generates complete narrative reports in minutes.

**CTA:** Start Free 14-Day Trial → (no credit card required)

**Social Proof:** Trusted by 200+ agency owners | Saves 120 hours/month | 4.9/5 rating

---

## Problem Section
**Header:** "Sound familiar?"

- ✗ Pulling data from 7 different tools every month
- ✗ Copy-pasting numbers into Google Slides at 11pm
- ✗ Writing the same "performance narrative" for 40 clients
- ✗ Paying $2k/month for a reporting VA who's still manual

---

## Solution Section
**Header:** Reporting that writes itself. Seriously.

NarrateIQ connects your data sources, learns how your agency writes, and generates complete monthly reports — data + narrative + recommendations — in under 5 minutes.

**Features:**
1. **Connect once, report forever** — OAuth with GA4, Meta Ads, Google Ads, Salesforce, and 12 more
2. **Train your voice** — Upload 5 sample reports, we learn your style
3. **One-click reports** — Full narrative, benchmarks, and recommendations generated instantly
4. **White-label delivery** — Branded PDF or client portal link

---

## Pricing Section
**Starter:** $199/month — 10 clients, 2 integrations
**Growth:** $499/month — 40 clients, unlimited integrations, voice training
**Agency:** $999/month — unlimited clients, white-label, API access

**ROI Calculator:** At 40 clients × 3 hours × $75/hr = $9,000/month saved. NarrateIQ pays for itself in 2 days.`,
    status: 'draft',
    createdAt: '2025-02-12T10:00:00Z',
  },
  {
    id: 'gtm-2',
    projectId: 'proj-1',
    type: 'campaign',
    title: 'NarrateIQ — Agency Founder LinkedIn Campaign',
    content: `# LinkedIn Campaign Plan — NarrateIQ

## Campaign Objective
Drive trial signups from digital marketing agency owners (5-50 person agencies)

## Target Audience
- Job titles: Agency Owner, Founder, CEO, Head of Client Services
- Company size: 10-200 employees
- Industry: Marketing, Advertising, Digital Marketing
- Interests: Marketing automation, Agency management, SaaS tools

## Ad Creative Concepts

### Creative 1 — Pain Point (Carousel)
Slide 1: "How much time does your team spend on client reports each month?"
Slide 2: "Average agency (40 clients): 160 hours/month"
Slide 3: "At $75/hr fully loaded = $12,000 in labor costs"
Slide 4: "NarrateIQ reduces that to 16 hours. Same reports. 10x faster."
CTA: Get Your Free 14-Day Trial

### Creative 2 — Social Proof (Single Image)
"I used to spend my entire Sunday writing client reports. Now I review and send them in 30 minutes. NarrateIQ changed my business." — Sarah K., 28-client agency owner
CTA: See How It Works

## Budget Recommendation
- Testing phase: $50/day × 14 days = $700 total
- Target CPM: $45-65 (LinkedIn agency segment)
- Expected reach: 8,000-12,000 agency founders
- Target CTR: 0.8-1.2%
- Expected clicks: 80-144
- Target trial conversion: 15%
- Expected trials from campaign: 12-22`,
    status: 'draft',
    createdAt: '2025-02-12T10:30:00Z',
  },
  {
    id: 'gtm-3',
    projectId: 'proj-1',
    type: 'outreach',
    title: 'NarrateIQ — Cold Outreach Sequence (Agency Founders)',
    content: `# Cold Outreach Sequence — Agency Founders

## Sequence Overview
5-touch sequence over 14 days targeting agency owners 10-50 person shops

---

## Email 1 (Day 1) — Problem Recognition
**Subject:** How much is your reporting process costing you?

Hi {{first_name}},

Quick question: how many hours does your team spend creating client reports each month?

If you're running a 20-30 client agency, I'd guess it's somewhere between 60-120 hours — mostly pulling data, formatting slides, and writing the narrative that actually explains what the numbers mean.

I built NarrateIQ because I watched agency owners (including myself) waste entire weekends on this. It connects to GA4, Meta Ads, and your other data sources, learns your agency's writing style, and generates complete reports in under 5 minutes.

Would you be open to a 15-minute demo this week?

Best,
[Your name]

---

## Email 2 (Day 4) — Social Proof
**Subject:** RE: How much is your reporting process costing you?

Following up — wanted to share a quick result from one of our early users:

"We had 35 clients and were spending 140 hours a month on reports. NarrateIQ got us to 14 hours. The reports actually sound like us now." — Marcus L., Growth Agency

The key insight: it's not just about data aggregation (AgencyAnalytics already does that), it's about the narrative layer that makes reports worth reading.

Still interested in a demo?

---

## Email 5 (Day 14) — Breakup + Offer
**Subject:** Last email from me, {{first_name}}

I'll keep this short — I know you're busy.

If client reporting is still a pain point, NarrateIQ has a 14-day trial with no credit card required. Takes 20 minutes to set up and generate your first report.

If not the right time, no worries at all. I'll remove you from my list.

Either way, best of luck with the agency!`,
    status: 'draft',
    createdAt: '2025-02-12T11:00:00Z',
  },
];

export const feedbackItems: FeedbackItem[] = [
  {
    id: 'fb-1',
    projectId: 'proj-1',
    source: 'Beta User Interview — Marcus L.',
    content: 'The report generation is faster than expected. My main feedback is I want to be able to edit sections of the generated report inline before exporting. Right now I have to export to PDF and edit in Adobe. That\'s still friction.',
    sentiment: 'positive',
    tags: ['editing', 'workflow', 'export', 'friction'],
    createdAt: '2025-02-15T14:00:00Z',
  },
  {
    id: 'fb-2',
    projectId: 'proj-1',
    source: 'Beta User Interview — Sarah K.',
    content: 'Voice training is working well — clients have actually complimented that our reports sound more professional. One issue: when Meta Ads API is slow, the entire report generation hangs with no progress indicator. I thought it crashed twice.',
    sentiment: 'positive',
    tags: ['voice-training', 'api-reliability', 'UX', 'loading'],
    createdAt: '2025-02-16T10:00:00Z',
  },
  {
    id: 'fb-3',
    projectId: 'proj-1',
    source: 'Support Ticket #042',
    content: 'Google Analytics 4 connection keeps dropping after 7 days. I have to re-authenticate every week. This is annoying and defeats the purpose of automation.',
    sentiment: 'negative',
    tags: ['authentication', 'GA4', 'reliability', 'bug'],
    createdAt: '2025-02-17T09:00:00Z',
  },
  {
    id: 'fb-4',
    projectId: 'proj-1',
    source: 'ProductHunt Comment',
    content: 'Looks interesting but $499/month for Growth tier is steep for a solo agency owner. Would love a $149 plan for 15 clients. Otherwise the math doesn\'t work for smaller agencies.',
    sentiment: 'neutral',
    tags: ['pricing', 'solo-agency', 'tier', 'feedback'],
    createdAt: '2025-02-18T16:00:00Z',
  },
];

export const learningReports: LearningReport[] = [
  {
    id: 'lr-1',
    weekOf: '2025-02-17',
    keyFindings: [
      'GA4 OAuth token expiry at 7 days is causing weekly re-auth friction for all users — critical bug',
      'Voice training quality rated 4.6/5 — strong signal, differentiation working',
      'Pricing gap between Starter ($199) and Growth ($499) is causing friction for mid-size agencies (15-25 clients)',
      'Inline editing before export is the #1 feature request from beta users',
      'Meta Ads API latency spikes causing perceived crashes due to missing progress feedback',
    ],
    improvements: [
      'Fix GA4 OAuth token refresh to extend to 60-day rotation',
      'Add real-time progress indicator for report generation (per data source status)',
      'Introduce mid-tier plan: Professional at $299/month for 25 clients',
      'Build inline report editor before PDF export',
    ],
    experiments: [
      'A/B test: "14-day trial" vs "generate first report free" CTA on landing page',
      'Test LinkedIn outreach with pain-point carousel vs. testimonial format',
      'Experiment with in-app voice training walkthrough to improve activation',
    ],
    roadmapItems: [
      'Q2: Inline report editor with rich text formatting',
      'Q2: Professional pricing tier at $299/month',
      'Q2: GA4 token refresh fix + reliability improvements',
      'Q3: Google Ads + LinkedIn Ads integrations',
      'Q3: Client portal with comment/approval workflow',
      'Q4: Salesforce CRM integration for full-funnel reporting',
    ],
    createdAt: '2025-02-18T09:00:00Z',
  },
];

export const rubricWeights: RubricWeights = {
  marketSize: 20,
  feasibility: 20,
  timeToValue: 15,
  riskLevel: 15,
  strategicFit: 15,
  differentiation: 15,
};
