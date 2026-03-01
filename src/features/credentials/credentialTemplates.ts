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
