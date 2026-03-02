/**
 * Maps credential service types and field keys to standard environment variable names.
 * These env var names match what popular SDKs and tools expect (e.g., AWS SDK reads
 * AWS_ACCESS_KEY_ID, Octokit reads GITHUB_TOKEN, etc.)
 */

/**
 * Mapping: serviceType → { fieldKey: "ENV_VAR_NAME" }
 */
export const CREDENTIAL_ENV_MAP: Record<string, Record<string, string>> = {
  github: { token: "GITHUB_TOKEN" },
  slack: { botToken: "SLACK_BOT_TOKEN", webhookUrl: "SLACK_WEBHOOK_URL" },
  aws: {
    accessKeyId: "AWS_ACCESS_KEY_ID",
    secretAccessKey: "AWS_SECRET_ACCESS_KEY",
    region: "AWS_REGION",
  },
  gcp: {
    projectId: "GCP_PROJECT_ID",
    clientEmail: "GCP_CLIENT_EMAIL",
    privateKey: "GCP_PRIVATE_KEY",
  },
  stripe: {
    secretKey: "STRIPE_SECRET_KEY",
    webhookSecret: "STRIPE_WEBHOOK_SECRET",
    publishableKey: "STRIPE_PUBLISHABLE_KEY",
  },
  telegram: { botToken: "TELEGRAM_BOT_TOKEN" },
  discord: {
    botToken: "DISCORD_BOT_TOKEN",
    applicationId: "DISCORD_APPLICATION_ID",
    publicKey: "DISCORD_PUBLIC_KEY",
  },
  whatsapp: {
    phoneNumberId: "WHATSAPP_PHONE_NUMBER_ID",
    accessToken: "WHATSAPP_ACCESS_TOKEN",
    verifyToken: "WHATSAPP_VERIFY_TOKEN",
    appSecret: "WHATSAPP_APP_SECRET",
  },
  sendgrid: { apiKey: "SENDGRID_API_KEY" },
  notion: { integrationToken: "NOTION_TOKEN" },
  linear: { apiKey: "LINEAR_API_KEY" },
  twilio: {
    accountSid: "TWILIO_ACCOUNT_SID",
    authToken: "TWILIO_AUTH_TOKEN",
    phoneNumber: "TWILIO_PHONE_NUMBER",
  },
  supabase: {
    url: "SUPABASE_URL",
    anonKey: "SUPABASE_ANON_KEY",
    serviceRoleKey: "SUPABASE_SERVICE_ROLE_KEY",
  },
  sentry: { dsn: "SENTRY_DSN", authToken: "SENTRY_AUTH_TOKEN" },
  datadog: { apiKey: "DATADOG_API_KEY", appKey: "DATADOG_APP_KEY" },
  hubspot: { accessToken: "HUBSPOT_ACCESS_TOKEN" },
  jira: {
    domain: "JIRA_DOMAIN",
    email: "JIRA_EMAIL",
    apiToken: "JIRA_API_TOKEN",
  },
  gitlab: { token: "GITLAB_TOKEN", baseUrl: "GITLAB_BASE_URL" },
  firebase: {
    projectId: "FIREBASE_PROJECT_ID",
    apiKey: "FIREBASE_API_KEY",
    authDomain: "FIREBASE_AUTH_DOMAIN",
  },
  twitter: {
    apiKey: "TWITTER_API_KEY",
    apiSecret: "TWITTER_API_SECRET",
    accessToken: "TWITTER_ACCESS_TOKEN",
    accessTokenSecret: "TWITTER_ACCESS_TOKEN_SECRET",
  },
  instagram: {
    accessToken: "INSTAGRAM_ACCESS_TOKEN",
    appId: "INSTAGRAM_APP_ID",
    appSecret: "INSTAGRAM_APP_SECRET",
  },
  smtp: {
    host: "SMTP_HOST",
    port: "SMTP_PORT",
    username: "SMTP_USERNAME",
    password: "SMTP_PASSWORD",
  },
  teams: {
    appId: "TEAMS_APP_ID",
    appPassword: "TEAMS_APP_PASSWORD",
    tenantId: "TEAMS_TENANT_ID",
  },
  mattermost: {
    serverUrl: "MATTERMOST_SERVER_URL",
    botToken: "MATTERMOST_BOT_TOKEN",
    teamId: "MATTERMOST_TEAM_ID",
  },
};

/**
 * Convert credential fields to a flat map of environment variable name → value.
 *
 * For known service types, uses the standard env var names from CREDENTIAL_ENV_MAP.
 * For custom service types, generates names like OPENCLAW_CRED_{KEY_UPPER}.
 */
export const credentialFieldsToEnvVars = (
  serviceType: string,
  fields: ReadonlyArray<{ key: string; value: string }>,
): Record<string, string> => {
  const mapping = CREDENTIAL_ENV_MAP[serviceType];
  const result: Record<string, string> = {};

  for (const field of fields) {
    if (!field.key || !field.value) continue;

    if (mapping && mapping[field.key]) {
      result[mapping[field.key]] = field.value;
    } else if (serviceType === "custom" || !mapping) {
      const envKey = `OPENCLAW_CRED_${field.key.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`;
      result[envKey] = field.value;
    }
  }

  return result;
};

/**
 * Aggregate env vars from ALL credential entries for a given agent.
 * Later entries with the same env var name will overwrite earlier ones.
 */
export const allCredentialsToEnvVars = (
  entries: ReadonlyArray<{
    serviceType: string;
    fields: ReadonlyArray<{ key: string; value: string }>;
  }>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const entry of entries) {
    const vars = credentialFieldsToEnvVars(entry.serviceType, entry.fields);
    Object.assign(result, vars);
  }
  return result;
};
