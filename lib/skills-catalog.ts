import skillsJson from './skills-data.json';

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

export const INITIAL_100_SKILLS: SkillDefinition[] = skillsJson as SkillDefinition[];
export const INITIAL_53_SKILLS: SkillDefinition[] = INITIAL_100_SKILLS;

/**
 * Smart skill matcher that finds the most relevant skill for the user's prompt
 */
export function findMatchingSkill(userPrompt: string, skills: SkillDefinition[]): SkillDefinition | null {
  if (!userPrompt || !userPrompt.trim()) return null;
  const lower = userPrompt.toLowerCase();

  // 1. Direct name match
  for (const s of skills) {
    if (!s.enabled) continue;
    if (lower.includes(s.name.toLowerCase()) || lower.includes(s.id.toLowerCase())) {
      return s;
    }
  }

  // 2. High-confidence keyword matching
  let bestSkill: SkillDefinition | null = null;
  let highestScore = 0;

  for (const s of skills) {
    if (!s.enabled) continue;
    let score = 0;
    const nameWords = s.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const w of nameWords) {
      if (lower.includes(w)) score += 3;
    }
    const descWords = s.description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    for (const w of descWords) {
      if (lower.includes(w)) score += 1;
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestSkill = s;
    }
  }

  return bestSkill;
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
