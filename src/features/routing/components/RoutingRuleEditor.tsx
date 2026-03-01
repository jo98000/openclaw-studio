"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, Plus, Trash2 } from "lucide-react";
import type {
  RoutingRule,
  RoutingCondition,
  RoutingConditionType,
} from "../types";

type RoutingRuleEditorProps = {
  rule?: RoutingRule;
  agentIds: string[];
  agentNames?: Record<string, string>;
  onSave: (rule: RoutingRule) => void;
  onClose: () => void;
};

const CONDITION_TYPES: { value: RoutingConditionType; label: string }[] = [
  { value: "channel", label: "Channel" },
  { value: "keyword", label: "Keyword" },
  { value: "language", label: "Language" },
  { value: "sentiment", label: "Sentiment" },
  { value: "time-range", label: "Time range" },
  { value: "custom", label: "Custom" },
];

const OPERATORS = [
  { value: "equals" as const, label: "equals" },
  { value: "contains" as const, label: "contains" },
  { value: "matches" as const, label: "matches" },
  { value: "gt" as const, label: "greater than" },
  { value: "lt" as const, label: "less than" },
];

const emptyCondition = (): RoutingCondition => ({
  type: "keyword",
  operator: "contains",
  value: "",
});

export const RoutingRuleEditor = ({
  rule,
  agentIds,
  agentNames,
  onSave,
  onClose,
}: RoutingRuleEditorProps) => {
  const t = useTranslations("routing");
  const [name, setName] = useState(rule?.name ?? "");
  const [priority, setPriority] = useState(rule?.priority ?? 0);
  const [targetAgentId, setTargetAgentId] = useState(rule?.targetAgentId ?? "");
  const [fallbackAgentId, setFallbackAgentId] = useState(
    rule?.fallbackAgentId ?? "",
  );
  const [conditions, setConditions] = useState<RoutingCondition[]>(
    rule?.conditions ?? [emptyCondition()],
  );

  const addCondition = () =>
    setConditions((prev) => [...prev, emptyCondition()]);

  const removeCondition = (index: number) =>
    setConditions((prev) => prev.filter((_, i) => i !== index));

  const updateCondition = (index: number, patch: Partial<RoutingCondition>) =>
    setConditions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );

  const handleSave = useCallback(() => {
    onSave({
      id: rule?.id ?? crypto.randomUUID(),
      name: name.trim() || "Untitled rule",
      enabled: rule?.enabled ?? true,
      priority,
      conditions: conditions.filter((c) => c.value.trim()),
      targetAgentId,
      fallbackAgentId: fallbackAgentId || undefined,
    });
  }, [
    rule,
    name,
    priority,
    conditions,
    targetAgentId,
    fallbackAgentId,
    onSave,
  ]);

  const canSave =
    name.trim() && targetAgentId && conditions.some((c) => c.value.trim());

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="ui-card w-full max-w-lg p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            {rule ? t("editRule") : t("addRule")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-icon xs"
            aria-label={t("close")}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {t("ruleName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("ruleNamePlaceholder")}
              className="ui-input w-full text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {t("priority")}
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              min={0}
              max={100}
              className="ui-input w-20 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {t("conditions")}
            </label>
            <div className="space-y-2">
              {conditions.map((cond, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={cond.type}
                    onChange={(e) =>
                      updateCondition(i, {
                        type: e.target.value as RoutingConditionType,
                      })
                    }
                    className="ui-input text-xs"
                  >
                    {CONDITION_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={cond.operator}
                    onChange={(e) =>
                      updateCondition(i, {
                        operator: e.target
                          .value as RoutingCondition["operator"],
                      })
                    }
                    className="ui-input text-xs"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) =>
                      updateCondition(i, { value: e.target.value })
                    }
                    placeholder={t("conditionValue")}
                    className="ui-input flex-1 text-xs"
                  />
                  {conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCondition(i)}
                      className="ui-btn-icon xs text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCondition}
              className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="h-3 w-3" /> {t("addCondition")}
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {t("targetAgent")}
            </label>
            <select
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(e.target.value)}
              className="ui-input w-full text-xs"
            >
              <option value="">{t("selectAgent")}</option>
              {agentIds.map((id) => (
                <option key={id} value={id}>
                  {agentNames?.[id] ?? id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              {t("fallbackAgent")}
            </label>
            <select
              value={fallbackAgentId}
              onChange={(e) => setFallbackAgentId(e.target.value)}
              className="ui-input w-full text-xs"
            >
              <option value="">{t("none")}</option>
              {agentIds.map((id) => (
                <option key={id} value={id}>
                  {agentNames?.[id] ?? id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-secondary text-xs"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="ui-btn-primary text-xs"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
};
