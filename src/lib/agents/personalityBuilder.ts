import type { AgentFileName } from "@/lib/agents/agentFiles";
import type { LegacyAgentFileName } from "@/lib/agents/agentFiles";
import {
  type PersonalityTraits,
  DEFAULT_TRAITS,
  serializeTraitsToMarkdown,
  parseTraitsFromMarkdown,
} from "@/lib/agents/personalityTraits";

// ---------------------------------------------------------------------------
// Draft type — unified structure for the new 5-file format.
// ---------------------------------------------------------------------------

export type PersonalityBuilderDraft = {
  persona: {
    name: string;
    creature: string;
    emoji: string;
    avatar: string;
    vibe: string;
    coreTruths: string;
    boundaries: string;
    continuity: string;
    traits: PersonalityTraits;
  };
  directives: {
    mission: string;
    rules: string;
    priorities: string;
    outputFormat: string;
    toolNotes: string;
  };
  user: {
    name: string;
    callThem: string;
    pronouns: string;
    timezone: string;
    notes: string;
    context: string;
  };
  heartbeat: string;
  memory: string;
};

export type { PersonalityTraits };

// ---------------------------------------------------------------------------
// File input types
// ---------------------------------------------------------------------------

type AgentFilesInput = Record<
  AgentFileName,
  { content: string; exists: boolean }
>;
type LegacyFilesInput = Record<
  LegacyAgentFileName,
  { content: string; exists: boolean }
>;

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

export const createEmptyDraft = (): PersonalityBuilderDraft => ({
  persona: {
    name: "",
    creature: "",
    emoji: "",
    avatar: "",
    vibe: "",
    coreTruths: "",
    boundaries: "",
    continuity: "",
    traits: { ...DEFAULT_TRAITS },
  },
  directives: {
    mission: "",
    rules: "",
    priorities: "",
    outputFormat: "",
    toolNotes: "",
  },
  user: {
    name: "",
    callThem: "",
    pronouns: "",
    timezone: "",
    notes: "",
    context: "",
  },
  heartbeat: "",
  memory: "",
});

// ---------------------------------------------------------------------------
// Low-level parsing helpers
// ---------------------------------------------------------------------------

const cleanLabel = (value: string) =>
  value.replace(/[*_]/g, "").trim().toLowerCase();

const cleanValue = (value: string) => {
  let next = value.trim();
  next = next.replace(/^[*_]+|[*_]+$/g, "").trim();
  return next;
};

const normalizeTemplateValue = (value: string) => {
  let normalized = value.trim();
  normalized = normalized.replace(/^[*_]+|[*_]+$/g, "").trim();
  if (normalized.startsWith("(") && normalized.endsWith(")")) {
    normalized = normalized.slice(1, -1).trim();
  }
  normalized = normalized.replace(/[\u2013\u2014]/g, "-");
  normalized = normalized.replace(/\s+/g, " ").toLowerCase();
  return normalized;
};

const IDENTITY_PLACEHOLDER_VALUES = new Set([
  "pick something you like",
  "ai? robot? familiar? ghost in the machine? something weirder?",
  "how do you come across? sharp? warm? chaotic? calm?",
  "your signature - pick one that feels right",
  "workspace-relative path, http(s) url, or data uri",
]);

const USER_PLACEHOLDER_VALUES = new Set(["optional"]);

const USER_CONTEXT_PLACEHOLDER_VALUES = new Set([
  "what do they care about? what projects are they working on? what annoys them? what makes them laugh? build this over time.",
]);

const isIdentityPlaceholder = (value: string) =>
  IDENTITY_PLACEHOLDER_VALUES.has(normalizeTemplateValue(value));

const isUserPlaceholder = (value: string) =>
  USER_PLACEHOLDER_VALUES.has(normalizeTemplateValue(value));

const isUserContextPlaceholder = (value: string) =>
  USER_CONTEXT_PLACEHOLDER_VALUES.has(normalizeTemplateValue(value));

const parseLabelMap = (content: string): Map<string, string> => {
  const map = new Map<string, string>();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^##\s+/.test(trimmed)) break;
    const normalized = trimmed.replace(/^[-*]\s*/, "");
    const colonIndex = normalized.indexOf(":");
    if (colonIndex < 0) continue;
    const label = cleanLabel(normalized.slice(0, colonIndex));
    if (!label || map.has(label)) continue;
    const value = cleanValue(normalized.slice(colonIndex + 1));
    map.set(label, value);
  }
  return map;
};

const readFirst = (map: Map<string, string>, labels: string[]) => {
  for (const label of labels) {
    const value = map.get(label);
    if (typeof value === "string") return value;
  }
  return "";
};

const isSectionHeading = (line: string) => /^##\s+/.test(line.trim());

const parseSection = (content: string, sectionTitle: string): string => {
  const lines = content.split(/\r?\n/);
  const target = `## ${sectionTitle}`.toLowerCase();
  let startIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim().toLowerCase() === target) {
      startIndex = index + 1;
      break;
    }
  }

  if (startIndex < 0) return "";

  let endIndex = lines.length;
  for (let index = startIndex; index < lines.length; index += 1) {
    if (isSectionHeading(lines[index])) {
      endIndex = index;
      break;
    }
  }

  while (startIndex < endIndex && lines[startIndex].trim().length === 0)
    startIndex += 1;
  while (endIndex > startIndex && lines[endIndex - 1].trim().length === 0)
    endIndex -= 1;

  if (startIndex >= endIndex) return "";
  return lines.slice(startIndex, endIndex).join("\n");
};

const normalizeText = (value: string) => value.replace(/\r\n/g, "\n").trim();
const normalizeListField = (value: string) =>
  value.replace(/\r\n/g, "\n").trim();

// ---------------------------------------------------------------------------
// Parse — NEW 5-file format
// ---------------------------------------------------------------------------

export const parsePersonalityFiles = (
  files: AgentFilesInput,
): PersonalityBuilderDraft => {
  const draft = createEmptyDraft();

  // PERSONA.md — identity fields + soul sections + traits
  const personaContent = files["PERSONA.md"].content;
  const personaLabels = parseLabelMap(personaContent);
  const pName = readFirst(personaLabels, ["name"]);
  const pCreature = readFirst(personaLabels, ["creature"]);
  const pEmoji = readFirst(personaLabels, ["emoji"]);
  const pAvatar = readFirst(personaLabels, ["avatar"]);
  const pVibeLabel = readFirst(personaLabels, ["vibe"]);
  draft.persona.name = isIdentityPlaceholder(pName) ? "" : pName;
  draft.persona.creature = isIdentityPlaceholder(pCreature) ? "" : pCreature;
  draft.persona.emoji = isIdentityPlaceholder(pEmoji) ? "" : pEmoji;
  draft.persona.avatar = isIdentityPlaceholder(pAvatar) ? "" : pAvatar;
  draft.persona.vibe = isIdentityPlaceholder(pVibeLabel) ? "" : pVibeLabel;
  draft.persona.coreTruths = parseSection(personaContent, "Core Truths");
  draft.persona.boundaries = parseSection(personaContent, "Boundaries");
  draft.persona.continuity = parseSection(personaContent, "Continuity");

  const traitsSection = parseSection(personaContent, "Traits");
  draft.persona.traits = traitsSection
    ? parseTraitsFromMarkdown(traitsSection)
    : { ...DEFAULT_TRAITS };

  // DIRECTIVES.md — mission, rules, priorities, output format, tool notes
  const directivesContent = files["DIRECTIVES.md"].content;
  draft.directives.mission = parseSection(directivesContent, "Mission");
  draft.directives.rules = parseSection(directivesContent, "Rules");
  draft.directives.priorities = parseSection(directivesContent, "Priorities");
  draft.directives.outputFormat = parseSection(
    directivesContent,
    "Output Format",
  );
  draft.directives.toolNotes = parseSection(directivesContent, "Tool Notes");

  // If no structured sections found, treat entire content as rules (fallback)
  if (
    !draft.directives.mission &&
    !draft.directives.rules &&
    !draft.directives.priorities &&
    !draft.directives.outputFormat &&
    !draft.directives.toolNotes &&
    directivesContent.trim()
  ) {
    draft.directives.rules = normalizeText(directivesContent);
  }

  // USER.md — same as before
  const userLabels = parseLabelMap(files["USER.md"].content);
  const userName = readFirst(userLabels, ["name"]);
  const userCallThem = readFirst(userLabels, [
    "what to call them",
    "preferred address",
    "how to address them",
  ]);
  const userPronouns = readFirst(userLabels, ["pronouns"]);
  const userTimezone = readFirst(userLabels, ["timezone", "time zone"]);
  const userNotes = readFirst(userLabels, ["notes"]);
  const userContext = parseSection(files["USER.md"].content, "Context");
  draft.user.name = isUserPlaceholder(userName) ? "" : userName;
  draft.user.callThem = isUserPlaceholder(userCallThem) ? "" : userCallThem;
  draft.user.pronouns = isUserPlaceholder(userPronouns) ? "" : userPronouns;
  draft.user.timezone = isUserPlaceholder(userTimezone) ? "" : userTimezone;
  draft.user.notes = isUserPlaceholder(userNotes) ? "" : userNotes;
  draft.user.context = isUserContextPlaceholder(userContext) ? "" : userContext;

  draft.heartbeat = files["HEARTBEAT.md"].content;
  draft.memory = files["MEMORY.md"].content;

  return draft;
};

// ---------------------------------------------------------------------------
// Parse — LEGACY 7-file format → same PersonalityBuilderDraft output
// ---------------------------------------------------------------------------

export const parseLegacyPersonalityFiles = (
  files: LegacyFilesInput,
): PersonalityBuilderDraft => {
  const draft = createEmptyDraft();

  // IDENTITY.md → persona identity fields
  const identity = parseLabelMap(files["IDENTITY.md"].content);
  const iName = readFirst(identity, ["name"]);
  const iCreature = readFirst(identity, ["creature"]);
  const iVibe = readFirst(identity, ["vibe"]);
  const iEmoji = readFirst(identity, ["emoji"]);
  const iAvatar = readFirst(identity, ["avatar"]);
  draft.persona.name = isIdentityPlaceholder(iName) ? "" : iName;
  draft.persona.creature = isIdentityPlaceholder(iCreature) ? "" : iCreature;
  draft.persona.vibe = isIdentityPlaceholder(iVibe) ? "" : iVibe;
  draft.persona.emoji = isIdentityPlaceholder(iEmoji) ? "" : iEmoji;
  draft.persona.avatar = isIdentityPlaceholder(iAvatar) ? "" : iAvatar;

  // SOUL.md → persona soul fields
  draft.persona.coreTruths = parseSection(
    files["SOUL.md"].content,
    "Core Truths",
  );
  draft.persona.boundaries = parseSection(
    files["SOUL.md"].content,
    "Boundaries",
  );
  draft.persona.continuity = parseSection(
    files["SOUL.md"].content,
    "Continuity",
  );
  const soulVibe = parseSection(files["SOUL.md"].content, "Vibe");
  if (soulVibe && !draft.persona.vibe) {
    draft.persona.vibe = soulVibe;
  }

  // AGENTS.md → directives rules (unstructured — treat whole file as rules)
  const agentsContent = normalizeText(files["AGENTS.md"].content);
  draft.directives.rules = agentsContent;

  // TOOLS.md → directives tool notes
  const toolsContent = normalizeText(files["TOOLS.md"].content);
  draft.directives.toolNotes = toolsContent;

  // USER.md
  const user = parseLabelMap(files["USER.md"].content);
  const userName = readFirst(user, ["name"]);
  const userCallThem = readFirst(user, [
    "what to call them",
    "preferred address",
    "how to address them",
  ]);
  const userPronouns = readFirst(user, ["pronouns"]);
  const userTimezone = readFirst(user, ["timezone", "time zone"]);
  const userNotes = readFirst(user, ["notes"]);
  const userContext = parseSection(files["USER.md"].content, "Context");
  draft.user.name = isUserPlaceholder(userName) ? "" : userName;
  draft.user.callThem = isUserPlaceholder(userCallThem) ? "" : userCallThem;
  draft.user.pronouns = isUserPlaceholder(userPronouns) ? "" : userPronouns;
  draft.user.timezone = isUserPlaceholder(userTimezone) ? "" : userTimezone;
  draft.user.notes = isUserPlaceholder(userNotes) ? "" : userNotes;
  draft.user.context = isUserContextPlaceholder(userContext) ? "" : userContext;

  draft.heartbeat = files["HEARTBEAT.md"].content;
  draft.memory = files["MEMORY.md"].content;

  return draft;
};

// ---------------------------------------------------------------------------
// Serialize — NEW 5-file format
// ---------------------------------------------------------------------------

const serializePersonaMarkdown = (
  persona: PersonalityBuilderDraft["persona"],
) => {
  const name = normalizeListField(persona.name);
  const creature = normalizeListField(persona.creature);
  const emoji = normalizeListField(persona.emoji);
  const avatar = normalizeListField(persona.avatar);
  const vibe = normalizeListField(persona.vibe);
  const coreTruths = normalizeText(persona.coreTruths);
  const boundaries = normalizeText(persona.boundaries);
  const continuity = normalizeText(persona.continuity);

  return [
    "# PERSONA.md",
    "",
    `- Name: ${name}`,
    `- Creature: ${creature}`,
    `- Vibe: ${vibe}`,
    `- Emoji: ${emoji}`,
    `- Avatar: ${avatar}`,
    "",
    "## Core Truths",
    "",
    ...(coreTruths ? coreTruths.split("\n") : []),
    "",
    "## Boundaries",
    "",
    ...(boundaries ? boundaries.split("\n") : []),
    "",
    "## Continuity",
    "",
    ...(continuity ? continuity.split("\n") : []),
    "",
    "## Traits",
    "",
    serializeTraitsToMarkdown(persona.traits),
    "",
  ].join("\n");
};

const serializeDirectivesMarkdown = (
  directives: PersonalityBuilderDraft["directives"],
) => {
  const mission = normalizeText(directives.mission);
  const rules = normalizeText(directives.rules);
  const priorities = normalizeText(directives.priorities);
  const outputFormat = normalizeText(directives.outputFormat);
  const toolNotes = normalizeText(directives.toolNotes);

  return [
    "# DIRECTIVES.md",
    "",
    "## Mission",
    "",
    ...(mission ? mission.split("\n") : []),
    "",
    "## Rules",
    "",
    ...(rules ? rules.split("\n") : []),
    "",
    "## Priorities",
    "",
    ...(priorities ? priorities.split("\n") : []),
    "",
    "## Output Format",
    "",
    ...(outputFormat ? outputFormat.split("\n") : []),
    "",
    "## Tool Notes",
    "",
    ...(toolNotes ? toolNotes.split("\n") : []),
    "",
  ].join("\n");
};

const serializeUserMarkdown = (draft: PersonalityBuilderDraft["user"]) => {
  const name = normalizeListField(draft.name);
  const callThem = normalizeListField(draft.callThem);
  const pronouns = normalizeListField(draft.pronouns);
  const timezone = normalizeListField(draft.timezone);
  const notes = normalizeListField(draft.notes);
  const context = normalizeText(draft.context);

  return [
    "# USER.md - About Your Human",
    "",
    `- Name: ${name}`,
    `- What to call them: ${callThem}`,
    `- Pronouns: ${pronouns}`,
    `- Timezone: ${timezone}`,
    `- Notes: ${notes}`,
    "",
    "## Context",
    "",
    ...(context ? context.split("\n") : []),
    "",
  ].join("\n");
};

export const serializePersonalityFiles = (
  draft: PersonalityBuilderDraft,
): Record<AgentFileName, string> => ({
  "PERSONA.md": serializePersonaMarkdown(draft.persona),
  "DIRECTIVES.md": serializeDirectivesMarkdown(draft.directives),
  "USER.md": serializeUserMarkdown(draft.user),
  "HEARTBEAT.md": draft.heartbeat,
  "MEMORY.md": draft.memory,
});
