"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useTransition } from "react";
import { Globe } from "lucide-react";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n/request";

export const LocaleSwitcher = () => {
  const locale = useLocale();
  const t = useTranslations("locale");
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (nextLocale: SupportedLocale) => {
      startTransition(() => {
        document.cookie = `locale=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
        window.location.reload();
      });
    },
    []
  );

  return (
    <button
      type="button"
      className="ui-btn-icon ui-btn-icon-xs relative"
      aria-label={t("switchLabel")}
      title={t("switchLabel")}
      disabled={isPending}
      onClick={() =>
        handleChange(locale === "en" ? "fr" : "en")
      }
    >
      <Globe className="h-3.5 w-3.5" />
      <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-surface-2 px-1 text-[8px] font-bold uppercase leading-tight text-muted-foreground">
        {locale}
      </span>
    </button>
  );
};
