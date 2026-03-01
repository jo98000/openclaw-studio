import {
  isWebchatSessionMutationBlockedError,
  syncGatewaySessionSettings,
  type GatewayClient,
  type GatewaySessionsPatchResult,
} from "@/lib/gateway/GatewayClient";

type SessionSettingField = "model" | "thinkingLevel";

type AgentSessionState = {
  agentId: string;
  sessionCreated: boolean;
  model?: string | null;
  thinkingLevel?: string | null;
};

type SessionSettingsDispatchAction =
  | {
      type: "updateAgent";
      agentId: string;
      patch: {
        model?: string | null;
        thinkingLevel?: string | null;
        sessionSettingsSynced?: boolean;
        sessionCreated?: boolean;
      };
    }
  | {
      type: "appendOutput";
      agentId: string;
      line: string;
    };

type SessionSettingsDispatch = (action: SessionSettingsDispatchAction) => void;

export type ApplySessionSettingMutationParams = {
  agents: AgentSessionState[];
  dispatch: SessionSettingsDispatch;
  client: GatewayClient;
  agentId: string;
  sessionKey: string;
  field: SessionSettingField;
  value: string | null;
};

const buildFallbackError = (field: SessionSettingField) =>
  field === "model" ? "Failed to set model." : "Failed to set thinking level.";

const buildErrorPrefix = (field: SessionSettingField) =>
  field === "model" ? "Model update failed" : "Thinking update failed";

const buildWebchatBlockedMessage = (field: SessionSettingField) =>
  field === "model"
    ? "Model update not applied: this gateway blocks sessions.patch for WebChat clients; message sending still works."
    : "Thinking level update not applied: this gateway blocks sessions.patch for WebChat clients; message sending still works.";

export const applySessionSettingMutation = async ({
  agents,
  dispatch,
  client,
  agentId,
  sessionKey,
  field,
  value,
}: ApplySessionSettingMutationParams) => {
  const targetAgent =
    agents.find((candidate) => candidate.agentId === agentId) ?? null;
  const previousModel = targetAgent?.model ?? null;
  const previousThinkingLevel = targetAgent?.thinkingLevel ?? null;
  dispatch({
    type: "updateAgent",
    agentId,
    patch: {
      [field]: value,
      sessionSettingsSynced: false,
    },
  });
  try {
    const result = await syncGatewaySessionSettings({
      client,
      sessionKey,
      ...(field === "model"
        ? { model: value ?? null }
        : { thinkingLevel: value ?? null }),
    });
    const patch: {
      model?: string | null;
      thinkingLevel?: string | null;
      sessionSettingsSynced: boolean;
      sessionCreated: boolean;
    } = { sessionSettingsSynced: true, sessionCreated: true };
    if (field === "model") {
      const resolvedModel = resolveModelFromPatchResult(result);
      // Only override the optimistic update if the gateway returned explicit
      // override fields.  The `resolved` block often returns the *default* model
      // rather than the override the user just set, which would revert the
      // dropdown.  When resolvedModel comes from the fallback path (no override
      // fields in the response) we trust the optimistic value instead.
      if (resolvedModel !== undefined && hasExplicitOverrideInResult(result)) {
        patch.model = resolvedModel;
      }
    } else {
      const nextThinkingLevel =
        typeof result.entry?.thinkingLevel === "string"
          ? result.entry.thinkingLevel
          : undefined;
      if (nextThinkingLevel !== undefined) {
        patch.thinkingLevel = nextThinkingLevel;
      }
    }
    dispatch({
      type: "updateAgent",
      agentId,
      patch,
    });
  } catch (err) {
    if (isWebchatSessionMutationBlockedError(err)) {
      dispatch({
        type: "updateAgent",
        agentId,
        patch: {
          ...(field === "model"
            ? { model: previousModel }
            : { thinkingLevel: previousThinkingLevel }),
          sessionSettingsSynced: true,
          sessionCreated: true,
        },
      });
      dispatch({
        type: "appendOutput",
        agentId,
        line: buildWebchatBlockedMessage(field),
      });
      return;
    }
    dispatch({
      type: "updateAgent",
      agentId,
      patch: {
        ...(field === "model"
          ? { model: previousModel }
          : { thinkingLevel: previousThinkingLevel }),
        sessionSettingsSynced: true,
      },
    });
    const msg = err instanceof Error ? err.message : buildFallbackError(field);
    dispatch({
      type: "appendOutput",
      agentId,
      line: `${buildErrorPrefix(field)}: ${msg}`,
    });
  }
};

const hasExplicitOverrideInResult = (
  result: GatewaySessionsPatchResult,
): boolean => {
  const provider =
    typeof result.entry?.providerOverride === "string"
      ? result.entry.providerOverride.trim()
      : "";
  const model =
    typeof result.entry?.modelOverride === "string"
      ? result.entry.modelOverride.trim()
      : "";
  return provider.length > 0 && model.length > 0;
};

const resolveModelFromPatchResult = (
  result: GatewaySessionsPatchResult,
): string | null | undefined => {
  // Prefer entry.modelOverride/providerOverride (the actual active override) over resolved
  // because the gateway's resolved field may return the base model, not the override.
  const overrideProvider =
    typeof result.entry?.providerOverride === "string"
      ? result.entry.providerOverride.trim()
      : "";
  const overrideModel =
    typeof result.entry?.modelOverride === "string"
      ? result.entry.modelOverride.trim()
      : "";
  if (overrideProvider && overrideModel) {
    return `${overrideProvider}/${overrideModel}`;
  }

  const provider =
    typeof result.resolved?.modelProvider === "string"
      ? result.resolved.modelProvider.trim()
      : "";
  const model =
    typeof result.resolved?.model === "string"
      ? result.resolved.model.trim()
      : "";
  if (!provider || !model) return undefined;
  return `${provider}/${model}`;
};
