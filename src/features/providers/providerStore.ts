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
  if (!store) throw new Error("useProviderStore must be used within ProviderStoreProvider");
  return store;
};

export const loadProviderConfigs = (): Record<string, ProviderConfig> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ProviderConfig>;
  } catch {
    return {};
  }
};

export const persistProviderConfigs = (configs: Record<string, ProviderConfig>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch {
    // localStorage may be full or unavailable
  }
};

export const buildProvidersWithStatus = (
  configs: Record<string, ProviderConfig>
): ProviderWithStatus[] => {
  return PROVIDER_REGISTRY.map((def) => {
    const config = configs[def.id];
    const status = config?.enabled && config.apiKey ? "configured" : "unconfigured";
    return { ...def, status, config };
  });
};
