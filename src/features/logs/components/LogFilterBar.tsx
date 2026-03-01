"use client";

import { Search, Trash2, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LogLevel } from "../types";

type LogFilterBarProps = {
  level: LogLevel | "";
  agentId: string;
  search: string;
  onLevelChange: (level: LogLevel | "") => void;
  onAgentIdChange: (agentId: string) => void;
  onSearchChange: (search: string) => void;
  onClear: () => void;
  onExport: () => void;
  logCount: number;
};

const LEVELS: { value: LogLevel | ""; labelKey: string }[] = [
  { value: "", labelKey: "levelAll" },
  { value: "debug", labelKey: "levelDebug" },
  { value: "info", labelKey: "levelInfo" },
  { value: "warn", labelKey: "levelWarn" },
  { value: "error", labelKey: "levelError" },
];

export const LogFilterBar = ({
  level,
  search,
  onLevelChange,
  onSearchChange,
  onClear,
  onExport,
  logCount,
}: LogFilterBarProps) => {
  const t = useTranslations("logs");

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="ui-input w-full pl-7 text-xs"
        />
      </div>
      <div className="flex gap-1">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => onLevelChange(l.value)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
              level === l.value
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground hover:bg-surface-3"
            }`}
          >
            {t(l.labelKey)}
          </button>
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">
        {logCount} {t("entries")}
      </span>
      <button type="button" onClick={onExport} className="ui-btn-icon xs" aria-label={t("export")}>
        <Download className="h-3 w-3" />
      </button>
      <button type="button" onClick={onClear} className="ui-btn-icon xs text-destructive" aria-label={t("clear")}>
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};
