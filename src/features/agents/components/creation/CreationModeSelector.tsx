"use client";
import { Layout, MessageSquare, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

type CreationMode = "template" | "conversational" | "blank";

type CreationModeSelectorProps = {
  selected: CreationMode | null;
  onSelect: (mode: CreationMode) => void;
};

export const CreationModeSelector = ({
  selected,
  onSelect,
}: CreationModeSelectorProps) => {
  const t = useTranslations("createAgent");
  const modes: {
    id: CreationMode;
    icon: typeof Layout;
    labelKey: string;
    descKey: string;
  }[] = [
    {
      id: "template",
      icon: Layout,
      labelKey: "modeTemplate",
      descKey: "modeTemplateDesc",
    },
    {
      id: "conversational",
      icon: MessageSquare,
      labelKey: "modeConversational",
      descKey: "modeConversationalDesc",
    },
    {
      id: "blank",
      icon: FileText,
      labelKey: "modeBlank",
      descKey: "modeBlankDesc",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selected === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border/60 hover:border-border"
            }`}
            onClick={() => onSelect(mode.id)}
          >
            <Icon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {t(mode.labelKey)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t(mode.descKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
