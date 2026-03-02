"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Plus, Trash2, ExternalLink, Info } from "lucide-react";
import type {
  CredentialEntry,
  CredentialField,
  CredentialServiceType,
} from "../types";
import {
  CREDENTIAL_TEMPLATES,
  getTemplateByServiceType,
} from "../credentialTemplates";
import { CredentialFieldInput } from "./CredentialFieldInput";
import { ServiceLogo } from "@/components/ServiceLogo";
import { randomUUID } from "@/lib/uuid";

type CredentialEditModalProps = {
  existingEntry?: CredentialEntry;
  onSave: (entry: CredentialEntry) => void;
  onClose: () => void;
};

type Step = "template" | "form";

const buildFieldsFromTemplate = (
  serviceType: CredentialServiceType,
): CredentialField[] => {
  const template = CREDENTIAL_TEMPLATES.find(
    (t) => t.serviceType === serviceType,
  );
  if (!template) return [];
  return template.defaultFields.map((f) => ({ ...f, value: "" }));
};

export const CredentialEditModal = ({
  existingEntry,
  onSave,
  onClose,
}: CredentialEditModalProps) => {
  const t = useTranslations("credentials");
  const tc = useTranslations("common");
  const isEdit = !!existingEntry;

  const [step, setStep] = useState<Step>(isEdit ? "form" : "template");
  const [serviceType, setServiceType] = useState<CredentialServiceType>(
    existingEntry?.serviceType ?? "custom",
  );
  const [label, setLabel] = useState(existingEntry?.label ?? "");
  const [fields, setFields] = useState<CredentialField[]>(
    existingEntry?.fields ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSelectTemplate = useCallback((type: CredentialServiceType) => {
    setServiceType(type);
    setFields(buildFieldsFromTemplate(type));
    setStep("form");
  }, []);

  const handleFieldChange = useCallback((index: number, value: string) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, value } : f)),
    );
  }, []);

  const handleAddField = useCallback(() => {
    setFields((prev) => [...prev, { key: "", value: "", sensitive: true }]);
  }, []);

  const handleRemoveField = useCallback((index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFieldKeyChange = useCallback((index: number, key: string) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, key } : f)));
  }, []);

  const handleSave = () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      setError(t("labelRequired"));
      return;
    }
    setError(null);
    const now = Date.now();
    onSave({
      id: existingEntry?.id ?? randomUUID(),
      label: trimmedLabel,
      serviceType,
      fields,
      createdAt: existingEntry?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
      <div
        className="ui-card flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-card p-0 shadow-xl"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? t("editCredential") : t("addCredential")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            {isEdit ? t("editCredential") : t("addCredential")}
          </h2>
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
          {/* Template selection step */}
          {step === "template" ? (
            <div>
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                {t("selectTemplate")}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CREDENTIAL_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.serviceType}
                    type="button"
                    className="flex flex-col items-start gap-1.5 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40 hover:bg-surface-2/50"
                    onClick={() => handleSelectTemplate(tmpl.serviceType)}
                    data-testid={`template-${tmpl.serviceType}`}
                  >
                    <ServiceLogo
                      serviceId={tmpl.serviceType}
                      name={tmpl.name}
                      fallbackColor={tmpl.iconColor}
                      size={28}
                    />
                    <span className="text-[11px] font-semibold text-foreground">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {tmpl.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Form step */}
          {step === "form" ? (
            <div className="flex flex-col gap-4">
              {/* Guide + Links */}
              {(() => {
                const tmpl = getTemplateByServiceType(serviceType);
                if (!tmpl) return null;
                const hasGuide = tmpl.guideSteps && tmpl.guideSteps.length > 0;
                const hasLinks = tmpl.signupUrl || tmpl.getKeyUrl;
                const hasMcp = !!tmpl.mcpServerHint;
                if (!hasGuide && !hasLinks && !hasMcp) return null;
                return (
                  <div className="flex flex-col gap-2">
                    {hasLinks ? (
                      <div className="flex flex-wrap gap-2">
                        {tmpl.signupUrl ? (
                          <a
                            href={tmpl.signupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-surface-2"
                          >
                            <ExternalLink
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            {t("signUp")}
                          </a>
                        ) : null}
                        {tmpl.getKeyUrl ? (
                          <a
                            href={tmpl.getKeyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
                          >
                            <ExternalLink
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            {t("getApiKey")}
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                    {hasGuide ? (
                      <details className="group">
                        <summary className="cursor-pointer text-[11px] font-medium text-muted-foreground hover:text-foreground">
                          {t("setupGuide")}
                        </summary>
                        <ol className="mt-1.5 flex flex-col gap-1 pl-4">
                          {tmpl.guideSteps!.map((step, i) => (
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
                    {hasMcp ? (
                      <div className="flex items-start gap-1.5 rounded-md bg-primary/5 px-2.5 py-2 text-[10px] text-primary">
                        <Info
                          className="mt-0.5 h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          MCP:{" "}
                          <code className="rounded bg-primary/10 px-1 font-mono text-[10px]">
                            {tmpl.mcpServerHint}
                          </code>
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })()}

              {/* Label */}
              <div>
                <label
                  htmlFor="cred-label"
                  className="mb-1.5 block text-xs font-medium text-foreground"
                >
                  {t("labelField")}
                </label>
                <input
                  id="cred-label"
                  type="text"
                  className="ui-input w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs"
                  placeholder={t("labelPlaceholder")}
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                />
                {error ? (
                  <p className="mt-1 text-[11px] text-destructive">{error}</p>
                ) : null}
              </div>

              {/* Fields */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {t("fieldValue")}
                </p>
                <div className="flex flex-col gap-2">
                  {fields.map((field, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {serviceType === "custom" ? (
                        <input
                          type="text"
                          className="ui-input w-28 shrink-0 rounded-md border border-border bg-surface-2 px-2 py-2 text-xs"
                          placeholder={t("fieldKey")}
                          value={field.key}
                          onChange={(e) =>
                            handleFieldKeyChange(i, e.target.value)
                          }
                          aria-label={t("fieldKey")}
                        />
                      ) : (
                        <span className="w-28 shrink-0 truncate text-[11px] font-medium text-muted-foreground">
                          {field.key}
                        </span>
                      )}
                      <div className="flex-1">
                        <CredentialFieldInput
                          fieldKey={field.key}
                          value={field.value}
                          sensitive={field.sensitive}
                          onChange={(v) => handleFieldChange(i, v)}
                        />
                      </div>
                      {serviceType === "custom" ? (
                        <button
                          type="button"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveField(i)}
                          aria-label={t("removeField")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                {serviceType === "custom" ? (
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    onClick={handleAddField}
                  >
                    <Plus className="h-3 w-3" />
                    {t("addField")}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {step === "form" ? (
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
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
              data-testid="save-credential-btn"
            >
              {tc("save")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
