"use client";

import { useTranslations } from "next-intl";
import { X, Download, Check, Star, Tag } from "lucide-react";
import type { SkillDefinition } from "../types";

type SkillDetailModalProps = {
  skill: SkillDefinition;
  installed: boolean;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onClose: () => void;
};

export const SkillDetailModal = ({
  skill,
  installed,
  onInstall,
  onUninstall,
  onClose,
}: SkillDetailModalProps) => {
  const t = useTranslations("skills");

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="ui-card w-full max-w-md p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-lg">
              {skill.icon}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{skill.name}</h3>
              <p className="text-[10px] text-muted-foreground">
                v{skill.version} by {skill.author}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="ui-btn-icon xs" aria-label={t("close")}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-xs text-muted-foreground">{skill.description}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {skill.rating} / 5
            </span>
            <span>{skill.installs.toLocaleString()} {t("installs")}</span>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 capitalize">{skill.category}</span>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-foreground">{t("tags")}</p>
            <div className="flex flex-wrap gap-1.5">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button type="button" onClick={onClose} className="ui-btn-secondary text-xs">
            {t("close")}
          </button>
          <button
            type="button"
            onClick={() => (installed ? onUninstall(skill.id) : onInstall(skill.id))}
            className={installed ? "ui-btn-ghost text-xs text-destructive" : "ui-btn-primary text-xs"}
          >
            {installed ? (
              <>{t("uninstall")}</>
            ) : (
              <><Download className="mr-1 inline h-3 w-3" /> {t("install")}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
