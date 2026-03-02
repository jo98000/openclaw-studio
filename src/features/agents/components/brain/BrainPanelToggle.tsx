"use client";

import { LayoutTemplate, Code } from "lucide-react";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BrainPanelToggleProps = {
  mode: "structured" | "expert";
  onModeChange: (mode: "structured" | "expert") => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const BrainPanelToggle = ({
  mode,
  onModeChange,
}: BrainPanelToggleProps) => {
  const t = useTranslations("inspect");

  const options = [
    {
      value: "structured" as const,
      label: t("brainStructured"),
      icon: LayoutTemplate,
    },
    { value: "expert" as const, label: t("brainExpert"), icon: Code },
  ];

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/40 p-0.5">
      {options.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            className={[
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
            onClick={() => onModeChange(value)}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
};
