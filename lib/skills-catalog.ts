import rawLifeOsSkills from './skills-data.json';

export interface SkillQuestion {
  title: string;
  prompt: string;
  options?: string[];
}

export interface SkillParameter {
  name: string;
  description: string;
  validChoices?: string;
  defaultFallback?: string;
}

export interface SkillDefinition {
  num?: number;
  id: string;
  name: string;
  department: string;
  description: string;
  enabled: boolean;
  allowedTiers: string[];
  quickQuestions?: SkillQuestion[];
  parameters?: SkillParameter[];
  workflow?: string[];
  guardrails?: string[];
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  dailyTokenLimit: number;
}

export const INITIAL_SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  { id: 'BEGINNER', name: 'Beginner', description: 'Essential access with standard quota', dailyTokenLimit: 50000 },
  { id: 'INTERMEDIATE', name: 'Intermediate', description: 'Expanded tool access & higher reasoning limit', dailyTokenLimit: 150000 },
  { id: 'ADVANCED', name: 'Advanced', description: 'Priority routing & full autonomous execution', dailyTokenLimit: 500000 },
  { id: 'ADMIN', name: 'Admin', description: 'Unrestricted enterprise capability', dailyTokenLimit: 1000000 },
];

const BASE_APP_AND_CAREER_SKILLS: SkillDefinition[] = [
  // --- GOOGLE WORKSPACE APP EXECUTION SUITE ---
  {
    num: 1,
    id: 'workspace-docs-architect',
    name: 'Google Docs Knowledge Architect',
    department: 'Workspace Operations',
    description: 'Creates and updates publication-grade, human-written Google Docs. Features clear typographical hierarchy, executive summaries, numbered action plans, and crisp takeaways. Strictly bans generic AI clichés.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Assess target document format (Brief, SOP, Proposal, Meeting Synthesis, or Project Charter).',
      'Conduct autonomous Drive or Web search if background context or industry benchmarks are required.',
      'Draft document with bold executive summary, structured numbered headers, data tables, and actionable conclusion.',
      'Execute create_document or update_document tool call.',
      'Return 1-2 sentence conversational confirmation with a single clickable markdown link to the Google Doc.'
    ],
    guardrails: [
      'Never output robotic AI clichés (delve into, tapestry, testament, in conclusion).',
      'Always structure with H1/H2/H3 headers and clear paragraph breaks.',
      'Provide exactly one master link to the finished document.'
    ]
  },
  {
    num: 2,
    id: 'workspace-sheets-modeler',
    name: 'Google Sheets Ledger & Financial Modeler',
    department: 'Financial Modeling & Operational Tracking',
    description: 'Architects easy-to-scan, structured Google Spreadsheets with uppercase headers, dynamic spreadsheet formulas (SUM, AVERAGE, IF, VLOOKUP, percentages), clean columns, and metrics. Never creates flat or unformatted data.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Define clear columnar schema with standardized bold uppercase headers.',
      'Include automated formula calculations for sums, averages, deltas, or status percentages in appropriate rows/columns.',
      'Execute create_spreadsheet or update_spreadsheet tool call with populated headers and rows.',
      'Return confirmation summarizing the columns, row count, and a direct clickable URL.'
    ],
    guardrails: [
      'Always use capital bold headers (e.g. ITEM_NAME, STATUS, TARGET_DATE, BUDGET_USD).',
      'Incorporate working spreadsheet formulas for totals and percentages.',
      'Keep data clean, aligned, and immediately ready for business review.'
    ]
  },
  {
    num: 3,
    id: 'workspace-slides-designer',
    name: 'Google Slides Executive Deck Creator',
    department: 'Executive Communications',
    description: 'Designs engaging, punchy, high-impact Google Slides presentations. Follows the single bold idea per slide rule, high visual cadence, and the strict Single Master Link protocol.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Establish core narrative arc (Context -> Problem/Opportunity -> Strategy -> Phased Execution -> Target Impact).',
      'Create presentation container using create_presentation.',
      'Add sequentially structured slides via add_slide with punchy headline and 3-4 high-density bullet points.',
      'Deliver confirmation with ONE single link to the entire presentation deck.'
    ],
    guardrails: [
      'Strictly enforce the Single Master Link Rule: NEVER provide links to individual slides.',
      'Maximum 3-5 bullet points per slide; keep wording sharp, active, and punchy.',
      'Include a strong title slide and a definitive Next Steps / Action Items closing slide.'
    ]
  },
  {
    num: 4,
    id: 'workspace-calendar-strategist',
    name: 'Google Calendar High-Leverage Scheduler',
    department: 'Time & Focus Architecture',
    description: 'Schedules strategic focus blocks, audits daily availability, resolves scheduling collisions, and sets up high-priority events with structured meeting agendas and participant invites.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'List existing events for the target timeframe via list_calendar_events to identify open windows.',
      'Anchor to the live current date/time to calculate precise start and end ISO datetimes.',
      'Execute create_calendar_event or update_calendar_event with concise summary and structured description agenda.',
      'Confirm the event time, duration, and link in a natural single sentence.'
    ],
    guardrails: [
      'Never double-book without alerting the user.',
      'Always anchor to the exact live current date when calculating relative terms like tomorrow or next Monday.',
      'Include clear purpose and agenda items in the event description.'
    ]
  },
  {
    num: 5,
    id: 'workspace-tasks-commander',
    name: 'Google Tasks Action Tracker',
    department: 'Execution & Operations',
    description: 'Transforms outcomes and milestones into structured Google Tasks. Assigns due dates, sets priority notes, updates progress status, and maintains execution momentum.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Inspect existing task lists via list_task_lists or list_tasks.',
      'Convert user outcome or email action items into distinct, verb-first executable tasks.',
      'Execute create_task or update_task with explicit due dates in RFC 3339 format.',
      'Confirm added tasks clearly with their assigned target deadlines.'
    ],
    guardrails: [
      'Every task title must begin with an imperative action verb (e.g. Finalize, Review, Deploy, Email).',
      'Always associate a realistic due date anchor when known.'
    ]
  },
  {
    num: 6,
    id: 'workspace-keep-notes',
    name: 'Google Keep Notes & Checklist Engine',
    department: 'Rapid Capture & Personal Organization',
    description: 'Instantly captures spontaneous thoughts, checklists with checkable boxes, sprint task lists, grocery/packing lists, and meeting takeaways directly into Google Keep notes.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Format notes cleanly with bulleted items or bracketed checkboxes (- [ ] Item).',
      'Execute create_note with an intuitive title and structured content.',
      'Confirm note creation and provide a quick preview of key items.'
    ],
    guardrails: [
      'Keep note content concise, focused, and immediately actionable.',
      'Use checkboxes for actionable lists and numbered sections for structured thoughts.'
    ]
  },
  {
    num: 7,
    id: 'workspace-gmail-intelligence',
    name: 'Gmail Context Scanner & Executive Drafter',
    department: 'Communications & Inbox Architecture',
    description: 'Scans relevant Gmail threads for critical details, extracts dates and commitments, and drafts articulate replies for user approval (draft-and-approve protocol).',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Query relevant emails via list_emails using precise search queries (from, subject, keywords).',
      'Read target message thread via read_email to extract context, commitments, and deadlines.',
      'Compose draft reply via draft_reply tool so the user can review and approve before sending.',
      'Present draft recipient, subject line, and concise preview in chat for one-click approval.'
    ],
    guardrails: [
      'Mandatory draft-and-approve protocol: Never send emails directly without explicit user approval.',
      'Drafts must be professional, warm, concise, and clearly state next steps.'
    ]
  },
  {
    num: 8,
    id: 'workspace-drive-librarian',
    name: 'Google Drive Systematic File Organizer',
    department: 'Digital Asset Management',
    description: 'Systematically searches and catalogs user files across Google Drive. Reads contents without asking the user repetitive questions and manages share permissions.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Search Google Drive via list_documents with targeted name or topic queries.',
      'Extract content from relevant files using read_document or read_spreadsheet.',
      'Manage access permissions using share_file when sharing with team members or generating public view links.',
      'Summarize findings concisely with direct links to the relevant assets.'
    ],
    guardrails: [
      'Always subtract known file data rather than asking the user what is in their Drive.',
      'Validate share permissions (reader vs writer) before sharing files.'
    ]
  },
  {
    num: 9,
    id: 'workspace-forms-creator',
    name: 'Google Forms Intake & Survey Builder',
    department: 'Feedback Loops & Data Intake',
    description: 'Builds modern Google Forms with multiple-choice, checkbox, and text questions for client intake, feedback loops, event registration, and team surveys.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Clarify form purpose, target audience, and required input fields.',
      'Structure questions logically into MULTIPLE_CHOICE, CHECKBOX, or TEXT types.',
      'Execute create_form tool call with title, description, and questions array.',
      'Return the public responder link and edit link to the user.'
    ],
    guardrails: [
      'Include clear, helpful instructions in question descriptions where needed.',
      'Ensure options for multiple choice are mutually exclusive and comprehensive.'
    ]
  },
  {
    num: 10,
    id: 'workspace-gemini-notebooks',
    name: 'Gemini Research Notebooks Curator',
    department: 'Deep Intelligence & Synthesis',
    description: 'Synthesizes complex topics into publication-quality research notebooks in Google Docs. Includes executive abstracts, empirical data, comparative evidence matrices, and verified citations.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Perform web research or document scanning to gather verified, legitimate sources.',
      'Synthesize findings into chapters with executive abstract, key data points, comparative table, and sources.',
      'Execute create_gemini_notebook or create_document tool call.',
      'Deliver 1-2 sentence confirmation with a single clickable link to the research notebook.'
    ],
    guardrails: [
      'All citations must reference authentic, credible institutions (peer-reviewed papers, official documentation, SEC filings).',
      'Structure must include an Executive Abstract, Comparative Matrix, and Actionable Roadmap.'
    ]
  },

  // --- CHIEF OF STAFF META-SKILLS (AUTONOMOUS, INTUITIVE & STRATEGIC) ---
  {
    num: 11,
    id: 'meta-deep-research',
    name: 'Autonomous Web Intelligence & Fact Verification',
    department: 'Autonomous Intelligence',
    description: 'Triggers unprompted real-time web search whenever a user prompt requires current benchmarks, pricing, contact details, or technical documentation. Synthesizes facts before replying.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Detect when real-world facts, current rates, market statistics, or technical specifications are needed.',
      'Execute search_internet with targeted query.',
      'Filter out low-signal SEO fluff and extract high-signal numbers, dates, and primary source links.',
      'Deliver the distilled answer with linked sources.'
    ],
    guardrails: [
      'Never guess or hallucinate facts that can be verified online.',
      'Cite sources with clean markdown links.'
    ]
  },
  {
    num: 12,
    id: 'meta-context-subtraction',
    name: 'Context Subtraction & Rapid Clarifying Q&A',
    department: 'Chief of Staff Protocols',
    description: 'Subtracts all known facts from previous conversation turns, Drive files, and Gmail threads. Asks ONLY the remaining essential questions formatted as rapid-tap - [A] / - [B] multiple-choice options.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Review existing context and attached files; eliminate all already-answered questions.',
      'If ambiguity prevents immediate execution, formulate at most 1-2 targeted questions.',
      'Format each question with crisp multiple-choice options (- [A] Option 1, - [B] Option 2).',
      'Never embed options into the question sentence itself.'
    ],
    guardrails: [
      'Never ask more than 2 questions at a time.',
      'Never ask questions whose answer is already discoverable in the user workspace.'
    ]
  },
  {
    num: 13,
    id: 'meta-inbox-sweeper-tasks',
    name: 'Gmail & Workspace Proactive Task Extractor',
    department: 'Autonomous Operations',
    description: 'Scans recent emails and workspace records to intuitively extract tasks for Life OS (to execute autonomously) and tasks for the user, organizing them systematically with deadlines.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Execute list_emails with query for unread or high-priority messages.',
      'Analyze email threads for deliverables, action items, dates, and outstanding requests.',
      'Categorize tasks into: (1) Tasks Life OS can execute immediately, and (2) Tasks requiring User decision.',
      'Sync tasks into Google Tasks via create_task or note them in Keep Notes.'
    ],
    guardrails: [
      'Clearly delineate what Life OS has handled vs what the user needs to sign off on.',
      'Preserve the original email subject and sender in task notes for instant context.'
    ]
  },
  {
    num: 14,
    id: 'meta-outcome-roadmap',
    name: 'Outcome & Deadline Project Planner',
    department: 'Strategic Planning',
    description: 'Takes ambiguous goals and deadlines, reverse-engineers a phased milestone roadmap, and orchestrates the needed Docs, Sheets, Calendar events, and Tasks automatically.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Anchor to target outcome and deadline date.',
      'Break into chronological phases (Phase 1 Discovery -> Phase 2 Build -> Phase 3 Review -> Phase 4 Launch).',
      'Generate living tracking Sheet via create_spreadsheet and milestone schedule via create_calendar_event.',
      'Provide a cohesive summary with the master plan link.'
    ],
    guardrails: [
      'Always ensure every milestone has an explicit owner and target deadline.',
      'Deliver plans that are immediately operational rather than theoretical.'
    ]
  },
  {
    num: 15,
    id: 'meta-blindspot-director',
    name: 'Executive Blind Spot Detector & Directing',
    department: 'Chief of Staff Advisory',
    description: 'Proactively identifies operational blind spots, looming deadlines, unreplied critical emails, or missing project dependencies, directing the user with high-leverage recommendations.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Cross-reference current calendar commitments with pending tasks and recent emails.',
      'Identify discrepancies (e.g. meeting scheduled with client but no prep doc created, or deadline tomorrow with pending tasks).',
      'Direct the user clearly: highlight the blind spot, the potential impact, and offer a 1-tap solution.'
    ],
    guardrails: [
      'Be direct and constructive; focus on preventing friction and saving time.',
      'Always offer a concrete action Life OS can execute immediately to resolve the blind spot.'
    ]
  },
  {
    num: 16,
    id: 'meta-html-ui-designer',
    name: 'Interactive HTML UI & Live Dashboard Designer',
    department: 'Generative UI & Visual Systems',
    description: 'Generates modern, high-contrast interactive HTML widgets, trackers, calculators, and dashboards wrapped in ```html codeblocks for instant live rendering in the chat sandbox.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Determine needed UI components (KPI cards, progress bars, interactive filters, calculators).',
      'Write clean, self-contained HTML with modern Tailwind CSS utility classes.',
      'Wrap complete code in an ```html codeblock for immediate live sandbox rendering in the chat UI.'
    ],
    guardrails: [
      'Code must be 100% self-contained and render cleanly in an iframe sandbox.',
      'Use high-contrast modern typography, rounded borders, and clean status colors.'
    ]
  },
  {
    num: 17,
    id: 'meta-multi-skill-orchestrator',
    name: 'Multi-Skill Chaining & Sequential Workflow',
    department: 'Autonomous Orchestration',
    description: 'Intelligently chains multiple skills in sequence when a user prompt requires end-to-end multi-app execution (e.g. Scan Gmail -> Build Google Sheet -> Draft Google Doc -> Schedule Calendar Focus).',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Deconstruct complex multi-part user request into sequential skill steps.',
      'Execute tool calls across the relevant skills in logical progression without stopping prematurely.',
      'Pass intermediate data into downstream tool calls.',
      'Deliver a consolidated, concise executive summary with links to all created artifacts.'
    ],
    guardrails: [
      'Never drop any step of a multi-part prompt.',
      'Deliver a cohesive executive summary linking all created assets together.'
    ]
  },

  // --- SAVIA CAREER OS: 19 MASTER SKILLS (READ-ONLY WITH HUMAN-IN-THE-LOOP STAGING) ---
  {
    num: 18,
    id: 'candidate-aspiration-and-criteria-inquisitor',
    name: 'Candidate Aspiration & Criteria Inquisitor',
    department: 'Career Intake & Strategy',
    description: 'Proactively extracts candidate non-negotiables, psychological energizers, minimum in-hand monthly net cash floor (distinguishing fixed cash from inflated CTC), work style preferences, and toxic culture triggers. Delivers Candidate_Mandate_Vault (Google Sheet) with weighted multi-factor scoring algorithms.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Trigger at campaign launch or when candidate priorities shift.',
      'Inquire: Role scope (IC vs. Management, 0-to-1 vs. 1-to-10), Minimum net in-hand cash, Work style (Remote/Hybrid/Commute radius), and Toxic culture boundaries.',
      'Build Candidate_Mandate_Vault via create_spreadsheet with weighted evaluation columns.',
      'Provide single link to the mandate spreadsheet.'
    ],
    guardrails: ['Distinguish real in-hand fixed monthly cash from vanity CTC figures.']
  },
  {
    num: 19,
    id: 'career-trajectory-and-pivot-architect',
    name: 'Career Trajectory & Pivot Architect',
    department: 'Career Intake & Strategy',
    description: 'Deconstructs historical achievements to identify transferable core competencies; models low-friction adjacent pivots vs high-friction radical jumps. Bridges functional transitions (e.g., Quick Commerce Operations to Technical Product Management or B2B SaaS Sales) and translates domain jargon. Delivers Career_Pivot_Dossier.gdoc detailing 12/24/36-month progression milestones.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Audit past achievements and translate technical/operational jargon into target industry language.',
      'Model 12/24/36-month career roadmap with tangible milestones.',
      'Execute create_document to generate Career_Pivot_Dossier.',
      'Deliver single document link with concise summary.'
    ],
    guardrails: ['Focus on low-friction adjacent pivots over reckless jumps.']
  },
  {
    num: 20,
    id: 'upskilling-and-skill-arbitrage-curator',
    name: 'Upskilling & Skill Gap Arbitrage Curator',
    department: 'Upskilling & Skill Arbitrage',
    description: 'Analyzes market vacancy trends to identify "Skill Arbitrage" opportunities—high-demand, low-supply technical/strategic skills offering the highest salary multiplier with minimum study overhead. Maps 20-hour to 80-hour accelerated learning tracks and prescribes hands-on capstone project briefs. Delivers Upskilling_Sprint_Roadmap in Google Keep and Tasks.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Identify highest-ROI skill gaps for target role compensation tier.',
      'Structure 20-80h accelerated track with hands-on capstone briefs (not passive video watching).',
      'Create structured checklist in Google Keep via create_note and milestone tasks via create_task.',
      'Confirm roadmap creation with actionable next steps.'
    ],
    guardrails: ['Prioritize production-grade capstone proof-of-work over passive certificates.']
  },
  {
    num: 21,
    id: 'portal-profile-synthesizer-and-seo-optimizer',
    name: 'Portal Profile Synthesizer & SEO Optimizer',
    department: 'Portal Profile Synthesis & SEO',
    description: 'Autonomously formats, optimizes, and writes bespoke profile content tailored to ranking algorithms: LinkedIn (High-converting Headline, 1st-person Storytelling "About", SEO keyword-packed Experience blocks), Naukri.com (Optimized 250-character indexer Resume Headline, Key Skills clustering driving 90% of recruiter search matching), Instahyre/Cutshort, Wellfound/YC, Foundit/IIMjobs. Delivers Portal_Profile_Master_Matrix.gdoc with 1-click copy-paste sections.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Tailor content specifically for each platform ranking engine (LinkedIn, Naukri, Instahyre, Wellfound).',
      'Optimize Naukri 250-char indexer headline and cluster key skills for algorithmic discovery.',
      'Synthesize into Portal_Profile_Master_Matrix via create_document.',
      'Deliver single document link with copy-paste readiness.'
    ],
    guardrails: ['Never output generic summaries; optimize for exact recruiter search query clusters.']
  },
  {
    num: 22,
    id: 'ats-resume-and-impact-bullet-synthesizer',
    name: 'ATS Resume & Impact Bullet Synthesizer',
    department: 'Collateral Studio, Resumes & Web',
    description: 'Generates single-page and two-page ATS-compliant resume variants strictly implementing Google XYZ format ("Accomplished [X], measured by [Y], by doing [Z]"). Embeds exact JD keyword semantics into natural career narrative bullets. Eliminates parsing traps (no tables, multi-column layouts, graphics, or non-standard fonts). Delivers tailored .gdoc files with 1-click PDF download links.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Parse target job description requirements and extract high-weight keywords.',
      'Rewrite experience bullets into strict Google XYZ format: Accomplished [X], measured by [Y], by doing [Z].',
      'Create single/two-page clean layout via create_document in /Applications/{Company_Role}/.',
      'Provide single master link to the finished resume doc.'
    ],
    guardrails: [
      'Zero ATS parsing traps: no tables, columns, or non-standard symbols.',
      'Every single bullet point must contain quantifiable business impact.'
    ]
  },
  {
    num: 23,
    id: 'multi-variant-static-portfolio-deployer',
    name: 'Multi-Variant Static Portfolio Deployer',
    department: 'Collateral Studio, Resumes & Web',
    description: 'Generates clean, responsive HTML5/Tailwind CSS static websites tailored to specific candidate personas (Variant A: Engineering & Systems Architecture, Variant B: Product & Business Operations, Variant C: Executive Leadership & Strategy). Delivers standalone, deployable static code bundles (index.html, style.css) ready for 1-click publishing on GitHub Pages or Vercel.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Select candidate persona variant (Variant A Engineering, Variant B Product/Ops, Variant C Executive).',
      'Generate production-ready HTML5 + Tailwind CSS code bundle.',
      'Render live interactive preview in chat sandbox and prepare static deployable files.',
      'Confirm bundle readiness for GitHub Pages, Netlify, or Vercel.'
    ],
    guardrails: ['Zero build dependencies: pure static HTML5 + Tailwind CSS + Vanilla JS.']
  },
  {
    num: 24,
    id: 'bespoke-work-sample-and-proof-of-work-architect',
    name: 'Bespoke Work Sample & Proof-of-Work Architect',
    department: 'Collateral Studio, Resumes & Web',
    description: 'Replaces generic cover letters with high-impact, unsolicited bespoke work samples addressing the target company\'s current operational bottlenecks: First 90 Days Strategic Plan, Product Teardown / Feature Spec (with 3 high-impact UX/architectural improvements), Commercial/Financial Model (Google Sheet), or Architecture RFC/Tech Spike. Delivers Bespoke_Work_Sample_{Company}.gdoc/.gsheet.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Diagnose the target company\'s single biggest operational or technical friction point.',
      'Build concrete artifact: 30-60-90 Day Plan, Product Spec, or Financial Unit Economics Model.',
      'Execute create_document or create_spreadsheet.',
      'Stage review card in Life OS center cockpit for human confirmation before release.'
    ],
    guardrails: ['Approval safeguard: artifact is strictly staged and released only upon human confirmation.']
  },
  {
    num: 25,
    id: 'multi-board-job-scout-and-matchmaker',
    name: 'Multi-Board Job Scout & Matchmaker',
    department: 'Sourcing, Matching & Network Activation',
    description: 'Aggregates and filters listings from 30+ domestic and international job platforms against the candidate\'s exact mandate. Deduplicates cross-posted listings and scores fit percentage based on compensation floor, tech stack alignment, commute/remote posture, and company stage. Delivers live updates to Job_Search_Master_Pipeline.gsheet with curated top-3 daily opportunities.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Perform web intelligence search across relevant target boards.',
      'Deduplicate postings and score candidate-mandate fit percentage.',
      'Update Job_Search_Master_Pipeline spreadsheet with curated top opportunities.',
      'Provide concise briefing highlighting the top 3 highest-conviction leads.'
    ],
    guardrails: ['Filter out ghost jobs and listings violating the candidate\'s hard compensation floor.']
  },
  {
    num: 26,
    id: 'circle-of-trust-and-referral-mobilizer',
    name: 'Circle-of-Trust & Referral Mobilizer',
    department: 'Sourcing, Matching & Network Activation',
    description: 'Taps phone contacts, personal WhatsApp circles, alumni directories, and family networks to secure internal referrals without transactional friction. Categorizes contacts by relationship depth and crafts warm, graceful outreach messages providing the referee with an easy copy-paste forwardable blurb for their internal HR portal. Delivers pre-formatted https://wa.me/ links and draft emails in Gmail Drafts.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Identify 1st and 2nd degree connections at target organization.',
      'Craft high-warmth, low-friction outreach with pre-written forwardable blurb.',
      'Generate native wa.me URI links and stage draft messages in Gmail Drafts.',
      'Present staged Action Cards for human 1-tap review.'
    ],
    guardrails: ['Never send autonomously; always provide pre-formatted wa.me links or staged Gmail drafts.']
  },
  {
    num: 27,
    id: 'network-infiltrator-and-referral-closer',
    name: 'Network Infiltrator & Referral Closer',
    department: 'Sourcing, Matching & Network Activation',
    description: 'Composes hyper-concise (under 90 words), value-first cold emails and LinkedIn InMails that achieve 40%+ open-and-reply rates. Hooks with an immediate observation about the company\'s recent milestone or problem, quotes 1-2 undeniable quantified metrics from candidate track record, and proposes a frictionless, low-pressure call to action (e.g. "Open to a 5-minute exploratory chat this Thursday?"). Delivers staged Gmail drafts.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Research target hiring manager, recent company releases, or tech blog posts.',
      'Draft hyper-concise pitch (under 90 words) with 1-2 quantified metric hooks.',
      'Execute draft_reply or compose draft in Gmail Drafts.',
      'Present Action Card for 1-tap approval.'
    ],
    guardrails: [
      'Strictly under 90 words.',
      'Zero generic greetings; hook directly on company public milestones.'
    ]
  },
  {
    num: 28,
    id: 'reverse-recruiter-and-talent-agent-desk',
    name: 'Reverse Recruiter & Talent Agent Desk',
    department: 'Sourcing, Matching & Network Activation',
    description: 'Operates as a boutique talent representation agency pitching the candidate as an exclusive, high-impact asset. Compiles Executive One-Pager Candidate Teaser showcasing high-level track record and domain authority. Identifies and stages outreach to Talent Partners at major venture capital and private equity firms (Peak XV, Accel, Matrix, Lightspeed, Elevation) and retained search consultants (Michael Page, Korn Ferry, Egon Zehnder). Delivers Executive_Candidate_Teaser.gdoc and staged institutional partnership pitches.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Compile authoritative Executive One-Pager Candidate Teaser via create_document.',
      'Map relevant VC/PE talent partners and executive search recruiters.',
      'Stage bespoke institutional pitches into Gmail Drafts.',
      'Deliver single document link and review cards.'
    ],
    guardrails: ['Position candidate as a scarce, exclusive sovereign talent asset.']
  },
  {
    num: 29,
    id: 'stealth-diligence-and-backchannel-auditor',
    name: 'Stealth Diligence & Backchannel Auditor',
    department: 'Due Diligence & Culture Auditing',
    description: 'Conducts forensic due diligence on prospective employers to protect the candidate from toxic cultures, financial distress, or unstable leadership. Audits Financial & Corporate Runway (MCA filings, recent funding, burn rate estimates), Attrition & Layoff Signals (silent layoffs, engineering headcount trajectory over 6-12 months, Glassdoor/AmbitionBox trendlines), and Discreet Backchanneling questions. Delivers Employer_Health_Scorecard (Green / Amber / Red flag audit).',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Investigate public filings, MCA registers, recent funding rounds, and executive turnover.',
      'Analyze Glassdoor, AmbitionBox, and LinkedIn headcount trendlines for silent attrition signals.',
      'Synthesize audit into Employer_Health_Scorecard with clear Red/Amber/Green ratings.',
      'Deliver debrief summary with objective backchannel inquiry questions.'
    ],
    guardrails: ['Never rely on PR statements; evaluate objective financial runway and attrition facts.']
  },
  {
    num: 30,
    id: 'interview-simulator-and-debrief-coach',
    name: 'Interview Simulator & Debrief Coach',
    department: 'Interview Simulation & Intelligence',
    description: 'Conducts structured, realistic mock interviews, prepares comprehensive company briefings, and assists with post-round debriefs. Formats: Behavioral drills (STAR method calibration: Situation, Task, Action, Result), Functional problem-solving (live case studies, system design breakdowns, product metrics), and Reverse interview mastery (supplying 3 insightful questions to ask the interviewer demonstrating deep strategic grasp). Delivers Company_Intelligence_Brief.gdoc and post-interview thank-you note draft.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Prepare Company_Intelligence_Brief with interviewer background and strategic priorities.',
      'Run interactive STAR drills, asking one question at a time with crisp feedback.',
      'Equip candidate with 3 high-impact reverse interview questions.',
      'Stage post-round thank-you note in Gmail Drafts.'
    ],
    guardrails: ['Every mock response must be calibrated for conciseness and punchy STAR metrics.']
  },
  {
    num: 31,
    id: 'hike-maximization-and-offer-arbitrage-tactician',
    name: 'Hike Maximization & Offer Arbitrage Tactician',
    department: 'Compensation, Hike Hacks & Terms Arbitrage',
    description: 'Deploys strategic levers and industry hacks to maximize in-hand hike, equity upside, and protective employment terms. The Strategic Playbook: Fixed vs. Variable Arbitrage (insists on fixed base maximization, counters performance bonus traps), Notice Period Arbitrage & Compression (uses buyout clauses as upfront signing cash), Multi-Offer Laddering (synchronizes final rounds within 7-day window to create competitive bidding), Signing Bonus Ringfencing (pro-rated monthly vesting vs punitive cliff clawbacks), Early Appraisal Clause (contractual 6-month review), and ESOP Exercise Shield (5-10 year PTEW). Delivers Offer_Maximization_Strategy_Memo.gdoc.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Deconstruct offer components into guaranteed fixed cash vs contingent variable traps.',
      'Formulate tactical counter-strategies (Notice buyout as bonus, 7-day multi-offer laddering, PTEW extension).',
      'Generate Offer_Maximization_Strategy_Memo via create_document.',
      'Deliver single document link with negotiation timeline.'
    ],
    guardrails: ['Strictly prioritize fixed in-hand cash and 5-10 year ESOP exercise windows.']
  },
  {
    num: 32,
    id: 'compensation-and-offer-negotiation-desk',
    name: 'Compensation & Offer Negotiation Desk',
    department: 'Compensation, Hike Hacks & Terms Arbitrage',
    description: 'Audits complex multi-component compensation packages and builds mathematical models comparing net real-world earnings. Modeling Features: Indian/Global tax optimization (in-hand monthly breakdown accounting for standard deductions, allowances, PF, and tax brackets), Multi-offer scenario simulator (comparing 3+ competing offers on total cash, equity expected value, commute costs, and health insurance), and Counter-offer email scripts citing market benchmarks. Delivers Compensation_Comparison_Model.gsheet and negotiation email drafts.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Audit offer salary slips, allowances, PF contributions, and tax deductions.',
      'Model 3+ competing offers in dynamic Google Sheet with automated net-takehome formulas.',
      'Compose diplomatic, data-backed counter-proposal staged in Gmail Drafts.',
      'Provide single spreadsheet link and Action Card.'
    ],
    guardrails: ['Always calculate real post-tax in-hand monthly net cash, not inflated annual CTC.']
  },
  {
    num: 33,
    id: 'job-campaign-pipeline-and-cadence-tracker',
    name: 'Job Campaign Pipeline & Cadence Tracker',
    department: 'Pipeline Tracking, Exit & Onboarding',
    description: 'Central CRM managing every active opportunity, preventing follow-up slips, and balancing application velocity. Funnel Diagnostics: Tracks conversion stages (Discovered -> Staged -> Applied -> Recruiter Screen -> Case Study -> Leadership -> Offer) and identifies bottlenecks (low screen rate points to resume keywords; low case study conversion points to work sample depth). Delivers Job_Search_Master_Pipeline.gsheet integrated with Google Calendar.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Maintain living candidate CRM spreadsheet with active pipeline stages.',
      'Schedule follow-up reminder events and interview preparation blocks in Google Calendar.',
      'Diagnose conversion drop-offs across pipeline stages.',
      'Provide weekly pipeline status and calendar sync.'
    ],
    guardrails: ['Never let an active application go more than 5 business days without staged follow-up.']
  },
  {
    num: 34,
    id: 'resignation-and-onboarding-transition-navigator',
    name: 'Resignation & Onboarding Transition Navigator',
    department: 'Pipeline Tracking, Exit & Onboarding',
    description: 'Manages notice period diplomacy, counter-offer psychology, statutory settlements, and the first 90 days ramp-up. Key Capabilities: Drafts graceful, bridge-preserving resignation letters, deconstructs current employer counter-offers to highlight hidden risks of staying, tracks statutory clearances (PF transfer/UAN mapping, Gratuity eligibility, leave encashment calculations, experience letter releases), and builds First_90_Days_Gameplan.gdoc for Day-1 momentum.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Draft elegant, bridge-preserving resignation letter staged in Gmail Drafts.',
      'Calculate statutory dues: Gratuity, PF transfer checklist, and leave encashment.',
      'Synthesize Day 1 to Day 90 strategic impact milestones via create_document.',
      'Deliver single document link and transition timeline.'
    ],
    guardrails: ['Preserve professional relationships; deconstruct counter-offer retention traps diplomatically.']
  },
  {
    num: 35,
    id: 'tailored-outreach-and-pitch-copywriter',
    name: 'Tailored Outreach & Pitch Copywriter',
    department: 'Pipeline Tracking, Exit & Onboarding',
    description: 'Crafts bespoke written communications tailored specifically to the company, role seniority, and hiring team\'s current focus. Output Standards: Zero generic clichés ("I am writing to express my interest..."), context-calibrated tone (Formal Corporate vs. High-Velocity Startup), direct attachment integration pointing to tailored resume variant and portfolio HTML link. Delivers staged messages inside the user\'s Gmail Drafts folder.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Analyze role seniority and company culture tone.',
      'Draft bespoke outreach copy without boilerplate cliches.',
      'Stage complete message into user\'s Gmail Drafts folder with clear subject line.',
      'Present 1-tap review card to the user.'
    ],
    guardrails: ['Strictly zero clichés; every outreach note must be unique and context-calibrated.']
  },
  {
    num: 36,
    id: 'stealth-application-and-read-only-safety-gate',
    name: 'Stealth Application & Read-Only Safety Gate',
    department: 'Foundational Safety Gatekeeper',
    description: 'FOUNDATIONAL GATEKEEPER. Enforces the inviolable safety constraint: No automated external communication. Protocol & Enforcement: Intercepts any proposed external send action and diverts output into local staging environments (Emails -> Gmail DRAFTS folder, WhatsApp -> Native https://wa.me/ URI ready for phone launch, Portals -> Pre-filled fields in Portal_Application_Brief.gdoc). Renders an interactive Action Card in Life OS Center Cockpit: [ Review & Open Draft ] / [ Reject ].',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Intercept any proposed outbound transmission (email, message, web form).',
      'Stage into user\'s Gmail Drafts, native wa.me link, or application brief doc.',
      'Render interactive approval Action Card with clear Review / Discard buttons.',
      'Wait for human 1-tap approval before candidate transmits externally.'
    ],
    guardrails: [
      'Zero Autonomous Transmission: Life OS will never independently transmit messages externally.',
      'Mandatory Human-in-the-Loop Approval for every outbound communication.'
    ]
  }
];

// --- 6 NEW BUSINESS, SALARIED & OUTREACH SKILLS ---
export const BUSINESS_AND_PROFESSIONAL_SKILLS: SkillDefinition[] = [
  {
    num: 37,
    id: 'whatsapp-omnichannel-communicator',
    name: 'WhatsApp 1-Tap Omnichannel Communicator',
    department: 'Business & Outreach Operations',
    description: 'Generates instant 1-tap WhatsApp message links (https://wa.me/<number>?text=...) with URL-encoded tailored messaging for customer outreach, vendor negotiations, payment follow-ups, meeting confirmations, and candidate catch-ups. Includes interactive WhatsApp Action Cards in chat.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Extract recipient phone number, contact name, and message intent.',
      'Sanitize phone into international format (e.g. 919876543210).',
      'Craft concise, polite, actionable message text with clear call-to-action.',
      'Call generate_whatsapp_link tool or build https://wa.me/ URI with URL-encoded text.',
      'Present interactive WhatsApp Action Card with direct [ Open WhatsApp Chat ] button.'
    ],
    guardrails: [
      'Always URL-encode the text parameter completely.',
      'Never send messages autonomously; always provide 1-tap human launch link.',
      'Ensure international dialing code is present without plus or spaces in the URL.'
    ]
  },
  {
    num: 38,
    id: 'direct-call-briefing-and-dialer',
    name: 'Executive Direct Call Dialer & Briefing Desk',
    department: 'Executive Communications',
    description: 'Prepares pre-call intelligence briefings (talking points, objectives, leverage points, landmines to avoid) paired with 1-tap direct dialer (tel:<number>) phone links. Automatically stages post-call notes in Google Keep or Tasks.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Identify contact name, telephone number, and call objective.',
      'Structure executive pre-call briefing: Objective, 3 Key Talking Points, Leverage Points, and Landmines to avoid.',
      'Call create_call_briefing tool or output direct tel:<number> dialer link.',
      'Offer to create a Google Keep note or Google Tasks follow-up for post-call logging.'
    ],
    guardrails: [
      'Ensure phone link uses standard tel:<number> format.',
      'Keep pre-call briefing crisp: 3 talking points maximum to enable rapid skim-reading before dialing.'
    ]
  },
  {
    num: 39,
    id: 'vendor-procurement-and-rfq-matcher',
    name: 'Vendor Procurement, RFQ & Cost Optimizer',
    department: 'Business Operations & Procurement',
    description: 'Discovers, compares, and procures suppliers, contractors, SaaS, and professional services. Drafts RFQ briefs, builds side-by-side cost & deliverable comparison matrices in Google Sheets, and scripts negotiation counter-offers.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Assess vendor category, scope of work, timeline, and budget constraints.',
      'Conduct autonomous web search to identify top-rated suppliers or service providers.',
      'Build side-by-side vendor comparison matrix in Google Sheets (Vendor, Price, Scope, SLA, Rating, Contact, Status).',
      'Draft standardized RFQ outreach notes or WhatsApp inquiry messages.',
      'Return single master link to comparison Google Sheet.'
    ],
    guardrails: [
      'Always include at least 3 comparable vendor options with transparent pricing or quote ranges.',
      'Use uppercase bold headers in the Google Sheet matrix.'
    ]
  },
  {
    num: 40,
    id: 'b2b-customer-outreach-engine',
    name: 'Customer Connect & Multi-Touch Outreach Engine',
    department: 'Sales & Customer Outreach',
    description: 'Drives high-converting customer connect pipelines across Gmail and WhatsApp. Automatically structures target lead lists in Google Sheets with status tracking (Pitched, Followed Up, Demo Scheduled, Closed Won) and ready-to-send messages.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Identify ideal customer profile (ICP), industry niche, and core value proposition.',
      'Synthesize customized multi-touch outreach sequence (Cold Email Touch 1, WhatsApp Touch 2, Value Add Touch 3).',
      'Create or update Google Sheets Customer Outreach Tracker with columns: PROSPECT_NAME, COMPANY, EMAIL, PHONE, STATUS, LAST_TOUCH.',
      'Stage email drafts in Gmail Drafts folder or generate 1-tap WhatsApp launch links.',
      'Deliver summary with link to tracker sheet.'
    ],
    guardrails: [
      'Zero robotic spam; every outreach message must highlight specific relevance to the prospect.',
      'Always stage drafts for human review before transmission.'
    ]
  },
  {
    num: 41,
    id: 'business-entity-and-compliance-setup',
    name: 'Business Entity, Incorporation & Compliance Setup',
    department: 'Entrepreneurship & Business Setup',
    description: 'Guides entrepreneurs and founders from zero-to-one company setup: entity selection (Proprietorship, LLP, Pvt Ltd, LLC), GST/tax registration, founder agreements, trademark filing, banking setup, and compliance checklists in Google Keep.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Evaluate business model, co-founder equity split, liability profile, and funding intent.',
      'Recommend optimal corporate structure (LLP vs Private Limited vs LLC).',
      'Create step-by-step incorporation and compliance checklist in Google Keep.',
      'Draft Founders Agreement or Core Term Sheet in Google Docs.',
      'List statutory annual filings, tax registration steps (GST, PAN, TAN), and current bank account prerequisites.'
    ],
    guardrails: [
      'Clearly outline statutory compliance deadlines and penalties.',
      'Provide structured checklist in Google Keep so the founder can tick items off sequentially.'
    ]
  },
  {
    num: 42,
    id: 'salaried-career-growth-and-appraisal-maximizer',
    name: 'Salaried Career Growth & Appraisal Maximizer',
    department: 'Corporate Career Excellence',
    description: 'Empowers salaried corporate professionals to navigate performance appraisal cycles, build high-impact brag sheets in Google Docs, manage upwards with skip-level leaders, secure promotions, and negotiate salary raises.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Collect annual achievements, key business metrics impacted, and leadership contributions.',
      'Generate executive "Brag Sheet & Impact Dossier" in Google Docs with quantified business outcomes.',
      'Formulate promotion pitch script and salary revision counter-offer talking points.',
      'Draft 1-on-1 manager agenda and quarterly career development check-in framework in Google Tasks.',
      'Provide single master link to the finished Impact Dossier doc.'
    ],
    guardrails: [
      'Focus purely on measurable business outcomes ($ revenue saved/earned, hours cut, throughput increase) rather than mere effort.',
      'Zero defensive language; frame everything as mutual stakeholder alignment.'
    ]
  }
];

// --- 10 SPECIALIZED PERSONA SKILLS (Students, Professionals, Seniors, Admins) ---
export const SPECIALIZED_PERSONA_SKILLS: SkillDefinition[] = [
  {
    num: 143,
    id: 'student-concept-synthesizer',
    name: 'Student Concept Synthesizer & Feynman Explainer',
    department: 'Education & Academia',
    description: 'Breaks down complex academic subjects, college STEM theories, and dense textbooks using the Feynman technique, analogies, and active-recall flashcard summaries in Google Keep or Docs.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Analyze student topic, syllabus level, and specific concept bottleneck.',
      'Explain core principles using intuitive real-world analogies (no academic jargon).',
      'Generate 5 active-recall Q&A flashcards and a 1-page visual study summary.',
      'Optionally export to Google Docs or create revision tasks in Google Tasks with spaced repetition dates.'
    ],
    guardrails: [
      'Never copy-paste raw definitions; rephrase with intuitive first-principles explanations.',
      'Keep study summaries structured with bullet points and bold terminology.'
    ]
  },
  {
    num: 144,
    id: 'student-exam-strategy-and-mock-analyzer',
    name: 'Competitive Exam Strategy & Mock Error Analyzer',
    department: 'Education & Exam Prep',
    description: 'Analyzes mock test scores, diagnostic question logs, and negative marking patterns for competitive exams (UPSC, JEE, NEET, GRE, GMAT, CAT). Creates targeted remedial revision schedules in Google Calendar.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Review mock test score breakdown, accuracy percentage, and time spent per section.',
      'Isolate recurring error categories: Conceptual gaps vs Calculation slips vs Time panic.',
      'Build remedial action plan in Google Sheets (Weak topic, Revision source, Next mock target).',
      'Schedule dedicated 90-minute deep-focus revision blocks in Google Calendar.'
    ],
    guardrails: [
      'Focus ruthlessly on reducing negative marking and unforced errors.',
      'Ensure revision blocks have clear stop times to prevent student burnout.'
    ]
  },
  {
    num: 145,
    id: 'preschool-and-franchise-operations',
    name: 'Pre-School & Franchise Operations Manager',
    department: 'Business & Franchise Operations',
    description: 'Manages early-childhood academy, daycare, and franchise branch operations: parent communication circulars, monthly fee reconciliation ledgers in Google Sheets, teacher staffing schedules, and regulatory compliance checklists.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Assess operational inquiry: Parent notices, fee rosters, nutrition menus, or event logistics.',
      'Draft warm, reassuring, professional parent broadcasts ready for WhatsApp or email distribution.',
      'Maintain fee dues, admissions pipeline, and petty cash logs in Google Sheets.',
      'Create safety compliance inspection checklists in Google Tasks.'
    ],
    guardrails: [
      'Tone must always be warm, empathetic, and reassuring when addressing parents.',
      'Strictly anonymize child medical and identifying information in shared logs.'
    ]
  },
  {
    num: 146,
    id: 'stock-trader-journal-and-risk-ledger',
    name: 'Stock Trader Trade Journal & Risk Capital Desk',
    department: 'Finance & Trading',
    description: 'Logs trading entries, setups, risk-reward ratios, stop-losses, and psychological notes in Google Sheets. Enforces strict 1-2% capital risk rules and calculates expectancy metrics.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Record trade details: Ticker, Position (Long/Short), Entry, Target, Stop-Loss, Position Size.',
      'Calculate Capital at Risk %, Risk-to-Reward ratio (R:R), and position expectancy in Google Sheets.',
      'Log pre-trade rationale and emotional state (e.g. FOMO vs Disciplined Setup).',
      'Highlight weekly win-rate, profit factor, and max drawdown trends.'
    ],
    guardrails: [
      'Flag any trade risking >2% of total portfolio capital with high-priority risk warnings.',
      'Never provide financial advice; enforce discipline, journaling, and mathematical risk management.'
    ]
  },
  {
    num: 147,
    id: 'professional-services-client-desk',
    name: 'Professional Practice Client Desk (CA, Legal, Medical, Architecture)',
    department: 'Professional Practice',
    description: 'Coordinates client retainers, filing deadlines (GST, ITR, court dates, patient consultations, blueprint milestones), engagement letters, and fee invoicing for self-employed professionals.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Identify client domain: Tax/Audit (CA), Litigation/Corporate (Lawyer), Clinical (Doctor), Design (Architect).',
      'Draft standardized engagement letter, NDA, or fee retainer quotation in Google Docs.',
      'Log statutory filing deadlines and hearing/appointment dates into Google Calendar and Tasks.',
      'Track client deliverables, document submissions, and billing status in Google Sheets.'
    ],
    guardrails: [
      'Always maintain client confidentiality and professional ethical disclaimer headers.',
      'Include statutory deadline buffer of at least 48 hours in calendar reminders.'
    ]
  },
  {
    num: 148,
    id: 'content-creator-growth-and-sponsorship-engine',
    name: 'Content Creator Sponsorship & Audience Engine',
    department: 'Freelance & Creator Economy',
    description: 'Orchestrates content calendars, YouTube/Instagram/LinkedIn script outlines, brand sponsorship pitch decks in Google Slides, rate card negotiation briefs, and deliverable tracking ledgers.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Define content niche, platform format (Shorts, Long-form, Newsletter), and target audience demographic.',
      'Structure high-retention video/post scripts with 3-second hook, body value spikes, and engaging CTA.',
      'Generate brand sponsorship rate card proposals and outreach pitches for PR managers.',
      'Track sponsored deliverables, view milestones, and payment disbursements in Google Sheets.'
    ],
    guardrails: [
      'Ensure script hooks hook the audience within the first 15 words.',
      'Include standard FTC/ASC sponsorship disclosure reminders in all promotional scripts.'
    ]
  },
  {
    num: 149,
    id: 'senior-vitality-and-medication-guardian',
    name: 'Senior Vitality, Medication & Daily Check-in Guardian',
    department: 'Senior Life & Vitality',
    description: 'Provides ultra-simple, high-contrast, uncluttered reminders for prescription medicines, doctor appointments, daily walks, and family check-in notifications. Designed with zero confusion.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Log senior prescription schedule: Dosage, timing (morning/afternoon/night), and food instructions.',
      'Set gentle, loud, clear recurring reminders in Google Calendar and Tasks.',
      'Draft 1-tap WhatsApp "I am doing well today" reassurance updates to send to family members.',
      'Organize upcoming medical checkups and diagnostic lab tests with simple checklists.'
    ],
    guardrails: [
      'Use ultra-simple, polite, large-print clear instructions without medical or tech jargon.',
      'Never modify medication dosages autonomously; always confirm with family or doctor.'
    ]
  },
  {
    num: 150,
    id: 'admin-system-auto-healer',
    name: 'Admin System Self-Healer & Bug Diagnostic Sentinel',
    department: 'Admin & DevOps Governance',
    description: 'Monitors real-time API error rates, broken tool executions, token exhaustion, and client exceptions. Automatically diagnoses root cause, recommends code fixes, and prompts admin for 1-tap approval.',
    enabled: true,
    allowedTiers: ['ADMIN'],
    workflow: [
      'Aggregate system logs, API status codes, and user error telemetry.',
      'Isolate failure domain: OAuth expiry, quota limit, malformed JSON, or UI crash.',
      'Generate root-cause analysis report with precise fix recommendations.',
      'Present 1-tap approval card to admin to execute healing rollback or key rotation.'
    ],
    guardrails: [
      'Admin approval is strictly required before any state-altering remediation is executed.',
      'All diagnostic logs must be sanitized of PII and private user tokens.'
    ]
  },
  {
    num: 151,
    id: 'admin-business-strategist-and-market-intel',
    name: 'Admin Business Growth Strategist & Market Intelligence Desk',
    department: 'Admin Executive Intelligence',
    description: 'Synthesizes platform user adoption, cohort retention, feature engagement, market competitor trends, pricing tier viability, and revenue forecasting into executive briefings in Google Slides & Sheets.',
    enabled: true,
    allowedTiers: ['ADMIN'],
    workflow: [
      'Ingest active user metrics, retention cohorts, and feature utilization patterns.',
      'Scan market intelligence, competitor pricing shifts, and emerging enterprise AI needs.',
      'Build executive financial forecast model and user acquisition funnel in Google Sheets.',
      'Generate quarterly strategy pitch deck in Google Slides for founders and leadership.'
    ],
    guardrails: [
      'Ensure forecasts distinguish between organic user growth and churn trends.',
      'Provide actionable growth hypotheses with clear risk-adjusted downside scenarios.'
    ]
  },
  {
    num: 152,
    id: 'admin-user-and-org-governance',
    name: 'Admin User Governance, Skill Pack & Quota Allocator',
    department: 'Admin Platform Governance',
    description: 'Enables administrators to inspect users, assign or revoke specialized skill packs, adjust token rate limits, provision family/team seats, and enforce enterprise governance policies.',
    enabled: true,
    allowedTiers: ['ADMIN'],
    workflow: [
      'Inspect user account profile, assigned persona, and current skill pack entitlements.',
      'Toggle active skill packs (e.g. Student Essentials, Executive Suite, Healthcare Practice).',
      'Configure API key quotas, rate limits, and multi-tenant security boundaries.',
      'Audit family and team member invitations and domain-level authentication rules.'
    ],
    guardrails: [
      'Never expose raw API keys or passwords in the admin audit log.',
      'Enforce least-privilege access; warn admin when granting platform-wide privileges.'
    ]
  }
];

const LIFE_OS_100_SKILLS: SkillDefinition[] = rawLifeOsSkills as unknown as SkillDefinition[];

// --- COMBINED MASTER CATALOG (152 SKILLS TOTAL) ---
export const CORE_MASTER_SKILLS: SkillDefinition[] = [
  ...BASE_APP_AND_CAREER_SKILLS,
  ...BUSINESS_AND_PROFESSIONAL_SKILLS,
  ...LIFE_OS_100_SKILLS,
  ...SPECIALIZED_PERSONA_SKILLS,
];

export const INITIAL_100_SKILLS: SkillDefinition[] = CORE_MASTER_SKILLS;
export const INITIAL_53_SKILLS: SkillDefinition[] = CORE_MASTER_SKILLS;

/**
 * Smart skill matcher that finds ALL relevant skills for the user's prompt
 * to support multi-skill chaining when a prompt asks for multiple tools.
 */
export function findMatchingSkills(userPrompt: string, skills: SkillDefinition[]): SkillDefinition[] {
  if (!userPrompt || !userPrompt.trim()) return [];
  const lower = userPrompt.toLowerCase();
  const matched: SkillDefinition[] = [];

  for (const s of skills) {
    if (!s.enabled) continue;
    let score = 0;

    // Direct name or ID match
    if (lower.includes(s.name.toLowerCase()) || lower.includes(s.id.toLowerCase())) {
      score += 10;
    }

    // App-specific trigger keywords
    if (s.id === 'workspace-docs-architect' && (lower.includes('doc') || lower.includes('document') || lower.includes('brief') || lower.includes('sop') || lower.includes('proposal'))) score += 5;
    if (s.id === 'workspace-sheets-modeler' && (lower.includes('sheet') || lower.includes('spreadsheet') || lower.includes('excel') || lower.includes('tracker') || lower.includes('ledger') || lower.includes('financial') || lower.includes('budget') || lower.includes('formula'))) score += 5;
    if (s.id === 'workspace-slides-designer' && (lower.includes('slide') || lower.includes('presentation') || lower.includes('deck') || lower.includes('ppt') || lower.includes('pitch'))) score += 5;
    if (s.id === 'workspace-calendar-strategist' && (lower.includes('calendar') || lower.includes('schedule') || lower.includes('meeting') || lower.includes('event') || lower.includes('book') || lower.includes('appointment'))) score += 5;
    if (s.id === 'workspace-tasks-commander' && (lower.includes('task') || lower.includes('todo') || lower.includes('deadline') || lower.includes('deliverable') || lower.includes('action item'))) score += 5;
    if (s.id === 'workspace-keep-notes' && (lower.includes('note') || lower.includes('keep') || lower.includes('checklist') || lower.includes('grocery') || lower.includes('packing'))) score += 5;
    if (s.id === 'workspace-gmail-intelligence' && (lower.includes('email') || lower.includes('gmail') || lower.includes('inbox') || lower.includes('draft') || lower.includes('mail'))) score += 5;
    if (s.id === 'workspace-drive-librarian' && (lower.includes('drive') || lower.includes('file') || lower.includes('folder') || lower.includes('share') || lower.includes('permission'))) score += 5;
    if (s.id === 'workspace-forms-creator' && (lower.includes('form') || lower.includes('survey') || lower.includes('questionnaire') || lower.includes('intake') || lower.includes('registration'))) score += 5;
    if (s.id === 'workspace-gemini-notebooks' && (lower.includes('notebook') || lower.includes('deep research') || lower.includes('literature') || lower.includes('paper') || lower.includes('citations'))) score += 5;
    if (s.id === 'meta-html-ui-designer' && (lower.includes('html') || lower.includes('ui') || lower.includes('dashboard') || lower.includes('widget') || lower.includes('calculator') || lower.includes('preview'))) score += 5;
    if (s.id === 'meta-deep-research' && (lower.includes('search') || lower.includes('look up') || lower.includes('find out') || lower.includes('google') || lower.includes('internet') || lower.includes('web'))) score += 5;
    if (s.id === 'meta-inbox-sweeper-tasks' && (lower.includes('scan my email') || lower.includes('extract task') || lower.includes('check mail') || lower.includes('sweep'))) score += 6;
    if (s.id === 'meta-outcome-roadmap' && (lower.includes('roadmap') || lower.includes('project plan') || lower.includes('timeline') || lower.includes('milestone') || lower.includes('by next'))) score += 5;

    // SAVIA CAREER OS TRIGGER KEYWORDS
    if (s.id === 'ats-resume-and-impact-bullet-synthesizer' && (lower.includes('resume') || lower.includes('cv') || lower.includes('ats') || lower.includes('bullet') || lower.includes('job application'))) score += 7;
    if (s.id === 'multi-board-job-scout-and-matchmaker' && (lower.includes('job') || lower.includes('career') || lower.includes('vacancy') || lower.includes('hiring') || lower.includes('role') || lower.includes('hunt') || lower.includes('matchmaker'))) score += 6;
    if (s.id === 'candidate-aspiration-and-criteria-inquisitor' && (lower.includes('salary expectation') || lower.includes('non-negotiable') || lower.includes('in-hand') || lower.includes('ctc') || lower.includes('criteria') || lower.includes('mandate'))) score += 6;
    if (s.id === 'career-trajectory-and-pivot-architect' && (lower.includes('pivot') || lower.includes('switch industry') || lower.includes('career change') || lower.includes('trajectory') || lower.includes('milestones'))) score += 6;
    if (s.id === 'portal-profile-synthesizer-and-seo-optimizer' && (lower.includes('linkedin') || lower.includes('naukri') || lower.includes('profile') || lower.includes('instahyre') || lower.includes('wellfound') || lower.includes('bio'))) score += 6;
    if (s.id === 'bespoke-work-sample-and-proof-of-work-architect' && (lower.includes('work sample') || lower.includes('proof of work') || lower.includes('teardown') || lower.includes('90 day plan') || lower.includes('case study'))) score += 7;
    if (s.id === 'interview-simulator-and-debrief-coach' && (lower.includes('interview') || lower.includes('mock') || lower.includes('star method') || lower.includes('debrief') || lower.includes('interviewer'))) score += 7;
    if (s.id === 'hike-maximization-and-offer-arbitrage-tactician' && (lower.includes('hike') || lower.includes('offer negotiation') || lower.includes('counter-offer') || lower.includes('signing bonus') || lower.includes('esop') || lower.includes('notice period'))) score += 7;
    if (s.id === 'compensation-and-offer-negotiation-desk' && (lower.includes('compensation') || lower.includes('salary breakdown') || lower.includes('in-hand cash') || lower.includes('compare offer') || lower.includes('comp package'))) score += 7;
    if (s.id === 'resignation-and-onboarding-transition-navigator' && (lower.includes('resignation') || lower.includes('resign') || lower.includes('notice period') || lower.includes('gratuity') || lower.includes('onboarding'))) score += 7;
    if (s.id === 'tailored-outreach-and-pitch-copywriter' && (lower.includes('cold email') || lower.includes('outreach') || lower.includes('pitch') || lower.includes('inmail') || lower.includes('recruiter email'))) score += 6;
    if (s.id === 'multi-variant-static-portfolio-deployer' && (lower.includes('portfolio') || lower.includes('static website') || lower.includes('personal site') || lower.includes('showcase'))) score += 6;
    if (s.id === 'stealth-diligence-and-backchannel-auditor' && (lower.includes('due diligence') || lower.includes('toxic') || lower.includes('runway') || lower.includes('layoffs') || lower.includes('culture audit'))) score += 6;
    if (s.id === 'stealth-application-and-read-only-safety-gate' && (lower.includes('safety gate') || lower.includes('read-only') || lower.includes('staging') || lower.includes('approval'))) score += 6;

    // BUSINESS, SALARIED & OUTREACH TRIGGER KEYWORDS
    if (s.id === 'whatsapp-omnichannel-communicator' && (lower.includes('whatsapp') || lower.includes('wa.me') || lower.includes('wa message') || lower.includes('text client') || lower.includes('chat on wa'))) score += 8;
    if (s.id === 'direct-call-briefing-and-dialer' && (lower.includes('call') || lower.includes('dial') || lower.includes('phone') || lower.includes('talking points') || lower.includes('pre-call') || lower.includes('briefing'))) score += 7;
    if (s.id === 'vendor-procurement-and-rfq-matcher' && (lower.includes('vendor') || lower.includes('rfq') || lower.includes('supplier') || lower.includes('contractor') || lower.includes('procurement') || lower.includes('quote') || lower.includes('quotation'))) score += 7;
    if (s.id === 'b2b-customer-outreach-engine' && (lower.includes('outreach') || lower.includes('customer connect') || lower.includes('leads') || lower.includes('cold email') || lower.includes('prospect') || lower.includes('sales pipeline'))) score += 7;
    if (s.id === 'business-entity-and-compliance-setup' && (lower.includes('business setup') || lower.includes('incorporat') || lower.includes('llp') || lower.includes('pvt ltd') || lower.includes('gst') || lower.includes('company registration') || lower.includes('startup setup'))) score += 7;
    if (s.id === 'salaried-career-growth-and-appraisal-maximizer' && (lower.includes('appraisal') || lower.includes('promotion') || lower.includes('raise') || lower.includes('salaried') || lower.includes('performance review') || lower.includes('brag sheet') || lower.includes('skip-level'))) score += 7;

    // SPECIALIZED PERSONA TRIGGER KEYWORDS
    if (s.id === 'student-concept-synthesizer' && (lower.includes('feynman') || lower.includes('study concept') || lower.includes('textbook') || lower.includes('explain simply') || lower.includes('flashcard') || lower.includes('student'))) score += 7;
    if (s.id === 'student-exam-strategy-and-mock-analyzer' && (lower.includes('mock') || lower.includes('exam') || lower.includes('upsc') || lower.includes('jee') || lower.includes('neet') || lower.includes('gre') || lower.includes('gmat') || lower.includes('cat') || lower.includes('negative marking'))) score += 8;
    if (s.id === 'preschool-and-franchise-operations' && (lower.includes('preschool') || lower.includes('daycare') || lower.includes('franchise') || lower.includes('parent circular') || lower.includes('fee dues') || lower.includes('teacher staffing'))) score += 8;
    if (s.id === 'stock-trader-journal-and-risk-ledger' && (lower.includes('trade journal') || lower.includes('trading') || lower.includes('stock') || lower.includes('risk reward') || lower.includes('stop loss') || lower.includes('capital at risk'))) score += 8;
    if (s.id === 'professional-services-client-desk' && (lower.includes('retainer') || lower.includes('client desk') || lower.includes('lawyer') || lower.includes('doctor') || lower.includes('architect') || lower.includes('filing deadline') || lower.includes('hearing'))) score += 7;
    if (s.id === 'content-creator-growth-and-sponsorship-engine' && (lower.includes('content creator') || lower.includes('youtube script') || lower.includes('sponsorship') || lower.includes('rate card') || lower.includes('creator economy') || lower.includes('brand deal'))) score += 8;
    if (s.id === 'senior-vitality-and-medication-guardian' && (lower.includes('medicine') || lower.includes('prescription') || lower.includes('doctor appointment') || lower.includes('senior') || lower.includes('check-in') || lower.includes('health reminder'))) score += 8;
    if (s.id === 'admin-system-auto-healer' && (lower.includes('auto heal') || lower.includes('bug report') || lower.includes('diagnostic') || lower.includes('api crash') || lower.includes('system error') || lower.includes('token exhausted'))) score += 8;
    if (s.id === 'admin-business-strategist-and-market-intel' && (lower.includes('business strategy') || lower.includes('market intel') || lower.includes('cohort retention') || lower.includes('pricing tier') || lower.includes('growth forecast'))) score += 8;
    if (s.id === 'admin-user-and-org-governance' && (lower.includes('user governance') || lower.includes('assign skill') || lower.includes('tenant') || lower.includes('admin quota') || lower.includes('rate limit'))) score += 8;

    // Description word matching
    const descWords = s.description.toLowerCase().split(/\s+/).filter(w => w.length > 5);
    for (const w of descWords) {
      if (lower.includes(w)) score += 1;
    }

    if (score >= 4) {
      matched.push(s);
    }
  }

  return matched;
}

/**
 * Backwards compatibility: find single best matching skill
 */
export function findMatchingSkill(userPrompt: string, skills: SkillDefinition[]): SkillDefinition | null {
  const matched = findMatchingSkills(userPrompt, skills);
  return matched.length > 0 ? matched[0] : null;
}

/**
 * Formats a skill's full prompt instructions including questions, parameters, and workflow
 */
export function formatSkillPrompt(skill: SkillDefinition): string {
  let prompt = `### ACTIVE SKILL: ${skill.name} (${skill.department})\n`;
  prompt += `**Objective**: ${skill.description}\n\n`;

  if (skill.quickQuestions && skill.quickQuestions.length > 0) {
    prompt += `**Quick-Select Setup Questions (Ask ONLY if user hasn't already provided this context)**:\n`;
    skill.quickQuestions.forEach((q, idx) => {
      prompt += `${idx + 1}. **${q.title}** ${q.prompt}\n`;
      if (q.options && q.options.length > 0) {
        q.options.forEach(opt => {
          prompt += `   - ${opt}\n`;
        });
      }
    });
    prompt += `\n*Rule: Format clarifying questions as multiple-choice options with '- [A] Choice 1', '- [B] Choice 2' so the user can easily tap to answer.*\n\n`;
  }

  if (skill.parameters && skill.parameters.length > 0) {
    prompt += `**Configuration Parameters (Fill-in-the-Blanks)**:\n`;
    skill.parameters.forEach(p => {
      prompt += `- \`${p.name}\`: ${p.description} (Fallback: ${p.defaultFallback || 'sensible default'})\n`;
    });
    prompt += `\n`;
  }

  if (skill.workflow && skill.workflow.length > 0) {
    prompt += `**Operational Workflow**:\n`;
    skill.workflow.forEach((step, idx) => {
      prompt += `${idx + 1}. ${step}\n`;
    });
    prompt += `\n`;
  }

  if (skill.guardrails && skill.guardrails.length > 0) {
    prompt += `**Guardrails & Gotchas**:\n`;
    skill.guardrails.forEach(g => {
      prompt += `- ${g}\n`;
    });
    prompt += `\n`;
  }

  return prompt;
}

/**
 * Intelligent Markdown Skill Parser — Multi-Format
 * Handles these markdown formats:
 *   Format A: ## 1. Skill Name           (numbered heading)
 *   Format B: ### Skill 1: Skill Name    (skill-prefixed heading)
 *   Format C: ## Skill Name / ### Name   (plain heading, no number)
 *   Format D: 3.1 candidate-inquisitor   (dotted numbering)
 *   Format E: - **Skill Name**: desc     (bullet list)
 */
export function parseSkillsFromMarkdown(markdownText: string): SkillDefinition[] {
  if (!markdownText || !markdownText.trim()) return [];

  const skills: SkillDefinition[] = [];

  // Match: "## 1. Name", "### 3.1 Name", "3.1 Name", "### Skill 1: Name", "## Name"
  const headingPattern = /^(?:(#{2,4})\s+)?(?:Skill\s+)?(\d+(?:\.\d+)*)?[.:\s]*\s*([A-Za-z0-9_\-\s]{3,120})$/gm;
  const headings: { index: number; level: number; num: number; title: string }[] = [];
  let hMatch;

  while ((hMatch = headingPattern.exec(markdownText)) !== null) {
    const title = hMatch[3].trim();
    if (!title || /^part\s+\d/i.test(title) || /^table\s+of/i.test(title) || /^appendix/i.test(title) || /^stage\s+\d/i.test(title)) continue;
    headings.push({
      index: hMatch.index,
      level: hMatch[1]?.length || 3,
      num: hMatch[2] ? parseFloat(hMatch[2]) || 0 : 0,
      title,
    });
  }

  // Extract body between consecutive headings
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const bodyStart = markdownText.indexOf('\n', h.index);
    const bodyEnd = i + 1 < headings.length ? headings[i + 1].index : markdownText.length;
    if (bodyStart < 0) continue;
    const body = markdownText.slice(bodyStart, bodyEnd);

    const parsed = extractSkillFromBody(h.title, body, Math.floor(h.num) || (i + 1));
    if (parsed) skills.push(parsed);
  }

  // Bullet-list fallback
  if (skills.length === 0) {
    const bulletPattern = /^[-*•]\s+\*\*([^*]+)\*\*[:\s]*(.+)$/gm;
    let bMatch;
    let bNum = 1;
    while ((bMatch = bulletPattern.exec(markdownText)) !== null) {
      const name = bMatch[1].trim();
      const desc = bMatch[2].trim();
      if (name.length < 3 || name.length > 120) continue;
      skills.push({
        num: bNum,
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        name,
        department: 'General Operations',
        description: desc,
        enabled: true,
        allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
      });
      bNum++;
    }
  }

  return skills;
}

/** Helper: extract a SkillDefinition from a heading title + body block */
function extractSkillFromBody(title: string, body: string, fallbackNum: number): SkillDefinition | null {
  const kv = (key: string): string => {
    const patterns = [
      new RegExp(`(?:\\*\\*|●\\s*|\\*\\s*)?${key}(?:\\*\\*)?\\s*:\\s*(.+)`, 'i'),
      new RegExp(`${key}\\s*:\\s*\`([^\`]+)\``, 'i'),
      new RegExp(`${key}\\s*:\\s*(.+)`, 'i'),
    ];
    for (const p of patterns) {
      const m = body.match(p);
      if (m) return m[1].trim();
    }
    return '';
  };

  const cleanTitle = title.replace(/^[\d.]+\s*/, '').replace(/[*_#`]/g, '').trim();
  const skillId = kv('Skill ID').replace(/`/g, '') || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const department = kv('Department') || kv('Subsystem') || kv('Stage') || 'Career & Operations';
  const description = kv('Purpose') || kv('Objective') || kv('Description') || kv('Trigger') || body.slice(0, 250).trim();

  const wfSteps = Array.from(body.matchAll(/\d+\.\s+\*\*([^*]+)\*\*[:\s]*([^\n]+)/g)).map(
    s => s[1].trim() + ': ' + s[2].trim()
  );

  const guardrails = Array.from(body.matchAll(/-\s+\*\*([^*]+)\*\*[:\s]*([^\n]+)/g))
    .filter(g => /guard|gotcha|rule|limit|warning|never|always/i.test(g[1] + g[2]))
    .map(g => g[1].trim() + ': ' + g[2].trim());

  return {
    num: fallbackNum,
    id: skillId,
    name: cleanTitle,
    department,
    description: description.slice(0, 400),
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: wfSteps.length > 0 ? wfSteps : undefined,
    guardrails: guardrails.length > 0 ? guardrails : undefined,
  };
}
