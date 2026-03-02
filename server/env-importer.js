const fs = require("node:fs");
const path = require("node:path");

/**
 * Known env var patterns → service type + field key mappings.
 * Each entry: { envVar, serviceType, fieldKey, sensitive }
 */
const ENV_PATTERNS = [
  // --- Providers ---
  { envVar: "OPENAI_API_KEY", serviceType: "openai", fieldKey: "apiKey", category: "provider" },
  { envVar: "ANTHROPIC_API_KEY", serviceType: "anthropic", fieldKey: "apiKey", category: "provider" },
  { envVar: "GOOGLE_AI_API_KEY", serviceType: "google", fieldKey: "apiKey", category: "provider" },
  { envVar: "GEMINI_API_KEY", serviceType: "google", fieldKey: "apiKey", category: "provider" },
  { envVar: "MISTRAL_API_KEY", serviceType: "mistral", fieldKey: "apiKey", category: "provider" },
  { envVar: "GROQ_API_KEY", serviceType: "groq", fieldKey: "apiKey", category: "provider" },
  { envVar: "PERPLEXITY_API_KEY", serviceType: "perplexity", fieldKey: "apiKey", category: "provider" },
  { envVar: "OPENROUTER_API_KEY", serviceType: "openrouter", fieldKey: "apiKey", category: "provider" },
  { envVar: "DEEPSEEK_API_KEY", serviceType: "deepseek", fieldKey: "apiKey", category: "provider" },
  { envVar: "TOGETHER_API_KEY", serviceType: "together", fieldKey: "apiKey", category: "provider" },
  { envVar: "FIREWORKS_API_KEY", serviceType: "fireworks", fieldKey: "apiKey", category: "provider" },
  { envVar: "COHERE_API_KEY", serviceType: "cohere", fieldKey: "apiKey", category: "provider" },
  { envVar: "HUGGINGFACE_API_KEY", serviceType: "huggingface", fieldKey: "apiKey", category: "provider" },
  { envVar: "HF_TOKEN", serviceType: "huggingface", fieldKey: "apiKey", category: "provider" },
  { envVar: "XAI_API_KEY", serviceType: "xai", fieldKey: "apiKey", category: "provider" },

  // --- Credentials ---
  { envVar: "GITHUB_TOKEN", serviceType: "github", fieldKey: "token", category: "credential" },
  { envVar: "SLACK_BOT_TOKEN", serviceType: "slack", fieldKey: "botToken", category: "credential" },
  { envVar: "SLACK_WEBHOOK_URL", serviceType: "slack", fieldKey: "webhookUrl", category: "credential" },
  { envVar: "AWS_ACCESS_KEY_ID", serviceType: "aws", fieldKey: "accessKeyId", category: "credential" },
  { envVar: "AWS_SECRET_ACCESS_KEY", serviceType: "aws", fieldKey: "secretAccessKey", category: "credential" },
  { envVar: "AWS_REGION", serviceType: "aws", fieldKey: "region", category: "credential" },
  { envVar: "AWS_DEFAULT_REGION", serviceType: "aws", fieldKey: "region", category: "credential" },
  { envVar: "GCP_PROJECT_ID", serviceType: "gcp", fieldKey: "projectId", category: "credential" },
  { envVar: "GOOGLE_CLOUD_PROJECT", serviceType: "gcp", fieldKey: "projectId", category: "credential" },
  { envVar: "GCP_CLIENT_EMAIL", serviceType: "gcp", fieldKey: "clientEmail", category: "credential" },
  { envVar: "GCP_PRIVATE_KEY", serviceType: "gcp", fieldKey: "privateKey", category: "credential" },
  { envVar: "STRIPE_SECRET_KEY", serviceType: "stripe", fieldKey: "secretKey", category: "credential" },
  { envVar: "STRIPE_WEBHOOK_SECRET", serviceType: "stripe", fieldKey: "webhookSecret", category: "credential" },
  { envVar: "STRIPE_PUBLISHABLE_KEY", serviceType: "stripe", fieldKey: "publishableKey", category: "credential" },
  { envVar: "TELEGRAM_BOT_TOKEN", serviceType: "telegram", fieldKey: "botToken", category: "credential" },
  { envVar: "DISCORD_BOT_TOKEN", serviceType: "discord", fieldKey: "botToken", category: "credential" },
  { envVar: "DISCORD_APPLICATION_ID", serviceType: "discord", fieldKey: "applicationId", category: "credential" },
  { envVar: "DISCORD_PUBLIC_KEY", serviceType: "discord", fieldKey: "publicKey", category: "credential" },
  { envVar: "WHATSAPP_PHONE_NUMBER_ID", serviceType: "whatsapp", fieldKey: "phoneNumberId", category: "credential" },
  { envVar: "WHATSAPP_ACCESS_TOKEN", serviceType: "whatsapp", fieldKey: "accessToken", category: "credential" },
  { envVar: "WHATSAPP_VERIFY_TOKEN", serviceType: "whatsapp", fieldKey: "verifyToken", category: "credential" },
  { envVar: "WHATSAPP_APP_SECRET", serviceType: "whatsapp", fieldKey: "appSecret", category: "credential" },
  { envVar: "SENDGRID_API_KEY", serviceType: "sendgrid", fieldKey: "apiKey", category: "credential" },
  { envVar: "NOTION_TOKEN", serviceType: "notion", fieldKey: "integrationToken", category: "credential" },
  { envVar: "NOTION_API_KEY", serviceType: "notion", fieldKey: "integrationToken", category: "credential" },
  { envVar: "LINEAR_API_KEY", serviceType: "linear", fieldKey: "apiKey", category: "credential" },
  { envVar: "TWILIO_ACCOUNT_SID", serviceType: "twilio", fieldKey: "accountSid", category: "credential" },
  { envVar: "TWILIO_AUTH_TOKEN", serviceType: "twilio", fieldKey: "authToken", category: "credential" },
  { envVar: "TWILIO_PHONE_NUMBER", serviceType: "twilio", fieldKey: "phoneNumber", category: "credential" },
  { envVar: "SUPABASE_URL", serviceType: "supabase", fieldKey: "url", category: "credential" },
  { envVar: "SUPABASE_ANON_KEY", serviceType: "supabase", fieldKey: "anonKey", category: "credential" },
  { envVar: "SUPABASE_SERVICE_ROLE_KEY", serviceType: "supabase", fieldKey: "serviceRoleKey", category: "credential" },
  { envVar: "SENTRY_DSN", serviceType: "sentry", fieldKey: "dsn", category: "credential" },
  { envVar: "SENTRY_AUTH_TOKEN", serviceType: "sentry", fieldKey: "authToken", category: "credential" },
  { envVar: "DATADOG_API_KEY", serviceType: "datadog", fieldKey: "apiKey", category: "credential" },
  { envVar: "DATADOG_APP_KEY", serviceType: "datadog", fieldKey: "appKey", category: "credential" },
  { envVar: "HUBSPOT_ACCESS_TOKEN", serviceType: "hubspot", fieldKey: "accessToken", category: "credential" },
  { envVar: "JIRA_API_TOKEN", serviceType: "jira", fieldKey: "apiToken", category: "credential" },
  { envVar: "JIRA_EMAIL", serviceType: "jira", fieldKey: "email", category: "credential" },
  { envVar: "JIRA_DOMAIN", serviceType: "jira", fieldKey: "domain", category: "credential" },
  { envVar: "GITLAB_TOKEN", serviceType: "gitlab", fieldKey: "token", category: "credential" },
  { envVar: "GITLAB_BASE_URL", serviceType: "gitlab", fieldKey: "baseUrl", category: "credential" },
  { envVar: "FIREBASE_PROJECT_ID", serviceType: "firebase", fieldKey: "projectId", category: "credential" },
  { envVar: "FIREBASE_API_KEY", serviceType: "firebase", fieldKey: "apiKey", category: "credential" },
  { envVar: "FIREBASE_AUTH_DOMAIN", serviceType: "firebase", fieldKey: "authDomain", category: "credential" },
  { envVar: "TWITTER_API_KEY", serviceType: "twitter", fieldKey: "apiKey", category: "credential" },
  { envVar: "TWITTER_API_SECRET", serviceType: "twitter", fieldKey: "apiSecret", category: "credential" },
  { envVar: "TWITTER_ACCESS_TOKEN", serviceType: "twitter", fieldKey: "accessToken", category: "credential" },
  { envVar: "TWITTER_ACCESS_TOKEN_SECRET", serviceType: "twitter", fieldKey: "accessTokenSecret", category: "credential" },
  { envVar: "INSTAGRAM_ACCESS_TOKEN", serviceType: "instagram", fieldKey: "accessToken", category: "credential" },
  { envVar: "INSTAGRAM_APP_ID", serviceType: "instagram", fieldKey: "appId", category: "credential" },
  { envVar: "INSTAGRAM_APP_SECRET", serviceType: "instagram", fieldKey: "appSecret", category: "credential" },
  { envVar: "SMTP_HOST", serviceType: "smtp", fieldKey: "host", category: "credential" },
  { envVar: "SMTP_PORT", serviceType: "smtp", fieldKey: "port", category: "credential" },
  { envVar: "SMTP_USERNAME", serviceType: "smtp", fieldKey: "username", category: "credential" },
  { envVar: "SMTP_PASSWORD", serviceType: "smtp", fieldKey: "password", category: "credential" },
  { envVar: "TEAMS_APP_ID", serviceType: "teams", fieldKey: "appId", category: "credential" },
  { envVar: "TEAMS_APP_PASSWORD", serviceType: "teams", fieldKey: "appPassword", category: "credential" },
  { envVar: "TEAMS_TENANT_ID", serviceType: "teams", fieldKey: "tenantId", category: "credential" },
  { envVar: "MATTERMOST_SERVER_URL", serviceType: "mattermost", fieldKey: "serverUrl", category: "credential" },
  { envVar: "MATTERMOST_BOT_TOKEN", serviceType: "mattermost", fieldKey: "botToken", category: "credential" },
  { envVar: "MATTERMOST_TEAM_ID", serviceType: "mattermost", fieldKey: "teamId", category: "credential" },
];

/**
 * Parse a .env file content into a key→value map.
 * Supports # comments, empty lines, quoted values, and multiline escapes.
 */
const parseDotEnv = (content) => {
  const result = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
};

/**
 * Import credentials and provider configs from a .env file.
 *
 * @param {string} filePath - Absolute path to the .env file
 * @returns {{ providers: Array, credentials: Array, unmatched: Array }}
 */
const importFromEnvFile = (filePath) => {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, "utf8");
  return importFromEnvContent(content);
};

/**
 * Import from raw .env content (for POST body usage).
 */
const importFromEnvContent = (content) => {
  const envMap = parseDotEnv(content);
  const matched = new Set();

  // Group matches by serviceType+category
  const grouped = {};
  for (const pattern of ENV_PATTERNS) {
    const value = envMap[pattern.envVar];
    if (!value) continue;
    matched.add(pattern.envVar);
    const groupKey = `${pattern.category}:${pattern.serviceType}`;
    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        serviceType: pattern.serviceType,
        category: pattern.category,
        fields: [],
      };
    }
    grouped[groupKey].fields.push({
      key: pattern.fieldKey,
      value,
      sensitive: !["region", "projectId", "url", "domain", "email", "host", "port", "baseUrl", "authDomain", "phoneNumber"].includes(pattern.fieldKey),
    });
  }

  const providers = [];
  const credentials = [];
  for (const group of Object.values(grouped)) {
    if (group.category === "provider") {
      const apiKeyField = group.fields.find((f) => f.key === "apiKey");
      providers.push({
        serviceType: group.serviceType,
        apiKey: apiKeyField?.value ?? "",
        source: ".env file",
      });
    } else {
      credentials.push({
        serviceType: group.serviceType,
        fields: group.fields,
        source: ".env file",
      });
    }
  }

  // Collect unmatched keys
  const unmatched = Object.keys(envMap).filter((key) => !matched.has(key));

  return { providers, credentials, unmatched };
};

module.exports = { importFromEnvFile, importFromEnvContent, parseDotEnv, ENV_PATTERNS };
