import type { InterAgentMessage } from "./types";

const MAX_MESSAGES = 500;
const STORAGE_KEY = "openclaw-studio:intercom-messages";

let buffer: InterAgentMessage[] = [];

const loadMessages = (): InterAgentMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InterAgentMessage[];
  } catch {
    return [];
  }
};

const persistMessages = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer.slice(-MAX_MESSAGES)));
};

export const initIntercomStore = () => {
  buffer = loadMessages();
};

export const pushIntercomMessage = (msg: Omit<InterAgentMessage, "id" | "timestamp">) => {
  buffer.push({
    ...msg,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  if (buffer.length > MAX_MESSAGES) {
    buffer = buffer.slice(-MAX_MESSAGES);
  }
  persistMessages();
};

export const getIntercomMessages = (agentId?: string): InterAgentMessage[] => {
  if (!agentId) return [...buffer];
  return buffer.filter((m) => m.fromAgentId === agentId || m.toAgentId === agentId);
};

export const clearIntercomMessages = () => {
  buffer = [];
  localStorage.removeItem(STORAGE_KEY);
};
