"use client";

import { Download, Check, Star } from "lucide-react";
import type { SkillDefinition } from "../types";

type SkillCardProps = {
  skill: SkillDefinition;
  installed: boolean;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onSelect: (id: string) => void;
};

export const SkillCard = ({ skill, installed, onInstall, onUninstall, onSelect }: SkillCardProps) => (
  <div
    className="ui-card flex cursor-pointer flex-col gap-2 p-3 transition-colors hover:bg-surface-2"
    onClick={() => onSelect(skill.id)}
    data-testid={`skill-card-${skill.id}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-base">
          {skill.icon}
        </span>
        <div>
          <span className="text-sm font-medium text-foreground">{skill.name}</span>
          <p className="text-[10px] text-muted-foreground">v{skill.version} by {skill.author}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          installed ? onUninstall(skill.id) : onInstall(skill.id);
        }}
        className={installed ? "ui-btn-secondary text-xs px-2 py-1" : "ui-btn-primary text-xs px-2 py-1"}
      >
        {installed ? (
          <><Check className="mr-1 inline h-3 w-3" /> Installed</>
        ) : (
          <><Download className="mr-1 inline h-3 w-3" /> Install</>
        )}
      </button>
    </div>
    <p className="text-[11px] text-muted-foreground">{skill.description}</p>
    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
      <span className="flex items-center gap-0.5">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {skill.rating}
      </span>
      <span>{skill.installs.toLocaleString()} installs</span>
      <span className="rounded-full bg-surface-2 px-1.5 py-0.5 capitalize">{skill.category}</span>
    </div>
  </div>
);
