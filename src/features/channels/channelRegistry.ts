import type { ChannelDefinition } from "./types";

export const CHANNEL_REGISTRY: ChannelDefinition[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "WhatsApp Business Cloud API",
    iconColor: "#25D366",
    icon: "📱",
    configFields: [
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "123456789", sensitive: false, required: true },
      { key: "accessToken", label: "Access Token", placeholder: "EAAx...", sensitive: true, required: true },
      { key: "verifyToken", label: "Verify Token", placeholder: "my-verify-token", sensitive: true, required: true },
      { key: "appSecret", label: "App Secret", placeholder: "abc123...", sensitive: true, required: false },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Telegram Bot API with webhook or long-polling",
    iconColor: "#26A5E4",
    icon: "✈️",
    configFields: [
      { key: "botToken", label: "Bot Token", placeholder: "123456:ABC-DEF...", sensitive: true, required: true },
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://...", sensitive: false, required: false },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Slack Events API + Web API for workspaces",
    iconColor: "#4A154B",
    icon: "💼",
    configFields: [
      { key: "botToken", label: "Bot Token", placeholder: "xoxb-...", sensitive: true, required: true },
      { key: "signingSecret", label: "Signing Secret", placeholder: "abc123...", sensitive: true, required: true },
      { key: "appId", label: "App ID", placeholder: "A0...", sensitive: false, required: false },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Discord bot for servers and DMs",
    iconColor: "#5865F2",
    icon: "🎮",
    configFields: [
      { key: "botToken", label: "Bot Token", placeholder: "MTk...", sensitive: true, required: true },
      { key: "applicationId", label: "Application ID", placeholder: "123...", sensitive: false, required: true },
      { key: "guildId", label: "Guild ID", placeholder: "456...", sensitive: false, required: false },
    ],
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Bot Framework connector for Teams",
    iconColor: "#6264A7",
    icon: "🏢",
    configFields: [
      { key: "appId", label: "App ID", placeholder: "xxxxxxxx-xxxx-...", sensitive: false, required: true },
      { key: "appPassword", label: "App Password", placeholder: "...", sensitive: true, required: true },
      { key: "tenantId", label: "Tenant ID", placeholder: "xxxxxxxx-xxxx-...", sensitive: false, required: false },
    ],
  },
  {
    id: "google-chat",
    name: "Google Chat",
    description: "Google Workspace Chat integration",
    iconColor: "#00AC47",
    icon: "💬",
    configFields: [
      { key: "serviceAccountKey", label: "Service Account JSON", placeholder: "{...}", sensitive: true, required: true },
      { key: "spaceId", label: "Space ID", placeholder: "spaces/...", sensitive: false, required: false },
    ],
  },
  {
    id: "signal",
    name: "Signal",
    description: "Signal messenger via Signal CLI or API",
    iconColor: "#3A76F0",
    icon: "🔒",
    configFields: [
      { key: "signalNumber", label: "Signal Number", placeholder: "+1234567890", sensitive: false, required: true },
      { key: "signalApiUrl", label: "Signal API URL", placeholder: "http://localhost:8080", sensitive: false, required: true },
    ],
  },
  {
    id: "imessage",
    name: "iMessage",
    description: "iMessage via BlueBubbles bridge",
    iconColor: "#34C759",
    icon: "🍎",
    configFields: [
      { key: "blueBubblesUrl", label: "BlueBubbles URL", placeholder: "http://localhost:1234", sensitive: false, required: true },
      { key: "blueBubblesPassword", label: "Password", placeholder: "...", sensitive: true, required: true },
    ],
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Matrix protocol via homeserver",
    iconColor: "#0DBD8B",
    icon: "🟢",
    configFields: [
      { key: "homeserverUrl", label: "Homeserver URL", placeholder: "https://matrix.org", sensitive: false, required: true },
      { key: "accessToken", label: "Access Token", placeholder: "syt_...", sensitive: true, required: true },
      { key: "userId", label: "User ID", placeholder: "@bot:matrix.org", sensitive: false, required: true },
    ],
  },
  {
    id: "zalo",
    name: "Zalo",
    description: "Zalo Official Account API",
    iconColor: "#0068FF",
    icon: "🇻🇳",
    configFields: [
      { key: "oaId", label: "OA ID", placeholder: "123...", sensitive: false, required: true },
      { key: "secretKey", label: "Secret Key", placeholder: "...", sensitive: true, required: true },
      { key: "accessToken", label: "Access Token", placeholder: "...", sensitive: true, required: true },
    ],
  },
  {
    id: "webchat",
    name: "WebChat",
    description: "Embeddable web chat widget",
    iconColor: "#0EA5E9",
    icon: "🌐",
    configFields: [
      { key: "directLineSecret", label: "DirectLine Secret", placeholder: "...", sensitive: true, required: false },
      { key: "theme", label: "Theme", placeholder: "default", sensitive: false, required: false },
    ],
  },
  {
    id: "mattermost",
    name: "Mattermost",
    description: "Self-hosted Mattermost bot",
    iconColor: "#0058CC",
    icon: "🔵",
    configFields: [
      { key: "serverUrl", label: "Server URL", placeholder: "https://mattermost.example.com", sensitive: false, required: true },
      { key: "botToken", label: "Bot Token", placeholder: "...", sensitive: true, required: true },
      { key: "teamId", label: "Team ID", placeholder: "...", sensitive: false, required: false },
    ],
  },
];

export const getChannelById = (id: string) =>
  CHANNEL_REGISTRY.find((c) => c.id === id) ?? null;
