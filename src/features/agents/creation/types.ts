import type { PersonalityTraits } from "@/lib/agents/personalityTraits";

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
  persona?: {
    traits?: PersonalityTraits;
    coreTruths?: string;
    boundaries?: string;
    vibe?: string;
  };
  directives?: {
    mission?: string;
    rules?: string;
    priorities?: string;
    outputFormat?: string;
  };
  userContext?: {
    name?: string;
    pronouns?: string;
    timezone?: string;
    notes?: string;
  };
  creationMode?: "template" | "conversational" | "blank";
};
