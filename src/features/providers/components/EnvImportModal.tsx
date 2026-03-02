"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { importFromEnvContent } from "@/features/credentials/envImportApi";
import type { EnvImportResult } from "@/features/credentials/envImportApi";

type EnvImportModalProps = {
  onImportProviders: (providers: EnvImportResult["providers"]) => void;
  onImportCredentials?: (credentials: EnvImportResult["credentials"]) => void;
  onClose: () => void;
};

export const EnvImportModal = ({
  onImportProviders,
  onImportCredentials,
  onClose,
}: EnvImportModalProps) => {
  const t = useTranslations("providers");
  const tc = useTranslations("common");
  const [content, setContent] = useState("");
  const [result, setResult] = useState<EnvImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(
    new Set(),
  );
  const [selectedCredentials, setSelectedCredentials] = useState<Set<string>>(
    new Set(),
  );

  const handleParse = useCallback(async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await importFromEnvContent(content);
      setResult(res);
      setSelectedProviders(new Set(res.providers.map((p) => p.serviceType)));
      setSelectedCredentials(
        new Set(res.credentials.map((c) => c.serviceType)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse .env content",
      );
    } finally {
      setLoading(false);
    }
  }, [content]);

  const handleImport = useCallback(() => {
    if (!result) return;
    const providers = result.providers.filter((p) =>
      selectedProviders.has(p.serviceType),
    );
    const credentials = result.credentials.filter((c) =>
      selectedCredentials.has(c.serviceType),
    );
    if (providers.length > 0) onImportProviders(providers);
    if (credentials.length > 0 && onImportCredentials)
      onImportCredentials(credentials);
    onClose();
  }, [
    result,
    selectedProviders,
    selectedCredentials,
    onImportProviders,
    onImportCredentials,
    onClose,
  ]);

  const toggleProvider = (serviceType: string) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(serviceType)) next.delete(serviceType);
      else next.add(serviceType);
      return next;
    });
  };

  const toggleCredential = (serviceType: string) => {
    setSelectedCredentials((prev) => {
      const next = new Set(prev);
      if (next.has(serviceType)) next.delete(serviceType);
      else next.add(serviceType);
      return next;
    });
  };

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text === "string") setContent(text);
      };
      reader.readAsText(file);
    },
    [],
  );

  const totalSelected = selectedProviders.size + selectedCredentials.size;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
      <div
        className="ui-card flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-card p-0 shadow-xl"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
        role="dialog"
        aria-modal="true"
        aria-label={t("envImportTitle")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-foreground">
              {t("envImportTitle")}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!result ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                {t("envImportDescription")}
              </p>

              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-surface-2">
                  <FileText className="h-3 w-3" aria-hidden="true" />
                  {t("envImportUpload")}
                  <input
                    type="file"
                    accept=".env,.env.*,text/plain"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <textarea
                className="ui-input min-h-[120px] w-full resize-y rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs"
                placeholder={t("envImportPlaceholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {error ? (
                <div className="flex items-center gap-1.5 text-[11px] text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                onClick={handleParse}
                disabled={!content.trim() || loading}
              >
                {loading ? (
                  <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin" />
                ) : null}
                {t("envImportScan")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {result.providers.length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
                    {t("envImportProviders")} ({result.providers.length})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {result.providers.map((p) => (
                      <label
                        key={p.serviceType}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:bg-surface-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProviders.has(p.serviceType)}
                          onChange={() => toggleProvider(p.serviceType)}
                          className="h-3.5 w-3.5 rounded border-border"
                        />
                        <span className="text-xs font-medium text-foreground">
                          {p.serviceType}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {p.apiKey.slice(0, 8)}
                          {"*".repeat(8)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {result.credentials.length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t("envImportCredentials")} ({result.credentials.length})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {result.credentials.map((c) => (
                      <label
                        key={c.serviceType}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 transition-colors hover:bg-surface-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCredentials.has(c.serviceType)}
                          onChange={() => toggleCredential(c.serviceType)}
                          className="h-3.5 w-3.5 rounded border-border"
                        />
                        <span className="text-xs font-medium text-foreground">
                          {c.serviceType}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {c.fields.length}{" "}
                          {c.fields.length === 1 ? "field" : "fields"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {result.providers.length === 0 &&
              result.credentials.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <AlertCircle className="h-6 w-6 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    {t("envImportNoResults")}
                  </p>
                </div>
              ) : null}

              {result.unmatched.length > 0 ? (
                <details className="group">
                  <summary className="cursor-pointer text-[11px] font-medium text-muted-foreground hover:text-foreground">
                    {t("envImportUnmatched")} ({result.unmatched.length})
                  </summary>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {result.unmatched.map((key) => (
                      <span
                        key={key}
                        className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          {result ? (
            <button
              type="button"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setResult(null)}
            >
              {tc("back")}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="ui-btn-ghost rounded-lg px-3 py-1.5 text-xs font-medium"
              onClick={onClose}
            >
              {tc("cancel")}
            </button>
            {result ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                onClick={handleImport}
                disabled={totalSelected === 0}
              >
                <Check className="h-3 w-3" />
                {t("envImportButton")} ({totalSelected})
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
