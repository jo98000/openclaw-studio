import type { CredentialTemplate, CredentialServiceType } from "./types";

export const CREDENTIAL_TEMPLATES: CredentialTemplate[] = [
  {
    serviceType: "smtp",
    name: "Email SMTP",
    description: "SMTP server credentials for sending email",
    iconColor: "#3B82F6",
    defaultFields: [
      { key: "host", sensitive: false },
      { key: "port", sensitive: false },
      { key: "username", sensitive: false },
      { key: "password", sensitive: true },
    ],
  },
  {
    serviceType: "twitter",
    name: "Twitter / X",
    description: "API keys and tokens for Twitter/X",
    iconColor: "#1DA1F2",
    defaultFields: [
      { key: "apiKey", sensitive: true },
      { key: "apiSecret", sensitive: true },
      { key: "accessToken", sensitive: true },
      { key: "accessTokenSecret", sensitive: true },
    ],
  },
  {
    serviceType: "instagram",
    name: "Instagram",
    description: "Access tokens for Instagram Graph API",
    iconColor: "#E1306C",
    defaultFields: [
      { key: "accessToken", sensitive: true },
      { key: "appId", sensitive: false },
      { key: "appSecret", sensitive: true },
    ],
  },
  {
    serviceType: "github",
    name: "GitHub",
    description: "Personal access tokens or app credentials",
    iconColor: "#24292F",
    defaultFields: [
      { key: "token", sensitive: true },
    ],
  },
  {
    serviceType: "slack",
    name: "Slack",
    description: "Bot tokens and webhook URLs",
    iconColor: "#4A154B",
    defaultFields: [
      { key: "botToken", sensitive: true },
      { key: "webhookUrl", sensitive: false },
    ],
  },
  {
    serviceType: "whatsapp",
    name: "WhatsApp Business",
    description: "WhatsApp Cloud API credentials",
    iconColor: "#25D366",
    defaultFields: [
      { key: "phoneNumberId", sensitive: false },
      { key: "accessToken", sensitive: true },
      { key: "verifyToken", sensitive: true },
      { key: "appSecret", sensitive: true },
    ],
  },
  {
    serviceType: "telegram",
    name: "Telegram Bot",
    description: "Telegram Bot API token",
    iconColor: "#26A5E4",
    defaultFields: [
      { key: "botToken", sensitive: true },
    ],
  },
  {
    serviceType: "discord",
    name: "Discord Bot",
    description: "Discord bot token and application credentials",
    iconColor: "#5865F2",
    defaultFields: [
      { key: "botToken", sensitive: true },
      { key: "applicationId", sensitive: false },
      { key: "publicKey", sensitive: false },
    ],
  },
  {
    serviceType: "teams",
    name: "Microsoft Teams",
    description: "Bot Framework credentials for Teams",
    iconColor: "#6264A7",
    defaultFields: [
      { key: "appId", sensitive: false },
      { key: "appPassword", sensitive: true },
      { key: "tenantId", sensitive: false },
    ],
  },
  {
    serviceType: "mattermost",
    name: "Mattermost",
    description: "Mattermost bot token and server URL",
    iconColor: "#0058CC",
    defaultFields: [
      { key: "serverUrl", sensitive: false },
      { key: "botToken", sensitive: true },
      { key: "teamId", sensitive: false },
    ],
  },
  {
    serviceType: "twilio",
    name: "Twilio",
    description: "SMS, voice, and WhatsApp via Twilio",
    iconColor: "#F22F46",
    defaultFields: [
      { key: "accountSid", sensitive: false },
      { key: "authToken", sensitive: true },
      { key: "phoneNumber", sensitive: false },
    ],
  },
  {
    serviceType: "sendgrid",
    name: "SendGrid",
    description: "Transactional and marketing email API",
    iconColor: "#1A82E2",
    defaultFields: [
      { key: "apiKey", sensitive: true },
    ],
  },
  {
    serviceType: "stripe",
    name: "Stripe",
    description: "Payment processing API keys",
    iconColor: "#635BFF",
    defaultFields: [
      { key: "secretKey", sensitive: true },
      { key: "webhookSecret", sensitive: true },
      { key: "publishableKey", sensitive: false },
    ],
  },
  {
    serviceType: "aws",
    name: "AWS",
    description: "Amazon Web Services access credentials",
    iconColor: "#FF9900",
    defaultFields: [
      { key: "accessKeyId", sensitive: true },
      { key: "secretAccessKey", sensitive: true },
      { key: "region", sensitive: false },
    ],
  },
  {
    serviceType: "gcp",
    name: "Google Cloud",
    description: "Google Cloud Platform service account",
    iconColor: "#4285F4",
    defaultFields: [
      { key: "projectId", sensitive: false },
      { key: "clientEmail", sensitive: false },
      { key: "privateKey", sensitive: true },
    ],
  },
  {
    serviceType: "supabase",
    name: "Supabase",
    description: "Supabase project URL and API keys",
    iconColor: "#3FCF8E",
    defaultFields: [
      { key: "url", sensitive: false },
      { key: "anonKey", sensitive: false },
      { key: "serviceRoleKey", sensitive: true },
    ],
  },
  {
    serviceType: "notion",
    name: "Notion",
    description: "Notion integration access token",
    iconColor: "#000000",
    defaultFields: [
      { key: "integrationToken", sensitive: true },
    ],
  },
  {
    serviceType: "linear",
    name: "Linear",
    description: "Linear project management API key",
    iconColor: "#5E6AD2",
    defaultFields: [
      { key: "apiKey", sensitive: true },
    ],
  },
  {
    serviceType: "jira",
    name: "Jira",
    description: "Atlassian Jira API credentials",
    iconColor: "#0052CC",
    defaultFields: [
      { key: "domain", sensitive: false },
      { key: "email", sensitive: false },
      { key: "apiToken", sensitive: true },
    ],
  },
  {
    serviceType: "gitlab",
    name: "GitLab",
    description: "GitLab personal or project access token",
    iconColor: "#FC6D26",
    defaultFields: [
      { key: "token", sensitive: true },
      { key: "baseUrl", sensitive: false },
    ],
  },
  {
    serviceType: "hubspot",
    name: "HubSpot",
    description: "HubSpot CRM access token",
    iconColor: "#FF7A59",
    defaultFields: [
      { key: "accessToken", sensitive: true },
    ],
  },
  {
    serviceType: "datadog",
    name: "Datadog",
    description: "Datadog monitoring API and application keys",
    iconColor: "#632CA6",
    defaultFields: [
      { key: "apiKey", sensitive: true },
      { key: "appKey", sensitive: true },
    ],
  },
  {
    serviceType: "sentry",
    name: "Sentry",
    description: "Sentry error monitoring DSN and auth token",
    iconColor: "#362D59",
    defaultFields: [
      { key: "dsn", sensitive: false },
      { key: "authToken", sensitive: true },
    ],
  },
  {
    serviceType: "firebase",
    name: "Firebase",
    description: "Firebase project credentials",
    iconColor: "#FFCA28",
    defaultFields: [
      { key: "projectId", sensitive: false },
      { key: "apiKey", sensitive: true },
      { key: "authDomain", sensitive: false },
    ],
  },
  {
    serviceType: "custom",
    name: "Custom",
    description: "Define your own credential fields",
    iconColor: "#6B7280",
    defaultFields: [],
  },
];

export const getTemplateByServiceType = (
  serviceType: CredentialServiceType,
): CredentialTemplate | null =>
  CREDENTIAL_TEMPLATES.find((t) => t.serviceType === serviceType) ?? null;
