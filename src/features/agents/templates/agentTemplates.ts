export type AgentTemplate = {
  id: string;
  icon: string;
  defaultModel: string;
  capabilities: {
    commandMode: "off" | "ask" | "auto";
    webAccess: boolean;
    fileTools: boolean;
  };
};

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "general",
    icon: "💬",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
  },
  {
    id: "researcher",
    icon: "🔍",
    defaultModel: "perplexity/sonar-pro",
    capabilities: { commandMode: "off", webAccess: true, fileTools: false },
  },
  {
    id: "coder",
    icon: "💻",
    defaultModel: "anthropic/claude-opus-4-5-20250414",
    capabilities: { commandMode: "auto", webAccess: true, fileTools: true },
  },
  {
    id: "writer",
    icon: "✍️",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "off", webAccess: false, fileTools: true },
  },
  {
    id: "multimodal",
    icon: "🌐",
    defaultModel: "google/gemini-2.0-flash",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
  },
  {
    id: "support",
    icon: "🎧",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
  },
  {
    id: "analyst",
    icon: "📊",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "auto", webAccess: true, fileTools: true },
  },
  {
    id: "devops",
    icon: "🔧",
    defaultModel: "anthropic/claude-opus-4-5-20250414",
    capabilities: { commandMode: "auto", webAccess: true, fileTools: true },
  },
  {
    id: "social",
    icon: "📱",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
  },
  {
    id: "strategist",
    icon: "📝",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "off", webAccess: true, fileTools: true },
  },
  {
    id: "sales",
    icon: "🎯",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
  },
  {
    id: "assistant",
    icon: "🗓️",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
  },
  {
    id: "translator",
    icon: "🌍",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "off", webAccess: true, fileTools: false },
  },
  {
    id: "custom",
    icon: "⚙️",
    defaultModel: "",
    capabilities: { commandMode: "ask", webAccess: false, fileTools: false },
  },
];

export const getTemplateById = (id: string) =>
  AGENT_TEMPLATES.find((t) => t.id === id) ?? null;
