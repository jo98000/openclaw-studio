import {
  type AgentPermissionsDraft,
  resolvePresetDefaultsForRole,
  updateAgentPermissionsViaStudio,
} from "@/features/agents/operations/agentPermissionsOperation";
import type { GatewayClient } from "@/lib/gateway/GatewayClient";
import {
  planCreateAgentBootstrapCommands,
  type CreateBootstrapCommand,
  type PersonaFilesPayload,
} from "@/features/agents/operations/createAgentBootstrapWorkflow";
import { writeGatewayAgentFiles } from "@/lib/gateway/agentFiles";
import {
  createEmptyDraft,
  serializePersonalityFiles,
} from "@/lib/agents/personalityBuilder";
import { DEFAULT_TRAITS } from "@/lib/agents/personalityTraits";

type CreateCompletion = {
  agentId: string;
  agentName: string;
};

type CreatedAgent = {
  agentId: string;
  sessionKey: string;
};

export const CREATE_AGENT_DEFAULT_PERMISSIONS: Readonly<AgentPermissionsDraft> =
  Object.freeze(resolvePresetDefaultsForRole("autonomous"));

const resolveBootstrapErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message || "Failed to apply default permissions.";
  }
  return "Failed to apply default permissions.";
};

export async function applyCreateAgentBootstrapPermissions(params: {
  client: GatewayClient;
  agentId: string;
  sessionKey: string;
  draft: AgentPermissionsDraft;
  loadAgents: () => Promise<void>;
}): Promise<void> {
  await updateAgentPermissionsViaStudio({
    client: params.client,
    agentId: params.agentId,
    sessionKey: params.sessionKey,
    draft: params.draft,
    loadAgents: params.loadAgents,
  });
}

export async function runCreateAgentBootstrapOperation(params: {
  completion: CreateCompletion;
  focusedAgentId: string | null;
  loadAgents: () => Promise<void>;
  findAgentById: (agentId: string) => CreatedAgent | null;
  applyDefaultPermissions: (input: {
    agentId: string;
    sessionKey: string;
  }) => Promise<void>;
  refreshGatewayConfigSnapshot: () => Promise<unknown>;
  personaPayload?: PersonaFilesPayload;
  planCommands?: typeof planCreateAgentBootstrapCommands;
}): Promise<CreateBootstrapCommand[]> {
  const plan = params.planCommands ?? planCreateAgentBootstrapCommands;

  await params.loadAgents();
  let createdAgent = params.findAgentById(params.completion.agentId);
  if (!createdAgent) {
    await params.loadAgents();
    createdAgent = params.findAgentById(params.completion.agentId);
  }

  let bootstrapErrorMessage: string | null = null;
  if (createdAgent) {
    try {
      await params.applyDefaultPermissions({
        agentId: createdAgent.agentId,
        sessionKey: createdAgent.sessionKey,
      });
      await params.refreshGatewayConfigSnapshot();
    } catch (error) {
      bootstrapErrorMessage = resolveBootstrapErrorMessage(error);
    }
  }

  return plan({
    completion: params.completion,
    createdAgent,
    bootstrapErrorMessage,
    focusedAgentId: params.focusedAgentId,
    personaPayload: params.personaPayload,
  });
}

function buildPersonaFilesFromPayload(
  agentName: string,
  payload: PersonaFilesPayload,
): Record<string, string> {
  const draft = createEmptyDraft();
  draft.persona.name = agentName;
  if (payload.persona) {
    if (payload.persona.traits) {
      draft.persona.traits = { ...DEFAULT_TRAITS, ...payload.persona.traits };
    }
    if (payload.persona.coreTruths)
      draft.persona.coreTruths = payload.persona.coreTruths;
    if (payload.persona.boundaries)
      draft.persona.boundaries = payload.persona.boundaries;
    if (payload.persona.vibe) draft.persona.vibe = payload.persona.vibe;
  }
  if (payload.directives) {
    if (payload.directives.mission)
      draft.directives.mission = payload.directives.mission;
    if (payload.directives.rules)
      draft.directives.rules = payload.directives.rules;
    if (payload.directives.priorities)
      draft.directives.priorities = payload.directives.priorities;
    if (payload.directives.outputFormat)
      draft.directives.outputFormat = payload.directives.outputFormat;
  }
  if (payload.userContext) {
    if (payload.userContext.name) draft.user.name = payload.userContext.name;
    if (payload.userContext.pronouns)
      draft.user.pronouns = payload.userContext.pronouns;
    if (payload.userContext.timezone)
      draft.user.timezone = payload.userContext.timezone;
    if (payload.userContext.notes) draft.user.notes = payload.userContext.notes;
  }
  return serializePersonalityFiles(draft);
}

export function executeCreateAgentBootstrapCommands(params: {
  commands: CreateBootstrapCommand[];
  client: GatewayClient;
  agentName: string;
  setCreateAgentModalError: (message: string | null) => void;
  setGlobalError: (message: string) => void;
  setCreateAgentBlock: (value: null) => void;
  setCreateAgentModalOpen: (open: boolean) => void;
  flushPendingDraft: (agentId: string | null) => void;
  selectAgent: (agentId: string) => void;
  setInspectSidebarCapabilities: (agentId: string) => void;
  setMobilePaneChat: () => void;
}): void {
  for (const command of params.commands) {
    if (command.kind === "set-create-modal-error") {
      params.setCreateAgentModalError(command.message);
      continue;
    }
    if (command.kind === "set-global-error") {
      params.setGlobalError(command.message);
      continue;
    }
    if (command.kind === "set-create-block") {
      params.setCreateAgentBlock(command.value);
      continue;
    }
    if (command.kind === "set-create-modal-open") {
      params.setCreateAgentModalOpen(command.open);
      continue;
    }
    if (command.kind === "flush-pending-draft") {
      params.flushPendingDraft(command.agentId);
      continue;
    }
    if (command.kind === "select-agent") {
      params.selectAgent(command.agentId);
      continue;
    }
    if (command.kind === "set-inspect-sidebar") {
      params.setInspectSidebarCapabilities(command.agentId);
      continue;
    }
    if (command.kind === "write-persona-files") {
      const files = buildPersonaFilesFromPayload(
        params.agentName,
        command.payload,
      );
      writeGatewayAgentFiles({
        client: params.client,
        agentId: command.agentId,
        files,
      }).catch((err) => {
        console.error("[bootstrap] Failed to write persona files:", err);
      });
      continue;
    }
    params.setMobilePaneChat();
  }
}
