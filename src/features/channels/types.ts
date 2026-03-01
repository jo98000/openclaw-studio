export type ChannelId =
  | "whatsapp"
  | "telegram"
  | "slack"
  | "discord"
  | "teams"
  | "google-chat"
  | "signal"
  | "imessage"
  | "matrix"
  | "zalo"
  | "webchat"
  | "mattermost";

export type ChannelStatus = "connected" | "disconnected" | "error" | "configuring";

export type ChannelConfig = {
  id: ChannelId;
  enabled: boolean;
  fields: Record<string, string>;
  agentId?: string;
};

export type ChannelDefinition = {
  id: ChannelId;
  name: string;
  description: string;
  iconColor: string;
  icon: string;
  configFields: ChannelConfigField[];
};

export type ChannelConfigField = {
  key: string;
  label: string;
  placeholder: string;
  sensitive: boolean;
  required: boolean;
};

export type ChannelWithStatus = ChannelDefinition & {
  status: ChannelStatus;
  config?: ChannelConfig;
};
