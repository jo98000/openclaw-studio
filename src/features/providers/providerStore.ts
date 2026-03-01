import { createContext, useContext } from "react";
import type { ProviderId, ProviderConfig, ProviderWithStatus } from "./types";
import { PROVIDER_REGISTRY } from "./providerRegistry";

const STORAGE_KEY = "openclaw-studio-providers";

export type ProviderStoreState = {
  configs: Record<string, ProviderConfig>;
};

export type ProviderStoreActions = {
  saveProvider: (config: ProviderConfig) => void;
  removeProvider: (id: ProviderId) => void;
  getProvidersWithStatus: () => ProviderWithStatus[];
  getConfiguredProviderIds: () => ProviderId[];
};

export type ProviderStore = ProviderStoreState & ProviderStoreActions;

export const ProviderStoreContext = createContext<ProviderStore | null>(null);

export const useProviderStore = (): ProviderStore => {
  const store = useContext(ProviderStoreContext);
  if (!store)
    throw new Error(
      "useProviderStore must be used within ProviderStoreProvider",
    );
  return store;
};

const migrateProviderConfig = (
  raw: Record<string, unknown>,
): ProviderConfig => {
  const config = raw as Record<string, unknown>;
  return {
    id: config.id as ProviderId,
    apiKey: (config.apiKey as string) || undefined,
    accessToken: (config.accessToken as string) || undefined,
    authType: (config.authType as ProviderConfig["authType"]) || "apiKey",
    baseUrl: (config.baseUrl as string) || undefined,
    enabled: config.enabled !== false,
  };
};

export const loadProviderConfigs = (): Record<string, ProviderConfig> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
    const migrated: Record<string, ProviderConfig> = {};
    for (const [key, value] of Object.entries(parsed)) {
      migrated[key] = migrateProviderConfig(value);
    }
    return migrated;
  } catch {
    return {};
  }
};

export const persistProviderConfigs = (
  configs: Record<string, ProviderConfig>,
) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // localStorage may be full or unavailable
  }
};

const isProviderConfigured = (config?: ProviderConfig): boolean => {
  if (!config?.enabled) return false;
  if (config.apiKey || config.accessToken) return true;
  // Ollama and self-hosted providers can be configured with just a baseUrl
  if (config.baseUrl) return true;
  return false;
};

export const buildProvidersWithStatus = (
  configs: Record<string, ProviderConfig>,
): ProviderWithStatus[] => {
  return PROVIDER_REGISTRY.map((def) => {
    const config = configs[def.id];
    const status = isProviderConfigured(config) ? "configured" : "unconfigured";
    return { ...def, status, config };
  });
};

export const getConfiguredProviderIdsFromConfigs = (
  configs: Record<string, ProviderConfig>,
): ProviderId[] => {
  return Object.values(configs)
    .filter(isProviderConfigured)
    .map((c) => c.id);
};
