"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type {
  ProviderDefinition,
  ProviderConfig,
  ProviderAuthType,
} from "../types";

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
  const [authType, setAuthType] = useState<ProviderAuthType>(
    existingConfig?.authType ?? "apiKey",
  );
  const [apiKey, setApiKey] = useState(existingConfig?.apiKey ?? "");
  const [accessToken, setAccessToken] = useState(
    existingConfig?.accessToken ?? "",
  );
  const [baseUrl, setBaseUrl] = useState(existingConfig?.baseUrl ?? "");
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOllama = provider.id === "ollama";
  const showAuthToggle = provider.supportsAccessToken && !isOllama;
  const currentSecret = authType === "apiKey" ? apiKey : accessToken;

  const handleTestConnection = useCallback(async () => {
    setValidationState("validating");
    setValidationError(null);
    try {
      const res = await fetch("/api/providers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          apiKey: authType === "apiKey" ? apiKey.trim() : undefined,
          accessToken:
            authType === "accessToken" ? accessToken.trim() : undefined,
          baseUrl: baseUrl.trim() || undefined,
        }),
      });
      const result = (await res.json()) as { valid: boolean; error?: string };
      if (result.valid) {
        setValidationState("valid");
      } else {
        setValidationState("invalid");
        setValidationError(result.error || "Unknown error");
      }
    } catch {
      setValidationState("invalid");
      setValidationError("Network error");
    }
  }, [provider.id, authType, apiKey, accessToken, baseUrl]);

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
    if (!isOllama) {
      const trimmedSecret = currentSecret.trim();
      if (!trimmedSecret) {
        setError(t("apiKeyRequired"));
        return;
      }
    }
    setError(null);
    onSave({
      id: provider.id,
      apiKey: authType === "apiKey" ? apiKey.trim() || undefined : undefined,
      accessToken:
        authType === "accessToken"
          ? accessToken.trim() || undefined
          : undefined,
      authType,
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
        className="ui-card flex w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-card p-0 shadow-xl"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {showAuthToggle ? (
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                {t("authMethod")}
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className={`ui-segment-item rounded-md px-3 py-1.5 text-[11px] font-medium ${
                    authType === "apiKey" ? "ui-selected" : ""
                  }`}
                  onClick={() => {
                    setAuthType("apiKey");
                    setError(null);
                  }}
                >
                  API Key
                </button>
                <button
                  type="button"
                  className={`ui-segment-item rounded-md px-3 py-1.5 text-[11px] font-medium ${
                    authType === "accessToken" ? "ui-selected" : ""
                  }`}
                  onClick={() => {
                    setAuthType("accessToken");
                    setError(null);
                  }}
                >
                  Access Token
                </button>
              </div>
            </div>
          ) : null}

          {!isOllama ? (
            <div>
              <label
                htmlFor="auth-secret-input"
                className="mb-1.5 block text-xs font-medium text-foreground"
              >
                {authType === "apiKey"
                  ? t("apiKeyLabel")
                  : t("accessTokenLabel")}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  id="auth-secret-input"
                  type={showSecret ? "text" : "password"}
                  className="ui-input w-full rounded-lg border border-border bg-surface-2 px-3 py-2 pr-10 font-mono text-xs"
                  placeholder={
                    authType === "apiKey"
                      ? t("apiKeyPlaceholder")
                      : t("accessTokenPlaceholder")
                  }
                  value={currentSecret}
                  onChange={(e) => {
                    if (authType === "apiKey") setApiKey(e.target.value);
                    else setAccessToken(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowSecret(!showSecret)}
                  aria-label={showSecret ? t("hideSecret") : t("showSecret")}
                >
                  {showSecret ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {error ? (
                <p className="mt-1 text-[11px] text-destructive">{error}</p>
              ) : null}
            </div>
          ) : null}

          {provider.supportsCustomEndpoint ? (
            <div>
              <label
                htmlFor="base-url-input"
                className="mb-1.5 block text-xs font-medium text-foreground"
              >
                {t("baseUrlLabel")}{" "}
                {!isOllama ? (
                  <span className="text-muted-foreground">
                    ({t("baseUrlOptional")})
                  </span>
                ) : null}
              </label>
              <input
                id="base-url-input"
                ref={isOllama ? inputRef : undefined}
                type="url"
                className="ui-input w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs"
                placeholder={
                  isOllama ? "http://localhost:11434" : t("baseUrlPlaceholder")
                }
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                {t("baseUrlHint")}
              </p>
            </div>
          ) : null}

          {/* Test Connection */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50"
              onClick={handleTestConnection}
              disabled={
                validationState === "validating" ||
                (!isOllama && !currentSecret.trim())
              }
            >
              {validationState === "validating" ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              ) : validationState === "valid" ? (
                <CheckCircle2
                  className="h-3 w-3 text-green-500"
                  aria-hidden="true"
                />
              ) : validationState === "invalid" ? (
                <XCircle
                  className="h-3 w-3 text-destructive"
                  aria-hidden="true"
                />
              ) : null}
              {t("testConnection")}
            </button>
            {validationState === "valid" ? (
              <span className="text-[10px] font-medium text-green-500">
                {t("connectionValid")}
              </span>
            ) : null}
            {validationState === "invalid" && validationError ? (
              <span className="text-[10px] font-medium text-destructive">
                {validationError}
              </span>
            ) : null}
          </div>

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
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                {t("availableModels")}
              </p>
              <div className="flex flex-wrap gap-1">
                {provider.models.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {m.name}
                    {m.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded bg-primary/10 px-1 text-[9px] font-semibold text-primary"
                      >
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
