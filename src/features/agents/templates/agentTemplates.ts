export type AgentTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
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
    name: "General Assistant",
    icon: "💬",
    description: "Balanced agent for everyday tasks",
    defaultModel: "anthropic/claude-sonnet-4-5-20250414",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
  },
  {
    id: "researcher",
    name: "Web Researcher",
    icon: "🔍",
    description: "Search-focused agent with web access",
    defaultModel: "perplexity/sonar-pro",
    capabilities: { commandMode: "off", webAccess: true, fileTools: false },
  },
  {
    id: "coder",
    name: "Expert Coder",
    icon: "💻",
    description: "Code-first agent with auto execution",
    defaultModel: "anthropic/claude-opus-4-5-20250414",
    capabilities: { commandMode: "auto", webAccess: true, fileTools: true },
  },
  {
    id: "writer",
    name: "Writer",
    icon: "✍️",
    description: "Content creation without code execution",
    defaultModel: "openai/gpt-4o",
    capabilities: { commandMode: "off", webAccess: false, fileTools: true },
  },
  {
    id: "multimodal",
    name: "Multimodal Agent",
    icon: "🌐",
    description: "Image + text with large context window",
    defaultModel: "google/gemini-2.0-flash",
    capabilities: { commandMode: "ask", webAccess: true, fileTools: true },
  },
  {
    id: "custom",
    name: "Custom",
    icon: "⚙️",
    description: "Configure everything manually",
    defaultModel: "",
    capabilities: { commandMode: "ask", webAccess: false, fileTools: false },
  },
];

export const getTemplateById = (id: string) =>
  AGENT_TEMPLATES.find((t) => t.id === id) ?? null;
