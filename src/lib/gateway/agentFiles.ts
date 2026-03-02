import {
  type AgentFileName,
  AGENT_FILE_NAMES,
  type LegacyAgentFileName,
} from "@/lib/agents/agentFiles";
import type { GatewayClient } from "@/lib/gateway/GatewayClient";
import {
  parseLegacyPersonalityFiles,
  serializePersonalityFiles,
} from "@/lib/agents/personalityBuilder";

type AgentsFilesGetResponse = {
  file?: { missing?: unknown; content?: unknown };
};

const resolveAgentId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("agentId is required.");
  }
  return trimmed;
};

// ---------------------------------------------------------------------------
// Core read / write (accept any string as name so legacy reads work too)
// ---------------------------------------------------------------------------

export const readGatewayAgentFile = async (params: {
  client: GatewayClient;
  agentId: string;
  name: string;
}): Promise<{ exists: boolean; content: string }> => {
  const agentId = resolveAgentId(params.agentId);
  const response = await params.client.call<AgentsFilesGetResponse>(
    "agents.files.get",
    {
      agentId,
      name: params.name,
    },
  );
  const file = response?.file;
  const fileRecord =
    file && typeof file === "object" ? (file as Record<string, unknown>) : null;
  const missing = fileRecord?.missing === true;
  const content =
    fileRecord && typeof fileRecord.content === "string"
      ? fileRecord.content
      : "";
  return { exists: !missing, content };
};

export const writeGatewayAgentFile = async (params: {
  client: GatewayClient;
  agentId: string;
  name: string;
  content: string;
}): Promise<void> => {
  const agentId = resolveAgentId(params.agentId);
  await params.client.call("agents.files.set", {
    agentId,
    name: params.name,
    content: params.content,
  });
};

export const writeGatewayAgentFiles = async (params: {
  client: GatewayClient;
  agentId: string;
  files: Partial<Record<AgentFileName, string>>;
}): Promise<void> => {
  const agentId = resolveAgentId(params.agentId);
  const entries = Object.entries(params.files).filter(
    (entry): entry is [AgentFileName, string] => typeof entry[1] === "string",
  );
  for (const [name, content] of entries) {
    await params.client.call("agents.files.set", {
      agentId,
      name,
      content,
    });
  }
};

// ---------------------------------------------------------------------------
// Legacy migration — 7-file → 5-file
// ---------------------------------------------------------------------------

const LEGACY_ONLY_NAMES: LegacyAgentFileName[] = [
  "AGENTS.md",
  "SOUL.md",
  "IDENTITY.md",
  "TOOLS.md",
];

export async function migrateAgentFilesIfNeeded(params: {
  client: GatewayClient;
  agentId: string;
}): Promise<boolean> {
  const agentId = resolveAgentId(params.agentId);

  const personaCheck = await readGatewayAgentFile({
    client: params.client,
    agentId,
    name: "PERSONA.md",
  });
  if (personaCheck.exists) return false;

  const legacyChecks = await Promise.all(
    LEGACY_ONLY_NAMES.map(async (name) => {
      const result = await readGatewayAgentFile({
        client: params.client,
        agentId,
        name,
      });
      return { name, ...result };
    }),
  );

  const hasLegacy = legacyChecks.some((c) => c.exists);
  if (!hasLegacy) return false;

  const allLegacyNames: LegacyAgentFileName[] = [
    "AGENTS.md",
    "SOUL.md",
    "IDENTITY.md",
    "USER.md",
    "TOOLS.md",
    "HEARTBEAT.md",
    "MEMORY.md",
  ];
  const allLegacyResults = await Promise.all(
    allLegacyNames.map(async (name) => {
      const existing = legacyChecks.find((c) => c.name === name);
      if (existing)
        return { name, exists: existing.exists, content: existing.content };
      const result = await readGatewayAgentFile({
        client: params.client,
        agentId,
        name,
      });
      return { name, ...result };
    }),
  );

  const legacyFiles = Object.fromEntries(
    allLegacyResults.map((r) => [
      r.name,
      { content: r.content, exists: r.exists },
    ]),
  ) as Record<LegacyAgentFileName, { content: string; exists: boolean }>;

  const draft = parseLegacyPersonalityFiles(legacyFiles);
  const newFiles = serializePersonalityFiles(draft);

  await writeGatewayAgentFiles({
    client: params.client,
    agentId,
    files: newFiles,
  });

  console.log(
    `[migration] Agent "${agentId}": migrated 7-file → 5-file format.`,
  );
  return true;
}

// ---------------------------------------------------------------------------
// Read all agent files with auto-migration
// ---------------------------------------------------------------------------

export async function readAllAgentFiles(params: {
  client: GatewayClient;
  agentId: string;
}): Promise<Record<AgentFileName, { content: string; exists: boolean }>> {
  const agentId = resolveAgentId(params.agentId);

  await migrateAgentFilesIfNeeded({ client: params.client, agentId });

  const results = await Promise.all(
    AGENT_FILE_NAMES.map(async (name) => {
      const result = await readGatewayAgentFile({
        client: params.client,
        agentId,
        name,
      });
      return [name, result] as const;
    }),
  );

  return Object.fromEntries(results) as Record<
    AgentFileName,
    { content: string; exists: boolean }
  >;
}
