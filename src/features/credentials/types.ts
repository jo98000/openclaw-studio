export type CredentialServiceType =
  | "smtp"
  | "twitter"
  | "instagram"
  | "github"
  | "slack"
  | "whatsapp"
  | "telegram"
  | "discord"
  | "teams"
  | "mattermost"
  | "twilio"
  | "sendgrid"
  | "stripe"
  | "aws"
  | "gcp"
  | "supabase"
  | "notion"
  | "linear"
  | "jira"
  | "gitlab"
  | "hubspot"
  | "datadog"
  | "sentry"
  | "firebase"
  | "custom";

export type CredentialField = {
  key: string;
  value: string;
  sensitive: boolean;
};

export type CredentialEntry = {
  id: string;
  label: string;
  serviceType: CredentialServiceType;
  fields: CredentialField[];
  createdAt: number;
  updatedAt: number;
};

export type CredentialTemplate = {
  serviceType: CredentialServiceType;
  name: string;
  description: string;
  iconColor: string;
  defaultFields: Omit<CredentialField, "value">[];
  signupUrl?: string;
  getKeyUrl?: string;
  guideSteps?: string[];
  mcpServerHint?: string;
};
