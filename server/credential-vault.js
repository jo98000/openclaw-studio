const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { resolveStateDir } = require("./studio-settings");

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

/**
 * Resolves the directory where encrypted credential files are stored.
 * One JSON file per agent: credentials/{agentId}.json
 */
const resolveCredentialsDir = (env = process.env) => {
  return path.join(resolveStateDir(env), "openclaw-studio", "credentials");
};

const resolveAgentCredentialPath = (agentId, env = process.env) => {
  const safe = String(agentId).replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(resolveCredentialsDir(env), `${safe}.json`);
};

/**
 * Derives a 32-byte encryption key from the CREDENTIAL_ENCRYPTION_KEY env var.
 * Accepts hex (64 chars) or any string (hashed with SHA-256).
 */
const deriveKey = (env = process.env) => {
  const raw = env.CREDENTIAL_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  if (/^[0-9a-f]{64}$/i.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  return crypto.createHash("sha256").update(raw).digest();
};

const encrypt = (plaintext, key) => {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    data: encrypted.toString("hex"),
  };
};

const decrypt = (envelope, key) => {
  const iv = Buffer.from(envelope.iv, "hex");
  const tag = Buffer.from(envelope.tag, "hex");
  const data = Buffer.from(envelope.data, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
};

/**
 * Loads and decrypts credentials for an agent.
 * Returns an array of credential entries, or [] if not found.
 */
const loadCredentials = (agentId, env = process.env) => {
  const key = deriveKey(env);
  const filePath = resolveAgentCredentialPath(agentId, env);

  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);

  // If no encryption key is set, data is stored as plain JSON
  if (!key) {
    return Array.isArray(parsed) ? parsed : [];
  }

  // Encrypted envelope
  if (parsed && parsed.iv && parsed.tag && parsed.data) {
    const json = decrypt(parsed, key);
    const entries = JSON.parse(json);
    return Array.isArray(entries) ? entries : [];
  }

  // Legacy unencrypted data
  return Array.isArray(parsed) ? parsed : [];
};

/**
 * Encrypts and persists credentials for an agent.
 */
const saveCredentials = (agentId, entries, env = process.env) => {
  const key = deriveKey(env);
  const filePath = resolveAgentCredentialPath(agentId, env);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const json = JSON.stringify(entries);

  if (key) {
    const envelope = encrypt(json, key);
    fs.writeFileSync(filePath, JSON.stringify(envelope), "utf8");
  } else {
    fs.writeFileSync(filePath, json, "utf8");
  }
};

/**
 * Removes credential file for an agent.
 */
const removeCredentials = (agentId, env = process.env) => {
  const filePath = resolveAgentCredentialPath(agentId, env);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore
  }
};

module.exports = {
  loadCredentials,
  saveCredentials,
  removeCredentials,
  resolveCredentialsDir,
};
