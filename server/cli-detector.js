const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

/**
 * Safely execute a shell command and return trimmed stdout, or null on failure.
 */
const tryExec = (cmd, timeoutMs = 5000) => {
  try {
    const result = execSync(cmd, {
      encoding: "utf8",
      timeout: timeoutMs,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return typeof result === "string" ? result.trim() : null;
  } catch {
    return null;
  }
};

/**
 * Check if a command exists on the system.
 */
const commandExists = (cmd) => {
  const check = process.platform === "win32" ? `where ${cmd}` : `which ${cmd}`;
  return tryExec(check) !== null;
};

/**
 * Read a file safely, return null on failure.
 */
const readFileSafe = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
};

/**
 * Parse INI-style AWS credentials file.
 * Returns the [default] profile fields.
 */
const parseAwsCredentials = (content) => {
  const result = {};
  let inDefault = false;
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("[")) {
      inDefault = trimmed === "[default]";
      continue;
    }
    if (!inDefault) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key && value) result[key] = value;
  }
  return result;
};

// ─── Individual CLI detectors ───────────────────────────────────────────────

const detectGitHub = () => {
  if (!commandExists("gh")) return null;
  const token = tryExec("gh auth token");
  if (!token) return null;
  return {
    serviceType: "github",
    source: "gh CLI",
    fields: [{ key: "token", value: token, sensitive: true }],
  };
};

const detectAws = () => {
  const home = os.homedir();
  const credPath = path.join(home, ".aws", "credentials");
  const content = readFileSafe(credPath);
  if (!content) return null;
  const parsed = parseAwsCredentials(content);
  if (!parsed.aws_access_key_id || !parsed.aws_secret_access_key) return null;

  const fields = [
    { key: "accessKeyId", value: parsed.aws_access_key_id, sensitive: true },
    { key: "secretAccessKey", value: parsed.aws_secret_access_key, sensitive: true },
  ];

  // Also check region from config
  const configPath = path.join(home, ".aws", "config");
  const configContent = readFileSafe(configPath);
  if (configContent) {
    const configParsed = parseAwsCredentials(configContent);
    if (configParsed.region) {
      fields.push({ key: "region", value: configParsed.region, sensitive: false });
    }
  }

  return { serviceType: "aws", source: "~/.aws/credentials", fields };
};

const detectGcloud = () => {
  if (!commandExists("gcloud")) return null;
  const token = tryExec("gcloud auth print-access-token", 10000);
  if (!token) return null;
  const project = tryExec("gcloud config get-value project");
  const fields = [];
  if (project) {
    fields.push({ key: "projectId", value: project, sensitive: false });
  }
  // Note: access token is short-lived, better for validation than storage
  return {
    serviceType: "gcp",
    source: "gcloud CLI",
    fields,
    note: "GCP access tokens are short-lived. Consider using a service account key for persistent access.",
  };
};

const detectStripe = () => {
  const home = os.homedir();
  const configPath = path.join(home, ".config", "stripe", "config.toml");
  const content = readFileSafe(configPath);
  if (!content) return null;
  // Simple TOML parsing for test_mode_api_key
  const match = content.match(/test_mode_api_key\s*=\s*"?([^"\n]+)"?/);
  if (!match) return null;
  const key = match[1].trim();
  if (!key.startsWith("sk_")) return null;
  return {
    serviceType: "stripe",
    source: "~/.config/stripe/config.toml",
    fields: [{ key: "secretKey", value: key, sensitive: true }],
  };
};

const detectGitLab = () => {
  const home = os.homedir();
  // glab CLI config
  const glabPath = path.join(home, ".config", "glab-cli", "config.yml");
  const content = readFileSafe(glabPath);
  if (!content) return null;
  const match = content.match(/token:\s*(.+)/);
  if (!match) return null;
  const token = match[1].trim();
  if (!token) return null;
  return {
    serviceType: "gitlab",
    source: "glab CLI config",
    fields: [{ key: "token", value: token, sensitive: true }],
  };
};

const detectSupabase = () => {
  if (!commandExists("supabase")) return null;
  // Supabase CLI stores credentials in ~/.supabase
  const home = os.homedir();
  const accessTokenPath = path.join(home, ".supabase", "access-token");
  const token = readFileSafe(accessTokenPath);
  if (!token || !token.trim()) return null;
  return {
    serviceType: "supabase",
    source: "supabase CLI",
    fields: [{ key: "serviceRoleKey", value: token.trim(), sensitive: true }],
    note: "This is a Supabase access token. You may also need your project URL and anon key.",
  };
};

// ─── Aggregated detector ────────────────────────────────────────────────────

const ALL_DETECTORS = [
  detectGitHub,
  detectAws,
  detectGcloud,
  detectStripe,
  detectGitLab,
  detectSupabase,
];

/**
 * Detect all CLI-sourced credentials available on the system.
 * Returns an array of detected credentials with their source.
 */
const detectCliCredentials = () => {
  const results = [];
  for (const detect of ALL_DETECTORS) {
    try {
      const result = detect();
      if (result) results.push(result);
    } catch {
      // skip individual failures
    }
  }
  return results;
};

module.exports = { detectCliCredentials };
