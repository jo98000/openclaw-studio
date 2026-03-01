"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Eye, EyeOff } from "lucide-react";
import type { ChannelDefinition, ChannelConfig, ChannelId } from "../types";

type ChannelConfigModalProps = {
  channel: ChannelDefinition;
  existingConfig?: ChannelConfig;
  onSave: (config: ChannelConfig) => void;
  onRemove?: () => void;
  onClose: () => void;
};

export const ChannelConfigModal = ({
  channel,
  existingConfig,
  onSave,
  onRemove,
  onClose,
}: ChannelConfigModalProps) => {
  const t = useTranslations("channels");
  const [fields, setFields] = useState<Record<string, string>>(
    existingConfig?.fields ?? Object.fromEntries(channel.configFields.map((f) => [f.key, ""]))
  );
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  const toggleVisibility = (key: string) => {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = useCallback(() => {
    const config: ChannelConfig = {
      id: channel.id as ChannelId,
      enabled: true,
      fields,
    };
    onSave(config);
  }, [channel.id, fields, onSave]);

  const hasRequiredFields = channel.configFields
    .filter((f) => f.required)
    .every((f) => fields[f.key]?.trim());

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="ui-card w-full max-w-md p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md text-base"
              style={{ backgroundColor: `${channel.iconColor}18` }}
            >
              {channel.icon}
            </span>
            <h3 className="text-sm font-semibold text-foreground">{channel.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="ui-btn-icon xs" aria-label={t("close")}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-xs text-muted-foreground">{channel.description}</p>

          {channel.configFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-medium text-foreground">
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </label>
              <div className="relative">
                <input
                  type={field.sensitive && !visibleFields.has(field.key) ? "password" : "text"}
                  value={fields[field.key] ?? ""}
                  onChange={(e) => setFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="ui-input w-full pr-8 text-xs"
                />
                {field.sensitive && (
                  <button
                    type="button"
                    onClick={() => toggleVisibility(field.key)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={visibleFields.has(field.key) ? "Masquer" : "Afficher"}
                  >
                    {visibleFields.has(field.key) ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          {onRemove ? (
            <button type="button" onClick={onRemove} className="ui-btn-ghost text-xs text-destructive">
              {t("remove")}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="ui-btn-secondary text-xs">
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasRequiredFields}
              className="ui-btn-primary text-xs"
            >
              {t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
