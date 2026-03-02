import type { PersonalityTraits } from "@/lib/agents/personalityTraits";
import { TEMPLATE_PERSONALITIES } from "@/features/agents/templates/templatePersonalities";

export type AgentTemplatePersona = {
  traits: PersonalityTraits;
  vibe: string;
  coreTruths: string;
  boundaries: string;
};

export type AgentTemplateDirectives = {
  mission: string;
  rules: string;
  priorities: string;
  outputFormat: string;
};

export type AgentTemplate = {
  id: string;
  icon: string;
  defaultModel: string;
  capabilities: {
    commandMode: "off" | "ask" | "auto";
    webAccess: boolean;
    fileTools: boolean;
  };
  persona: AgentTemplatePersona;
  directives: AgentTemplateDirectives;
  suggestedUserContext?: {
    notes: string;
  };
};

const p = (id: string) =>
  TEMPLATE_PERSONALITIES[id] ?? {
    persona: {
      traits: {
        formality: 50,
        verbosity: 50,
        creativity: 50,
        proactivity: 50,
        warmth: 50,
      },
      vibe: "",
      coreTruths: "",
      boundaries: "",
    },
    directives: { mission: "", rules: "", priorities: "", outputFormat: "" },
  };

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "general",
    icon: "\u{1F4AC}",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
    ...p("general"),
  },
  {
    id: "researcher",
    icon: "\u{1F50D}",
    defaultModel: "perplexity/sonar-pro",
    capabilities: { commandMode: "off", webAccess: true, fileTools: false },
    ...p("researcher"),
  },
  {
    id: "coder",
    icon: "\u{1F4BB}",
    defaultModel: "anthropic/claude-opus-4-5-20250414",
    capabilities: { commandMode: "auto", webAccess: true, fileTools: true },
    ...p("coder"),
  },
  {
    id: "writer",
    icon: "\u270D\uFE0F",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "off", webAccess: false, fileTools: true },
    ...p("writer"),
  },
  {
    id: "multimodal",
    icon: "\u{1F310}",
    defaultModel: "google/gemini-2.0-flash",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
    ...p("multimodal"),
  },
  {
    id: "support",
    icon: "\u{1F3A7}",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
    ...p("support"),
  },
  {
    id: "analyst",
    icon: "\u{1F4CA}",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "auto", webAccess: true, fileTools: true },
    ...p("analyst"),
  },
  {
    id: "devops",
    icon: "\u{1F527}",
    defaultModel: "anthropic/claude-opus-4-5-20250414",
    capabilities: { commandMode: "auto", webAccess: true, fileTools: true },
    ...p("devops"),
  },
  {
    id: "social",
    icon: "\u{1F4F1}",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
    ...p("social"),
  },
  {
    id: "strategist",
    icon: "\u{1F4DD}",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "off", webAccess: true, fileTools: true },
    ...p("strategist"),
  },
  {
    id: "sales",
    icon: "\u{1F3AF}",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
    ...p("sales"),
  },
  {
    id: "assistant",
    icon: "\u{1F5D3}\uFE0F",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
    ...p("assistant"),
  },
  {
    id: "translator",
    icon: "\u{1F30D}",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "off", webAccess: true, fileTools: false },
    ...p("translator"),
  },
  {
    id: "custom",
    icon: "\u2699\uFE0F",
    defaultModel: "",
    capabilities: { commandMode: "ask", webAccess: false, fileTools: false },
    ...p("custom"),
  },
];

export const getTemplateById = (id: string) =>
  AGENT_TEMPLATES.find((t) => t.id === id) ?? null;
