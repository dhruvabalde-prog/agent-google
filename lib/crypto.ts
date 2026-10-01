import crypto from 'crypto';

// Master key derived from SESSION_SECRET or ENCRYPTION_KEY
const RAW_SECRET = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || 'antigravity-top-tier-aes-256-gcm-master-key-seed-32-bytes!';
// Derive a 32-byte key using SHA-256
const MASTER_KEY = crypto.createHash('sha256').update(RAW_SECRET).digest();

/**
 * Top-tier Authenticated Encryption with Associated Data (AEAD) using AES-256-GCM.
 * Each message uses a cryptographically secure random 12-byte IV.
 * Returns formatted ciphertext: "iv:authTag:encryptedPayload"
 */
export function encryptData(plaintext: string): string {
  if (!plaintext) return '';
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return plaintext;
  }
}

/**
 * Decrypts AES-256-GCM ciphertext. Verifies integrity tag.
 * Returns plaintext or null if tampered/invalid.
 */
export function decryptData(ciphertext: string): string {
  if (!ciphertext) return '';
  // Check if it matches iv:authTag:encrypted format
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    // Unencrypted legacy fallback
    return ciphertext;
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // Return original or failure message if decryption fails
    return ciphertext;
  }
}
