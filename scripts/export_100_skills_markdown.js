const fs = require('fs');
const path = require('path');

const skillsData = require('../lib/skills-data.json');

let md = `# Navia / Life OS — Complete Master Catalog of 100 Autonomous Skills

> **The Definitive Catalog of All 100 Curated, High-Yield Skills across Self, Home/Family, Work/Teams, and Meta Cognition.**  
> *Format: Deterministic Execution Workflows, Parameter Schemas, Quick Questions, and Safety Guardrails.*  
> *Platform: Navia Sovereign Operating System*

---

## Overview

Unlike unconstrained prompt-based chatbots that guess how to perform tasks, Navia operates on a **finite, curated catalog of 100 high-yield deterministic skills**. 

Each skill is architected as an **audited operational routine** with:
1. **Interactive Quick Questions**: User-friendly multi-choice prompts to subtract ambiguity in 10 seconds.
2. **Deterministic Parameters**: Clean variable placeholders for personalized execution.
3. **Multi-Step Execution Workflow**: Direct autonomous actions across Google Workspace (Docs, Sheets, Slides, Drive, Calendar, Tasks, Gmail) and Microsoft 365 (Word, Excel, Outlook, OneDrive).
4. **Safety & Compliance Guardrails**: Rigid zero-knowledge boundaries, privacy disclaimers, and human-in-the-loop approval thresholds.

---

## Master Table of Contents by Department

| Department | Skill Range | Focus Area |
| :--- | :---: | :--- |
| [1. Self: Health, Vitality & Preventive Longevity](#department-1-self-health-vitality--preventive-longevity) | **Skills 1 – 15** | Preventive screenings, metabolic health, sleep architecture, biomarkers, fitness, mental stamina |
| [2. Self: Wealth, Financial Security & Independence](#department-2-self-wealth-financial-security--independence) | **Skills 16 – 30** | Net worth audits, cash flow engines, investment tracking, tax prep, debt elimination, insurance |
| [3. Self: Career Navigation, Ambition & Professional Mastery](#department-3-self-career-navigation-ambition--professional-mastery) | **Skills 31 – 45** | Executive presence, 90-day role onboarding, negotiation briefs, deliberate practice, personal board |
| [4. Home & Family: Eldercare, Aging Parents & Medical Guardianship](#department-4-home--family-eldercare-aging-parents--medical-guardianship) | **Skills 46 – 58** | Medication schedules, caregiver coordination, chronic disease logs, home safety, emergency dossiers |
| [5. Home & Family: Parenting, Children & Education](#department-5-home--family-parenting-children--education) | **Skills 59 – 70** | School & sports calendar ingestion, extracurricular logistics, screen-time balance, tutor tracking |
| [6. Home & Family: Domestic Logistics, Homeownership & Assets](#department-6-home--family-domestic-logistics-homeownership--assets) | **Skills 71 – 82** | Home maintenance schedules, contractor bids, vehicle upkeep, warranty vaults, estate organization |
| [7. Work & Teams: Executive Presence, Projects & Communications](#department-7-work--teams-executive-presence-projects--communications) | **Skills 83 – 92** | Daily Chief of Staff morning briefs, meeting agendas, conflict shields, team status ledgers, investor updates |
| [8. Meta Skills: Cognitive Architecture, Research & System Discretion](#department-8-meta-skills-cognitive-architecture-research--system-discretion) | **Skills 93 – 100** | Deep literature synthesis, multi-variable decision matrices, cognitive load audits, strategic debriefs |

---

`;

// Group by department
const depts = [
  'Self: Health, Vitality & Preventive Longevity',
  'Self: Wealth, Financial Security & Independence',
  'Self: Career Navigation, Ambition & Professional Mastery',
  'Home & Family: Eldercare, Aging Parents & Medical Guardianship',
  'Home & Family: Parenting, Children & Education',
  'Home & Family: Domestic Logistics, Homeownership & Assets',
  'Work & Teams: Executive Presence, Projects & Communications',
  'Meta Skills: Cognitive Architecture, Research & System Discretion'
];

let currentDept = '';
let deptIndex = 0;

depts.forEach(deptName => {
  deptIndex++;
  const deptSkills = skillsData.filter(s => s.department === deptName);
  
  const anchorName = `department-${deptIndex}-${deptName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  md += `## Department ${deptIndex}: ${deptName}\n\n`;

  deptSkills.forEach(skill => {
    md += `### Skill ${skill.num}: ${skill.name}\n\n`;
    md += `- **ID**: \`${skill.id}\`\n`;
    md += `- **Department**: *${skill.department}*\n`;
    md += `- **Allowed Tiers**: ${skill.allowedTiers.map(t => `\`${t}\``).join(', ')}\n\n`;
    md += `**Description**:\n${skill.description}\n\n`;

    if (skill.quickQuestions && skill.quickQuestions.length > 0) {
      md += `#### Quick Interactive Questions\n`;
      skill.quickQuestions.forEach(q => {
        md += `- **${q.title}**: *"${q.prompt}"*\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach(opt => {
            md += `  - ${opt}\n`;
          });
        }
      });
      md += `\n`;
    }

    if (skill.parameters && skill.parameters.length > 0) {
      md += `#### Configurable Parameters\n`;
      skill.parameters.forEach(p => {
        md += `- **\`${p.name}\`**: ${p.description} *(Valid Choices: ${p.validChoices || 'Free input'}; Default: \`${p.defaultFallback || 'None'}\`)*\n`;
      });
      md += `\n`;
    }

    if (skill.workflow && skill.workflow.length > 0) {
      md += `#### Autonomous Workflow Execution\n`;
      skill.workflow.forEach((step, sIdx) => {
        md += `${sIdx + 1}. ${step}\n`;
      });
      md += `\n`;
    }

    if (skill.guardrails && skill.guardrails.length > 0) {
      md += `#### Guardrails & Safety Protocols\n`;
      skill.guardrails.forEach(g => {
        md += `> ⚠️ **Guardrail**: ${g}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  });
});

const outputPath = path.join(__dirname, '../ALL_100_LIFE_OS_SKILLS.md');
fs.writeFileSync(outputPath, md, 'utf8');
console.log('Successfully generated ALL_100_LIFE_OS_SKILLS.md at', outputPath);
