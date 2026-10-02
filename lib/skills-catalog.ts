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

export const CORE_MASTER_SKILLS: SkillDefinition[] = [
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
    description: 'Scans recent emails and workspace records to intuitively extract tasks for Suchi (to execute autonomously) and tasks for the user, organizing them systematically with deadlines.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: [
      'Execute list_emails with query for unread or high-priority messages.',
      'Analyze email threads for deliverables, action items, dates, and outstanding requests.',
      'Categorize tasks into: (1) Tasks Suchi can execute immediately, and (2) Tasks requiring User decision.',
      'Sync tasks into Google Tasks via create_task or note them in Keep Notes.'
    ],
    guardrails: [
      'Clearly delineate what Suchi has handled vs what the user needs to sign off on.',
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
      'Always offer a concrete action Suchi can execute immediately to resolve the blind spot.'
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
      'Pass intermediate data (e.g. data found in Gmail) into downstream tool calls (e.g. populating Google Sheet).',
      'Deliver a consolidated, concise executive summary with links to all created artifacts.'
    ],
    guardrails: [
      'Never drop any step of a multi-part prompt.',
      'Deliver a cohesive executive summary linking all created assets together.'
    ]
  }
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
 *   Format D: - **Skill Name**: desc     (bullet list)
 *
 * Extracts Skill ID, Department, Objective/Description from body content.
 * Returns EMPTY array on failure — caller decides fallback.
 */
export function parseSkillsFromMarkdown(markdownText: string): SkillDefinition[] {
  if (!markdownText || !markdownText.trim()) return [];

  const skills: SkillDefinition[] = [];

  // ---- Strategy 1: Split on heading lines (##/### with optional number) ----
  // Matches: "## 1. Name", "### Skill 1: Name", "## Name", "### Name"
  const headingPattern = /^(#{2,3})\s+(?:Skill\s+)?(\d+)?[.:\s]*\s*(.+)$/gm;
  const headings: { index: number; level: number; num: number; title: string }[] = [];
  let hMatch;

  while ((hMatch = headingPattern.exec(markdownText)) !== null) {
    const title = hMatch[3].trim();
    // Skip generic section headings (Part 1, Part 2, Table of Contents, etc.)
    if (/^part\s+\d/i.test(title) || /^table\s+of/i.test(title) || /^appendix/i.test(title)) continue;
    headings.push({
      index: hMatch.index,
      level: hMatch[1].length,
      num: hMatch[2] ? parseInt(hMatch[2], 10) : 0,
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

    // Skip headings that are clearly section titles (no skill-like content)
    const hasSkillMarkers = /\*\*(?:Skill ID|Department|Objective|Description|Tool Calls|Workspace Tool|Delivery)\*\*/i.test(body)
      || /`[a-z0-9_-]+`/i.test(body)
      || body.trim().length > 50;
    if (!hasSkillMarkers && body.trim().length < 30) continue;

    const parsed = extractSkillFromBody(h.title, body, h.num || (i + 1));
    if (parsed) skills.push(parsed);
  }

  // ---- Strategy 2: Bullet-list skills (- **Name**: description) ----
  if (skills.length === 0) {
    const bulletPattern = /^[-*]\s+\*\*([^*]+)\*\*[:\s]*(.+)$/gm;
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
  // Extract key-value fields from **Key**: Value or * **Key**: Value patterns
  const kv = (key: string): string => {
    const patterns = [
      new RegExp(`\\*\\*${key}\\*\\*\\s*:\\s*(.+)`, 'i'),
      new RegExp(`${key}\\s*:\\s*\`([^\`]+)\``, 'i'),
      new RegExp(`${key}\\s*:\\s*(.+)`, 'i'),
    ];
    for (const p of patterns) {
      const m = body.match(p);
      if (m) return m[1].trim();
    }
    return '';
  };

  const skillId = kv('Skill ID').replace(/`/g, '') || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const department = kv('Department') || 'General Operations';
  const description = kv('Objective') || kv('Description') || '';

  // Extract workflow steps (numbered items with bold prefix)
  const wfSteps = Array.from(body.matchAll(/\d+\.\s+\*\*([^*]+)\*\*[:\s]*([^\n]+)/g)).map(
    s => s[1].trim() + ': ' + s[2].trim()
  );

  // Extract guardrails (bullet items with bold prefix)
  const guardrails = Array.from(body.matchAll(/-\s+\*\*([^*]+)\*\*[:\s]*([^\n]+)/g))
    .filter(g => /guard|gotcha|rule|limit|warning|never|always/i.test(g[1] + g[2]))
    .map(g => g[1].trim() + ': ' + g[2].trim());

  return {
    num: fallbackNum,
    id: skillId,
    name: title,
    department,
    description,
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    workflow: wfSteps.length > 0 ? wfSteps : undefined,
    guardrails: guardrails.length > 0 ? guardrails : undefined,
  };
}
