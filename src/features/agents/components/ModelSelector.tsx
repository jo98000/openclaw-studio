"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown,
  Search,
  Zap,
  Globe,
  Brain,
  Code,
  Sparkles,
  Gauge,
  Settings,
} from "lucide-react";
import type { GatewayModelChoice } from "@/lib/gateway/models";
import { useTranslations } from "next-intl";
import { PROVIDER_REGISTRY } from "@/features/providers/providerRegistry";

type ModelSelectorProps = {
  models: GatewayModelChoice[];
  value: string;
  onChange: (value: string | null) => void;
  onConfigureProviders?: () => void;
};

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  reasoning: Brain,
  search: Globe,
  code: Code,
  multimodal: Sparkles,
  fast: Zap,
  general: Gauge,
};

const CATEGORY_COLORS: Record<string, string> = {
  reasoning: "text-violet-500",
  search: "text-teal-500",
  code: "text-blue-500",
  multimodal: "text-amber-500",
  fast: "text-green-500",
  general: "text-slate-500",
};

const PROVIDER_NAMES: Record<string, string> = Object.fromEntries(
  PROVIDER_REGISTRY.map((p) => [p.id, p.name]),
);

export const ModelSelector = ({
  models,
  value,
  onChange,
  onConfigureProviders,
}: ModelSelectorProps) => {
  const t = useTranslations("modelSelector");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (prev) setSearch("");
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const grouped = useMemo(() => {
    const groups: Record<string, GatewayModelChoice[]> = {};
    for (const model of models) {
      const provider = model.provider || "other";
      if (!groups[provider]) groups[provider] = [];
      groups[provider].push(model);
    }
    return groups;
  }, [models]);

  const filteredGrouped = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const result: Record<string, GatewayModelChoice[]> = {};
    for (const [provider, providerModels] of Object.entries(grouped)) {
      const filtered = providerModels.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          provider.toLowerCase().includes(q),
      );
      if (filtered.length > 0) result[provider] = filtered;
    }
    return result;
  }, [grouped, search]);

  const selectedModel = models.find((m) => `${m.provider}/${m.id}` === value);
  const displayName = selectedModel?.name ?? (value || t("selectModel"));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="ui-input ui-control-important inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[10px] font-semibold text-foreground"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("chooseModel")}
      >
        {selectedModel?.provider ? (
          <span
            className="h-2 w-2 rounded-full bg-primary"
            aria-hidden="true"
          />
        ) : null}
        <span className="max-w-[14ch] truncate">{displayName}</span>
        <ChevronDown
          className="h-3 w-3 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          className="absolute bottom-full left-0 z-[300] mb-1 w-64 rounded-xl border border-border bg-card shadow-xl"
          role="listbox"
          aria-label={t("modelList")}
        >
          {models.length > 5 ? (
            <div className="border-b border-border px-3 py-2">
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  ref={searchRef}
                  type="text"
                  className="w-full rounded-md bg-surface-2 py-1 pl-7 pr-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                  placeholder={t("searchModels")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          <div className="max-h-64 overflow-y-auto p-1">
            {Object.entries(filteredGrouped).map(
              ([provider, providerModels]) => (
                <div key={provider}>
                  <p className="px-2 pb-0.5 pt-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {PROVIDER_NAMES[provider] ?? provider}
                  </p>
                  {providerModels.map((model) => {
                    const modelKey = `${model.provider}/${model.id}`;
                    const isSelected = modelKey === value;
                    const CategoryIcon =
                      CATEGORY_ICONS[
                        model.reasoning ? "reasoning" : "general"
                      ] ?? Gauge;
                    const categoryColor =
                      CATEGORY_COLORS[
                        model.reasoning ? "reasoning" : "general"
                      ] ?? "text-slate-500";

                    return (
                      <button
                        key={modelKey}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-foreground"
                            : "text-foreground hover:bg-surface-2"
                        }`}
                        onClick={() => {
                          onChange(modelKey);
                          setOpen(false);
                          setSearch("");
                        }}
                      >
                        <CategoryIcon
                          className={`h-3 w-3 shrink-0 ${categoryColor}`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium">
                            {model.name}
                          </p>
                          {model.contextWindow ? (
                            <p className="text-[9px] text-muted-foreground">
                              {model.contextWindow >= 1000000
                                ? `${(model.contextWindow / 1000000).toFixed(0)}M`
                                : `${(model.contextWindow / 1000).toFixed(0)}k`}{" "}
                              {t("context")}
                            </p>
                          ) : null}
                        </div>
                        {model.reasoning ? (
                          <span className="rounded bg-violet-500/10 px-1 text-[8px] font-bold text-violet-500">
                            {t("think")}
                          </span>
                        ) : null}
                        {isSelected ? (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ),
            )}
            {Object.keys(filteredGrouped).length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-[11px] text-muted-foreground">
                  {models.length === 0
                    ? t("noConfiguredProviders")
                    : t("noModels")}
                </p>
                {models.length === 0 && onConfigureProviders ? (
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    onClick={() => {
                      onConfigureProviders();
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Settings className="h-3 w-3" aria-hidden="true" />
                    {t("configureProviders")}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};
