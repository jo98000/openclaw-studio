export type AgentCreateModalSubmitPayload = {
  name: string;
  avatarSeed?: string;
  templateId?: string;
  modelKey?: string;
  description?: string;
  capabilities?: {
    commandMode: "off" | "ask" | "auto";
    webAccess: boolean;
    fileTools: boolean;
  };
};
