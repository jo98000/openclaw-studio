"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Layers, Search, Check } from "lucide-react";
import { toast } from "sonner";
import type { ProviderId, ProviderConfig } from "../types";
import { PROVIDER_REGISTRY } from "../providerRegistry";
import { useProviderStore } from "../providerStore";
import { ProviderCard } from "./ProviderCard";
import { ApiKeyModal } from "./ApiKeyModal";

type ProviderCategory =
  | "all"
  | "commercial"
  | "open-source"
  | "self-hosted"
  | "gateway";

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
  xai: "commercial",
  litellm: "self-hosted",
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
  const { configs, saveProvider, removeProvider, getProvidersWithStatus } =
    useProviderStore();
  const [editingProviderId, setEditingProviderId] = useState<ProviderId | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProviderCategory>("all");

  const allProviders = useMemo(
    () => getProvidersWithStatus(),
    [getProvidersWithStatus],
  );

  const configuredProviders = useMemo(
    () => allProviders.filter((p) => p.status === "configured"),
    [allProviders],
  );

  const unconfiguredProviders = useMemo(() => {
    let filtered = allProviders.filter((p) => p.status !== "configured");
    if (category !== "all") {
      filtered = filtered.filter((p) => PROVIDER_CATEGORIES[p.id] === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [allProviders, category, search]);

  const filteredConfigured = useMemo(() => {
    if (!search.trim()) return configuredProviders;
    const q = search.toLowerCase();
    return configuredProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [configuredProviders, search]);

  const editingProvider = editingProviderId
    ? PROVIDER_REGISTRY.find((p) => p.id === editingProviderId)
    : null;

  const handleSave = useCallback(
    (config: ProviderConfig) => {
      saveProvider(config);
      setEditingProviderId(null);
      toast.success(
        `${PROVIDER_REGISTRY.find((p) => p.id === config.id)?.name ?? config.id} configured`,
      );
    },
    [saveProvider],
  );

  const handleRemove = useCallback(() => {
    if (!editingProviderId) return;
    removeProvider(editingProviderId);
    setEditingProviderId(null);
    toast.success("Provider removed");
  }, [editingProviderId, removeProvider]);

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="providers-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">
            {t("title")}
          </h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {configuredProviders.length}/{allProviders.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 text-xs text-muted-foreground">{t("description")}</p>

        <div className="relative mb-3">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ui-input w-full pl-8 text-xs"
          />
        </div>

        {/* Configured Providers Section */}
        {filteredConfigured.length > 0 ? (
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <Check className="h-3 w-3 text-primary" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                {t("configuredSection")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredConfigured.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onConfigure={(id) => setEditingProviderId(id as ProviderId)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Available Providers Section */}
        <div>
          {configuredProviders.length > 0 ? (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("availableSection")}
            </p>
          ) : null}

          <div className="mb-3 flex gap-1.5 overflow-x-auto">
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
            {unconfiguredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onConfigure={(id) => setEditingProviderId(id as ProviderId)}
              />
            ))}
          </div>

          {unconfiguredProviders.length === 0 &&
          configuredProviders.length > 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              {t("allConfigured")}
            </p>
          ) : null}

          {unconfiguredProviders.length === 0 &&
          configuredProviders.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No providers match your search.
            </p>
          ) : null}
        </div>
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
