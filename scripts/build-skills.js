const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'data', 'skills-master.md'), 'utf8');

const regex = /##\s+(\d+)\\\.\s+([^\n]+)([\s\S]*?)(?=(?:##\s+\d+\\\.\s+|$))/g;
let match;
const skills = [];

while ((match = regex.exec(content)) !== null) {
  const num = parseInt(match[1], 10);
  const title = match[2].trim();
  const body = match[3];

  const nameMatch = body.match(/name:\s*([^\s\n]+)/);
  const descMatch = body.match(/description:\s*([^\n]+)/);
  const deptMatch = body.match(/department:\s*([^\n]+)/) || body.match(/\*\*Department\*\*:\s*([^\n]+)/);

  // Setup questions
  const setupMatch = body.match(/## Setup & Onboarding[\s\S]*?(?=## Configuration Parameters|$)/);
  const setupText = setupMatch ? setupMatch[0] : '';
  const qMatches = [...setupText.matchAll(/\d+\.\s+\*\*([^*]+)\*\*([^\n]*)([\s\S]*?)(?=(?:\d+\.\s+\*\*|$))/g)];
  const quickQuestions = qMatches.map(m => {
    const qTitle = m[1].trim();
    const qPrompt = m[2].trim();
    const qRest = m[3];
    const optMatches = [...qRest.matchAll(/-\s*\\?\[([A-Z0-9])\\?\]\s*([^\n]+)/g)];
    const options = optMatches.map(o => '[' + o[1] + '] ' + o[2].replace(/\\/g, '').trim());
    return {
      title: qTitle,
      prompt: qPrompt,
      options: options.length > 0 ? options : undefined
    };
  });

  // Parameters
  const paramMatch = body.match(/## Configuration Parameters[\s\S]*?(?=## Operational Workflow|$)/);
  const paramText = paramMatch ? paramMatch[0] : '';
  const paramRows = [...paramText.matchAll(/\|\s*`(\{\{[A-Z0-9_]+\}\})`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g)];
  const parameters = paramRows.map(r => ({
    name: r[1].trim(),
    description: r[2].trim(),
    validChoices: r[3].trim(),
    defaultFallback: r[4].trim(),
  }));

  // Workflow steps
  const wfMatch = body.match(/## Operational Workflow[\s\S]*?(?=## Guardrails|$)/);
  const wfText = wfMatch ? wfMatch[0] : '';
  const wfSteps = [...wfText.matchAll(/\d+\.\s+\*\*([^*]+)\*\*:\s*([^\n]+)/g)].map(
    s => s[1].trim() + ': ' + s[2].trim()
  );

  // Guardrails
  const grMatch = body.match(/## Guardrails & Gotchas[\s\S]*?(?=---|##|$)/);
  const grText = grMatch ? grMatch[0] : '';
  const guardrails = [...grText.matchAll(/-\s+\*\*([^*]+)\*\*:\s*([^\n]+)/g)].map(
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

const outputPath = path.join(__dirname, '..', 'lib', 'skills-data.json');
fs.writeFileSync(outputPath, JSON.stringify(skills, null, 2), 'utf8');
console.log('Successfully saved ' + skills.length + ' complete skills to ' + outputPath);
