"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Webhook, Plus, Trash2, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import type { WebhookConfig } from "../types";
import {
  loadWebhooks,
  persistWebhooks,
  addWebhook,
  updateWebhook,
  removeWebhook,
} from "../webhookStore";
import { WebhookCreateModal } from "./WebhookCreateModal";

export const WebhooksPanel = () => {
  const t = useTranslations("webhooks");
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(loadWebhooks);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleSave = useCallback(
    (webhook: WebhookConfig) => {
      const existing = webhooks.find((w) => w.id === webhook.id);
      const next = existing
        ? updateWebhook(webhooks, webhook.id, webhook)
        : addWebhook(webhooks, webhook);
      setWebhooks(next);
      persistWebhooks(next);
      setShowEditor(false);
      setEditingWebhook(null);
      toast.success(existing ? t("webhookUpdated") : t("webhookCreated"));
    },
    [webhooks, t],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const next = removeWebhook(webhooks, id);
      setWebhooks(next);
      persistWebhooks(next);
      toast.success(t("webhookRemoved"));
    },
    [webhooks, t],
  );

  const handleToggle = useCallback(
    (id: string) => {
      const wh = webhooks.find((w) => w.id === id);
      if (!wh) return;
      const next = updateWebhook(webhooks, id, { enabled: !wh.enabled });
      setWebhooks(next);
      persistWebhooks(next);
    },
    [webhooks],
  );

  const enabledCount = webhooks.filter((w) => w.enabled).length;

  return (
    <div className="flex h-full flex-col" data-testid="webhooks-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {enabledCount}/{webhooks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingWebhook(null);
            setShowEditor(true);
          }}
          className="ui-btn-primary flex items-center gap-1 text-xs"
        >
          <Plus className="h-3 w-3" /> {t("addWebhook")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 text-xs text-muted-foreground">{t("description")}</p>

        {webhooks.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">{t("noWebhooks")}</p>
        ) : (
          <div className="space-y-2">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className={`ui-card flex items-center gap-3 p-3 ${!wh.enabled ? "opacity-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(wh.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={wh.enabled ? t("disable") : t("enable")}
                >
                  {wh.enabled ? (
                    <ToggleRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <span className="truncate text-sm font-medium text-foreground">{wh.name}</span>
                  <p className="truncate text-[11px] text-muted-foreground">{wh.url}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {wh.events.length} {t("eventsLabel")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWebhook(wh);
                      setShowEditor(true);
                    }}
                    className="ui-btn-icon xs"
                    aria-label={t("editWebhook")}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(wh.id)}
                    className="ui-btn-icon xs text-destructive"
                    aria-label={t("removeWebhook")}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditor ? (
        <WebhookCreateModal
          webhook={editingWebhook ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingWebhook(null);
          }}
        />
      ) : null}
    </div>
  );
};
