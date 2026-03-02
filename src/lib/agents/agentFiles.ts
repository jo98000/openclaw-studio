// ---------------------------------------------------------------------------
// Agent file names — new 5-file format (PERSONA.md, DIRECTIVES.md, USER.md,
// HEARTBEAT.md, MEMORY.md). Replaces the former 7-file layout.
// ---------------------------------------------------------------------------

export const AGENT_FILE_NAMES = [
  "PERSONA.md",
  "DIRECTIVES.md",
  "USER.md",
  "HEARTBEAT.md",
  "MEMORY.md",
] as const;

export type AgentFileName = (typeof AGENT_FILE_NAMES)[number];

export const PERSONALITY_FILE_NAMES = [
  "PERSONA.md",
  "DIRECTIVES.md",
  "USER.md",
] as const satisfies readonly AgentFileName[];

export type PersonalityFileName = (typeof PERSONALITY_FILE_NAMES)[number];

export const PERSONALITY_FILE_LABELS: Record<PersonalityFileName, string> = {
  "PERSONA.md": "Persona",
  "DIRECTIVES.md": "Directives",
  "USER.md": "Context",
};

export const isAgentFileName = (value: string): value is AgentFileName =>
  AGENT_FILE_NAMES.includes(value as AgentFileName);

export const AGENT_FILE_META: Record<
  AgentFileName,
  { title: string; hint: string }
> = {
  "PERSONA.md": {
    title: "PERSONA.md",
    hint: "Identity, personality, tone, and boundaries.",
  },
  "DIRECTIVES.md": {
    title: "DIRECTIVES.md",
    hint: "Operating instructions, priorities, rules, and tool conventions.",
  },
  "USER.md": {
    title: "USER.md",
    hint: "User profile and preferences.",
  },
  "HEARTBEAT.md": {
    title: "HEARTBEAT.md",
    hint: "Small checklist for heartbeat runs.",
  },
  "MEMORY.md": {
    title: "MEMORY.md",
    hint: "Durable memory for this agent.",
  },
};

export const AGENT_FILE_PLACEHOLDERS: Record<AgentFileName, string> = {
  "PERSONA.md":
    "Name, creature, vibe, personality traits, core truths, and boundaries.",
  "DIRECTIVES.md":
    "Mission, operating rules, priorities, output format, and tool notes.",
  "USER.md": "How should it address you? Preferences and context.",
  "HEARTBEAT.md": "A tiny checklist for periodic runs.",
  "MEMORY.md": "Durable facts, decisions, and preferences to remember.",
};

export const createAgentFilesState = () =>
  Object.fromEntries(
    AGENT_FILE_NAMES.map((name) => [name, { content: "", exists: false }]),
  ) as Record<AgentFileName, { content: string; exists: boolean }>;

// ---------------------------------------------------------------------------
// Legacy file names (7-file format) — kept for migration detection.
// ---------------------------------------------------------------------------

export const LEGACY_FILE_NAMES = [
  "AGENTS.md",
  "SOUL.md",
  "IDENTITY.md",
  "USER.md",
  "TOOLS.md",
  "HEARTBEAT.md",
  "MEMORY.md",
] as const;

export type LegacyAgentFileName = (typeof LEGACY_FILE_NAMES)[number];

export const isLegacyAgentFileName = (
  value: string,
): value is LegacyAgentFileName =>
  LEGACY_FILE_NAMES.includes(value as LegacyAgentFileName);
