"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import type { GatewayStatus } from "@/lib/gateway/GatewayClient";
import { isLocalGatewayUrl } from "@/lib/gateway/local-gateway";
import type { StudioGatewaySettings } from "@/lib/studio/settings";

type GatewayConnectScreenProps = {
  gatewayUrl: string;
  token: string;
  localGatewayDefaults: StudioGatewaySettings | null;
  status: GatewayStatus;
  error: string | null;
  onGatewayUrlChange: (value: string) => void;
  onTokenChange: (value: string) => void;
  onUseLocalDefaults: () => void;
  onConnect: () => void;
};

const resolveLocalGatewayPort = (gatewayUrl: string): number => {
  try {
    const parsed = new URL(gatewayUrl);
    const port = Number(parsed.port);
    if (Number.isFinite(port) && port > 0) return port;
  } catch {}
  return 18789;
};

export const GatewayConnectScreen = ({
  gatewayUrl,
  token,
  localGatewayDefaults,
  status,
  error,
  onGatewayUrlChange,
  onTokenChange,
  onUseLocalDefaults,
  onConnect,
}: GatewayConnectScreenProps) => {
  const t = useTranslations("gateway");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [showToken, setShowToken] = useState(false);
  const isLocal = useMemo(() => isLocalGatewayUrl(gatewayUrl), [gatewayUrl]);
  const localPort = useMemo(() => resolveLocalGatewayPort(gatewayUrl), [gatewayUrl]);
  const localGatewayCommand = useMemo(
    () => `npx openclaw gateway run --bind loopback --port ${localPort} --verbose`,
    [localPort]
  );
  const localGatewayCommandPnpm = useMemo(
    () => `pnpm openclaw gateway run --bind loopback --port ${localPort} --verbose`,
    [localPort]
  );
  const statusCopy = useMemo(() => {
    if (status === "connecting" && isLocal) {
      return t("localDetected", { port: localPort });
    }
    if (status === "connecting") {
      return t("connectingRemote");
    }
    if (isLocal) {
      return t("noLocal");
    }
    return t("notConnected");
  }, [isLocal, localPort, status, t]);
  const connectDisabled = status === "connecting";
  const connectLabel = connectDisabled ? t("connecting") : t("connect");
  const statusDotClass =
    status === "connected"
      ? "ui-dot-status-connected"
      : status === "connecting"
        ? "ui-dot-status-connecting"
        : "ui-dot-status-disconnected";

  const copyLocalCommand = async () => {
    try {
      await navigator.clipboard.writeText(localGatewayCommand);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1200);
    } catch {
      setCopyStatus("failed");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    }
  };

  const commandField = (
    <div className="space-y-1.5">
      <div className="ui-command-surface flex items-center gap-2 rounded-md px-3 py-2">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12px]">
          {localGatewayCommand}
        </code>
        <button
          type="button"
          className="ui-btn-icon ui-command-copy h-7 w-7 shrink-0"
          onClick={copyLocalCommand}
          aria-label={t("copyCommandLabel")}
          title={t("copyCommand")}
        >
          {copyStatus === "copied" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      {copyStatus === "copied" ? (
        <p className="text-xs text-muted-foreground">{t("copied")}</p>
      ) : copyStatus === "failed" ? (
        <p className="ui-text-danger text-xs">{t("copyFailed")}</p>
      ) : (
        <p className="text-xs leading-snug text-muted-foreground">
          {t("sourceCheckout")} <span className="font-mono">{localGatewayCommandPnpm}</span>.
        </p>
      )}
    </div>
  );

  const remoteForm = (
    <div className="mt-2.5 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-[11px] font-medium text-foreground/80">
        {t("upstreamUrl")}
        <input
          className="ui-input h-10 rounded-md px-4 font-sans text-sm text-foreground outline-none"
          type="text"
          value={gatewayUrl}
          onChange={(event) => onGatewayUrlChange(event.target.value)}
          placeholder={t("upstreamUrlPlaceholder")}
          spellCheck={false}
        />
      </label>

      <div className="space-y-0.5 text-xs text-muted-foreground/90">
        <p className="font-medium text-foreground/85">{t("usingTailscale")}</p>
        <p>
          URL: <span className="font-mono">wss://&lt;your-tailnet-host&gt;</span>
        </p>
      </div>

      <label className="flex flex-col gap-1 text-[11px] font-medium text-foreground/80">
        {t("upstreamToken")}
        <div className="relative">
          <input
            className="ui-input h-10 w-full rounded-md px-4 pr-10 font-sans text-sm text-foreground outline-none"
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(event) => onTokenChange(event.target.value)}
            placeholder={t("tokenPlaceholder")}
            spellCheck={false}
          />
          <button
            type="button"
            className="ui-btn-icon absolute inset-y-0 right-1 my-auto h-8 w-8 border-transparent bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground"
            aria-label={showToken ? t("hideToken") : t("showToken")}
            onClick={() => setShowToken((prev) => !prev)}
          >
            {showToken ? (
              <EyeOff className="h-4 w-4 transition-transform duration-150" />
            ) : (
              <Eye className="h-4 w-4 transition-transform duration-150" />
            )}
          </button>
        </div>
      </label>

      <button
        type="button"
        className="ui-btn-primary mt-1 h-11 w-full px-4 text-xs font-semibold tracking-[0.05em] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onConnect}
        disabled={connectDisabled || !gatewayUrl.trim()}
      >
        {connectLabel}
      </button>

      {status === "connecting" ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("connecting")}
        </p>
      ) : null}
      {error ? <p className="ui-text-danger text-xs leading-snug">{error}</p> : null}
    </div>
  );

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[820px] flex-1 flex-col gap-5">
      <div className="ui-card px-4 py-2">
        <div className="flex items-center gap-2">
          {status === "connecting" ? (
            <Loader2 className="h-4 w-4 animate-spin text-[color:var(--status-connecting-fg)]" />
          ) : (
            <span
              className={`h-2.5 w-2.5 ${statusDotClass}`}
            />
          )}
          <p className="text-sm font-semibold text-foreground">{statusCopy}</p>
        </div>
      </div>

      <div className="ui-card px-4 py-5 sm:px-6">
        <div>
          <p className="font-mono text-[10px] font-medium tracking-[0.06em] text-muted-foreground">
            {t("remoteRecommended")}
          </p>
          <p className="mt-2 text-sm text-foreground/85">{t("remoteDefault")}</p>
        </div>
        {remoteForm}
      </div>

      <div className="ui-card px-4 py-4 sm:px-6 sm:py-5">
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] font-semibold tracking-[0.06em] text-muted-foreground">
            {t("runLocally")}
          </p>
          <p className="text-sm text-foreground/85">
            {t("startLocal")}
          </p>
        </div>
        <div className="mt-3 space-y-3">
          {commandField}
          {localGatewayDefaults ? (
            <div className="ui-input rounded-md px-3 py-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t("useTokenFrom")} <span className="font-mono">~/.openclaw/openclaw.json</span>.
                </p>
                <p className="font-mono text-[11px] text-foreground/85">
                  {localGatewayDefaults.url}
                </p>
                <button
                  type="button"
                  className="ui-btn-secondary h-9 w-full px-3 text-xs font-semibold tracking-[0.05em] text-foreground"
                  onClick={onUseLocalDefaults}
                >
                  {t("useLocalDefaults")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
