import type { CredentialEntry } from "./types";

const STORAGE_KEY_PREFIX = "openclaw-studio-credentials-";

const storageKey = (agentId: string): string =>
  `${STORAGE_KEY_PREFIX}${agentId}`;

export const loadAgentCredentials = (agentId: string): CredentialEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(agentId));
    if (!raw) return [];
    return JSON.parse(raw) as CredentialEntry[];
  } catch {
    return [];
  }
};

export const persistAgentCredentials = (
  agentId: string,
  entries: CredentialEntry[],
): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(agentId), JSON.stringify(entries));
  } catch {
    // localStorage may be full or unavailable
  }
};

export const removeAgentCredentials = (agentId: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(agentId));
  } catch {
    // ignore
  }
};
