export interface SkillPack {
  id: string;
  name: string;
  badge: string;
  description: string;
  targetAudience: string;
  skillIds: string[];
  recommendedRole: string;
}

export const GENERAL_PURPOSE_SKILL_PACKS: SkillPack[] = [
  {
    id: 'pack-chief-of-staff',
    name: 'Executive Chief of Staff Pack',
    badge: 'Executive',
    description: 'High-leverage executive management: inbox triage, strategic meeting briefings, calendar protection, executive memo synthesis, and proactive cross-app task delegation.',
    targetAudience: 'Founders, C-Suite, Executives & Project Directors',
    skillIds: [
      'workspace-docs-architect',
      'workspace-calendar-strategist',
      'workspace-gmail-intelligence',
      'workspace-tasks-commander',
      'workspace-keep-notes',
      'meta-context-subtraction',
      'meta-inbox-sweeper-tasks',
      'meta-blindspot-director',
      'meta-multi-skill-orchestrator',
    ],
    recommendedRole: 'FOUNDER / EXECUTIVE',
  },
  {
    id: 'pack-personal-productivity',
    name: 'Personal Productivity & Life OS Pack',
    badge: 'Productivity',
    description: 'Daily life & work optimization: morning agendas, evening retrospectives, grocery & travel checklists, habit trackers, and personal task management.',
    targetAudience: 'Professionals, Solopreneurs, Consultants & Individuals',
    skillIds: [
      'workspace-calendar-strategist',
      'workspace-tasks-commander',
      'workspace-keep-notes',
      'workspace-drive-librarian',
      'meta-inbox-sweeper-tasks',
      'meta-outcome-roadmap',
    ],
    recommendedRole: 'EVERYONE',
  },
  {
    id: 'pack-research-intelligence',
    name: 'Deep Research & Market Intel Pack',
    badge: 'Intelligence',
    description: 'Empirical research and data synthesis: real-time web verification, competitor benchmarking, source-cited research dossiers, and executive notebooks.',
    targetAudience: 'Researchers, Strategists, Analysts & Consultants',
    skillIds: [
      'workspace-docs-architect',
      'workspace-sheets-modeler',
      'workspace-gemini-notebooks',
      'meta-deep-research',
      'meta-multi-skill-orchestrator',
    ],
    recommendedRole: 'RESEARCH / STRATEGY',
  },
  {
    id: 'pack-operations-finance',
    name: 'Operations & Financial Modeling Pack',
    badge: 'Operations',
    description: 'Quantitative modeling: automated spreadsheet formulas (SUM, AVERAGE, IF, VLOOKUP), budget & expense audits, vendor contracts, and milestone roadmaps.',
    targetAudience: 'COOs, Finance Leads, Operations Managers & Team Leads',
    skillIds: [
      'workspace-sheets-modeler',
      'workspace-forms-creator',
      'workspace-tasks-commander',
      'meta-outcome-roadmap',
      'meta-html-ui-designer',
    ],
    recommendedRole: 'SALES / MARKETING',
  },
  {
    id: 'pack-career-os',
    name: 'Savia Career OS & Executive Talent Agency Pack',
    badge: 'Career OS',
    description: 'Autonomous career counseling, job sourcing, proof-of-work collateral studio, and compensation engineering suite. Strictly read-only with human-in-the-loop staging.',
    targetAudience: 'Job Seekers, Executives in Transition, Career Pivoters & Senior Leaders',
    skillIds: [
      'candidate-aspiration-and-criteria-inquisitor',
      'career-trajectory-and-pivot-architect',
      'upskilling-and-skill-arbitrage-curator',
      'portal-profile-synthesizer-and-seo-optimizer',
      'ats-resume-and-impact-bullet-synthesizer',
      'multi-variant-static-portfolio-deployer',
      'bespoke-work-sample-and-proof-of-work-architect',
      'multi-board-job-scout-and-matchmaker',
      'circle-of-trust-and-referral-mobilizer',
      'network-infiltrator-and-referral-closer',
      'reverse-recruiter-and-talent-agent-desk',
      'stealth-diligence-and-backchannel-auditor',
      'interview-simulator-and-debrief-coach',
      'hike-maximization-and-offer-arbitrage-tactician',
      'compensation-and-offer-negotiation-desk',
      'job-campaign-pipeline-and-cadence-tracker',
      'resignation-and-onboarding-transition-navigator',
      'tailored-outreach-and-pitch-copywriter',
      'stealth-application-and-read-only-safety-gate',
    ],
    recommendedRole: 'ALL JOB SEEKERS / CAREER PIVOTERS',
  },
];
