import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { GatewayStatus } from "@/lib/gateway/GatewayClient";
import { Plug, Layers } from "lucide-react";
import { resolveGatewayStatusBadgeClass } from "./colorSemantics";

type HeaderBarProps = {
  status: GatewayStatus;
  onConnectionSettings: () => void;
  onProviders?: () => void;
  showConnectionSettings?: boolean;
};

export const HeaderBar = ({
  status,
  onConnectionSettings,
  onProviders,
  showConnectionSettings = true,
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
                      <Layers className="mr-2 inline h-3 w-3" aria-hidden="true" />
                      {t("aiProviders")}
                    </button>
                  ) : null}
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
