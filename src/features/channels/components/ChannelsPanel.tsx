"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Radio, Search } from "lucide-react";
import { toast } from "sonner";
import type { ChannelId, ChannelConfig, ChannelWithStatus } from "../types";
import { CHANNEL_REGISTRY } from "../channelRegistry";
import {
  loadChannelConfigs,
  persistChannelConfigs,
  buildChannelsWithStatus,
} from "../channelStore";
import { ChannelCard } from "./ChannelCard";
import { ChannelConfigModal } from "./ChannelConfigModal";

export const ChannelsPanel = () => {
  const t = useTranslations("channels");
  const [configs, setConfigs] =
    useState<Record<string, ChannelConfig>>(loadChannelConfigs);
  const [editingChannelId, setEditingChannelId] = useState<ChannelId | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const allChannels: ChannelWithStatus[] = useMemo(
    () => buildChannelsWithStatus(configs),
    [configs],
  );

  const channels = useMemo(() => {
    if (!search.trim()) return allChannels;
    const q = search.toLowerCase();
    return allChannels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [allChannels, search]);

  const connectedCount = allChannels.filter(
    (c) => c.status === "connected",
  ).length;

  const editingChannel = editingChannelId
    ? CHANNEL_REGISTRY.find((c) => c.id === editingChannelId)
    : null;

  const handleSave = useCallback(
    (config: ChannelConfig) => {
      const next = { ...configs, [config.id]: config };
      setConfigs(next);
      persistChannelConfigs(next);
      setEditingChannelId(null);
      toast.success(
        `${CHANNEL_REGISTRY.find((c) => c.id === config.id)?.name ?? config.id} configured`,
      );
    },
    [configs],
  );

  const handleRemove = useCallback(() => {
    if (!editingChannelId) return;
    const next = { ...configs };
    delete next[editingChannelId];
    setConfigs(next);
    persistChannelConfigs(next);
    setEditingChannelId(null);
    toast.success("Channel removed");
  }, [configs, editingChannelId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="channels-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">
            {t("title")}
          </h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {connectedCount}/{allChannels.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 text-xs text-muted-foreground">{t("description")}</p>

        <div className="relative mb-4">
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

        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onConfigure={(id) => setEditingChannelId(id as ChannelId)}
            />
          ))}
        </div>

        {channels.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {t("noResults")}
          </p>
        )}
      </div>

      {editingChannel ? (
        <ChannelConfigModal
          channel={editingChannel}
          existingConfig={configs[editingChannelId!]}
          onSave={handleSave}
          onRemove={configs[editingChannelId!] ? handleRemove : undefined}
          onClose={() => setEditingChannelId(null)}
        />
      ) : null}
    </div>
  );
};
