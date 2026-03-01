export const SPINE_LEFT = "left-[15px]";
export const ASSISTANT_GUTTER_CLASS = "pl-[44px]";
export const ASSISTANT_MAX_WIDTH_DEFAULT_CLASS = "max-w-[68ch]";
export const ASSISTANT_MAX_WIDTH_EXPANDED_CLASS = "max-w-[1120px]";
export const CHAT_TOP_THRESHOLD_PX = 8;
export const EMPTY_CHAT_INTRO_MESSAGES = [
  "How can I help you today?",
  "What should we accomplish today?",
  "Ready when you are. What do you want to tackle?",
  "What are we working on today?",
  "I'm here and ready. What's the plan?",
];

export const formatChatTimestamp = (timestampMs: number): string => {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestampMs));
};

export const formatDurationLabel = (durationMs: number): string => {
  const seconds = durationMs / 1000;
  if (!Number.isFinite(seconds) || seconds <= 0) return "0.0s";
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  return `${Math.round(seconds)}s`;
};

export const stableStringHash = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const resolveEmptyChatIntroMessage = (agentId: string, sessionEpoch: number | undefined): string => {
  if (EMPTY_CHAT_INTRO_MESSAGES.length === 0) return "How can I help you today?";
  const normalizedEpoch =
    typeof sessionEpoch === "number" && Number.isFinite(sessionEpoch)
      ? Math.max(0, Math.trunc(sessionEpoch))
      : 0;
  const offset = stableStringHash(agentId) % EMPTY_CHAT_INTRO_MESSAGES.length;
  const index = (offset + normalizedEpoch) % EMPTY_CHAT_INTRO_MESSAGES.length;
  return EMPTY_CHAT_INTRO_MESSAGES[index];
};

export const looksLikePath = (value: string): boolean => {
  if (!value) return false;
  if (/(^|[\s(])(?:[A-Za-z]:\\|~\/|\/)/.test(value)) return true;
  if (/(^|[\s(])(src|app|packages|components)\//.test(value)) return true;
  if (/(^|[\s(])[\w.-]+\.(ts|tsx|js|jsx|json|md|py|go|rs|java|kt|rb|sh|yaml|yml)\b/.test(value)) {
    return true;
  }
  return false;
};

export const isStructuredMarkdown = (text: string): boolean => {
  if (!text) return false;
  if (/```/.test(text)) return true;
  if (/^\s*#{1,6}\s+/m.test(text)) return true;
  if (/^\s*[-*+]\s+/m.test(text)) return true;
  if (/^\s*\d+\.\s+/m.test(text)) return true;
  if (/^\s*\|.+\|\s*$/m.test(text)) return true;
  if (looksLikePath(text) && text.split("\n").filter(Boolean).length >= 3) return true;
  return false;
};

export const resolveAssistantMaxWidthClass = (text: string | null | undefined): string => {
  const value = (text ?? "").trim();
  if (!value) return ASSISTANT_MAX_WIDTH_DEFAULT_CLASS;
  if (isStructuredMarkdown(value)) return ASSISTANT_MAX_WIDTH_EXPANDED_CLASS;
  const nonEmptyLines = value.split("\n").filter((line) => line.trim().length > 0);
  const shortLineCount = nonEmptyLines.filter((line) => line.trim().length <= 44).length;
  if (nonEmptyLines.length >= 10 && shortLineCount / Math.max(1, nonEmptyLines.length) >= 0.65) {
    return ASSISTANT_MAX_WIDTH_EXPANDED_CLASS;
  }
  return ASSISTANT_MAX_WIDTH_DEFAULT_CLASS;
};

export const formatApprovalExpiry = (
  timestampMs: number | undefined | null
): string | null => {
  if (typeof timestampMs !== "number" || !Number.isFinite(timestampMs)) return null;
  const now = Date.now();
  const diff = timestampMs - now;
  if (diff <= 0) return "expired";
  if (diff < 60_000) return `${Math.ceil(diff / 1000)}s`;
  return `${Math.ceil(diff / 60_000)}m`;
};
