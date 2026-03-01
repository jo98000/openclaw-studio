"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { ProviderDefinition, ProviderConfig } from "../types";

type ApiKeyModalProps = {
  provider: ProviderDefinition;
  existingConfig?: ProviderConfig;
  onSave: (config: ProviderConfig) => void;
  onRemove?: () => void;
  onClose: () => void;
};

export const ApiKeyModal = ({
  provider,
  existingConfig,
  onSave,
  onRemove,
  onClose,
}: ApiKeyModalProps) => {
  const t = useTranslations("providers");
  const tc = useTranslations("common");
  const [apiKey, setApiKey] = useState(existingConfig?.apiKey ?? "");
  const [baseUrl, setBaseUrl] = useState(existingConfig?.baseUrl ?? "");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSave = () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError(t("apiKeyRequired"));
      return;
    }
    setError(null);
    onSave({
      id: provider.id,
      apiKey: trimmedKey,
      baseUrl: baseUrl.trim() || undefined,
      enabled: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
      <div
        className="ui-card w-full max-w-md rounded-2xl border bg-card p-0 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={`Configure ${provider.name}`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
              style={{ backgroundColor: provider.iconColor }}
              aria-hidden="true"
            >
              {provider.name.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              {provider.name}
            </h2>
          </div>
          <button
            type="button"
            className="ui-btn-icon ui-btn-icon-xs"
            onClick={onClose}
            aria-label={tc("close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4">
          <div>
            <label htmlFor="api-key-input" className="mb-1.5 block text-xs font-medium text-foreground">
              {t("apiKeyLabel")}
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="api-key-input"
                type={showKey ? "text" : "password"}
                className="ui-input w-full rounded-lg border border-border bg-surface-2 px-3 py-2 pr-10 font-mono text-xs"
                placeholder={t("apiKeyPlaceholder")}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Masquer la clé API" : "Afficher la clé API"}
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {error ? (
              <p className="mt-1 text-[11px] text-destructive">{error}</p>
            ) : null}
          </div>

          {provider.supportsCustomEndpoint ? (
            <div>
              <label htmlFor="base-url-input" className="mb-1.5 block text-xs font-medium text-foreground">
                {t("baseUrlLabel")} <span className="text-muted-foreground">({t("baseUrlOptional")})</span>
              </label>
              <input
                id="base-url-input"
                type="url"
                className="ui-input w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs"
                placeholder={t("baseUrlPlaceholder")}
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                {t("baseUrlHint")}
              </p>
            </div>
          ) : null}

          {provider.docsUrl ? (
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              {t("documentation", { name: provider.name })}
            </a>
          ) : null}

          {provider.models.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{t("availableModels")}</p>
              <div className="flex flex-wrap gap-1">
                {provider.models.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {m.name}
                    {m.badges.map((badge) => (
                      <span key={badge} className="rounded bg-primary/10 px-1 text-[9px] font-semibold text-primary">
                        {badge}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <div>
            {existingConfig && onRemove ? (
              <button
                type="button"
                className="text-xs font-medium text-destructive hover:underline"
                onClick={onRemove}
              >
                {t("removeProvider")}
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="ui-btn-ghost rounded-lg px-3 py-1.5 text-xs font-medium"
              onClick={onClose}
            >
              {tc("cancel")}
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={handleSave}
              data-testid="save-provider-btn"
            >
              {tc("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
