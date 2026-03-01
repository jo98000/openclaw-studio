"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Layers } from "lucide-react";
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

export const ProvidersPanel = () => {
  const t = useTranslations("providers");
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>(loadProviderConfigs);
  const [editingProviderId, setEditingProviderId] = useState<ProviderId | null>(null);

  const providers: ProviderWithStatus[] = useMemo(
    () => buildProvidersWithStatus(configs),
    [configs]
  );

  const configuredCount = providers.filter((p) => p.status === "configured").length;

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
            {configuredCount}/{providers.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-4 text-xs text-muted-foreground">
          {t("description")}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onConfigure={(id) => setEditingProviderId(id as ProviderId)}
            />
          ))}
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
