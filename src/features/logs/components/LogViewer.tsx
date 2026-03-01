"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ScrollText } from "lucide-react";
import type { LogLevel, LogEntry } from "../types";
import {
  initLogStore,
  getLogs,
  clearLogs,
  exportLogs,
  getLogCount,
} from "../logStore";
import { LogFilterBar } from "./LogFilterBar";

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: "text-muted-foreground",
  info: "text-blue-500",
  warn: "text-amber-500",
  error: "text-destructive",
};

const LogRow = ({ entry }: { entry: LogEntry }) => (
  <div className="flex gap-2 border-b border-border/50 px-5 py-1 font-mono text-[11px] hover:bg-surface-2">
    <span className="shrink-0 text-muted-foreground">
      {new Date(entry.timestamp).toLocaleTimeString()}
    </span>
    <span
      className={`w-10 shrink-0 font-semibold uppercase ${LEVEL_COLORS[entry.level]}`}
    >
      {entry.level}
    </span>
    <span className="shrink-0 text-primary">[{entry.agentId}]</span>
    <span className="min-w-0 flex-1 break-all text-foreground">
      {entry.message}
    </span>
  </div>
);

export const LogViewer = () => {
  const t = useTranslations("logs");
  const [level, setLevel] = useState<LogLevel | "">("");
  const [agentId, setAgentId] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    initLogStore();
  }, []);

  const entries = useMemo(
    () =>
      getLogs({
        level: level || undefined,
        agentId: agentId || undefined,
        search: search || undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, agentId, search, refreshKey],
  );

  const logCount = getLogCount();

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
  };

  const handleClear = useCallback(() => {
    clearLogs();
    setRefreshKey((k) => k + 1);
  }, []);

  const handleExport = useCallback(() => {
    const text = exportLogs({
      level: level || undefined,
      agentId: agentId || undefined,
      search: search || undefined,
    });
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openclaw-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [level, agentId, search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="log-viewer">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <ScrollText className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {logCount}
        </span>
      </div>

      <LogFilterBar
        level={level}
        agentId={agentId}
        search={search}
        onLevelChange={setLevel}
        onAgentIdChange={setAgentId}
        onSearchChange={setSearch}
        onClear={handleClear}
        onExport={handleExport}
        logCount={entries.length}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {entries.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {t("noLogs")}
          </p>
        ) : (
          entries.map((entry) => <LogRow key={entry.id} entry={entry} />)
        )}
      </div>

      {!autoScroll && (
        <button
          type="button"
          onClick={() => {
            setAutoScroll(true);
            if (scrollRef.current)
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }}
          className="mx-5 mb-2 rounded-md bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground"
        >
          {t("scrollToBottom")}
        </button>
      )}
    </div>
  );
};
