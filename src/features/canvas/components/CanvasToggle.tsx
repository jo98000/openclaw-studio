"use client";

import { MonitorPlay } from "lucide-react";

type CanvasToggleProps = {
  active: boolean;
  onToggle: () => void;
};

export const CanvasToggle = ({ active, onToggle }: CanvasToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    className={`ui-btn-icon xs ${active ? "text-primary" : "text-muted-foreground"}`}
    aria-label={active ? "Masquer le canvas" : "Afficher le canvas"}
    aria-pressed={active}
  >
    <MonitorPlay className="h-3.5 w-3.5" />
  </button>
);
