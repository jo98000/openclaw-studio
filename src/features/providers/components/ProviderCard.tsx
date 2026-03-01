import { useTranslations } from "next-intl";
import { Check, KeyRound, Settings, Shield, Globe } from "lucide-react";
import type { ProviderWithStatus } from "../types";

type ProviderCardProps = {
  provider: ProviderWithStatus;
  onConfigure: (providerId: string) => void;
};

export const ProviderCard = ({ provider, onConfigure }: ProviderCardProps) => {
  const t = useTranslations("providers");
  const tc = useTranslations("common");
  const isConfigured = provider.status === "configured";
  const isOllama = provider.id === "ollama";
  const authType = provider.config?.authType ?? "apiKey";
  const secret = provider.config?.apiKey || provider.config?.accessToken || "";

  return (
    <div
      className={`ui-card group relative flex flex-col gap-3 rounded-xl border p-4 transition-all ${
        isConfigured
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card hover:border-border/80"
      }`}
      data-testid={`provider-card-${provider.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: provider.iconColor }}
            aria-hidden="true"
          >
            {provider.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">
                {provider.name}
              </h3>
              {provider.models.length > 0 ? (
                <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                  {provider.models.length}{" "}
                  {provider.models.length === 1 ? "model" : "models"}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {provider.description}
            </p>
          </div>
        </div>
        {isConfigured ? (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <Check className="h-3 w-3" aria-hidden="true" />
            {t("active")}
          </span>
        ) : null}
      </div>

      {provider.models.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {provider.models.map((model) => (
            <span
              key={model.id}
              className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {model.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic">
          {t("customModels")}
        </p>
      )}

      {isConfigured ? (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {isOllama ? (
              <>
                <Globe className="h-3 w-3" aria-hidden="true" />
                {provider.config?.baseUrl || "localhost:11434"}
              </>
            ) : authType === "accessToken" ? (
              <>
                <Shield className="h-3 w-3" aria-hidden="true" />
                <span className="text-[9px] font-medium text-muted-foreground/70">
                  Token
                </span>
                {secret
                  ? ` ${secret.slice(0, 7)}${"*".repeat(8)}`
                  : t("keySet")}
              </>
            ) : (
              <>
                <KeyRound className="h-3 w-3" aria-hidden="true" />
                {secret ? `${secret.slice(0, 7)}${"*".repeat(8)}` : t("keySet")}
              </>
            )}
          </span>
          <button
            type="button"
            className="ui-btn-ghost inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium"
            onClick={() => onConfigure(provider.id)}
            aria-label={`Configure ${provider.name}`}
          >
            <Settings className="h-3 w-3" aria-hidden="true" />
            {tc("edit")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="ui-btn-ghost w-full justify-center rounded-md border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          onClick={() => onConfigure(provider.id)}
          data-testid={`configure-${provider.id}`}
        >
          <KeyRound className="mr-1.5 inline h-3 w-3" aria-hidden="true" />
          {t("addApiKey")}
        </button>
      )}
    </div>
  );
};
