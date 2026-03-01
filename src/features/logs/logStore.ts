import type { LogEntry, LogLevel, LogFilter } from "./types";

const MAX_ENTRIES = 2000;
const STORAGE_KEY = "openclaw-studio:logs";

let buffer: LogEntry[] = [];

const loadBuffer = (): LogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
};

const persistBuffer = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer.slice(-MAX_ENTRIES)));
};

export const initLogStore = () => {
  buffer = loadBuffer();
};

export const pushLog = (level: LogLevel, agentId: string, message: string, metadata?: Record<string, unknown>) => {
  buffer.push({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    level,
    agentId,
    message,
    metadata,
  });
  if (buffer.length > MAX_ENTRIES) {
    buffer = buffer.slice(-MAX_ENTRIES);
  }
  persistBuffer();
};

export const getLogs = (filter?: LogFilter): LogEntry[] => {
  let entries = [...buffer];
  if (filter?.level) {
    entries = entries.filter((e) => e.level === filter.level);
  }
  if (filter?.agentId) {
    entries = entries.filter((e) => e.agentId === filter.agentId);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    entries = entries.filter((e) => e.message.toLowerCase().includes(q) || e.agentId.toLowerCase().includes(q));
  }
  return entries;
};

export const clearLogs = () => {
  buffer = [];
  localStorage.removeItem(STORAGE_KEY);
};

export const getLogCount = (): number => buffer.length;

export const exportLogs = (filter?: LogFilter): string => {
  const entries = getLogs(filter);
  return entries
    .map((e) => `[${new Date(e.timestamp).toISOString()}] [${e.level.toUpperCase()}] [${e.agentId}] ${e.message}`)
    .join("\n");
};
