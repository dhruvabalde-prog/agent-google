import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { encryptData, decryptData } from './crypto';
import { INITIAL_53_SKILLS, INITIAL_SUBSCRIPTION_TIERS, SubscriptionTier, SkillDefinition, parseSkillsFromMarkdown } from './skills-catalog';

// Super Admin seed configuration
export const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'dhruvabalde@gmail.com';
export const SUPER_ADMIN_PIN = process.env.SUPER_ADMIN_PIN || '687996';
export const SUPER_ADMIN_PIN_HASH = bcrypt.hashSync(SUPER_ADMIN_PIN, 10);

let pool: Pool | null = null;
let isPgAvailable = false;

// Check if database URL is valid and does not have the placeholder
const rawDbUrl = process.env.DATABASE_URL || '';
const hasPlaceholder = rawDbUrl.includes('[YOUR-PASSWORD]') || rawDbUrl.includes('YOUR-PASSWORD');

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

const memoryStore: MemoryStore = {
  users: new Map(),
  chats: new Map(),
  messages: new Map(),
  skills: new Map(),
  tiers: new Map(),
  apps: new Map(),
  apiKeys: new Map(),
  auditLogs: [],
};

// Seed all 53 skills
INITIAL_53_SKILLS.forEach(s => memoryStore.skills.set(s.id, s));

// Seed default subscription tiers
INITIAL_SUBSCRIPTION_TIERS.forEach(t => memoryStore.tiers.set(t.id, t));

// Seed superadmin user
memoryStore.users.set(SUPER_ADMIN_EMAIL.toLowerCase(), {
  id: 'usr_superadmin',
  email: SUPER_ADMIN_EMAIL.toLowerCase(),
  name: 'Super Admin',
  role: 'SUPER_ADMIN',
  subscription_tier: 'ADMIN',
  created_at: new Date().toISOString(),
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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

        CREATE TABLE IF NOT EXISTS messages (
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
          allowed_tiers TEXT[] DEFAULT ARRAY['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']
        );

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
      `);

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

export async function upsertUser(user: { email: string; name?: string; picture?: string; role?: string; subscription_tier?: string }) {
  await initDb();
  const normalized = user.email.toLowerCase();
  const isSuper = normalized === SUPER_ADMIN_EMAIL.toLowerCase();
  const role = isSuper ? 'SUPER_ADMIN' : (user.role || 'USER');
  const tier = isSuper ? 'ADMIN' : (user.subscription_tier || 'BEGINNER');

  if (pool && isPgAvailable) {
    try {
      const res = await pool.query(`
        INSERT INTO users (id, email, name, picture, role, subscription_tier)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, users.name),
          picture = COALESCE(EXCLUDED.picture, users.picture)
        RETURNING *
      `, [crypto.randomUUID(), normalized, user.name || '', user.picture || '', role, tier]);
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
    created_at: existing.created_at || new Date().toISOString(),
  };
  memoryStore.users.set(normalized, updated);
  return updated;
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
      const res = await pool.query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC', [chatId]);
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
        INSERT INTO messages (id, chat_id, role, content, actions, attachments, audio_url, created_at)
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
      if (res.rows.length > 0) return res.rows;
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
        INSERT INTO skills (id, name, department, description, enabled, allowed_tiers)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          department = EXCLUDED.department,
          description = EXCLUDED.description,
          enabled = EXCLUDED.enabled,
          allowed_tiers = EXCLUDED.allowed_tiers
      `, [skill.id, skill.name, skill.department, skill.description || '', skill.enabled, skill.allowedTiers || ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN']]);
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

// ----------------- API KEY POOL -----------------
export async function getApiKeyForTier(tier: string, provider = 'gemini'): Promise<string> {
  await initDb();
  const keys = Array.from(memoryStore.apiKeys.values()).filter(
    k => k.provider === provider && k.is_active && (k.tier === 'ALL' || k.tier === tier)
  );

  if (keys.length > 0) {
    keys.sort((a, b) => a.usage_count - b.usage_count);
    const chosen = keys[0];
    chosen.usage_count++;
    return chosen.key_value;
  }

  return process.env.GEMINI_API_KEY || '';
}

export async function addApiKey(provider: string, key: string, tier: string) {
  const id = `key_${Date.now()}`;
  const masked = key.substring(0, 4) + '...' + key.substring(key.length - 4);
  const record = {
    id,
    provider,
    key_masked: masked,
    key_value: key,
    tier,
    is_active: true,
    usage_count: 0,
    failure_count: 0,
  };
  memoryStore.apiKeys.set(id, record);
  return record;
}

export async function deleteApiKey(keyId: string) {
  memoryStore.apiKeys.delete(keyId);
}

export async function getAllApiKeys() {
  return Array.from(memoryStore.apiKeys.values()).map(k => ({
    id: k.id,
    provider: k.provider,
    key_masked: k.key_masked,
    tier: k.tier,
    is_active: k.is_active,
    usage_count: k.usage_count,
  }));
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
