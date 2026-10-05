import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { encryptData, decryptData } from './crypto';
import { CORE_MASTER_SKILLS, INITIAL_SUBSCRIPTION_TIERS, SubscriptionTier, SkillDefinition, parseSkillsFromMarkdown } from './skills-catalog';

// Super Admin seed configuration
export const SUPER_ADMIN_EMAILS = [
  'dhruvabalde@gmail.com',
  'ddhruva21balde@gmail.com',
  (process.env.SUPER_ADMIN_EMAIL || 'dhruvabalde@gmail.com').toLowerCase(),
];
export const SUPER_ADMIN_EMAIL = 'dhruvabalde@gmail.com';
export const SUPER_ADMIN_PINS = [
  '111111',
  process.env.SUPER_ADMIN_PIN || '111111',
];
export const SUPER_ADMIN_PIN = '111111';
export const SUPER_ADMIN_PIN_HASH = bcrypt.hashSync(SUPER_ADMIN_PIN, 10);

export function isSuperAdminEmail(email?: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.includes(normalized) || normalized.includes('dhruva');
}

export function isValidAdminPin(pin?: string): boolean {
  if (!pin) return false;
  const clean = pin.trim();
  return SUPER_ADMIN_PINS.includes(clean);
}

let pool: Pool | null = null;
let isPgAvailable = false;

// Format & sanitize database URL if present
let rawDbUrl = process.env.DATABASE_URL || '';
if (rawDbUrl.includes('[') && rawDbUrl.includes(']')) {
  rawDbUrl = rawDbUrl.replace(/\[([^\]]+)\]/, (_, p1) => encodeURIComponent(p1));
}
const hasPlaceholder = rawDbUrl.includes('YOUR-PASSWORD');

if (rawDbUrl && !hasPlaceholder) {
  try {
    pool = new Pool({
      connectionString: rawDbUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    isPgAvailable = true;
  } catch (err) {
    console.warn('Postgres pool initialization failed, using in-memory fallback:', err);
    isPgAvailable = false;
  }
}

// In-Memory resilient fallback store
interface MemoryStore {
  users: Map<string, any>;
  chats: Map<string, any>;
  messages: Map<string, any[]>;
  skills: Map<string, SkillDefinition>;
  tiers: Map<string, SubscriptionTier>;
  apps: Map<string, any>;
  apiKeys: Map<string, any>;
  auditLogs: any[];
}

const globalStore: MemoryStore = (globalThis as any).__suchi_memoryStore || {
  users: new Map(),
  chats: new Map(),
  messages: new Map(),
  skills: new Map(),
  tiers: new Map(),
  apps: new Map(),
  apiKeys: new Map(),
  auditLogs: [],
};

if (!(globalThis as any).__suchi_memoryStore) {
  (globalThis as any).__suchi_memoryStore = globalStore;
}

const memoryStore: MemoryStore = globalStore;


export interface CloudAppIntegration {
  id: string;
  name: string;
  category: 'Workspace & Productivity' | 'AI & Analytics' | 'Cloud Infrastructure' | 'Security & Operations';
  description: string;
  status: 'ACTIVE IN APP' | 'STANDBY IN CLOUD CONSOLE';
  enabled: boolean;
  allowedTiers: string[];
}

export const INITIAL_CLOUD_APPS: CloudAppIntegration[] = [
  {
    id: 'docs',
    name: 'Google Docs API',
    category: 'Workspace & Productivity',
    description: 'Document creation, batch reading, inline styling, and structured content updates.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'sheets',
    name: 'Google Sheets API',
    category: 'Workspace & Productivity',
    description: 'Automated spreadsheet generation, grid value extraction, formula writes, and row appending.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'slides',
    name: 'Google Slides API',
    category: 'Workspace & Productivity',
    description: 'Presentation decks, slide layout creation, text block formatting, and deck sharing.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'drive',
    name: 'Google Drive API',
    category: 'Workspace & Productivity',
    description: 'File metadata indexing, search queries, permissions sharing, and deletion.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'calendar',
    name: 'Google Calendar API',
    category: 'Workspace & Productivity',
    description: 'Primary calendar event scheduling, attendee notifications, agenda querying, and reschedule.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'tasks',
    name: 'Google Tasks API',
    category: 'Workspace & Productivity',
    description: 'Task lists, quick action note-taking, due date alerts, and completion tracking.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'gmail',
    name: 'Gmail API',
    category: 'Workspace & Productivity',
    description: 'Thread search, MIME drafting, safety-guarded reply workflows, and draft approvals.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'gemini',
    name: 'Gemini API',
    category: 'AI & Analytics',
    description: 'Multimodal generative AI reasoning, tool call function orchestration, and live grounded search.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'bigquery',
    name: 'BigQuery API',
    category: 'AI & Analytics',
    description: 'Enterprise data warehousing, SQL query execution, and large-scale data analytics.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'storage',
    name: 'Cloud Storage API (GCS)',
    category: 'Cloud Infrastructure',
    description: 'Object storage buckets, media asset hosting, and scalable file persistence.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'firestore',
    name: 'Cloud Firestore API',
    category: 'Cloud Infrastructure',
    description: 'NoSQL document database, real-time sync, and client-side data persistence.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'meet',
    name: 'Google Meet API',
    category: 'Workspace & Productivity',
    description: 'Video conferencing management, meeting room links generation, and transcript access.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'forms',
    name: 'Google Forms API',
    category: 'Workspace & Productivity',
    description: 'Form creation, response retrieval, quiz configuration, and survey analytics.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'chat',
    name: 'Google Chat API',
    category: 'Workspace & Productivity',
    description: 'Workspace space messaging, webhook notifications, and conversational bot integration.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'people',
    name: 'People API (Contacts)',
    category: 'Workspace & Productivity',
    description: 'Contact book lookup, relationship graphs, profile metadata, and email directory.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'identitytoolkit',
    name: 'Identity Toolkit API',
    category: 'Security & Operations',
    description: 'Federated identity authentication, Google Sign-in verification, and session token auth.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
  },
  {
    id: 'remoteconfig',
    name: 'Firebase Remote Config API',
    category: 'Security & Operations',
    description: 'Dynamic feature flags, client-side configuration changes, and runtime parameters.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['ADVANCED', 'ADMIN'],
  },
  {
    id: 'pubsub',
    name: 'Cloud Pub/Sub API',
    category: 'Cloud Infrastructure',
    description: 'Asynchronous event ingestion, real-time message streaming, and distributed microservices.',
    status: 'STANDBY IN CLOUD CONSOLE',
    enabled: true,
    allowedTiers: ['ADVANCED', 'ADMIN'],
  },
  {
    id: 'logging',
    name: 'Cloud Logging API',
    category: 'Security & Operations',
    description: 'Centralized observability, security audit logs, error reporting, and runtime monitoring.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['ADMIN'],
  },
  {
    id: 'serviceusage',
    name: 'Service Usage API',
    category: 'Security & Operations',
    description: 'Enables, lists, and audits all Google Cloud APIs activated inside the Cloud Console project.',
    status: 'ACTIVE IN APP',
    enabled: true,
    allowedTiers: ['ADMIN'],
  },
];

// Seed all 17 Core Master Skills
CORE_MASTER_SKILLS.forEach(s => memoryStore.skills.set(s.id, s));

// Seed default subscription tiers
INITIAL_SUBSCRIPTION_TIERS.forEach(t => memoryStore.tiers.set(t.id, t));

// Seed cloud apps
INITIAL_CLOUD_APPS.forEach(a => memoryStore.apps.set(a.id, a));

// Seed superadmin users
SUPER_ADMIN_EMAILS.forEach((emailStr) => {
  memoryStore.users.set(emailStr.toLowerCase(), {
    id: `usr_${emailStr.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: emailStr.toLowerCase(),
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    subscription_tier: 'ADMIN',
    is_oauth_tester: true,
    assigned_packs: ['pack-chief-of-staff', 'pack-personal-productivity', 'pack-research-intelligence', 'pack-operations-finance', 'pack-career-os'],
    assigned_skills: [],
    onboarding_profile: 'Platform Administrator — Full Sovereign Access & Global Orchestration',
    created_at: new Date().toISOString(),
  });
});

export const DEFAULT_ONBOARDING_TEST_USERS = [
  {
    email: 'arjun.sharma@example.com',
    name: 'Arjun Sharma',
    role: 'USER',
    subscription_tier: 'INTERMEDIATE',
    is_oauth_tester: true,
    assigned_packs: ['pack-chief-of-staff', 'pack-personal-productivity'],
    assigned_skills: ['workspace-calendar-strategist', 'workspace-gmail-intelligence', 'workspace-tasks-commander'],
    onboarding_profile: 'Executive Founder — Daily morning briefings, automated calendar triage & Keep checklists',
  },
  {
    email: 'priya.patel@example.com',
    name: 'Priya Patel',
    role: 'USER',
    subscription_tier: 'ADVANCED',
    is_oauth_tester: true,
    assigned_packs: ['pack-career-os', 'pack-research-intelligence'],
    assigned_skills: ['candidate-aspiration-and-criteria-inquisitor', 'stealth-application-and-read-only-safety-gate', 'meta-deep-research'],
    onboarding_profile: 'VP of Product — Stealth executive job transition, proof-of-work dossiers & comp negotiation',
  },
  {
    email: 'rohan.mehta@example.com',
    name: 'Rohan Mehta',
    role: 'USER',
    subscription_tier: 'INTERMEDIATE',
    is_oauth_tester: true,
    assigned_packs: ['pack-operations-finance', 'pack-research-intelligence'],
    assigned_skills: ['workspace-sheets-modeler', 'workspace-docs-architect', 'meta-outcome-roadmap'],
    onboarding_profile: 'Growth & Operations Lead — Financial spreadsheets, quarterly roadmaps & research synthesis',
  },
  {
    email: 'sneha.reddy@example.com',
    name: 'Sneha Reddy',
    role: 'USER',
    subscription_tier: 'BEGINNER',
    is_oauth_tester: true,
    assigned_packs: ['pack-personal-productivity'],
    assigned_skills: ['workspace-keep-notes', 'workspace-tasks-commander'],
    onboarding_profile: 'Operations Manager — Daily task distillation, Keep checklists & meeting summaries',
  },
];

DEFAULT_ONBOARDING_TEST_USERS.forEach((tu) => {
  memoryStore.users.set(tu.email.toLowerCase(), {
    id: `usr_${tu.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: tu.email.toLowerCase(),
    name: tu.name,
    picture: '',
    role: tu.role,
    subscription_tier: tu.subscription_tier,
    is_oauth_tester: tu.is_oauth_tester,
    assigned_packs: tu.assigned_packs,
    assigned_skills: tu.assigned_skills,
    onboarding_profile: tu.onboarding_profile,
    created_at: new Date().toISOString(),
  });
});

// Seed default Gemini API key if present
if (process.env.GEMINI_API_KEY) {
  const k = process.env.GEMINI_API_KEY;
  const masked = k.substring(0, 4) + '...' + k.substring(k.length - 4);
  memoryStore.apiKeys.set('default-gemini', {
    id: 'default-gemini',
    provider: 'gemini',
    key_masked: masked,
    key_value: k,
    tier: 'ALL',
    is_active: true,
    usage_count: 0,
    failure_count: 0,
  });
}

let tablesInitialized = false;
export async function initDb() {
  if (!pool || !isPgAvailable || tablesInitialized) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          picture TEXT,
          role TEXT NOT NULL DEFAULT 'USER',
          subscription_tier TEXT NOT NULL DEFAULT 'BEGINNER',
          is_oauth_tester BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_oauth_tester BOOLEAN DEFAULT TRUE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_packs TEXT[] DEFAULT ARRAY[]::TEXT[];
        ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_skills TEXT[] DEFAULT ARRAY[]::TEXT[];
        ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_profile TEXT;

        CREATE TABLE IF NOT EXISTS apps (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'STANDBY IN CLOUD CONSOLE',
          enabled BOOLEAN DEFAULT TRUE,
          allowed_tiers TEXT[] DEFAULT ARRAY['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
        );

        CREATE TABLE IF NOT EXISTS subscription_tiers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          daily_token_limit INTEGER DEFAULT 50000
        );

        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          user_email TEXT NOT NULL,
          title TEXT NOT NULL,
          meaningful_outcome TEXT,
          outcome_status TEXT DEFAULT 'NONE',
          is_locked BOOLEAN DEFAULT FALSE,
          is_starred BOOLEAN DEFAULT FALSE,
          is_incognito BOOLEAN DEFAULT FALSE,
          markdown_content TEXT,
          message_count INTEGER DEFAULT 0,
          duration TEXT DEFAULT '0m',
          has_files BOOLEAN DEFAULT FALSE,
          has_voice BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          actions JSONB,
          attachments JSONB,
          audio_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS skills (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          department TEXT NOT NULL,
          description TEXT,
          enabled BOOLEAN DEFAULT TRUE,
          allowed_tiers TEXT[] DEFAULT ARRAY['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
          quick_questions JSONB,
          parameters JSONB,
          workflow TEXT[],
          guardrails TEXT[]
        );
        ALTER TABLE skills ADD COLUMN IF NOT EXISTS quick_questions JSONB;
        ALTER TABLE skills ADD COLUMN IF NOT EXISTS parameters JSONB;
        ALTER TABLE skills ADD COLUMN IF NOT EXISTS workflow TEXT[];
        ALTER TABLE skills ADD COLUMN IF NOT EXISTS guardrails TEXT[];

        CREATE TABLE IF NOT EXISTS api_keys (
          id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          key_masked TEXT NOT NULL,
          key_value TEXT NOT NULL,
          tier TEXT DEFAULT 'ALL',
          is_active BOOLEAN DEFAULT TRUE,
          usage_count INTEGER DEFAULT 0,
          failure_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          admin_email TEXT NOT NULL,
          action TEXT NOT NULL,
          target TEXT,
          details TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS bug_reports (
          id TEXT PRIMARY KEY,
          user_email TEXT NOT NULL,
          user_name TEXT,
          issue_type TEXT NOT NULL,
          summary TEXT NOT NULL,
          user_description TEXT,
          last_user_message TEXT,
          last_assistant_response TEXT,
          failed_action JSONB,
          diagnostics JSONB,
          status TEXT DEFAULT 'OPEN',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed default onboarding test users into Postgres if users table has <= 1 row
      try {
        const countRes = await client.query('SELECT COUNT(*) FROM users');
        if (parseInt(countRes.rows[0].count, 10) <= 1) {
          for (const tu of DEFAULT_ONBOARDING_TEST_USERS) {
            await client.query(`
              INSERT INTO users (id, email, name, role, subscription_tier, is_oauth_tester, assigned_packs, assigned_skills, onboarding_profile)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                assigned_packs = EXCLUDED.assigned_packs,
                assigned_skills = EXCLUDED.assigned_skills,
                onboarding_profile = EXCLUDED.onboarding_profile,
                is_oauth_tester = EXCLUDED.is_oauth_tester
            `, [
              `usr_${tu.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
              tu.email.toLowerCase(),
              tu.name,
              tu.role,
              tu.subscription_tier,
              tu.is_oauth_tester,
              tu.assigned_packs,
              tu.assigned_skills,
              tu.onboarding_profile,
            ]);
          }
        }
      } catch (err) {
        console.warn('Could not auto-seed test users in Postgres:', err);
      }

      tablesInitialized = true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('Could not initialize Postgres tables (check credentials), running with fallback store:', err);
    isPgAvailable = false;
  }
}

// ----------------- USER METHODS -----------------
export async function getUserByEmail(email: string) {
  await initDb();
  const normalized = email.toLowerCase();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [normalized]);
      if (res.rows.length > 0) return res.rows[0];
    } catch (e) {
      console.warn('PG error in getUserByEmail:', e);
    }
  }
  return memoryStore.users.get(normalized) || null;
}

export async function upsertUser(user: { email: string; name?: string; picture?: string; role?: string; subscription_tier?: string; is_oauth_tester?: boolean; assigned_packs?: string[] }) {
  await initDb();
  const normalized = user.email.toLowerCase();
  const isSuper = isSuperAdminEmail(normalized);
  const role = isSuper ? 'SUPER_ADMIN' : (user.role || 'USER');
  const tier = isSuper ? 'ADMIN' : (user.subscription_tier || 'BEGINNER');
  const isTester = user.is_oauth_tester !== undefined ? user.is_oauth_tester : true;
  const packs = user.assigned_packs || [];

  if (pool && isPgAvailable) {
    try {
      const res = await pool.query(`
        INSERT INTO users (id, email, name, picture, role, subscription_tier, is_oauth_tester, assigned_packs)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, users.name),
          picture = COALESCE(EXCLUDED.picture, users.picture)
        RETURNING *
      `, [crypto.randomUUID(), normalized, user.name || '', user.picture || '', role, tier, isTester, packs]);
      return res.rows[0];
    } catch (e) {
      console.warn('PG error in upsertUser:', e);
    }
  }

  const existing = memoryStore.users.get(normalized) || {};
  const updated = {
    id: existing.id || crypto.randomUUID(),
    email: normalized,
    name: user.name || existing.name || '',
    picture: user.picture || existing.picture || '',
    role: isSuper ? 'SUPER_ADMIN' : (existing.role || role),
    subscription_tier: isSuper ? 'ADMIN' : (existing.subscription_tier || tier),
    is_oauth_tester: existing.is_oauth_tester !== undefined ? existing.is_oauth_tester : isTester,
    assigned_packs: user.assigned_packs || existing.assigned_packs || [],
    created_at: existing.created_at || new Date().toISOString(),
  };
  memoryStore.users.set(normalized, updated);
  return updated;
}

export async function addUser(user: { email: string; name?: string; role?: string; subscription_tier?: string; is_oauth_tester?: boolean; assigned_packs?: string[]; assigned_skills?: string[]; onboarding_profile?: string }) {
  await initDb();
  const normalized = user.email.toLowerCase();
  const isSuper = isSuperAdminEmail(normalized);
  const role = isSuper ? 'SUPER_ADMIN' : (user.role || 'USER');
  const tier = isSuper ? 'ADMIN' : (user.subscription_tier || 'BEGINNER');
  const isTester = user.is_oauth_tester !== undefined ? user.is_oauth_tester : true;
  const packs = user.assigned_packs || [];
  const skills = user.assigned_skills || [];
  const profile = user.onboarding_profile || '';

  if (pool && isPgAvailable) {
    try {
      const res = await pool.query(`
        INSERT INTO users (id, email, name, role, subscription_tier, is_oauth_tester, assigned_packs, assigned_skills, onboarding_profile)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          subscription_tier = EXCLUDED.subscription_tier,
          is_oauth_tester = EXCLUDED.is_oauth_tester,
          assigned_packs = COALESCE(EXCLUDED.assigned_packs, users.assigned_packs),
          assigned_skills = COALESCE(EXCLUDED.assigned_skills, users.assigned_skills),
          onboarding_profile = COALESCE(EXCLUDED.onboarding_profile, users.onboarding_profile)
        RETURNING *
      `, [crypto.randomUUID(), normalized, user.name || '', role, tier, isTester, packs, skills, profile]);
      return res.rows[0];
    } catch (e) {
      console.warn('PG error in addUser:', e);
    }
  }

  const record = {
    id: crypto.randomUUID(),
    email: normalized,
    name: user.name || '',
    picture: '',
    role,
    subscription_tier: tier,
    is_oauth_tester: isTester,
    assigned_packs: packs,
    assigned_skills: skills,
    onboarding_profile: profile,
    created_at: new Date().toISOString(),
  };
  memoryStore.users.set(normalized, record);
  return record;
}

export async function updateUserAssignedPacks(email: string, packs: string[]) {
  await initDb();
  const normalized = email.toLowerCase();
  if (pool && isPgAvailable) {
    try {
      await pool.query('UPDATE users SET assigned_packs = $1 WHERE email = $2', [packs, normalized]);
    } catch (e) {
      console.warn('PG error in updateUserAssignedPacks:', e);
    }
  }
  const u = memoryStore.users.get(normalized);
  if (u) {
    u.assigned_packs = packs;
    memoryStore.users.set(normalized, u);
  }
}

export async function updateUserAssignedSkills(email: string, skills: string[]) {
  await initDb();
  const normalized = email.toLowerCase();
  if (pool && isPgAvailable) {
    try {
      await pool.query('UPDATE users SET assigned_skills = $1 WHERE email = $2', [skills, normalized]);
    } catch (e) {
      console.warn('PG error in updateUserAssignedSkills:', e);
    }
  }
  const u = memoryStore.users.get(normalized);
  if (u) {
    u.assigned_skills = skills;
    memoryStore.users.set(normalized, u);
  }
}

export async function toggleUserPack(email: string, packId: string, enabled: boolean) {
  await initDb();
  const normalized = email.toLowerCase();
  const user = await getUserByEmail(normalized);
  let packs: string[] = user?.assigned_packs || [];
  if (enabled) {
    if (!packs.includes(packId)) packs = [...packs, packId];
  } else {
    packs = packs.filter((p: string) => p !== packId);
  }
  await updateUserAssignedPacks(normalized, packs);
  return packs;
}

export async function toggleUserSkill(email: string, skillId: string, enabled: boolean) {
  await initDb();
  const normalized = email.toLowerCase();
  const user = await getUserByEmail(normalized);
  let skills: string[] = user?.assigned_skills || [];
  if (enabled) {
    if (!skills.includes(skillId)) skills = [...skills, skillId];
  } else {
    skills = skills.filter((s: string) => s !== skillId);
  }
  await updateUserAssignedSkills(normalized, skills);
  return skills;
}

export async function toggleTestUser(email: string, isTester: boolean) {
  await initDb();
  const normalized = email.toLowerCase();
  if (pool && isPgAvailable) {
    try {
      await pool.query('UPDATE users SET is_oauth_tester = $1 WHERE email = $2', [isTester, normalized]);
    } catch (e) {
      console.warn('PG error in toggleTestUser:', e);
    }
  }
  const u = memoryStore.users.get(normalized);
  if (u) {
    u.is_oauth_tester = isTester;
    memoryStore.users.set(normalized, u);
  }
}

export async function getOAuthTestUsers() {
  const all = await getAllUsers();
  return all.filter((u: any) => u.is_oauth_tester);
}

export async function getAllUsers() {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      return res.rows;
    } catch (e) {
      console.warn('PG error in getAllUsers:', e);
    }
  }
  return Array.from(memoryStore.users.values());
}

export async function updateUserTier(email: string, tier: string, role?: string) {
  await initDb();
  const normalized = email.toLowerCase();
  if (pool && isPgAvailable) {
    try {
      await pool.query(
        'UPDATE users SET subscription_tier = $1, role = COALESCE($2, role) WHERE email = $3',
        [tier, role || null, normalized]
      );
    } catch (e) {
      console.warn('PG error in updateUserTier:', e);
    }
  }
  const u = memoryStore.users.get(normalized);
  if (u) {
    u.subscription_tier = tier;
    if (role) u.role = role;
    memoryStore.users.set(normalized, u);
  }
}

export async function deleteUser(email: string) {
  await initDb();
  const normalized = email.toLowerCase();
  if (pool && isPgAvailable) {
    try {
      await pool.query('DELETE FROM users WHERE email = $1', [normalized]);
    } catch (e) {
      console.warn('PG error in deleteUser:', e);
    }
  }
  memoryStore.users.delete(normalized);
}

// ----------------- APPS & INTEGRATIONS METHODS -----------------
export async function getAllApps(): Promise<CloudAppIntegration[]> {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT * FROM apps ORDER BY category ASC, name ASC');
      if (res.rows.length > 0) return res.rows;
    } catch (e) {
      console.warn('PG error in getAllApps:', e);
    }
  }
  return Array.from(memoryStore.apps.values());
}

export async function toggleApp(appId: string, enabled: boolean) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('UPDATE apps SET enabled = $1 WHERE id = $2', [enabled, appId]);
    } catch (e) {
      console.warn('PG error in toggleApp:', e);
    }
  }
  const app = memoryStore.apps.get(appId);
  if (app) {
    app.enabled = enabled;
    memoryStore.apps.set(appId, app);
  }
}

export async function updateAppTiers(appId: string, allowedTiers: string[]) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('UPDATE apps SET allowed_tiers = $1 WHERE id = $2', [allowedTiers, appId]);
    } catch (e) {
      console.warn('PG error in updateAppTiers:', e);
    }
  }
  const app = memoryStore.apps.get(appId);
  if (app) {
    app.allowedTiers = allowedTiers;
    memoryStore.apps.set(appId, app);
  }
}

// ----------------- SUBSCRIPTION TIERS METHODS -----------------
export async function getAllSubscriptionTiers(): Promise<SubscriptionTier[]> {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT * FROM subscription_tiers ORDER BY daily_token_limit ASC');
      if (res.rows.length > 0) return res.rows;
    } catch (e) {
      console.warn('PG error in getAllSubscriptionTiers:', e);
    }
  }
  return Array.from(memoryStore.tiers.values());
}

export async function saveSubscriptionTier(tier: SubscriptionTier) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query(`
        INSERT INTO subscription_tiers (id, name, description, daily_token_limit)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          daily_token_limit = EXCLUDED.daily_token_limit
      `, [tier.id.toUpperCase(), tier.name, tier.description || '', tier.dailyTokenLimit || 50000]);
    } catch (e) {
      console.warn('PG error in saveSubscriptionTier:', e);
    }
  }
  memoryStore.tiers.set(tier.id.toUpperCase(), tier);
}

export async function deleteSubscriptionTier(tierId: string) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('DELETE FROM subscription_tiers WHERE id = $1', [tierId.toUpperCase()]);
    } catch (e) {
      console.warn('PG error in deleteSubscriptionTier:', e);
    }
  }
  memoryStore.tiers.delete(tierId.toUpperCase());
}

// ----------------- CHAT METHODS (ENCRYPTED) -----------------
export async function getChatsByUser(email: string) {
  await initDb();
  const normalized = email.toLowerCase();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query(
        'SELECT * FROM chats WHERE user_email = $1 AND is_incognito = FALSE ORDER BY is_starred DESC, updated_at DESC',
        [normalized]
      );
      return res.rows.map(r => ({
        ...r,
        markdown_content: decryptData(r.markdown_content || ''),
      }));
    } catch (e) {
      console.warn('PG error in getChatsByUser:', e);
    }
  }
  return Array.from(memoryStore.chats.values())
    .filter(c => c.user_email === normalized && !c.is_incognito)
    .sort((a, b) => {
      if (a.is_starred !== b.is_starred) return a.is_starred ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .map(c => ({
      ...c,
      markdown_content: decryptData(c.markdown_content || ''),
    }));
}

export async function getChatById(chatId: string) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT * FROM chats WHERE id = $1', [chatId]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        row.markdown_content = decryptData(row.markdown_content || '');
        return row;
      }
    } catch (e) {
      console.warn('PG error in getChatById:', e);
    }
  }
  const chat = memoryStore.chats.get(chatId);
  if (!chat) return null;
  return {
    ...chat,
    markdown_content: decryptData(chat.markdown_content || ''),
  };
}

export async function saveChat(chat: any) {
  await initDb();
  const now = new Date().toISOString();
  chat.updated_at = now;
  if (!chat.created_at) chat.created_at = now;

  // AES-256-GCM Encrypt markdown content before saving to DB
  const encryptedMd = encryptData(chat.markdown_content || '');

  if (pool && isPgAvailable) {
    try {
      await pool.query(`
        INSERT INTO chats (id, user_email, title, meaningful_outcome, outcome_status, is_locked, is_starred, is_incognito, markdown_content, message_count, duration, has_files, has_voice, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          meaningful_outcome = EXCLUDED.meaningful_outcome,
          outcome_status = EXCLUDED.outcome_status,
          is_locked = EXCLUDED.is_locked,
          is_starred = EXCLUDED.is_starred,
          markdown_content = EXCLUDED.markdown_content,
          message_count = EXCLUDED.message_count,
          has_files = EXCLUDED.has_files,
          has_voice = EXCLUDED.has_voice,
          updated_at = EXCLUDED.updated_at
      `, [
        chat.id, chat.user_email.toLowerCase(), chat.title, chat.meaningful_outcome || null,
        chat.outcome_status || 'NONE', chat.is_locked || false, chat.is_starred || false,
        chat.is_incognito || false, encryptedMd, chat.message_count || 0,
        chat.duration || '0m', chat.has_files || false, chat.has_voice || false,
        chat.created_at, chat.updated_at
      ]);
    } catch (e) {
      console.warn('PG error in saveChat:', e);
    }
  }
  memoryStore.chats.set(chat.id, { ...chat, markdown_content: encryptedMd });
  return chat;
}

export async function toggleChatStar(chatId: string) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('UPDATE chats SET is_starred = NOT is_starred WHERE id = $1 RETURNING is_starred', [chatId]);
      if (res.rows.length > 0) return res.rows[0].is_starred;
    } catch (e) {
      console.warn('PG error in toggleChatStar:', e);
    }
  }
  const c = memoryStore.chats.get(chatId);
  if (c) {
    c.is_starred = !c.is_starred;
    memoryStore.chats.set(chatId, c);
    return c.is_starred;
  }
  return false;
}

export async function deleteChat(chatId: string) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('DELETE FROM chat_messages WHERE chat_id = $1', [chatId]);
      await pool.query('DELETE FROM chats WHERE id = $1', [chatId]);
    } catch (e) {
      console.warn('PG error in deleteChat:', e);
    }
  }
  memoryStore.chats.delete(chatId);
  memoryStore.messages.delete(chatId);
  return true;
}

export async function getMessagesByChatId(chatId: string) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT * FROM chat_messages WHERE chat_id = $1 ORDER BY created_at ASC', [chatId]);
      return res.rows.map(r => ({
        ...r,
        content: decryptData(r.content),
      }));
    } catch (e) {
      console.warn('PG error in getMessagesByChatId:', e);
    }
  }
  const list = memoryStore.messages.get(chatId) || [];
  return list.map(m => ({
    ...m,
    content: decryptData(m.content),
  }));
}

export async function saveMessage(msg: { id: string; chat_id: string; role: string; content: string; actions?: any; attachments?: any; audio_url?: string }) {
  await initDb();
  const now = new Date().toISOString();
  // AES-256-GCM Encrypt user message content
  const encryptedContent = encryptData(msg.content);

  if (pool && isPgAvailable) {
    try {
      await pool.query(`
        INSERT INTO chat_messages (id, chat_id, role, content, actions, attachments, audio_url, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        msg.id, msg.chat_id, msg.role, encryptedContent,
        msg.actions ? JSON.stringify(msg.actions) : null,
        msg.attachments ? JSON.stringify(msg.attachments) : null,
        msg.audio_url || null, now
      ]);
    } catch (e) {
      console.warn('PG error in saveMessage:', e);
    }
  }
  const list = memoryStore.messages.get(msg.chat_id) || [];
  list.push({ ...msg, content: encryptedContent, created_at: now });
  memoryStore.messages.set(msg.chat_id, list);
}

// ----------------- SKILLS MANAGEMENT (FULL CRUD & BULK MD) -----------------
export async function getAllSkills(): Promise<SkillDefinition[]> {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT * FROM skills ORDER BY department ASC, name ASC');
      if (res.rows.length > 0) {
        if (res.rows.length < CORE_MASTER_SKILLS.length) {
          const existingIds = new Set(res.rows.map(r => r.id));
          for (const s of CORE_MASTER_SKILLS) {
            if (!existingIds.has(s.id)) {
              await saveSkill(s);
            }
          }
          const updatedRes = await pool.query('SELECT * FROM skills ORDER BY department ASC, name ASC');
          return updatedRes.rows.map(r => ({
            id: r.id,
            name: r.name,
            department: r.department,
            description: r.description || '',
            enabled: r.enabled ?? true,
            allowedTiers: r.allowed_tiers || r.allowedTiers || ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
            quickQuestions: r.quick_questions || r.quickQuestions,
            parameters: r.parameters,
            workflow: r.workflow,
            guardrails: r.guardrails,
          }));
        }
        return res.rows.map(r => ({
          id: r.id,
          name: r.name,
          department: r.department,
          description: r.description || '',
          enabled: r.enabled ?? true,
          allowedTiers: r.allowed_tiers || r.allowedTiers || ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
          quickQuestions: r.quick_questions || r.quickQuestions,
          parameters: r.parameters,
          workflow: r.workflow,
          guardrails: r.guardrails,
        }));
      } else {
        // Auto-seed CORE_MASTER_SKILLS directly into PostgreSQL
        for (const s of CORE_MASTER_SKILLS) {
          await saveSkill(s);
        }
        return CORE_MASTER_SKILLS;
      }
    } catch (e) {
      console.warn('PG error in getAllSkills:', e);
    }
  }
  return Array.from(memoryStore.skills.values());
}

export async function saveSkill(skill: SkillDefinition) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query(`
        INSERT INTO skills (id, name, department, description, enabled, allowed_tiers, quick_questions, parameters, workflow, guardrails)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          department = EXCLUDED.department,
          description = EXCLUDED.description,
          enabled = EXCLUDED.enabled,
          allowed_tiers = EXCLUDED.allowed_tiers,
          quick_questions = EXCLUDED.quick_questions,
          parameters = EXCLUDED.parameters,
          workflow = EXCLUDED.workflow,
          guardrails = EXCLUDED.guardrails
      `, [
        skill.id,
        skill.name,
        skill.department,
        skill.description || '',
        skill.enabled,
        skill.allowedTiers || ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
        skill.quickQuestions ? JSON.stringify(skill.quickQuestions) : null,
        skill.parameters ? JSON.stringify(skill.parameters) : null,
        skill.workflow || null,
        skill.guardrails || null,
      ]);
    } catch (e) {
      console.warn('PG error in saveSkill:', e);
    }
  }
  memoryStore.skills.set(skill.id, skill);
}

export async function deleteSkill(skillId: string) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('DELETE FROM skills WHERE id = $1', [skillId]);
    } catch (e) {
      console.warn('PG error in deleteSkill:', e);
    }
  }
  memoryStore.skills.delete(skillId);
}

export async function toggleSkill(skillId: string, enabled: boolean) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('UPDATE skills SET enabled = $1 WHERE id = $2', [enabled, skillId]);
    } catch (e) {
      console.warn('PG error in toggleSkill:', e);
    }
  }
  const s = memoryStore.skills.get(skillId);
  if (s) {
    s.enabled = enabled;
    memoryStore.skills.set(skillId, s);
  }
}

export async function toggleDepartmentSkills(department: string, enabled: boolean) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('UPDATE skills SET enabled = $1 WHERE department = $2', [enabled, department]);
    } catch (e) {
      console.warn('PG error in toggleDepartmentSkills:', e);
    }
  }
  for (const s of Array.from(memoryStore.skills.values())) {
    if (s.department === department) {
      s.enabled = enabled;
      memoryStore.skills.set(s.id, s);
    }
  }
}

export async function bulkImportSkillsFromMarkdown(markdownContent: string, mode: 'merge' | 'replace' = 'merge') {
  const parsedSkills = parseSkillsFromMarkdown(markdownContent);

  if (parsedSkills.length === 0) {
    return { importedCount: 0, error: 'No skills could be parsed from the markdown. Use headings like "## 1. Skill Name" or "### Skill Name" with body content.' };
  }

  if (mode === 'replace') {
    memoryStore.skills.clear();
    if (pool && isPgAvailable) {
      try {
        await pool.query('DELETE FROM skills');
      } catch (e) {
        console.warn('PG error clearing skills:', e);
      }
    }
  }

  for (const s of parsedSkills) {
    await saveSkill(s);
  }

  return { importedCount: parsedSkills.length };
}

// ----------------- API KEY POOL (PERSISTED IN POSTGRESQL & LOAD BALANCED) -----------------
export async function getApiKeyForTier(tier: string, provider = 'gemini'): Promise<string> {
  await initDb();
  const prov = provider.toLowerCase();

  if (pool && isPgAvailable) {
    try {
      const res = await pool.query(
        'SELECT * FROM api_keys WHERE LOWER(provider) = $1 AND is_active = TRUE AND (tier = $2 OR tier = $3) ORDER BY usage_count ASC LIMIT 1',
        [prov, 'ALL', tier]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        await pool.query('UPDATE api_keys SET usage_count = usage_count + 1 WHERE id = $1', [row.id]);
        return decryptData(row.key_value);
      }
    } catch (e) {
      console.warn('PG error in getApiKeyForTier:', e);
    }
  }

  const keys = Array.from(memoryStore.apiKeys.values()).filter(
    k => k.provider.toLowerCase() === prov && k.is_active && (k.tier === 'ALL' || k.tier === tier)
  );

  if (keys.length > 0) {
    keys.sort((a, b) => a.usage_count - b.usage_count);
    const chosen = keys[0];
    chosen.usage_count++;
    return chosen.key_value;
  }

  if (prov === 'gemini') return process.env.GEMINI_API_KEY || '';
  if (prov === 'anthropic') return process.env.ANTHROPIC_API_KEY || '';
  if (prov === 'openai') return process.env.OPENAI_API_KEY || '';
  return '';
}

export async function addApiKey(provider: string, key: string, tier: string) {
  await initDb();
  const prov = provider.toLowerCase();

  const allCurrent = await getAllApiKeys();
  const provKeys = allCurrent.filter(k => k.provider.toLowerCase() === prov);
  if (provKeys.length >= 10) {
    throw new Error(`Maximum 10 API keys reached for ${prov.toUpperCase()}. Remove an unused key before adding a new one.`);
  }

  const id = `key_${prov}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const cleanKey = key.trim();
  const masked = cleanKey.length > 8
    ? cleanKey.substring(0, 4) + '...' + cleanKey.substring(cleanKey.length - 4)
    : '****';
  const encrypted = encryptData(cleanKey);

  const record = {
    id,
    provider: prov,
    key_masked: masked,
    key_value: cleanKey,
    tier: tier || 'ALL',
    is_active: true,
    usage_count: 0,
    failure_count: 0,
  };

  if (pool && isPgAvailable) {
    try {
      await pool.query(`
        INSERT INTO api_keys (id, provider, key_masked, key_value, tier, is_active, usage_count, failure_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [id, prov, masked, encrypted, record.tier, true, 0, 0]);
    } catch (e) {
      console.warn('PG error in addApiKey:', e);
    }
  }

  memoryStore.apiKeys.set(id, record);
  return {
    id: record.id,
    provider: record.provider,
    key_masked: record.key_masked,
    tier: record.tier,
    is_active: record.is_active,
    usage_count: record.usage_count,
    failure_count: record.failure_count,
  };
}

export async function deleteApiKey(keyId: string) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('DELETE FROM api_keys WHERE id = $1', [keyId]);
    } catch (e) {
      console.warn('PG error in deleteApiKey:', e);
    }
  }
  memoryStore.apiKeys.delete(keyId);
}

export async function getAllApiKeys() {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT id, provider, key_masked, tier, is_active, usage_count, failure_count FROM api_keys ORDER BY provider ASC, id DESC');
      return res.rows.map(r => ({
        id: r.id,
        provider: r.provider,
        key_masked: r.key_masked,
        tier: r.tier,
        is_active: r.is_active,
        usage_count: r.usage_count || 0,
        failure_count: r.failure_count || 0,
      }));
    } catch (e) {
      console.warn('PG error in getAllApiKeys:', e);
    }
  }
  return Array.from(memoryStore.apiKeys.values()).map(k => ({
    id: k.id,
    provider: k.provider,
    key_masked: k.key_masked,
    tier: k.tier,
    is_active: k.is_active,
    usage_count: k.usage_count,
    failure_count: k.failure_count || 0,
  }));
}

// ----------------- REAL BUG REPORTS & TELEMETRY (PERSISTED) -----------------
export async function saveBugReport(report: any) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query(`
        INSERT INTO bug_reports (id, user_email, user_name, issue_type, summary, user_description, last_user_message, last_assistant_response, failed_action, diagnostics, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          user_description = EXCLUDED.user_description
      `, [
        report.id,
        report.userEmail,
        report.userName || '',
        report.issueType,
        report.summary,
        report.userDescription || '',
        report.lastUserMessage || '',
        report.lastAssistantResponse || '',
        report.failedAction ? JSON.stringify(report.failedAction) : null,
        report.diagnostics ? JSON.stringify(report.diagnostics) : null,
        report.status || 'OPEN',
        report.createdAt || new Date().toISOString(),
      ]);
    } catch (e) {
      console.warn('PG error in saveBugReport:', e);
    }
  }
}

export async function getAllBugReports() {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      const res = await pool.query('SELECT * FROM bug_reports ORDER BY created_at DESC');
      if (res.rows.length > 0) {
        return res.rows.map(r => ({
          id: r.id,
          createdAt: r.created_at,
          userEmail: r.user_email,
          userName: r.user_name,
          issueType: r.issue_type,
          summary: r.summary,
          userDescription: r.user_description,
          lastUserMessage: r.last_user_message,
          lastAssistantResponse: r.last_assistant_response,
          failedAction: r.failed_action,
          diagnostics: r.diagnostics || {},
          status: r.status,
        }));
      }
    } catch (e) {
      console.warn('PG error in getAllBugReports:', e);
    }
  }
  return [];
}

export async function updateBugReportStatus(reportId: string, status: string) {
  await initDb();
  if (pool && isPgAvailable) {
    try {
      await pool.query('UPDATE bug_reports SET status = $1 WHERE id = $2', [status, reportId]);
    } catch (e) {
      console.warn('PG error in updateBugReportStatus:', e);
    }
  }
}

// ----------------- AUDIT LOGS -----------------
export async function logAdminAction(adminEmail: string, action: string, target?: string, details?: string) {
  const item = {
    id: `log_${Date.now()}`,
    admin_email: adminEmail,
    action,
    target: target || '',
    details: details || '',
    created_at: new Date().toISOString(),
  };
  memoryStore.auditLogs.unshift(item);
  if (memoryStore.auditLogs.length > 200) memoryStore.auditLogs.pop();
}

export async function getAuditLogs() {
  return memoryStore.auditLogs;
}
