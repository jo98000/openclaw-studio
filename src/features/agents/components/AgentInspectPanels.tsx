"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ExternalLink,
  ListChecks,
  Play,
  Sun,
  Trash2,
  X,
  ChevronRight,
} from "lucide-react";

import type { AgentState } from "@/features/agents/state/store";
import { AgentCredentialsPanel } from "@/features/credentials/components/AgentCredentialsPanel";
import type {
  CronCreateDraft,
  CronCreateTemplateId,
} from "@/lib/cron/createPayloadBuilder";
import {
  formatCronPayload,
  formatCronSchedule,
  type CronJobSummary,
} from "@/lib/cron/types";
import type { GatewayClient } from "@/lib/gateway/GatewayClient";
import type { SkillStatusReport } from "@/lib/skills/types";
import type { GatewayModelChoice } from "@/lib/gateway/models";
import {
  readGatewayAgentFile,
  writeGatewayAgentFile,
} from "@/lib/gateway/agentFiles";
import {
  resolveExecutionRoleFromAgent,
  resolvePresetDefaultsForRole,
  type AgentPermissionsDraft,
} from "@/features/agents/operations/agentPermissionsOperation";
import { AgentSkillsPanel } from "@/features/agents/components/AgentSkillsPanel";
import { SystemSkillsPanel } from "@/features/agents/components/SystemSkillsPanel";
import {
  AGENT_FILE_NAMES,
  type AgentFileName,
  createAgentFilesState,
  isAgentFileName,
} from "@/lib/agents/agentFiles";
import {
  parsePersonalityFiles,
  serializePersonalityFiles,
} from "@/lib/agents/personalityBuilder";
import type { AgentChannelLink } from "@/features/routing/agentChannelResolver";

const AgentInspectHeader = ({
  label,
  title,
  onClose,
  closeTestId,
  closeDisabled,
}: {
  label?: string;
  title?: string;
  onClose: () => void;
  closeTestId: string;
  closeDisabled?: boolean;
}) => {
  const t = useTranslations("inspect");
  const normalizedLabel = label?.trim() ?? "";
  const normalizedTitle = title?.trim() ?? "";
  const hasLabel = normalizedLabel.length > 0;
  const hasTitle = normalizedTitle.length > 0;
  if (!hasLabel && !hasTitle) {
    return null;
  }
  return (
    <div className="flex items-center justify-between pl-4 pr-2 pb-3 pt-2">
      <div>
        {hasLabel ? (
          <div className="font-mono text-[9px] font-medium tracking-[0.04em] text-muted-foreground/58">
            {normalizedLabel}
          </div>
        ) : null}
        {hasTitle ? (
          <div
            className={
              hasLabel
                ? "text-[1.45rem] font-semibold leading-[1.05] tracking-[0.01em] text-foreground"
                : "font-mono text-[12px] font-semibold tracking-[0.05em] text-foreground"
            }
          >
            {normalizedTitle}
          </div>
        ) : null}
      </div>
      <button
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/55 transition hover:bg-surface-2 hover:text-muted-foreground/85"
        type="button"
        data-testid={closeTestId}
        aria-label={t("closePanel")}
        disabled={closeDisabled}
        onClick={onClose}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

type AgentSettingsPanelProps = {
  agent: AgentState;
  mode?:
    | "capabilities"
    | "skills"
    | "system"
    | "automations"
    | "credentials"
    | "advanced";
  showHeader?: boolean;
  onClose: () => void;
  gatewayClient?: GatewayClient | null;
  models?: GatewayModelChoice[];
  onModelChange?: (value: string | null) => void;
  onThinkingChange?: (value: string | null) => void;
  onRename?: (name: string) => Promise<boolean> | boolean;
  permissionsDraft?: AgentPermissionsDraft;
  onUpdateAgentPermissions?: (
    draft: AgentPermissionsDraft,
  ) => Promise<void> | void;
  onDelete: () => void;
  canDelete?: boolean;
  onToolCallingToggle: (enabled: boolean) => void;
  onThinkingTracesToggle: (enabled: boolean) => void;
  cronJobs: CronJobSummary[];
  cronLoading: boolean;
  cronError: string | null;
  cronRunBusyJobId: string | null;
  cronDeleteBusyJobId: string | null;
  onRunCronJob: (jobId: string) => Promise<void> | void;
  onDeleteCronJob: (jobId: string) => Promise<void> | void;
  cronCreateBusy?: boolean;
  onCreateCronJob?: (draft: CronCreateDraft) => Promise<void> | void;
  controlUiUrl?: string | null;
  skillsReport?: SkillStatusReport | null;
  skillsLoading?: boolean;
  skillsError?: string | null;
  skillsBusy?: boolean;
  skillsBusyKey?: string | null;
  skillMessages?: Record<
    string,
    { kind: "success" | "error"; message: string }
  >;
  skillApiKeyDrafts?: Record<string, string>;
  defaultAgentScopeWarning?: string | null;
  systemInitialSkillKey?: string | null;
  onSystemInitialSkillHandled?: () => void;
  skillsAllowlist?: string[] | undefined;
  onSetSkillEnabled?: (
    skillName: string,
    enabled: boolean,
  ) => Promise<void> | void;
  onOpenSystemSetup?: (skillKey?: string) => void;
  onSetSkillGlobalEnabled?: (
    skillKey: string,
    enabled: boolean,
  ) => Promise<void> | void;
  onInstallSkill?: (
    skillKey: string,
    name: string,
    installId: string,
  ) => Promise<void> | void;
  onRemoveSkill?: (skill: {
    skillKey: string;
    source: string;
    baseDir: string;
  }) => Promise<void> | void;
  onSkillApiKeyChange?: (
    skillKey: string,
    value: string,
  ) => Promise<void> | void;
  onSaveSkillApiKey?: (skillKey: string) => Promise<void> | void;
  connectedChannels?: AgentChannelLink[];
};

const formatCronStateLine = (
  job: CronJobSummary,
  t: (key: string, values?: any) => string,
): string | null => {
  if (
    typeof job.state.runningAtMs === "number" &&
    Number.isFinite(job.state.runningAtMs)
  ) {
    return t("runningNow");
  }
  if (
    typeof job.state.nextRunAtMs === "number" &&
    Number.isFinite(job.state.nextRunAtMs)
  ) {
    return t("nextRun", {
      date: new Date(job.state.nextRunAtMs).toLocaleString(),
    });
  }
  if (
    typeof job.state.lastRunAtMs === "number" &&
    Number.isFinite(job.state.lastRunAtMs)
  ) {
    const status = job.state.lastStatus ? `${job.state.lastStatus} ` : "";
    return t("lastRun", {
      statusDate:
        `${status}${new Date(job.state.lastRunAtMs).toLocaleString()}`.trim(),
    });
  }
  return null;
};

const getFirstLinePreview = (value: string, maxChars: number): string => {
  const firstLine =
    value
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "";
  if (!firstLine) return "";
  if (firstLine.length <= maxChars) return firstLine;
  return `${firstLine.slice(0, maxChars)}...`;
};

type CronTemplateOption = {
  id: CronCreateTemplateId;
  titleKey: string;
  descKey: string;
  icon: typeof Sun;
};

const CRON_TEMPLATE_OPTIONS: CronTemplateOption[] = [
  {
    id: "morning-brief",
    titleKey: "morningBrief",
    descKey: "morningBriefDesc",
    icon: Sun,
  },
  {
    id: "reminder",
    titleKey: "reminder",
    descKey: "reminderDesc",
    icon: Bell,
  },
  {
    id: "weekly-review",
    titleKey: "weeklyReview",
    descKey: "weeklyReviewDesc",
    icon: CalendarDays,
  },
  {
    id: "inbox-triage",
    titleKey: "inboxTriage",
    descKey: "inboxTriageDesc",
    icon: ListChecks,
  },
  {
    id: "custom",
    titleKey: "custom",
    descKey: "customDesc",
    icon: ListChecks,
  },
];

const TIMED_AUTOMATION_STEP_META: Array<{
  titleKey: string;
  indicatorKey: string;
}> = [
  { titleKey: "stepChooseType", indicatorKey: "stepIndicatorType" },
  { titleKey: "stepDefineFunction", indicatorKey: "stepIndicatorFunction" },
  { titleKey: "stepSetTiming", indicatorKey: "stepIndicatorTiming" },
  { titleKey: "stepReview", indicatorKey: "stepIndicatorReview" },
];

const resolveLocalTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const createInitialCronDraft = (): CronCreateDraft => ({
  templateId: "morning-brief",
  name: "",
  taskText: "",
  scheduleKind: "every",
  everyAmount: 30,
  everyUnit: "minutes",
  everyAtTime: "09:00",
  everyTimeZone: resolveLocalTimeZone(),
  deliveryMode: "none",
  deliveryChannel: "last",
});

const arePermissionsDraftEqual = (
  a: AgentPermissionsDraft,
  b: AgentPermissionsDraft,
): boolean =>
  a.commandMode === b.commandMode &&
  a.webAccess === b.webAccess &&
  a.fileTools === b.fileTools;

const applyTemplateDefaults = (
  templateId: CronCreateTemplateId,
  current: CronCreateDraft,
  t: (key: string) => string,
): CronCreateDraft => {
  const nextTimeZone =
    (current.everyTimeZone ?? "").trim() || resolveLocalTimeZone();
  const base = {
    ...createInitialCronDraft(),
    deliveryMode: current.deliveryMode ?? "none",
    deliveryChannel: current.deliveryChannel || "last",
    deliveryTo: current.deliveryTo,
    advancedSessionTarget: current.advancedSessionTarget,
    advancedWakeMode: current.advancedWakeMode,
    everyTimeZone: nextTimeZone,
  } satisfies CronCreateDraft;

  if (templateId === "morning-brief") {
    return {
      ...base,
      templateId,
      name: t("morningBriefName"),
      taskText: t("morningBriefTask"),
      scheduleKind: "every",
      everyAmount: 1,
      everyUnit: "days",
      everyAtTime: "07:00",
    };
  }
  if (templateId === "reminder") {
    return {
      ...base,
      templateId,
      name: t("reminderName"),
      taskText: t("reminderTask"),
      scheduleKind: "at",
      scheduleAt: "",
    };
  }
  if (templateId === "weekly-review") {
    return {
      ...base,
      templateId,
      name: t("weeklyReviewName"),
      taskText: t("weeklyReviewTask"),
      scheduleKind: "every",
      everyAmount: 7,
      everyUnit: "days",
      everyAtTime: "09:00",
    };
  }
  if (templateId === "inbox-triage") {
    return {
      ...base,
      templateId,
      name: t("inboxTriageName"),
      taskText: t("inboxTriageTask"),
      scheduleKind: "every",
      everyAmount: 30,
      everyUnit: "minutes",
    };
  }
  return {
    ...base,
    templateId: "custom",
    name: "",
    taskText: "",
    scheduleKind: "every",
    everyAmount: 30,
    everyUnit: "minutes",
  };
};

export const AgentSettingsPanel = ({
  agent,
  mode = "capabilities",
  showHeader = true,
  onClose,
  gatewayClient = null,
  models = [],
  onModelChange,
  onThinkingChange,
  onRename,
  permissionsDraft,
  onUpdateAgentPermissions = () => {},
  onDelete,
  canDelete = true,
  onToolCallingToggle,
  onThinkingTracesToggle,
  cronJobs,
  cronLoading,
  cronError,
  cronRunBusyJobId,
  cronDeleteBusyJobId,
  onRunCronJob,
  onDeleteCronJob,
  cronCreateBusy = false,
  onCreateCronJob = () => {},
  controlUiUrl = null,
  skillsReport = null,
  skillsLoading = false,
  skillsError = null,
  skillsBusy = false,
  skillsBusyKey = null,
  skillMessages = {},
  skillApiKeyDrafts = {},
  defaultAgentScopeWarning = null,
  systemInitialSkillKey = null,
  onSystemInitialSkillHandled = () => {},
  skillsAllowlist,
  onSetSkillEnabled = () => {},
  onOpenSystemSetup = () => {},
  onSetSkillGlobalEnabled = () => {},
  onInstallSkill = () => {},
  onRemoveSkill = () => {},
  onSkillApiKeyChange = () => {},
  onSaveSkillApiKey = () => {},
  connectedChannels = [],
}: AgentSettingsPanelProps) => {
  const t = useTranslations("inspect");
  const initialPermissionsDraft =
    permissionsDraft ??
    resolvePresetDefaultsForRole(resolveExecutionRoleFromAgent(agent));
  const [permissionsBaselineValue, setPermissionsBaselineValue] =
    useState<AgentPermissionsDraft>(initialPermissionsDraft);
  const [permissionsDraftValue, setPermissionsDraftValue] =
    useState<AgentPermissionsDraft>(initialPermissionsDraft);
  const [permissionsSaving, setPermissionsSaving] = useState(false);
  const [permissionsSaveState, setPermissionsSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [permissionsSaveError, setPermissionsSaveError] = useState<
    string | null
  >(null);
  const permissionsSaveTimerRef = useRef<number | null>(null);
  const permissionsDraftAgentIdRef = useRef(agent.agentId);
  const [expandedCronJobIds, setExpandedCronJobIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [cronCreateOpen, setCronCreateOpen] = useState(false);
  const [cronCreateStep, setCronCreateStep] = useState(0);
  const [cronCreateError, setCronCreateError] = useState<string | null>(null);
  const [cronDraft, setCronDraft] = useState<CronCreateDraft>(
    createInitialCronDraft,
  );

  const resolvedExecutionRole = useMemo(
    () => resolveExecutionRoleFromAgent(agent),
    [agent],
  );
  const resolvedPermissionsDraft = useMemo(
    () =>
      permissionsDraft ?? resolvePresetDefaultsForRole(resolvedExecutionRole),
    [permissionsDraft, resolvedExecutionRole],
  );
  const permissionsDirty = useMemo(
    () =>
      !arePermissionsDraftEqual(
        permissionsDraftValue,
        permissionsBaselineValue,
      ),
    [permissionsBaselineValue, permissionsDraftValue],
  );

  useEffect(() => {
    const agentChanged = permissionsDraftAgentIdRef.current !== agent.agentId;
    permissionsDraftAgentIdRef.current = agent.agentId;
    setPermissionsBaselineValue(resolvedPermissionsDraft);
    if (!agentChanged && (permissionsSaving || permissionsDirty)) {
      return;
    }
    setPermissionsDraftValue(resolvedPermissionsDraft);
    setPermissionsSaveState("idle");
    setPermissionsSaveError(null);
    setPermissionsSaving(false);
  }, [
    agent.agentId,
    permissionsDirty,
    permissionsSaving,
    resolvedPermissionsDraft,
  ]);

  const runPermissionsSave = useCallback(
    async (draft: AgentPermissionsDraft) => {
      if (permissionsSaving) return;
      setPermissionsSaving(true);
      setPermissionsSaveState("saving");
      setPermissionsSaveError(null);
      try {
        await onUpdateAgentPermissions(draft);
        setPermissionsSaveState("saved");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("failedToSavePermissions");
        setPermissionsSaveState("error");
        setPermissionsSaveError(message);
      } finally {
        setPermissionsSaving(false);
      }
    },
    [onUpdateAgentPermissions, permissionsSaving],
  );

  useEffect(() => {
    return () => {
      if (permissionsSaveTimerRef.current !== null) {
        window.clearTimeout(permissionsSaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!permissionsDirty) return;
    if (permissionsSaving) return;
    if (permissionsSaveTimerRef.current !== null) {
      window.clearTimeout(permissionsSaveTimerRef.current);
    }
    setPermissionsSaveState("idle");
    permissionsSaveTimerRef.current = window.setTimeout(() => {
      permissionsSaveTimerRef.current = null;
      void runPermissionsSave(permissionsDraftValue);
    }, 450);
    return () => {
      if (permissionsSaveTimerRef.current !== null) {
        window.clearTimeout(permissionsSaveTimerRef.current);
        permissionsSaveTimerRef.current = null;
      }
    };
  }, [
    permissionsDirty,
    permissionsDraftValue,
    permissionsSaving,
    runPermissionsSave,
  ]);

  const openCronCreate = () => {
    setCronCreateOpen(true);
    setCronCreateStep(0);
    setCronCreateError(null);
    setCronDraft(createInitialCronDraft());
  };

  const closeCronCreate = () => {
    setCronCreateOpen(false);
    setCronCreateStep(0);
    setCronCreateError(null);
    setCronDraft(createInitialCronDraft());
  };

  const updateCronDraft = (patch: Partial<CronCreateDraft>) => {
    setCronDraft((prev) => ({ ...prev, ...patch }));
  };

  const selectCronTemplate = (templateId: CronCreateTemplateId) => {
    setCronDraft((prev) => applyTemplateDefaults(templateId, prev, t));
  };

  const canMoveToScheduleStep =
    cronDraft.name.trim().length > 0 && cronDraft.taskText.trim().length > 0;
  const canMoveToReviewStep =
    cronDraft.scheduleKind === "every"
      ? Number.isFinite(cronDraft.everyAmount) &&
        (cronDraft.everyAmount ?? 0) > 0 &&
        (cronDraft.everyUnit !== "days" ||
          ((cronDraft.everyAtTime ?? "").trim().length > 0 &&
            (cronDraft.everyTimeZone ?? "").trim().length > 0))
      : (cronDraft.scheduleAt ?? "").trim().length > 0;
  const canSubmitCronCreate = canMoveToScheduleStep && canMoveToReviewStep;

  const submitCronCreate = async () => {
    if (cronCreateBusy || !canSubmitCronCreate) {
      return;
    }
    setCronCreateError(null);
    const payload: CronCreateDraft = {
      templateId: cronDraft.templateId,
      name: cronDraft.name.trim(),
      taskText: cronDraft.taskText.trim(),
      scheduleKind: cronDraft.scheduleKind,
      ...(typeof cronDraft.everyAmount === "number"
        ? { everyAmount: cronDraft.everyAmount }
        : {}),
      ...(cronDraft.everyUnit ? { everyUnit: cronDraft.everyUnit } : {}),
      ...(cronDraft.everyUnit === "days" && cronDraft.everyAtTime
        ? { everyAtTime: cronDraft.everyAtTime }
        : {}),
      ...(cronDraft.everyUnit === "days" && cronDraft.everyTimeZone
        ? { everyTimeZone: cronDraft.everyTimeZone }
        : {}),
      ...(cronDraft.scheduleAt ? { scheduleAt: cronDraft.scheduleAt } : {}),
      ...(cronDraft.deliveryMode
        ? { deliveryMode: cronDraft.deliveryMode }
        : {}),
      ...(cronDraft.deliveryChannel
        ? { deliveryChannel: cronDraft.deliveryChannel }
        : {}),
      ...(cronDraft.deliveryTo ? { deliveryTo: cronDraft.deliveryTo } : {}),
      ...(cronDraft.advancedSessionTarget
        ? { advancedSessionTarget: cronDraft.advancedSessionTarget }
        : {}),
      ...(cronDraft.advancedWakeMode
        ? { advancedWakeMode: cronDraft.advancedWakeMode }
        : {}),
    };
    try {
      await onCreateCronJob(payload);
      closeCronCreate();
    } catch (err) {
      setCronCreateError(
        err instanceof Error ? err.message : t("failedToCreate"),
      );
    }
  };

  const moveCronCreateBack = () => {
    setCronCreateStep((prev) => Math.max(0, prev - 1));
  };

  const moveCronCreateNext = () => {
    if (cronCreateStep === 0) {
      setCronCreateStep(1);
      return;
    }
    if (cronCreateStep === 1 && canMoveToScheduleStep) {
      setCronCreateStep(2);
      return;
    }
    if (cronCreateStep === 2 && canMoveToReviewStep) {
      setCronCreateStep(3);
    }
  };

  const panelLabel =
    mode === "advanced"
      ? t("advanced")
      : mode === "skills"
        ? t("skillsLabel")
        : mode === "system"
          ? t("systemSetup")
          : mode === "credentials"
            ? t("credentialsLabel")
            : "";
  const canOpenControlUi =
    typeof controlUiUrl === "string" && controlUiUrl.trim().length > 0;
  const timedAutomationStepMeta =
    TIMED_AUTOMATION_STEP_META[cronCreateStep] ??
    TIMED_AUTOMATION_STEP_META[TIMED_AUTOMATION_STEP_META.length - 1];

  return (
    <div
      className="agent-inspect-panel"
      data-testid="agent-settings-panel"
      style={{
        position: "relative",
        left: "auto",
        top: "auto",
        width: "100%",
        height: "100%",
      }}
    >
      {showHeader ? (
        <AgentInspectHeader
          label={panelLabel}
          title={agent.name}
          onClose={onClose}
          closeTestId="agent-settings-close"
        />
      ) : null}

      <div className="flex flex-col gap-0 px-5 pb-5">
        {mode === "capabilities" ? (
          <>
            <section
              className="sidebar-section"
              data-testid="agent-settings-identity"
            >
              <h3 className="sidebar-section-title">{t("agentIdentity")}</h3>
              <div className="mt-3 flex flex-col gap-4">
                {onRename ? (
                  <div className="px-1">
                    <label className="sidebar-copy flex flex-col gap-1 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground/88">
                        {t("agentName")}
                      </span>
                      <input
                        className="ui-input mt-1 w-full rounded-md px-3 py-2 text-xs text-foreground"
                        data-testid="agent-settings-name-input"
                        defaultValue={agent.name}
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          if (next && next !== agent.name.trim()) {
                            void onRename(next);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : null}
                <div className="px-1">
                  <label className="sidebar-copy flex flex-col gap-1 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/88">
                      {t("modelLabel")}
                    </span>
                    <select
                      className="ui-input mt-1 w-full rounded-md px-3 py-2 text-xs text-foreground"
                      data-testid="agent-settings-model-select"
                      value={agent.model ?? ""}
                      onChange={(e) => {
                        const next = e.target.value.trim();
                        onModelChange?.(next || null);
                      }}
                    >
                      <option value="">{t("modelDefault")}</option>
                      {models.map((m) => {
                        const key = `${m.provider}/${m.id}`;
                        return (
                          <option key={key} value={key}>
                            {m.name || key}
                            {m.reasoning ? ` (${t("reasoning")})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                </div>
                <div className="px-1">
                  <label className="sidebar-copy flex flex-col gap-1 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/88">
                      {t("thinkingLabel")}
                    </span>
                    <select
                      className="ui-input mt-1 w-full rounded-md px-3 py-2 text-xs text-foreground"
                      data-testid="agent-settings-thinking-select"
                      value={agent.thinkingLevel ?? ""}
                      onChange={(e) => {
                        const next = e.target.value.trim();
                        onThinkingChange?.(next || null);
                      }}
                    >
                      <option value="">{t("thinkingDefault")}</option>
                      <option value="off">{t("thinkingOff")}</option>
                      <option value="minimal">{t("thinkingMinimal")}</option>
                      <option value="low">{t("thinkingLow")}</option>
                      <option value="medium">{t("thinkingMedium")}</option>
                      <option value="high">{t("thinkingHigh")}</option>
                      <option value="xhigh">{t("thinkingXHigh")}</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>
            <section
              className="sidebar-section mt-6"
              data-testid="agent-settings-permissions"
            >
              <h3 className="sidebar-section-title">{t("permissions")}</h3>
              <div className="mt-2 flex flex-col gap-8">
                <div className="px-1 py-1">
                  <div className="sidebar-copy flex flex-col gap-1 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/88">
                      {t("runCommands")}
                    </span>
                    <div
                      className="ui-segment ui-segment-command-mode mt-2 grid-cols-3"
                      role="group"
                      aria-label={t("runCommands")}
                    >
                      {(
                        [
                          { id: "off", label: t("off") },
                          { id: "ask", label: t("ask") },
                          { id: "auto", label: t("auto") },
                        ] as const
                      ).map((option) => {
                        const selected =
                          permissionsDraftValue.commandMode === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            aria-label={`${t("runCommands")} ${option.label.toLowerCase()}`}
                            aria-pressed={selected}
                            className="ui-segment-item px-3 py-2.5 text-center font-mono text-[11px] font-semibold tracking-[0.04em]"
                            data-active={selected ? "true" : "false"}
                            onClick={() =>
                              setPermissionsDraftValue((current) => ({
                                ...current,
                                commandMode: option.id,
                              }))
                            }
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="ui-settings-row flex min-h-[68px] items-center justify-between gap-6 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-label={t("webAccess")}
                      aria-checked={permissionsDraftValue.webAccess}
                      className={`ui-switch self-center ${permissionsDraftValue.webAccess ? "ui-switch--on" : ""}`}
                      onClick={() =>
                        setPermissionsDraftValue((current) => ({
                          ...current,
                          webAccess: !current.webAccess,
                        }))
                      }
                    >
                      <span className="ui-switch-thumb" />
                    </button>
                    <div className="sidebar-copy flex flex-col">
                      <span className="text-[11px] font-medium text-foreground/88">
                        {t("webAccess")}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {t("webAccessDesc")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground/55"
                    aria-hidden="true"
                  />
                </div>
                <div className="ui-settings-row flex min-h-[68px] items-center justify-between gap-6 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-label={t("fileTools")}
                      aria-checked={permissionsDraftValue.fileTools}
                      className={`ui-switch self-center ${permissionsDraftValue.fileTools ? "ui-switch--on" : ""}`}
                      onClick={() =>
                        setPermissionsDraftValue((current) => ({
                          ...current,
                          fileTools: !current.fileTools,
                        }))
                      }
                    >
                      <span className="ui-switch-thumb" />
                    </button>
                    <div className="sidebar-copy flex flex-col">
                      <span className="text-[11px] font-medium text-foreground/88">
                        {t("fileTools")}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {t("fileToolsDesc")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground/55"
                    aria-hidden="true"
                  />
                </div>
                <div className="ui-settings-row flex min-h-[68px] items-center justify-between gap-6 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-label={t("browserAutomation")}
                      aria-checked="false"
                      className="ui-switch self-center"
                      disabled
                    >
                      <span className="ui-switch-thumb" />
                    </button>
                    <div className="sidebar-copy flex flex-col">
                      <span className="text-[11px] font-medium text-foreground/88">
                        {t("browserAutomation")}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {t("comingSoon")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground/55"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="sidebar-copy mt-3 text-[11px] text-muted-foreground">
                {permissionsSaveState === "saving" ? t("saving") : null}
                {permissionsSaveState === "saved" ? t("saved") : null}
                {permissionsSaveState === "error" && permissionsSaveError ? (
                  <span>
                    {t("saveError")} {permissionsSaveError}{" "}
                    <button
                      type="button"
                      className="underline underline-offset-2"
                      onClick={() => {
                        void runPermissionsSave(permissionsDraftValue);
                      }}
                    >
                      {t("retry")}
                    </button>
                  </span>
                ) : null}
              </div>
              {permissionsSaveState === "error" && !permissionsSaveError ? (
                <div className="ui-alert-danger mt-3 rounded-md px-3 py-2 text-xs">
                  {t("savePermissionsError")}
                </div>
              ) : null}
            </section>
            {connectedChannels.length > 0 ? (
              <section
                className="sidebar-section mt-6"
                data-testid="agent-settings-channels"
              >
                <h3 className="sidebar-section-title">
                  {t("connectedChannels")}
                </h3>
                <div className="mt-2 flex flex-col gap-2">
                  {connectedChannels.map((link) => (
                    <div
                      key={`${link.channelId}-${link.ruleName}`}
                      className="ui-settings-row flex items-center gap-3 rounded-md px-4 py-3"
                    >
                      <span className="text-base">{link.channelIcon}</span>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[11px] font-medium text-foreground/88">
                          {link.channelName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {t("viaRule", { rule: link.ruleName })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {mode === "skills" ? (
          <AgentSkillsPanel
            skillsReport={skillsReport}
            skillsLoading={skillsLoading}
            skillsError={skillsError}
            skillsBusy={skillsBusy}
            skillsBusyKey={skillsBusyKey}
            skillsAllowlist={skillsAllowlist}
            onSetSkillEnabled={onSetSkillEnabled}
            onOpenSystemSetup={onOpenSystemSetup}
          />
        ) : null}

        {mode === "system" ? (
          <SystemSkillsPanel
            skillsReport={skillsReport}
            skillsLoading={skillsLoading}
            skillsError={skillsError}
            skillsBusy={skillsBusy}
            skillsBusyKey={skillsBusyKey}
            skillMessages={skillMessages}
            skillApiKeyDrafts={skillApiKeyDrafts}
            defaultAgentScopeWarning={defaultAgentScopeWarning}
            initialSkillKey={systemInitialSkillKey}
            onInitialSkillKeyHandled={onSystemInitialSkillHandled}
            onSetSkillGlobalEnabled={onSetSkillGlobalEnabled}
            onInstallSkill={onInstallSkill}
            onRemoveSkill={onRemoveSkill}
            onSkillApiKeyChange={onSkillApiKeyChange}
            onSaveSkillApiKey={onSaveSkillApiKey}
          />
        ) : null}

        {mode === "automations" ? (
          <section
            className="sidebar-section"
            data-testid="agent-settings-cron"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="sidebar-section-title">{t("timedAutomations")}</h3>
              {!cronLoading && !cronError && cronJobs.length > 0 ? (
                <button
                  className="sidebar-btn-ghost px-2.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={openCronCreate}
                >
                  {t("create")}
                </button>
              ) : null}
            </div>
            {cronLoading ? (
              <div className="mt-3 text-[11px] text-muted-foreground">
                {t("loadingAutomations")}
              </div>
            ) : null}
            {!cronLoading && cronError ? (
              <div className="ui-alert-danger mt-3 rounded-md px-3 py-2 text-xs">
                {cronError}
              </div>
            ) : null}
            {!cronLoading && !cronError && cronJobs.length === 0 ? (
              <div className="sidebar-card mt-3 flex flex-col items-center justify-center gap-4 px-5 py-6 text-center">
                <CalendarDays
                  className="h-4 w-4 text-muted-foreground/70"
                  aria-hidden="true"
                  data-testid="cron-empty-icon"
                />
                <div className="sidebar-copy text-[11px] text-muted-foreground/82">
                  {t("noAutomations")}
                </div>
                <button
                  className="sidebar-btn-primary mt-2 w-auto min-w-[116px] self-center px-4 py-2 font-mono text-[10px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={openCronCreate}
                >
                  {t("create")}
                </button>
              </div>
            ) : null}
            {!cronLoading && !cronError && cronJobs.length > 0 ? (
              <div className="mt-3 flex flex-col gap-3">
                {cronJobs.map((job) => {
                  const runBusy = cronRunBusyJobId === job.id;
                  const deleteBusy = cronDeleteBusyJobId === job.id;
                  const busy = runBusy || deleteBusy;
                  const scheduleText = formatCronSchedule(job.schedule);
                  const payloadText = formatCronPayload(job.payload).trim();
                  const payloadPreview = getFirstLinePreview(payloadText, 160);
                  const payloadExpandable =
                    payloadText.length > payloadPreview.length ||
                    payloadText.split("\n").length > 1;
                  const expanded = expandedCronJobIds.has(job.id);
                  const stateLine = formatCronStateLine(job, t);
                  return (
                    <div
                      key={job.id}
                      className="group/cron ui-card flex items-start justify-between gap-2 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <div className="min-w-0 flex-1 truncate font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
                            {job.name}
                          </div>
                          {!job.enabled ? (
                            <div className="shrink-0 rounded-md bg-muted/50 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-2xs">
                              {t("disabled")}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {t("frequency")}
                          </span>
                          <div className="break-words">{scheduleText}</div>
                        </div>
                        {stateLine ? (
                          <div className="mt-1 break-words text-[11px] text-muted-foreground">
                            {stateLine}
                          </div>
                        ) : null}
                        {payloadText ? (
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                {t("task")}
                              </span>
                              {payloadExpandable ? (
                                <button
                                  className="ui-btn-secondary shrink-0 min-h-0 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.06em] text-muted-foreground"
                                  type="button"
                                  onClick={() => {
                                    setExpandedCronJobIds((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(job.id)) {
                                        next.delete(job.id);
                                      } else {
                                        next.add(job.id);
                                      }
                                      return next;
                                    });
                                  }}
                                >
                                  {expanded ? t("less") : t("more")}
                                </button>
                              ) : null}
                            </div>
                            <div
                              className="mt-0.5 whitespace-pre-wrap break-words"
                              title={payloadText}
                            >
                              {expanded
                                ? payloadText
                                : payloadPreview || payloadText}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition group-focus-within/cron:opacity-100 group-hover/cron:opacity-100">
                        <button
                          className="ui-btn-icon h-7 w-7 disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          aria-label={t("runNow", { name: job.name })}
                          onClick={() => {
                            void onRunCronJob(job.id);
                          }}
                          disabled={busy}
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="ui-btn-icon ui-btn-icon-danger h-7 w-7 bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          aria-label={t("deleteAutomation", { name: job.name })}
                          onClick={() => {
                            void onDeleteCronJob(job.id);
                          }}
                          disabled={busy}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <section
              className="sidebar-section"
              data-testid="agent-settings-heartbeat-coming-soon"
            >
              <h3 className="sidebar-section-title">{t("heartbeats")}</h3>
              <div className="mt-3 text-[11px] text-muted-foreground">
                {t("heartbeatsComingSoon")}
              </div>
            </section>
          </section>
        ) : null}

        {mode === "credentials" ? (
          <AgentCredentialsPanel
            agentId={agent.agentId}
            gatewayClient={gatewayClient}
          />
        ) : null}

        {mode === "advanced" ? (
          <>
            <section
              className="sidebar-section mt-8"
              data-testid="agent-settings-control-ui"
            >
              <h3 className="sidebar-section-title ui-text-danger">
                {t("dangerZone")}
              </h3>
              <div className="ui-alert-danger mt-3 rounded-md px-3 py-3 text-[11px]">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <div className="font-medium">{t("advancedUsersOnly")}</div>
                    <div>{t("openControlUiDesc")}</div>
                    <div>{t("controlUiWarning")}</div>
                  </div>
                </div>
              </div>
              {canOpenControlUi ? (
                <a
                  className="sidebar-btn-primary ui-btn-danger mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-center font-mono text-[10px] font-semibold tracking-[0.06em]"
                  href={controlUiUrl ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("openFullControlUi")}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : (
                <>
                  <button
                    className="sidebar-btn-primary ui-btn-danger mt-3 inline-flex px-3 py-2.5 font-mono text-[10px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-65"
                    type="button"
                    disabled
                  >
                    {t("openFullControlUi")}
                  </button>
                  <div className="mt-2 text-[10px] text-muted-foreground/70">
                    {t("controlUiUnavailable")}
                  </div>
                </>
              )}
            </section>

            {canDelete ? (
              <section className="sidebar-section mt-8">
                <div className="text-[11px] text-muted-foreground/68">
                  {t("deleteAgentDesc")}
                </div>
                <button
                  className="sidebar-btn-ghost ui-btn-danger mt-3 inline-flex px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.06em]"
                  type="button"
                  onClick={onDelete}
                >
                  {t("deleteAgent")}
                </button>
              </section>
            ) : (
              <section className="sidebar-section mt-8">
                <h3 className="sidebar-section-title">{t("systemAgent")}</h3>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  {t("systemAgentDesc")}
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
      {cronCreateOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("createAutomationLabel")}
          onClick={closeCronCreate}
        >
          <div
            className="ui-panel w-full max-w-2xl bg-card shadow-xs"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-6 py-5">
              <div className="min-w-0">
                <div className="text-[11px] font-medium tracking-[0.01em] text-muted-foreground/80">
                  {t("composerLabel")}
                </div>
                <div className="mt-1 text-base font-semibold text-foreground">
                  {t(timedAutomationStepMeta.titleKey)}
                </div>
              </div>
              <button
                type="button"
                className="sidebar-btn-ghost px-3 font-mono text-[10px] font-semibold tracking-[0.06em]"
                onClick={closeCronCreate}
              >
                {t("close")}
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              {cronCreateError ? (
                <div className="ui-alert-danger rounded-md px-3 py-2 text-xs">
                  {cronCreateError}
                </div>
              ) : null}
              {cronCreateStep === 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {t("pickTemplate")}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {CRON_TEMPLATE_OPTIONS.map((option) => {
                      const active = option.id === cronDraft.templateId;
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-label={t(option.titleKey)}
                          className={`ui-card px-3 py-3 text-left transition ${
                            active
                              ? "ui-selected"
                              : "bg-surface-2/60 hover:bg-surface-3/90"
                          }`}
                          onClick={() => selectCronTemplate(option.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-foreground" />
                            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
                              {t(option.titleKey)}
                            </div>
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {t(option.descKey)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {cronCreateStep === 1 ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {t("nameAndDescribe")}
                  </div>
                  <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                      {t("automationName")}
                    </span>
                    <input
                      aria-label={t("automationName")}
                      className="h-10 rounded-md border border-border bg-surface-3 px-3 text-sm text-foreground outline-none"
                      value={cronDraft.name}
                      onChange={(event) =>
                        updateCronDraft({ name: event.target.value })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                      {t("task")}
                    </span>
                    <textarea
                      aria-label={t("task")}
                      className="min-h-28 rounded-md border border-border bg-surface-3 px-3 py-2 text-sm text-foreground outline-none"
                      value={cronDraft.taskText}
                      onChange={(event) =>
                        updateCronDraft({ taskText: event.target.value })
                      }
                    />
                  </label>
                </div>
              ) : null}
              {cronCreateStep === 2 ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {t("chooseWhen")}
                  </div>
                  <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                      {t("scheduleType")}
                    </span>
                    <select
                      className="h-10 rounded-md border border-border bg-surface-3 px-3 text-sm text-foreground outline-none"
                      value={cronDraft.scheduleKind}
                      onChange={(event) =>
                        updateCronDraft({
                          scheduleKind: event.target
                            .value as CronCreateDraft["scheduleKind"],
                        })
                      }
                    >
                      <option value="every">{t("every")}</option>
                      <option value="at">{t("oneTime")}</option>
                    </select>
                  </label>
                  {cronDraft.scheduleKind === "every" ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                          {t("every")}
                        </span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          className="h-10 rounded-md border border-border bg-surface-3 px-3 text-sm text-foreground outline-none"
                          value={String(cronDraft.everyAmount ?? 30)}
                          onChange={(event) =>
                            updateCronDraft({
                              everyAmount:
                                Number.parseInt(event.target.value, 10) || 0,
                            })
                          }
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                          Unité
                        </span>
                        <select
                          className="h-10 rounded-md border border-border bg-surface-3 px-3 text-sm text-foreground outline-none"
                          value={cronDraft.everyUnit ?? "minutes"}
                          onChange={(event) =>
                            updateCronDraft({
                              everyUnit: event.target
                                .value as CronCreateDraft["everyUnit"],
                            })
                          }
                        >
                          <option value="minutes">{t("minutes")}</option>
                          <option value="hours">{t("hours")}</option>
                          <option value="days">{t("days")}</option>
                        </select>
                      </label>
                      {cronDraft.everyUnit === "days" ? (
                        <>
                          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                              {t("timeOfDay")}
                            </span>
                            <input
                              type="time"
                              className="h-10 rounded-md border border-border bg-surface-3 px-3 text-sm text-foreground outline-none"
                              value={cronDraft.everyAtTime ?? "09:00"}
                              onChange={(event) =>
                                updateCronDraft({
                                  everyAtTime: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                              Fuseau horaire
                            </span>
                            <input
                              className="h-10 rounded-md border border-border bg-surface-3 px-3 text-sm text-foreground outline-none"
                              value={
                                cronDraft.everyTimeZone ??
                                resolveLocalTimeZone()
                              }
                              onChange={(event) =>
                                updateCronDraft({
                                  everyTimeZone: event.target.value,
                                })
                              }
                            />
                          </label>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                  {cronDraft.scheduleKind === "at" ? (
                    <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                        Exécuter à
                      </span>
                      <input
                        type="datetime-local"
                        className="h-10 rounded-md border border-border bg-surface-3 px-3 text-sm text-foreground outline-none"
                        value={cronDraft.scheduleAt ?? ""}
                        onChange={(event) =>
                          updateCronDraft({ scheduleAt: event.target.value })
                        }
                      />
                    </label>
                  ) : null}
                </div>
              ) : null}
              {cronCreateStep === 3 ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>{t("reviewDetails")}</div>
                  <div className="ui-card px-3 py-2">
                    <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
                      {cronDraft.name || t("untitledAutomation")}
                    </div>
                    <div className="mt-1 text-[11px]">
                      {cronDraft.taskText || t("noTaskProvided")}
                    </div>
                    <div className="mt-2 text-[11px]">
                      {t("schedule")} :{" "}
                      {cronDraft.scheduleKind === "every"
                        ? `${t("every")} ${cronDraft.everyAmount ?? 0} ${cronDraft.everyUnit === "minutes" ? t("minutes") : cronDraft.everyUnit === "hours" ? t("hours") : t("days")}${
                            cronDraft.everyUnit === "days"
                              ? ` ${t("at")} ${cronDraft.everyAtTime ?? ""} (${cronDraft.everyTimeZone ?? resolveLocalTimeZone()})`
                              : ""
                          }`
                        : `${t("at")} ${cronDraft.scheduleAt ?? ""}`}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border/50 px-5 pb-4 pt-5">
              <div className="text-[11px] text-muted-foreground">
                {t("stepOf", {
                  indicator: t(timedAutomationStepMeta.indicatorKey),
                  current: cronCreateStep + 1,
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="sidebar-btn-ghost px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={moveCronCreateBack}
                  disabled={cronCreateStep === 0 || cronCreateBusy}
                >
                  {t("back")}
                </button>
                {cronCreateStep < 3 ? (
                  <button
                    type="button"
                    className="sidebar-btn-ghost px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={moveCronCreateNext}
                    disabled={
                      cronCreateBusy ||
                      (cronCreateStep === 1 && !canMoveToScheduleStep) ||
                      (cronCreateStep === 2 && !canMoveToReviewStep)
                    }
                  >
                    {t("next")}
                  </button>
                ) : null}
                {cronCreateStep === 3 ? (
                  <button
                    type="button"
                    className="sidebar-btn-primary px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
                    onClick={() => {
                      void submitCronCreate();
                    }}
                    disabled={cronCreateBusy || !canSubmitCronCreate}
                  >
                    {t("createAutomation")}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

type AgentFilesState = ReturnType<typeof createAgentFilesState>;

type UseAgentFilesEditorResult = {
  agentFiles: AgentFilesState;
  agentFilesLoading: boolean;
  agentFilesSaving: boolean;
  agentFilesDirty: boolean;
  agentFilesError: string | null;
  setAgentFileContent: (name: AgentFileName, value: string) => void;
  saveAgentFiles: () => Promise<boolean>;
  discardAgentFileChanges: () => void;
};

const useAgentFilesEditor = (params: {
  client: GatewayClient | null | undefined;
  agentId: string | null | undefined;
}): UseAgentFilesEditorResult => {
  const t = useTranslations("inspect");
  const { client, agentId } = params;
  const [agentFiles, setAgentFiles] = useState(createAgentFilesState);
  const [agentFilesLoading, setAgentFilesLoading] = useState(false);
  const [agentFilesSaving, setAgentFilesSaving] = useState(false);
  const [agentFilesDirty, setAgentFilesDirty] = useState(false);
  const [agentFilesError, setAgentFilesError] = useState<string | null>(null);
  const savedAgentFilesRef = useRef<AgentFilesState>(createAgentFilesState());

  const cloneAgentFilesState = useCallback(
    (source: AgentFilesState): AgentFilesState => {
      const next = createAgentFilesState();
      for (const name of AGENT_FILE_NAMES) {
        next[name] = { ...source[name] };
      }
      return next;
    },
    [],
  );

  const loadAgentFiles = useCallback(async () => {
    setAgentFilesLoading(true);
    setAgentFilesError(null);
    try {
      const trimmedAgentId = agentId?.trim();
      if (!trimmedAgentId) {
        const emptyState = createAgentFilesState();
        savedAgentFilesRef.current = emptyState;
        setAgentFiles(emptyState);
        setAgentFilesDirty(false);
        setAgentFilesError(t("agentIdMissing"));
        return;
      }
      if (!client) {
        setAgentFilesError(t("gatewayClientUnavailable"));
        return;
      }
      const results = await Promise.all(
        AGENT_FILE_NAMES.map(async (name) => {
          const file = await readGatewayAgentFile({
            client,
            agentId: trimmedAgentId,
            name,
          });
          return { name, content: file.content, exists: file.exists };
        }),
      );
      const nextState = createAgentFilesState();
      for (const file of results) {
        if (!isAgentFileName(file.name)) continue;
        nextState[file.name] = {
          content: file.content ?? "",
          exists: Boolean(file.exists),
        };
      }
      savedAgentFilesRef.current = nextState;
      setAgentFiles(nextState);
      setAgentFilesDirty(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("failedToLoadFiles");
      setAgentFilesError(message);
    } finally {
      setAgentFilesLoading(false);
    }
  }, [agentId, client]);

  const saveAgentFiles = useCallback(async () => {
    setAgentFilesSaving(true);
    setAgentFilesError(null);
    try {
      const trimmedAgentId = agentId?.trim();
      if (!trimmedAgentId) {
        setAgentFilesError(t("agentIdMissing"));
        return false;
      }
      if (!client) {
        setAgentFilesError(t("gatewayClientUnavailable"));
        return false;
      }
      await Promise.all(
        AGENT_FILE_NAMES.map(async (name) => {
          await writeGatewayAgentFile({
            client,
            agentId: trimmedAgentId,
            name,
            content: agentFiles[name].content,
          });
        }),
      );
      const nextState = createAgentFilesState();
      for (const name of AGENT_FILE_NAMES) {
        nextState[name] = {
          content: agentFiles[name].content,
          exists: true,
        };
      }
      savedAgentFilesRef.current = nextState;
      setAgentFiles(nextState);
      setAgentFilesDirty(false);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("failedToSaveFiles");
      setAgentFilesError(message);
      return false;
    } finally {
      setAgentFilesSaving(false);
    }
  }, [agentFiles, agentId, client]);

  const setAgentFileContent = useCallback(
    (name: AgentFileName, value: string) => {
      if (!isAgentFileName(name)) return;
      setAgentFiles((prev) => ({
        ...prev,
        [name]: { ...prev[name], content: value },
      }));
      setAgentFilesDirty(true);
    },
    [],
  );

  const discardAgentFileChanges = useCallback(() => {
    setAgentFiles(cloneAgentFilesState(savedAgentFilesRef.current));
    setAgentFilesDirty(false);
    setAgentFilesError(null);
  }, [cloneAgentFilesState]);

  useEffect(() => {
    void loadAgentFiles();
  }, [loadAgentFiles]);

  return {
    agentFiles,
    agentFilesLoading,
    agentFilesSaving,
    agentFilesDirty,
    agentFilesError,
    setAgentFileContent,
    saveAgentFiles,
    discardAgentFileChanges,
  };
};

type AgentBrainPanelProps = {
  client: GatewayClient;
  agents: AgentState[];
  selectedAgentId: string | null;
  onUnsavedChangesChange?: (dirty: boolean) => void;
};

const AgentBrainPanelSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="space-y-3 border-t border-border/55 pt-8 first:border-t-0 first:pt-0">
    <h3 className="text-sm font-medium text-foreground">{title}</h3>
    {children}
  </section>
);

export const AgentBrainPanel = ({
  client,
  agents,
  selectedAgentId,
  onUnsavedChangesChange,
}: AgentBrainPanelProps) => {
  const t = useTranslations("inspect");
  const selectedAgent = useMemo(
    () =>
      selectedAgentId
        ? (agents.find((entry) => entry.agentId === selectedAgentId) ?? null)
        : null,
    [agents, selectedAgentId],
  );

  const {
    agentFiles,
    agentFilesLoading,
    agentFilesSaving,
    agentFilesDirty,
    agentFilesError,
    setAgentFileContent,
    saveAgentFiles,
    discardAgentFileChanges,
  } = useAgentFilesEditor({ client, agentId: selectedAgent?.agentId ?? null });
  const draft = useMemo(() => parsePersonalityFiles(agentFiles), [agentFiles]);

  const setIdentityField = useCallback(
    (
      field: "name" | "creature" | "vibe" | "emoji" | "avatar",
      value: string,
    ) => {
      const nextDraft = parsePersonalityFiles(agentFiles);
      nextDraft.identity[field] = value;
      const serialized = serializePersonalityFiles(nextDraft);
      setAgentFileContent("IDENTITY.md", serialized["IDENTITY.md"]);
    },
    [agentFiles, setAgentFileContent],
  );

  const handleSave = useCallback(async () => {
    if (agentFilesLoading || agentFilesSaving || !agentFilesDirty) return;
    await saveAgentFiles();
  }, [agentFilesDirty, agentFilesLoading, agentFilesSaving, saveAgentFiles]);

  useEffect(() => {
    onUnsavedChangesChange?.(agentFilesDirty);
  }, [agentFilesDirty, onUnsavedChangesChange]);

  useEffect(() => {
    return () => {
      onUnsavedChangesChange?.(false);
    };
  }, [onUnsavedChangesChange]);

  if (!selectedAgentId) {
    return (
      <div
        className="agent-inspect-panel flex min-h-0 flex-col overflow-hidden"
        data-testid="agent-personality-panel"
        style={{
          position: "relative",
          left: "auto",
          top: "auto",
          width: "100%",
          height: "100%",
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-6">
          <p className="text-sm text-muted-foreground">{t("agentIdMissing")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="agent-inspect-panel flex min-h-0 flex-col overflow-hidden"
      data-testid="agent-personality-panel"
      style={{
        position: "relative",
        left: "auto",
        top: "auto",
        width: "100%",
        height: "100%",
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6">
        <section
          className="mx-auto flex w-full max-w-[920px] min-h-0 flex-col"
          data-testid="agent-personality-files"
        >
          {agentFilesError ? (
            <div className="ui-alert-danger mb-4 rounded-md px-3 py-2 text-xs">
              {agentFilesError}
            </div>
          ) : null}

          <div className="mb-6 flex items-center justify-end gap-2">
            <button
              type="button"
              className="ui-btn-secondary px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] disabled:opacity-50"
              disabled={
                agentFilesLoading || agentFilesSaving || !agentFilesDirty
              }
              onClick={discardAgentFileChanges}
            >
              {t("discard")}
            </button>
            <button
              type="button"
              className="ui-btn-primary px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
              disabled={
                agentFilesLoading || agentFilesSaving || !agentFilesDirty
              }
              onClick={() => {
                void handleSave();
              }}
            >
              {t("save")}
            </button>
          </div>

          <div className="space-y-8 pb-8">
            <AgentBrainPanelSection title="Persona">
              <textarea
                aria-label="Persona"
                className="h-56 w-full resize-y rounded-md border border-border/80 bg-background px-4 py-3 font-mono text-sm leading-6 text-foreground outline-none"
                value={agentFiles["SOUL.md"].content}
                disabled={agentFilesLoading || agentFilesSaving}
                onChange={(event) => {
                  setAgentFileContent("SOUL.md", event.target.value);
                }}
              />
            </AgentBrainPanelSection>

            <AgentBrainPanelSection title="Directives">
              <textarea
                aria-label="Directives"
                className="h-56 w-full resize-y rounded-md border border-border/80 bg-background px-4 py-3 font-mono text-sm leading-6 text-foreground outline-none"
                value={agentFiles["AGENTS.md"].content}
                disabled={agentFilesLoading || agentFilesSaving}
                onChange={(event) => {
                  setAgentFileContent("AGENTS.md", event.target.value);
                }}
              />
            </AgentBrainPanelSection>

            <AgentBrainPanelSection title={t("context")}>
              <textarea
                aria-label={t("context")}
                className="h-56 w-full resize-y rounded-md border border-border/80 bg-background px-4 py-3 font-mono text-sm leading-6 text-foreground outline-none"
                value={agentFiles["USER.md"].content}
                disabled={agentFilesLoading || agentFilesSaving}
                onChange={(event) => {
                  setAgentFileContent("USER.md", event.target.value);
                }}
              />
            </AgentBrainPanelSection>

            <section className="space-y-3 border-t border-border/55 pt-8">
              <h3 className="text-sm font-medium text-foreground">
                {t("identity")}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs text-muted-foreground">
                  {t("identityName")}
                  <input
                    className="h-10 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
                    value={draft.identity.name}
                    disabled={agentFilesLoading || agentFilesSaving}
                    onChange={(event) => {
                      setIdentityField("name", event.target.value);
                    }}
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs text-muted-foreground">
                  {t("creature")}
                  <input
                    className="h-10 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
                    value={draft.identity.creature}
                    disabled={agentFilesLoading || agentFilesSaving}
                    onChange={(event) => {
                      setIdentityField("creature", event.target.value);
                    }}
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs text-muted-foreground">
                  {t("vibe")}
                  <input
                    className="h-10 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
                    value={draft.identity.vibe}
                    disabled={agentFilesLoading || agentFilesSaving}
                    onChange={(event) => {
                      setIdentityField("vibe", event.target.value);
                    }}
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs text-muted-foreground">
                  Emoji
                  <input
                    className="h-10 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
                    value={draft.identity.emoji}
                    disabled={agentFilesLoading || agentFilesSaving}
                    onChange={(event) => {
                      setIdentityField("emoji", event.target.value);
                    }}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 text-xs text-muted-foreground">
                Avatar
                <input
                  className="h-10 rounded-md border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
                  value={draft.identity.avatar}
                  disabled={agentFilesLoading || agentFilesSaving}
                  onChange={(event) => {
                    setIdentityField("avatar", event.target.value);
                  }}
                />
              </label>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};
