"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import type { RoutingRule } from "../types";
import {
  loadRoutingConfig,
  persistRoutingConfig,
  addRoutingRule,
  updateRoutingRule,
  removeRoutingRule,
} from "../routingStore";
import { RoutingRuleEditor } from "./RoutingRuleEditor";

type RoutingPanelProps = {
  agents?: { agentId: string; name: string }[];
};

export const RoutingPanel = ({ agents = [] }: RoutingPanelProps) => {
  const t = useTranslations("routing");
  const [config, setConfig] = useState(loadRoutingConfig);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const agentIds = useMemo(
    () =>
      agents.length > 0
        ? agents.map((a) => a.agentId)
        : ["main", "support", "sales", "dev"],
    [agents],
  );

  const handleSave = useCallback(
    (rule: RoutingRule) => {
      const existing = config.rules.find((r) => r.id === rule.id);
      const next = existing
        ? updateRoutingRule(config, rule.id, rule)
        : addRoutingRule(config, rule);
      setConfig(next);
      persistRoutingConfig(next);
      setShowEditor(false);
      setEditingRule(null);
      toast.success(existing ? t("ruleUpdated") : t("ruleCreated"));
    },
    [config, t],
  );

  const handleRemove = useCallback(
    (ruleId: string) => {
      const next = removeRoutingRule(config, ruleId);
      setConfig(next);
      persistRoutingConfig(next);
      toast.success(t("ruleRemoved"));
    },
    [config, t],
  );

  const handleToggle = useCallback(
    (ruleId: string) => {
      const rule = config.rules.find((r) => r.id === ruleId);
      if (!rule) return;
      const next = updateRoutingRule(config, ruleId, {
        enabled: !rule.enabled,
      });
      setConfig(next);
      persistRoutingConfig(next);
    },
    [config],
  );

  return (
    <div className="flex h-full flex-col" data-testid="routing-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">
            {t("title")}
          </h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {config.rules.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingRule(null);
            setShowEditor(true);
          }}
          className="ui-btn-primary flex items-center gap-1 text-xs"
        >
          <Plus className="h-3 w-3" /> {t("addRule")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-3 text-xs text-muted-foreground">{t("description")}</p>

        {config.rules.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {t("noRules")}
          </p>
        ) : (
          <div className="space-y-2">
            {config.rules.map((rule) => (
              <div
                key={rule.id}
                className={`ui-card flex items-center gap-3 p-3 ${!rule.enabled ? "opacity-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(rule.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={rule.enabled ? t("disable") : t("enable")}
                >
                  {rule.enabled ? (
                    <ToggleRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {rule.name}
                    </span>
                    <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      P{rule.priority}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {rule.conditions.length} {t("conditionsLabel")} →{" "}
                    {rule.targetAgentId}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRule(rule);
                      setShowEditor(true);
                    }}
                    className="ui-btn-icon xs"
                    aria-label={t("editRule")}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(rule.id)}
                    className="ui-btn-icon xs text-destructive"
                    aria-label={t("removeRule")}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditor ? (
        <RoutingRuleEditor
          rule={editingRule ?? undefined}
          agentIds={agentIds}
          agentNames={
            agents.length > 0
              ? Object.fromEntries(agents.map((a) => [a.agentId, a.name]))
              : undefined
          }
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingRule(null);
          }}
        />
      ) : null}
    </div>
  );
};
