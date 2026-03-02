"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { ChannelDefinition, ChannelConfig, ChannelId } from "../types";
import { ServiceLogo } from "@/components/ServiceLogo";

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
    existingConfig?.fields ??
      Object.fromEntries(channel.configFields.map((f) => [f.key, ""])),
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
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="ui-card w-full max-w-md p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <ServiceLogo
              serviceId={channel.id}
              name={channel.name}
              fallbackColor={channel.iconColor}
              size={28}
            />
            <h3 className="text-sm font-semibold text-foreground">
              {channel.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-icon xs"
            aria-label={t("close")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-xs text-muted-foreground">{channel.description}</p>

          {/* Guide + Links */}
          {channel.signupUrl ||
          channel.getKeyUrl ||
          (channel.guideSteps && channel.guideSteps.length > 0) ? (
            <div className="flex flex-col gap-2">
              {channel.signupUrl || channel.getKeyUrl ? (
                <div className="flex flex-wrap gap-2">
                  {channel.getKeyUrl ? (
                    <a
                      href={channel.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      {t("getCredentials")}
                    </a>
                  ) : null}
                  {channel.signupUrl ? (
                    <a
                      href={channel.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      {t("signUp")}
                    </a>
                  ) : null}
                </div>
              ) : null}
              {channel.guideSteps && channel.guideSteps.length > 0 ? (
                <details className="group">
                  <summary className="cursor-pointer text-[11px] font-medium text-muted-foreground hover:text-foreground">
                    {t("setupGuide")}
                  </summary>
                  <ol className="mt-1.5 flex flex-col gap-1 pl-4">
                    {channel.guideSteps.map((step, i) => (
                      <li
                        key={i}
                        className="list-decimal text-[11px] text-muted-foreground"
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}
            </div>
          ) : null}

          {channel.configFields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-medium text-foreground">
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </label>
              <div className="relative">
                <input
                  type={
                    field.sensitive && !visibleFields.has(field.key)
                      ? "password"
                      : "text"
                  }
                  value={fields[field.key] ?? ""}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="ui-input w-full pr-8 text-xs"
                />
                {field.sensitive && (
                  <button
                    type="button"
                    onClick={() => toggleVisibility(field.key)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      visibleFields.has(field.key) ? "Masquer" : "Afficher"
                    }
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
            <button
              type="button"
              onClick={onRemove}
              className="ui-btn-ghost text-xs text-destructive"
            >
              {t("remove")}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="ui-btn-secondary text-xs"
            >
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
