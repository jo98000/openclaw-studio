"use client";

import { useTranslations } from "next-intl";
import { Settings, Trash2, KeyRound } from "lucide-react";
import type { CredentialEntry } from "../types";
import { getTemplateByServiceType } from "../credentialTemplates";
import { ServiceLogo } from "@/components/ServiceLogo";

type CredentialCardProps = {
  entry: CredentialEntry;
  onEdit: () => void;
  onDelete: () => void;
};

const maskValue = (value: string): string => {
  if (!value) return "••••••••";
  if (value.length <= 4) return "••••••••";
  return `${value.slice(0, 4)}${"•".repeat(8)}`;
};

export const CredentialCard = ({
  entry,
  onEdit,
  onDelete,
}: CredentialCardProps) => {
  const tc = useTranslations("common");
  const template = getTemplateByServiceType(entry.serviceType);
  const iconColor = template?.iconColor ?? "#6B7280";
  const serviceName = template?.name ?? entry.serviceType;
  const firstSensitive = entry.fields.find((f) => f.sensitive);

  return (
    <div
      className="ui-card group relative flex flex-col gap-2.5 rounded-xl border border-border p-4 transition-all hover:border-border/80"
      data-testid={`credential-card-${entry.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <ServiceLogo
            serviceId={entry.serviceType}
            name={serviceName}
            fallbackColor={iconColor}
            size={32}
          />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {entry.label}
            </h3>
            <p className="text-[11px] text-muted-foreground">{serviceName}</p>
          </div>
        </div>
      </div>

      {firstSensitive ? (
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <KeyRound className="h-3 w-3" aria-hidden="true" />
          {maskValue(firstSensitive.value)}
        </span>
      ) : null}

      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          className="ui-btn-ghost inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium"
          onClick={onEdit}
          aria-label={`${tc("edit")} ${entry.label}`}
        >
          <Settings className="h-3 w-3" aria-hidden="true" />
          {tc("edit")}
        </button>
        <button
          type="button"
          className="ui-btn-ghost inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={`${tc("delete")} ${entry.label}`}
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
          {tc("delete")}
        </button>
      </div>
    </div>
  );
};
