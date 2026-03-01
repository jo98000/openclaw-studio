import type { RoutingConfig, RoutingRule } from "./types";

const STORAGE_KEY = "openclaw-studio:routing-config";

const DEFAULT_CONFIG: RoutingConfig = {
  rules: [],
  defaultAgentId: "",
};

export const loadRoutingConfig = (): RoutingConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return JSON.parse(raw) as RoutingConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const persistRoutingConfig = (config: RoutingConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const addRoutingRule = (config: RoutingConfig, rule: RoutingRule): RoutingConfig => ({
  ...config,
  rules: [...config.rules, rule].sort((a, b) => a.priority - b.priority),
});

export const updateRoutingRule = (
  config: RoutingConfig,
  ruleId: string,
  patch: Partial<RoutingRule>,
): RoutingConfig => ({
  ...config,
  rules: config.rules
    .map((r) => (r.id === ruleId ? { ...r, ...patch } : r))
    .sort((a, b) => a.priority - b.priority),
});

export const removeRoutingRule = (config: RoutingConfig, ruleId: string): RoutingConfig => ({
  ...config,
  rules: config.rules.filter((r) => r.id !== ruleId),
});
