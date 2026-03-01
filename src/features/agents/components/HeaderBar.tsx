import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { GatewayStatus } from "@/lib/gateway/GatewayClient";
import {
  Plug,
  Layers,
  Radio,
  GitBranch,
  Webhook,
  Puzzle,
  BarChart3,
  ScrollText,
  MonitorPlay,
  MessageSquare,
  Mic,
} from "lucide-react";
import { resolveGatewayStatusBadgeClass } from "./colorSemantics";

type HeaderBarProps = {
  status: GatewayStatus;
  onConnectionSettings: () => void;
  onProviders?: () => void;
  onChannels?: () => void;
  onRouting?: () => void;
  onWebhooks?: () => void;
  onSkills?: () => void;
  onAnalytics?: () => void;
  onLogs?: () => void;
  onCanvas?: () => void;
  onIntercom?: () => void;
  onVoice?: () => void;
  showConnectionSettings?: boolean;
  configuredProviderCount?: number;
  totalProviderCount?: number;
};

export const HeaderBar = ({
  status,
  onConnectionSettings,
  onProviders,
  onChannels,
  onRouting,
  onWebhooks,
  onSkills,
  onAnalytics,
  onLogs,
  onCanvas,
  onIntercom,
  onVoice,
  showConnectionSettings = true,
  configuredProviderCount = 0,
  totalProviderCount = 0,
}: HeaderBarProps) => {
  const t = useTranslations("header");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="ui-topbar relative z-[180]">
      <div className="grid h-10 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-3 sm:px-4 md:px-5">
        <div aria-hidden="true" />
        <p className="truncate text-sm font-semibold tracking-[0.01em] text-foreground">
          {t("title")}
        </p>
        <div className="flex items-center justify-end gap-1">
          {status === "connecting" ? (
            <span
              className={`ui-chip px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.08em] ${resolveGatewayStatusBadgeClass("connecting")}`}
              data-testid="gateway-connecting-indicator"
              data-status="connecting"
            >
              {t("connecting")}
            </span>
          ) : null}
          {onProviders ? (
            <button
              type="button"
              className="ui-btn-icon ui-btn-icon-xs relative"
              data-testid="providers-direct-toggle"
              aria-label={t("aiProviders")}
              onClick={onProviders}
            >
              <Layers className="h-3.5 w-3.5" />
              {configuredProviderCount === 0 && totalProviderCount > 0 ? (
                <span
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive"
                  aria-label={t("noProvidersConfigured")}
                />
              ) : null}
            </button>
          ) : null}
          <LocaleSwitcher />
          <ThemeToggle />
          {showConnectionSettings ? (
            <div className="relative z-[210]" ref={menuRef}>
              <button
                type="button"
                className="ui-btn-icon ui-btn-icon-xs"
                data-testid="studio-menu-toggle"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Plug className="h-3.5 w-3.5" />
                <span className="sr-only">{t("openMenu")}</span>
              </button>
              {menuOpen ? (
                <div className="ui-card ui-menu-popover absolute right-0 top-9 z-[260] min-w-44 p-1">
                  {onProviders ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onProviders();
                        setMenuOpen(false);
                      }}
                      data-testid="providers-toggle"
                    >
                      <Layers
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("aiProviders")}
                      {configuredProviderCount > 0 ? (
                        <span className="ml-auto text-[9px] text-muted-foreground">
                          {configuredProviderCount}/{totalProviderCount}
                        </span>
                      ) : null}
                    </button>
                  ) : null}
                  {onChannels ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onChannels();
                        setMenuOpen(false);
                      }}
                      data-testid="channels-toggle"
                    >
                      <Radio
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("channels")}
                    </button>
                  ) : null}
                  {onRouting ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onRouting();
                        setMenuOpen(false);
                      }}
                      data-testid="routing-toggle"
                    >
                      <GitBranch
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("routing")}
                    </button>
                  ) : null}
                  {onWebhooks ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onWebhooks();
                        setMenuOpen(false);
                      }}
                      data-testid="webhooks-toggle"
                    >
                      <Webhook
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("webhooks")}
                    </button>
                  ) : null}
                  {onSkills ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onSkills();
                        setMenuOpen(false);
                      }}
                      data-testid="skills-toggle"
                    >
                      <Puzzle
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("skillsBrowser")}
                    </button>
                  ) : null}
                  {onCanvas ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onCanvas();
                        setMenuOpen(false);
                      }}
                      data-testid="canvas-toggle"
                    >
                      <MonitorPlay
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("canvas")}
                    </button>
                  ) : null}
                  {onIntercom ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onIntercom();
                        setMenuOpen(false);
                      }}
                      data-testid="intercom-toggle"
                    >
                      <MessageSquare
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("intercom")}
                    </button>
                  ) : null}
                  {onVoice ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onVoice();
                        setMenuOpen(false);
                      }}
                      data-testid="voice-toggle"
                    >
                      <Mic className="mr-2 inline h-3 w-3" aria-hidden="true" />
                      {t("voice")}
                    </button>
                  ) : null}
                  <div className="my-1 border-t border-border" />
                  {onAnalytics ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onAnalytics();
                        setMenuOpen(false);
                      }}
                      data-testid="analytics-toggle"
                    >
                      <BarChart3
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("analytics")}
                    </button>
                  ) : null}
                  {onLogs ? (
                    <button
                      className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                      type="button"
                      onClick={() => {
                        onLogs();
                        setMenuOpen(false);
                      }}
                      data-testid="logs-toggle"
                    >
                      <ScrollText
                        className="mr-2 inline h-3 w-3"
                        aria-hidden="true"
                      />
                      {t("logs")}
                    </button>
                  ) : null}
                  <div className="my-1 border-t border-border" />
                  <button
                    className="ui-btn-ghost w-full justify-start border-transparent px-3 py-2 text-left text-xs font-medium tracking-normal text-foreground"
                    type="button"
                    onClick={() => {
                      onConnectionSettings();
                      setMenuOpen(false);
                    }}
                    data-testid="gateway-settings-toggle"
                  >
                    {t("gatewayConnection")}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
