import {
  GatewayResponseError,
  type GatewayClient,
} from "@/lib/gateway/GatewayClient";
import {
  readConfigAgentList,
  upsertConfigAgentEntry,
  writeConfigAgentList,
  type GatewayConfigSnapshot,
  type ConfigAgentEntry,
} from "@/lib/gateway/agentConfig";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const shouldRetryConfigWrite = (err: unknown) => {
  if (!(err instanceof GatewayResponseError)) return false;
  return /re-run config\.get|config changed since last load/i.test(err.message);
};

/**
 * Read the per-agent sandbox docker env vars from a config agent entry.
 */
const readAgentSandboxEnv = (
  entry: ConfigAgentEntry,
): Record<string, string> => {
  const sandbox = isRecord(entry.sandbox) ? entry.sandbox : null;
  const docker = sandbox && isRecord(sandbox.docker) ? sandbox.docker : null;
  const env = docker && isRecord(docker.env) ? docker.env : null;
  const result: Record<string, string> = {};
  if (!env) return result;
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Write credential env vars into an agent entry's sandbox.docker.env,
 * preserving any existing env vars that are NOT credential-managed.
 */
const writeAgentSandboxEnv = (
  entry: ConfigAgentEntry,
  credentialEnvVars: Record<string, string>,
  previousCredentialKeys: ReadonlySet<string>,
): ConfigAgentEntry => {
  const next: ConfigAgentEntry = { ...entry };
  const currentEnv = readAgentSandboxEnv(entry);

  // Start with current env, remove previously-managed credential keys,
  // then merge in the new credential env vars.
  const nextEnv: Record<string, string> = {};
  for (const [key, value] of Object.entries(currentEnv)) {
    if (!previousCredentialKeys.has(key)) {
      nextEnv[key] = value;
    }
  }
  for (const [key, value] of Object.entries(credentialEnvVars)) {
    if (value) {
      nextEnv[key] = value;
    }
  }

  const sandbox = isRecord(next.sandbox) ? { ...next.sandbox } : {};
  const docker = isRecord(sandbox.docker)
    ? { ...(sandbox.docker as Record<string, unknown>) }
    : {};
  docker.env = nextEnv;
  sandbox.docker = docker;
  next.sandbox = sandbox;
  return next;
};

/**
 * Sync credential env vars to the per-agent gateway config.
 *
 * This writes directly to `agents.list[{agentId}].sandbox.docker.env`
 * so the gateway injects them into the agent's Docker container at runtime.
 *
 * @param client - Active GatewayClient instance
 * @param agentId - The agent to configure
 * @param credentialEnvVars - Map of ENV_VAR_NAME → value from credential vault
 * @param previousCredentialKeys - Set of env var keys from a previous sync
 *   (used to remove stale keys when credentials are deleted/changed)
 */
export const syncCredentialEnvToGateway = async (params: {
  client: GatewayClient;
  agentId: string;
  credentialEnvVars: Record<string, string>;
  previousCredentialKeys?: ReadonlySet<string>;
}): Promise<void> => {
  const agentId = params.agentId.trim();
  if (!agentId) {
    throw new Error("Agent id is required.");
  }

  const prevKeys = params.previousCredentialKeys ?? new Set<string>();

  const tryOnce = async (attempt: number): Promise<void> => {
    const snapshot = await params.client.call<GatewayConfigSnapshot>(
      "config.get",
      {},
    );
    const baseConfig = isRecord(snapshot.config) ? snapshot.config : {};
    const list = readConfigAgentList(baseConfig);

    const { list: nextList } = upsertConfigAgentEntry(list, agentId, (entry) =>
      writeAgentSandboxEnv(entry, params.credentialEnvVars, prevKeys),
    );

    const nextConfig = writeConfigAgentList(baseConfig, nextList);
    const payload: Record<string, unknown> = {
      raw: JSON.stringify(nextConfig, null, 2),
    };
    const requiresBaseHash = snapshot.exists !== false;
    const baseHash =
      typeof snapshot.hash === "string" ? snapshot.hash.trim() : "";
    if (requiresBaseHash && !baseHash) {
      throw new Error("Gateway config hash unavailable; re-run config.get.");
    }
    if (baseHash) {
      payload.baseHash = baseHash;
    }
    try {
      await params.client.call("config.set", payload);
    } catch (err) {
      if (attempt < 1 && shouldRetryConfigWrite(err)) {
        return tryOnce(attempt + 1);
      }
      throw err;
    }
  };

  await tryOnce(0);
};

/**
 * Remove all credential-managed env vars from a specific agent's sandbox config.
 * Used when all credentials are deleted for an agent.
 */
export const clearCredentialEnvFromGateway = async (params: {
  client: GatewayClient;
  agentId: string;
  credentialKeys: ReadonlySet<string>;
}): Promise<void> => {
  return syncCredentialEnvToGateway({
    client: params.client,
    agentId: params.agentId,
    credentialEnvVars: {},
    previousCredentialKeys: params.credentialKeys,
  });
};
