export interface SkillDefinition {
  id: string;
  name: string;
  department: string;
  description: string;
  enabled: boolean;
  allowedTiers: string[];
  quickQuestions?: Array<{ question: string; options?: string[] }>;
  parameters?: Array<{ name: string; description: string; defaultFallback: string }>;
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

export const INITIAL_53_SKILLS: SkillDefinition[] = [
  // Department 1: Sales, Business Development & Revenue Architecture
  {
    id: 'capital-efficiency-and-grants-scout',
    name: 'Capital Efficiency and Grants Scout',
    department: 'Sales, Business Development & Revenue Architecture',
    description: 'Identifies non-dilutive startup funding, government grants, state subsidies, and cloud credits.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    quickQuestions: [
      { question: 'Country of operations', options: ['India', 'United States', 'Singapore', 'United Kingdom'] },
      { question: "What is your venture's current stage?", options: ['Idea / Pre-Seed', 'Prototype / MVP Building', 'Early Revenue / Bootstrapped', 'Growth / Scaling'] }
    ]
  },
  {
    id: 'customer-delight-and-churn-sentinel',
    name: 'Customer Delight and Churn Sentinel',
    department: 'Sales, Business Development & Revenue Architecture',
    description: 'Monitors client feedback loops, resolves onboarding friction, and designs proactive customer retention touchpoints.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'institutional-pilot-and-sales-closer',
    name: 'Institutional Pilot and Sales Closer',
    department: 'Sales, Business Development & Revenue Architecture',
    description: 'Structures and executes 14-day institutional pilots, stakeholder alignment meetings, and commercial closing.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'needle-mover-strategy-evaluator',
    name: 'Needle Mover Strategy Evaluator',
    department: 'Sales, Business Development & Revenue Architecture',
    description: 'Applies an 80/20 Pareto filter to evaluate projects, opportunities, and tasks, ruthlessly eliminating low-yield distractions.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'prepaid-cashflow-and-revenue-architect',
    name: 'Prepaid Cashflow and Revenue Architect',
    department: 'Sales, Business Development & Revenue Architecture',
    description: 'Structures upfront pilot contracts, quarterly advances, and cashflow-positive B2B contract terms.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'pricing-psychology-and-packaging-lab',
    name: 'Pricing Psychology and Packaging Lab',
    department: 'Sales, Business Development & Revenue Architecture',
    description: 'Models SaaS subscription tiers, value-metric pricing, enterprise pricing sheets, and psychological discounting structures.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'public-procurement-and-gem-navigator',
    name: 'Public Procurement and Government Tenders Navigator',
    department: 'Sales, Business Development & Revenue Architecture',
    description: 'Navigates public procurement portals, government tenders, vendor registration, and startup exemption clauses.',
    enabled: true,
    allowedTiers: ['ADVANCED', 'ADMIN']
  },

  // Department 2: Corporate Governance, Legal, People & Security
  {
    id: 'company-governance-and-legal-builder',
    name: 'Company Governance and Legal Builder',
    department: 'Corporate Governance, Legal, People & Security',
    description: 'Organizes corporate compliance schedules, statutory tax filings, standard NDAs, client service agreements, and board resolutions.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'conflict-resolution-and-difficult-conversations',
    name: 'Conflict Resolution and Difficult Conversations',
    department: 'Corporate Governance, Legal, People & Security',
    description: 'Prepares objective negotiation frameworks, non-violent communication scripts, and calm talking points for sensitive disputes.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'crisis-and-reputation-management',
    name: 'Crisis and Reputation Management',
    department: 'Corporate Governance, Legal, People & Security',
    description: 'Prepares outage communication protocols, incident response templates, and customer contingency plans during service emergencies.',
    enabled: true,
    allowedTiers: ['ADVANCED', 'ADMIN']
  },
  {
    id: 'digital-declutter-and-cyber-hygiene-guard',
    name: 'Digital Declutter and Cyber Hygiene Guard',
    department: 'Corporate Governance, Legal, People & Security',
    description: 'Maintains credential rotation schedules, 2FA backup verification, cloud storage cleanups, and digital security hygiene.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'hiring-and-talent-vetting-desk',
    name: 'Hiring and Talent Vetting Desk',
    department: 'Corporate Governance, Legal, People & Security',
    description: 'Develops objective role scorecards, work-sample test tasks, and structured behavioral interview rubrics for vetting candidates.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'sovereign-kyc-and-id-vault',
    name: 'Sovereign KYC and ID Vault',
    department: 'Corporate Governance, Legal, People & Security',
    description: 'Securely structures and indexes family identification records, passports, property deeds, and vehicle paperwork in Google Drive.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },

  // Department 3: Health, Clinical Vault & Household Operations
  {
    id: 'contractor-and-home-renovation-estimator',
    name: 'Contractor and Home Renovation Estimator',
    department: 'Health, Clinical Vault & Household Operations',
    description: 'Audits renovation quotes, carpentry estimates, material specifications, and contractor milestone payment schedules.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'domestic-staff-and-home-ops-manager',
    name: 'Domestic Staff and Home Ops Manager',
    department: 'Health, Clinical Vault & Household Operations',
    description: 'Tracks domestic staff attendance, salary ledgers, leave tracking, advance deductions, and residential utility maintenance.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'family-clinical-and-health-vault',
    name: 'Family Clinical and Health Vault',
    department: 'Health, Clinical Vault & Household Operations',
    description: 'Organizes family medical records, diagnostic lab report trends, prescription histories, and doctor consultation dossiers.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'family-emergency-and-sos-sentinel',
    name: 'Family Emergency and SOS Sentinel',
    department: 'Health, Clinical Vault & Household Operations',
    description: 'Maintains a 1-tap emergency medical response dossier including hospital preferences, blood groups, doctor hotlines, and insurance details.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'family-nutrition-and-pantry-optimizer',
    name: 'Family Nutrition and Pantry Optimizer',
    department: 'Health, Clinical Vault & Household Operations',
    description: 'Designs balanced weekly household meal plans, coordinates pantry grocery restocking, and estimates nutritional macro balance.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'preventive-health-screening-cadence',
    name: 'Preventive Health Screening Cadence',
    department: 'Health, Clinical Vault & Household Operations',
    description: 'Maintains annual age-specific health audit schedules, preventive screenings, dental cleanings, and family checkup cadences.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },

  // Department 4: Marketing, Media & Organic Distribution
  {
    id: 'creative-media-and-content-studio',
    name: 'Creative Media and Content Studio',
    department: 'Marketing, Media & Organic Distribution',
    description: 'Formats high-impact short-form video scripts, book outlines, conceptual frameworks, and musical narratives.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'goal-reality-check-and-roadmap-engine',
    name: 'Goal Reality Check and Roadmap Engine',
    department: 'Marketing, Media & Organic Distribution',
    description: 'Audits ambitious timelines against operational bandwidth and structures realistic, dependency-mapped milestone roadmaps.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'mission-outcome-and-research-engine',
    name: 'Mission Outcome and Research Engine',
    department: 'Marketing, Media & Organic Distribution',
    description: 'Conducts deep web research and synthesizes complex findings into structured briefs, comparative matrices, and executive reports.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'pr-and-organic-media-outreach',
    name: 'PR and Organic Media Outreach',
    department: 'Marketing, Media & Organic Distribution',
    description: 'Crafts founder story pitches, newsworthy press releases, and podcast guest applications to earn high-authority organic media coverage.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'vernacular-growth-and-localization-hub',
    name: 'Vernacular Growth and Localization Hub',
    department: 'Marketing, Media & Organic Distribution',
    description: 'Translates and culturally adapts English marketing copy, video scripts, and product messaging into conversational regional idioms.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'viral-artifact-and-plg-engine',
    name: 'Viral Artifact and Product-Led Growth (PLG) Engine',
    department: 'Marketing, Media & Organic Distribution',
    description: 'Designs high-utility public Google Sheets, Docs, and planning frameworks with embedded brand provenance footers.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'zero-ad-spend-distribution-engine',
    name: 'Zero Ad Spend Distribution Engine',
    department: 'Marketing, Media & Organic Distribution',
    description: 'Builds organic customer acquisition engines through strategic non-cash barter partnerships, niche community alliances, and referral loops.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },

  // Department 5: Finance, Wealth & Asset Optimization
  {
    id: 'dormant-benefits-and-perks-optimizer',
    name: 'Dormant Benefits and Perks Optimizer',
    department: 'Finance, Wealth & Asset Optimization',
    description: 'Audits credit cards, insurance policies, and banking memberships to uncover unclaimed perks, lounge visits, fee waivers, and services.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'family-legal-estate-and-will-planner',
    name: 'Family Legal Estate and Will Planner',
    department: 'Finance, Wealth & Asset Optimization',
    description: 'Catalogs family asset registries, account nominee verifications, succession records, and testamentary will frameworks.',
    enabled: true,
    allowedTiers: ['ADVANCED', 'ADMIN']
  },
  {
    id: 'family-wealth-budget-and-tax-desk',
    name: 'Family Wealth Budget and Tax Desk',
    department: 'Finance, Wealth & Asset Optimization',
    description: 'Manages monthly household cashflow discipline, expense categorization, statutory tax deductions, and advance tax schedules.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'long-term-investment-allocator',
    name: 'Long Term Investment Allocator',
    department: 'Finance, Wealth & Asset Optimization',
    description: 'Models disciplined asset allocation across broad index funds, debt instruments, gold, and automated annual rebalancing rules.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },

  // Department 6: Engineering, Systems & AI Infrastructure
  {
    id: 'dual-gmail-unified-intelligence-bridge',
    name: 'Dual Gmail Unified Intelligence Bridge',
    department: 'Engineering, Systems & AI Infrastructure',
    description: 'Syncs, categorizes, and indexes communications across multiple distinct email inboxes while preserving strict data segregation.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'open-source-cost-arbitrageur',
    name: 'Open Source Cost Arbitrageur',
    department: 'Engineering, Systems & AI Infrastructure',
    description: 'Swaps expensive proprietary SaaS subscriptions for secure self-hosted or open-source alternatives to reduce software burn.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'tech-sentinel-and-uptime-guard',
    name: 'Tech Sentinel and Uptime Guard',
    department: 'Engineering, Systems & AI Infrastructure',
    description: 'Monitors platform availability, deployment health, API usage thresholds, rate limits, and SSL certificate expiration across web applications.',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'token-frugality-and-context-controller',
    name: 'Token Frugality and Context Controller',
    department: 'Engineering, Systems & AI Infrastructure',
    description: 'Optimizes prompt architecture, implements sliding context windows, and routes requests across model tiers to reduce LLM token burn.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },

  // Department 7: Executive Function & Focus Architecture
  {
    id: 'energy-restoration-and-sabbatical-planner',
    name: 'Energy Restoration and Sabbatical Planner',
    department: 'Executive Function & Focus Architecture',
    description: 'Plans micro-sabbaticals, sensory resets, and structured recovery blocks to prevent cognitive burnout and replenish creative energy.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'energy-workload-matching-coach',
    name: 'Energy Workload Matching Coach',
    department: 'Executive Function & Focus Architecture',
    description: 'Aligns task difficulty and cognitive load with real-time mental energy and circadian focus rhythms throughout the day.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'focus-my-energy',
    name: 'Focus My Energy',
    department: 'Executive Function & Focus Architecture',
    description: "Aligns daily task execution with the user's real-time mental energy level instead of a rigid calendar.",
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'micro-timer-friction-breaker',
    name: 'Micro Timer Friction Breaker',
    department: 'Executive Function & Focus Architecture',
    description: 'Guides 5- to 15-minute countdown sprints and micro-commitments to overcome heavy task inertia and kickstart focus.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'nightly-wind-down-extraction-session',
    name: 'Nightly Wind Down Extraction Session',
    department: 'Executive Function & Focus Architecture',
    description: "Conducts a concise 2-minute evening review to clear mental open loops, capture pending thoughts, and set tomorrow morning's focus anchor.",
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'proactive-accountability-and-reporting-sentinel',
    name: 'Proactive Accountability and Reporting Sentinel',
    department: 'Executive Function & Focus Architecture',
    description: 'Monitors ongoing task commitments, tracks milestone completion rates, and compiles objective weekly productivity retrospectives.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'single-daily-north-star-filter',
    name: 'Single Daily North Star Filter',
    department: 'Executive Function & Focus Architecture',
    description: 'Filters out backlog noise and locks in exactly one high-impact needle-mover priority per realm to Google Tasks and Calendar each morning.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'sleep-architecture-optimizer',
    name: 'Sleep Architecture Optimizer',
    department: 'Executive Function & Focus Architecture',
    description: 'Optimizes circadian rhythm alignment, evening digital wind-down buffers, bedroom environment factors, and morning light anchoring.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },

  // Department 8: Personal Acceleration & Core Protocols
  {
    id: 'execution-burden-absorber',
    name: 'Execution Burden Absorber',
    department: 'Personal Acceleration & Core Protocols',
    description: 'Transforms unstructured voice directives, messy brain dumps, and rough notes into finished executive documents, spreadsheets, and slides.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'family-relationships-and-social-calendar',
    name: 'Family Relationships and Social Calendar',
    department: 'Personal Acceleration & Core Protocols',
    description: 'Tracks family birthdays, wedding anniversaries, social milestones, gift ideas, and thoughtful relationship connection touches.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'gemini-spark-instructions',
    name: 'Agent Core Instructions',
    department: 'Personal Acceleration & Core Protocols',
    description: 'Master operational guidelines, executive function coaching, low cognitive load communication standards, and user preference protocols.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'one-tap-action-card-deck',
    name: 'One Tap Action Card Deck',
    department: 'Personal Acceleration & Core Protocols',
    description: 'Structures complex decisions into tactile, binary action cards with 1-sentence rationales and direct artifact links.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'skill-acquisition-and-rapid-learning-coach',
    name: 'Skill Acquisition and Rapid Learning Coach',
    department: 'Personal Acceleration & Core Protocols',
    description: 'Designs 20-hour accelerated learning curriculums, deconstructs core sub-skills, and builds deliberate practice drills.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },

  // Department 9: Lifestyle, Commerce & Smart Mobility
  {
    id: 'gifts-and-festive-sales-arbitrageur',
    name: 'Gifts and Festive Sales Arbitrageur',
    department: 'Lifestyle, Commerce & Smart Mobility',
    description: 'Strategically plans and procures festive, wedding, and corporate gifts during mega-sale events using price history and card reward stacking.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'long-horizon-trip-and-event-planner',
    name: 'Long Horizon Trip and Event Planner',
    department: 'Lifestyle, Commerce & Smart Mobility',
    description: 'Maps multi-month travel runways, outstation family wedding itineraries, transit bookings, hotel room blocks, and packing logistics.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'nest-voice-room-orchestrator',
    name: 'Nest Voice Room Orchestrator',
    department: 'Lifestyle, Commerce & Smart Mobility',
    description: 'Connects smart speakers and home devices for hands-free voice routines, timers, morning briefings, and ambient focus soundscapes.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'physical-fitness-and-workout-programmer',
    name: 'Physical Fitness and Workout Programmer',
    department: 'Lifestyle, Commerce & Smart Mobility',
    description: 'Programs progressive home strength workouts, dumbbell routines, mobility drills, and weekly workout consistency tracking.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'smart-shopping-optimizer',
    name: 'Smart Shopping and Finance Optimizer',
    department: 'Lifestyle, Commerce & Smart Mobility',
    description: 'Optimizes shopping, deals, cashback, credit cards, gift cards, medicines, local dining, and asset reselling across platforms.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
  {
    id: 'vehicle-care-and-mobility-desk',
    name: 'Vehicle Care and Mobility Desk',
    department: 'Lifestyle, Commerce & Smart Mobility',
    description: 'Manages automobile maintenance logs, scheduled dealer servicing, insurance policy renewals, emissions certifications, and toll balances.',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
  },
];

/**
 * Intelligent Markdown Skill Parser
 * Reads markdown repository files and extracts skill definitions
 */
export function parseSkillsFromMarkdown(markdownText: string): SkillDefinition[] {
  const skills: SkillDefinition[] = [];
  const sections = markdownText.split(/##\s+\d+\\\.\s+|##\s+\d+\.\s+/);

  for (const section of sections) {
    if (!section.trim()) continue;

    // Extract name
    const titleMatch = section.match(/^([^\n]+)/);
    const nameMatch = section.match(/name:\s*([^\s\n]+)/);
    const descMatch = section.match(/description:\s*([^\n]+)/);
    const deptMatch = section.match(/department:\s*([^\n]+)/) || section.match(/\*\*Department\*\*:\s*([^\n]+)/);

    const name = titleMatch ? titleMatch[1].trim() : (nameMatch ? nameMatch[1].trim() : '');
    if (!name || name.toLowerCase().includes('master skills') || name.startsWith('#')) continue;

    const id = nameMatch ? nameMatch[1].trim() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const department = deptMatch ? deptMatch[1].trim() : 'General Operations';
    const description = descMatch ? descMatch[1].trim() : `Autonomous execution module for ${name}`;

    skills.push({
      id,
      name,
      department,
      description,
      enabled: true,
      allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
    });
  }

  return skills.length > 0 ? skills : INITIAL_53_SKILLS;
}
