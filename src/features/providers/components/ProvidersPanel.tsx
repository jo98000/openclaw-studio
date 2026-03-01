"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Layers, Search } from "lucide-react";
import { toast } from "sonner";
import type { ProviderId, ProviderConfig, ProviderWithStatus } from "../types";
import { PROVIDER_REGISTRY } from "../providerRegistry";
import {
  loadProviderConfigs,
  persistProviderConfigs,
  buildProvidersWithStatus,
} from "../providerStore";
import { ProviderCard } from "./ProviderCard";
import { ApiKeyModal } from "./ApiKeyModal";

type ProviderCategory = "all" | "commercial" | "open-source" | "self-hosted" | "gateway";

const PROVIDER_CATEGORIES: Record<string, ProviderCategory> = {
  anthropic: "commercial",
  openai: "commercial",
  perplexity: "commercial",
  google: "commercial",
  mistral: "commercial",
  groq: "commercial",
  deepseek: "commercial",
  cohere: "commercial",
  "amazon-bedrock": "commercial",
  "azure-openai": "commercial",
  nvidia: "commercial",
  together: "open-source",
  fireworks: "open-source",
  huggingface: "open-source",
  ollama: "self-hosted",
  cloudflare: "self-hosted",
  openrouter: "gateway",
  custom: "self-hosted",
};

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  all: "All",
  commercial: "Commercial",
  "open-source": "Open Source",
  "self-hosted": "Self-Hosted",
  gateway: "Gateway",
};

export const ProvidersPanel = () => {
  const t = useTranslations("providers");
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>(loadProviderConfigs);
  const [editingProviderId, setEditingProviderId] = useState<ProviderId | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProviderCategory>("all");

  const allProviders: ProviderWithStatus[] = useMemo(
    () => buildProvidersWithStatus(configs),
    [configs]
  );

  const providers = useMemo(() => {
    let filtered = allProviders;
    if (category !== "all") {
      filtered = filtered.filter((p) => PROVIDER_CATEGORIES[p.id] === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allProviders, category, search]);

  const configuredCount = allProviders.filter((p) => p.status === "configured").length;

  const editingProvider = editingProviderId
    ? PROVIDER_REGISTRY.find((p) => p.id === editingProviderId)
    : null;

  const handleSave = useCallback(
    (config: ProviderConfig) => {
      const next = { ...configs, [config.id]: config };
      setConfigs(next);
      persistProviderConfigs(next);
      setEditingProviderId(null);
      toast.success(`${PROVIDER_REGISTRY.find((p) => p.id === config.id)?.name ?? config.id} configured`);
    },
    [configs]
  );

  const handleRemove = useCallback(() => {
    if (!editingProviderId) return;
    const next = { ...configs };
    delete next[editingProviderId];
    setConfigs(next);
    persistProviderConfigs(next);
    setEditingProviderId(null);
    toast.success("Provider removed");
  }, [configs, editingProviderId]);

  return (
    <div className="flex h-full flex-col" data-testid="providers-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {configuredCount}/{allProviders.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 text-xs text-muted-foreground">
          {t("description")}
        </p>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ui-input w-full pl-8 text-xs"
          />
        </div>

        <div className="mb-4 flex gap-1.5 overflow-x-auto">
          {(Object.keys(CATEGORY_LABELS) as ProviderCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`ui-segment-item whitespace-nowrap px-2.5 py-1 text-[11px] ${
                category === cat ? "ui-selected" : ""
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onConfigure={(id) => setEditingProviderId(id as ProviderId)}
            />
          ))}
        </div>

        {providers.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No providers match your search.
          </p>
        )}
      </div>

      {editingProvider ? (
        <ApiKeyModal
          provider={editingProvider}
          existingConfig={configs[editingProviderId!]}
          onSave={handleSave}
          onRemove={configs[editingProviderId!] ? handleRemove : undefined}
          onClose={() => setEditingProviderId(null)}
        />
      ) : null}
    </div>
  );
};
