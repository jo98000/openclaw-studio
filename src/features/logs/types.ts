export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  id: string;
  timestamp: number;
  level: LogLevel;
  agentId: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type LogFilter = {
  level?: LogLevel;
  agentId?: string;
  search?: string;
};
