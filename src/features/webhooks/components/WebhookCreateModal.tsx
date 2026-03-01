"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Eye, EyeOff } from "lucide-react";
import type { WebhookConfig, WebhookEvent } from "../types";

type WebhookCreateModalProps = {
  webhook?: WebhookConfig;
  onSave: (webhook: WebhookConfig) => void;
  onClose: () => void;
};

const ALL_EVENTS: { value: WebhookEvent; labelKey: string }[] = [
  { value: "agent.started", labelKey: "agentStarted" },
  { value: "agent.stopped", labelKey: "agentStopped" },
  { value: "agent.error", labelKey: "agentError" },
  { value: "message.received", labelKey: "messageReceived" },
  { value: "message.sent", labelKey: "messageSent" },
  { value: "approval.requested", labelKey: "approvalRequested" },
  { value: "approval.resolved", labelKey: "approvalResolved" },
  { value: "session.created", labelKey: "sessionCreated" },
  { value: "session.ended", labelKey: "sessionEnded" },
];

export const WebhookCreateModal = ({ webhook, onSave, onClose }: WebhookCreateModalProps) => {
  const t = useTranslations("webhooks");
  const te = useTranslations("webhookEvents");
  const [name, setName] = useState(webhook?.name ?? "");
  const [url, setUrl] = useState(webhook?.url ?? "");
  const [secret, setSecret] = useState(webhook?.secret ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [events, setEvents] = useState<Set<WebhookEvent>>(new Set(webhook?.events ?? []));

  const toggleEvent = (event: WebhookEvent) => {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) next.delete(event);
      else next.add(event);
      return next;
    });
  };

  const handleSave = useCallback(() => {
    onSave({
      id: webhook?.id ?? crypto.randomUUID(),
      name: name.trim() || te("untitledWebhook"),
      url: url.trim(),
      secret: secret.trim() || undefined,
      events: Array.from(events),
      enabled: webhook?.enabled ?? true,
      createdAt: webhook?.createdAt ?? new Date().toISOString(),
    });
  }, [webhook, name, url, secret, events, onSave]);

  const canSave = name.trim() && url.trim() && events.size > 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="ui-card w-full max-w-md p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            {webhook ? t("editWebhook") : t("addWebhook")}
          </h3>
          <button type="button" onClick={onClose} className="ui-btn-icon xs" aria-label={t("close")}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">{t("nameLabel")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="ui-input w-full text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">{t("urlLabel")}</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              className="ui-input w-full text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {t("secretLabel")} <span className="text-muted-foreground">({t("optional")})</span>
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={t("secretPlaceholder")}
                className="ui-input w-full pr-8 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowSecret((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showSecret ? te("hide") : te("show")}
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">{t("events")}</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_EVENTS.map((evt) => (
                <label key={evt.value} className="flex items-center gap-1.5 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={events.has(evt.value)}
                    onChange={() => toggleEvent(evt.value)}
                    className="h-3.5 w-3.5 rounded border-border"
                  />
                  {te(evt.labelKey)}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button type="button" onClick={onClose} className="ui-btn-secondary text-xs">
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="ui-btn-primary text-xs"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
};
