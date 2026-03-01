import type { VoiceConfig, VoiceProvider, VoiceSession } from "./types";

const STORAGE_KEY = "openclaw-studio:voice-configs";

let configs: VoiceConfig[] = [];
const sessions = new Map<string, VoiceSession>();

const loadConfigs = (): VoiceConfig[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VoiceConfig[];
  } catch {
    return [];
  }
};

const persistConfigs = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
};

export const initVoiceStore = () => {
  configs = loadConfigs();
};

export const getVoiceConfigs = (): VoiceConfig[] => [...configs];

export const getVoiceConfigForAgent = (agentId: string): VoiceConfig | undefined =>
  configs.find((c) => c.agentId === agentId);

export const upsertVoiceConfig = (config: Omit<VoiceConfig, "id">): VoiceConfig => {
  const existing = configs.find((c) => c.agentId === config.agentId);
  if (existing) {
    Object.assign(existing, config);
    persistConfigs();
    return existing;
  }
  const newConfig: VoiceConfig = { ...config, id: crypto.randomUUID() };
  configs.push(newConfig);
  persistConfigs();
  return newConfig;
};

export const removeVoiceConfig = (agentId: string) => {
  configs = configs.filter((c) => c.agentId !== agentId);
  persistConfigs();
};

export const getVoiceSession = (agentId: string): VoiceSession => {
  let session = sessions.get(agentId);
  if (!session) {
    session = { agentId, state: "idle", startedAt: null };
    sessions.set(agentId, session);
  }
  return session;
};

export const setVoiceSessionState = (
  agentId: string,
  state: VoiceSession["state"],
) => {
  const session = getVoiceSession(agentId);
  session.state = state;
  session.startedAt = state === "idle" ? null : Date.now();
};
