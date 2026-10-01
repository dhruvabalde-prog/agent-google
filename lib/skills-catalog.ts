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

export const INITIAL_53_SKILLS: SkillDefinition[] = skillsJson as SkillDefinition[];

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
 * Intelligent Markdown Skill Parser
 * Reads markdown repository files and extracts skill definitions
 */
export function parseSkillsFromMarkdown(markdownText: string): SkillDefinition[] {
  const skills: SkillDefinition[] = [];
  const regex = /##\s+(\d+)\\\.\s+([^\n]+)([\s\S]*?)(?=(?:##\s+\d+\\\.\s+|$))/g;
  let match;

  while ((match = regex.exec(markdownText)) !== null) {
    const num = parseInt(match[1], 10);
    const title = match[2].trim();
    const body = match[3];

    const nameMatch = body.match(/name:\s*([^\s\n]+)/);
    const descMatch = body.match(/description:\s*([^\n]+)/);
    const deptMatch = body.match(/department:\s*([^\n]+)/) || body.match(/\*\*Department\*\*:\s*([^\n]+)/);

    // Setup questions
    const setupMatch = body.match(/## Setup & Onboarding[\s\S]*?(?=## Configuration Parameters|$)/);
    const setupText = setupMatch ? setupMatch[0] : '';
    const qMatches = Array.from(setupText.matchAll(/\d+\.\s+\*\*([^*]+)\*\*([^\n]*)([\s\S]*?)(?=(?:\d+\.\s+\*\*|$))/g));
    const quickQuestions = qMatches.map(m => {
      const qTitle = m[1].trim();
      const qPrompt = m[2].trim();
      const qRest = m[3];
      const optMatches = Array.from(qRest.matchAll(/-\s*\\?\[([A-Z0-9])\\?\]\s*([^\n]+)/g));
      const options = optMatches.map(o => '[' + o[1] + '] ' + o[2].replace(/\\/g, '').trim());
      return {
        title: qTitle,
        prompt: qPrompt,
        options: options.length > 0 ? options : undefined,
      };
    });

    // Parameters
    const paramMatch = body.match(/## Configuration Parameters[\s\S]*?(?=## Operational Workflow|$)/);
    const paramText = paramMatch ? paramMatch[0] : '';
    const paramRows = Array.from(paramText.matchAll(/\|\s*`(\{\{[A-Z0-9_]+\}\})`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g));
    const parameters = paramRows.map(r => ({
      name: r[1].trim(),
      description: r[2].trim(),
      validChoices: r[3].trim(),
      defaultFallback: r[4].trim(),
    }));

    // Workflow steps
    const wfMatch = body.match(/## Operational Workflow[\s\S]*?(?=## Guardrails|$)/);
    const wfText = wfMatch ? wfMatch[0] : '';
    const wfSteps = Array.from(wfText.matchAll(/\d+\.\s+\*\*([^*]+)\*\*:\s*([^\n]+)/g)).map(
      s => s[1].trim() + ': ' + s[2].trim()
    );

    // Guardrails
    const grMatch = body.match(/## Guardrails & Gotchas[\s\S]*?(?=---|##|$)/);
    const grText = grMatch ? grMatch[0] : '';
    const guardrails = Array.from(grText.matchAll(/-\s+\*\*([^*]+)\*\*:\s*([^\n]+)/g)).map(
      g => g[1].trim() + ': ' + g[2].trim()
    );

    skills.push({
      num,
      id: nameMatch ? nameMatch[1].trim() : title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: title,
      department: deptMatch ? deptMatch[1].replace(/allowed-tools:.*$/, '').trim() : 'General Operations',
      description: descMatch ? descMatch[1].replace(/department:.*$/, '').trim() : '',
      enabled: true,
      allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
      quickQuestions,
      parameters,
      workflow: wfSteps,
      guardrails,
    });
  }

  return skills.length > 0 ? skills : INITIAL_53_SKILLS;
}
