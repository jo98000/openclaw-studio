"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Shuffle, ChevronRight, ChevronLeft } from "lucide-react";
import type { AgentCreateModalSubmitPayload } from "@/features/agents/creation/types";
import type { GatewayModelChoice } from "@/lib/gateway/models";
import { AgentAvatar } from "@/features/agents/components/AgentAvatar";
import { randomUUID } from "@/lib/uuid";
import {
  AGENT_TEMPLATES,
  type AgentTemplate,
} from "@/features/agents/templates/agentTemplates";
import { useCreateAgentWizard } from "@/features/agents/hooks/useCreateAgentWizard";
import { CreationModeSelector } from "@/features/agents/components/creation/CreationModeSelector";
import { StepPersona } from "@/features/agents/components/creation/StepPersona";
import { ConversationalBuilder } from "@/features/agents/components/creation/ConversationalBuilder";
import type { PersonaBuilderResult } from "@/features/agents/creation/personaBuilderSchema";

type AgentCreateModalProps = {
  open: boolean;
  suggestedName: string;
  busy?: boolean;
  submitError?: string | null;
  models?: GatewayModelChoice[];
  onClose: () => void;
  onSubmit: (payload: AgentCreateModalSubmitPayload) => Promise<void> | void;
};

const fieldClassName =
  "ui-input w-full rounded-md px-3 py-2 text-xs text-foreground outline-none";
const labelClassName =
  "font-mono text-[11px] font-semibold tracking-[0.05em] text-muted-foreground";

const StepIndicator = ({
  current,
  labels,
}: {
  current: number;
  labels: string[];
}) => (
  <div className="flex items-center gap-2 px-6 py-3 border-b border-border/30">
    {labels.map((label, i) => (
      <div key={label} className="flex items-center gap-2">
        {i > 0 ? (
          <ChevronRight
            className="h-3 w-3 text-muted-foreground/40"
            aria-hidden="true"
          />
        ) : null}
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
            i === current
              ? "bg-primary/10 text-primary"
              : i < current
                ? "bg-surface-2 text-foreground"
                : "bg-surface-2 text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
    ))}
  </div>
);

const TemplateSelector = ({
  selected,
  onSelect,
  t,
}: {
  selected: string | null;
  onSelect: (template: AgentTemplate) => void;
  t: (key: string) => string;
}) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {AGENT_TEMPLATES.map((tmpl) => (
      <button
        key={tmpl.id}
        type="button"
        className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
          selected === tmpl.id
            ? "border-primary/40 bg-primary/5"
            : "border-border hover:border-border/80 hover:bg-surface-2/50"
        }`}
        onClick={() => onSelect(tmpl)}
        data-testid={`template-${tmpl.id}`}
      >
        <span className="text-base">{tmpl.icon}</span>
        <span className="text-[11px] font-semibold text-foreground">
          {t(`${tmpl.id}.name`)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {t(`${tmpl.id}.description`)}
        </span>
      </button>
    ))}
  </div>
);

const AgentCreateModalContent = ({
  suggestedName,
  busy,
  submitError,
  models = [],
  onClose,
  onSubmit,
}: Omit<AgentCreateModalProps, "open">) => {
  const t = useTranslations("createAgent");
  const tc = useTranslations("common");
  const tt = useTranslations("templates");
  const wizard = useCreateAgentWizard(suggestedName);
  const {
    step,
    state,
    set,
    applyTemplate,
    goNext,
    goPrev,
    canProceedFromStep,
    buildPayload,
  } = wizard;

  const canProceed = canProceedFromStep(step);

  const handleTemplateSelect = useCallback(
    (template: AgentTemplate) => {
      applyTemplate(template);
    },
    [applyTemplate],
  );

  const handleConversationalResult = useCallback(
    (result: PersonaBuilderResult) => {
      set("name", result.name || state.name);
      set("traits", result.persona.traits);
      set("vibe", result.persona.vibe);
      set("coreTruths", result.persona.coreTruths);
      set("boundaries", result.persona.boundaries);
      set("mission", result.directives.mission);
      set("rules", result.directives.rules);
      set("priorities", result.directives.priorities);
      set("outputFormat", result.directives.outputFormat);
      if (result.suggestedModel) set("modelKey", result.suggestedModel);
      goNext();
    },
    [set, state.name, goNext],
  );

  const handleSubmit = () => {
    if (!state.name.trim() || busy) return;
    void onSubmit(buildPayload());
  };

  const groupedModels = models.reduce<Record<string, GatewayModelChoice[]>>(
    (acc, m) => {
      const p = m.provider || "other";
      if (!acc[p]) acc[p] = [];
      acc[p].push(m);
      return acc;
    },
    {},
  );

  const providerLabels: Record<string, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    perplexity: "Perplexity",
    google: "Google",
    mistral: "Mistral",
    groq: "Groq",
    openrouter: "OpenRouter",
    ollama: "Ollama",
    deepseek: "DeepSeek",
    together: "Together AI",
    fireworks: "Fireworks AI",
    cohere: "Cohere",
    "amazon-bedrock": "Amazon Bedrock",
    "azure-openai": "Azure OpenAI",
    cloudflare: "Cloudflare Workers AI",
    nvidia: "NVIDIA NIM",
    huggingface: "Hugging Face",
    custom: "Custom",
  };

  const stepLabels = [
    t("stepMode"),
    t("stepIdentity"),
    t("stepPersona"),
    t("stepModel"),
    t("stepCapabilities"),
  ];

  const isLastStep = step === 4;

  return (
    <div
      className="fixed inset-0 z-[120] overflow-hidden bg-background/80"
      role="dialog"
      aria-modal="true"
      aria-label={t("headerTitle")}
      onClick={busy ? undefined : onClose}
    >
      <div className="flex h-full items-center justify-center p-4">
        <div
          className="ui-panel flex w-full max-w-2xl flex-col overflow-hidden shadow-xs"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
          onClick={(event) => event.stopPropagation()}
          data-testid="agent-create-modal"
        >
          <div className="flex items-center justify-between border-b border-border/35 px-6 py-4">
            <div>
              <div className="font-mono text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">
                {t("headerLabel")}
              </div>
              <div className="mt-1 text-base font-semibold text-foreground">
                {t("headerTitle")}
              </div>
            </div>
            <button
              type="button"
              className="ui-btn-ghost px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClose}
              disabled={busy}
            >
              {tc("close")}
            </button>
          </div>

          <StepIndicator current={step} labels={stepLabels} />

          <div
            className="px-6 py-5"
            style={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 14rem)",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Step 0: Creation Mode */}
            {step === 0 ? (
              <CreationModeSelector
                selected={state.creationMode}
                onSelect={(mode) => set("creationMode", mode)}
              />
            ) : null}

            {/* Step 1: Identity */}
            {step === 1 ? (
              <div className="grid gap-4">
                {state.creationMode === "template" ? (
                  <>
                    <label className={labelClassName}>
                      {t("templateLabel")}
                    </label>
                    <TemplateSelector
                      selected={state.templateId}
                      onSelect={handleTemplateSelect}
                      t={tt}
                    />
                  </>
                ) : null}

                {state.creationMode === "conversational" ? (
                  <ConversationalBuilder
                    onResult={handleConversationalResult}
                  />
                ) : null}

                <label className={labelClassName}>
                  {t("nameLabel")}
                  <input
                    aria-label={t("nameLabel")}
                    value={state.name}
                    onChange={(event) => set("name", event.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && canProceed) {
                        e.preventDefault();
                        goNext();
                      }
                    }}
                    className={`mt-1 ${fieldClassName}`}
                    placeholder={t("namePlaceholder")}
                    autoFocus
                  />
                </label>

                <label className={labelClassName}>
                  {t("descriptionLabel")}
                  <input
                    aria-label={t("descriptionLabel")}
                    value={state.description}
                    onChange={(e) => set("description", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        goNext();
                      }
                    }}
                    className={`mt-1 ${fieldClassName}`}
                    placeholder={t("descriptionPlaceholder")}
                  />
                </label>

                <div className="grid justify-items-center gap-2 border-t border-border/40 pt-3">
                  <div className={labelClassName}>{t("avatarLabel")}</div>
                  <AgentAvatar
                    seed={state.avatarSeed}
                    name={state.name.trim() || "Nouvel Agent"}
                    size={52}
                    isSelected
                  />
                  <button
                    type="button"
                    aria-label={t("shuffleAvatarLabel")}
                    className="ui-btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-[11px] text-muted-foreground"
                    onClick={() => set("avatarSeed", randomUUID())}
                    disabled={busy}
                  >
                    <Shuffle className="h-3 w-3" />
                    {t("shuffleAvatar")}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Step 2: Persona & Directives */}
            {step === 2 ? (
              <StepPersona
                traits={state.traits}
                onTraitsChange={(traits) => set("traits", traits)}
                coreTruths={state.coreTruths}
                onCoreTruthsChange={(v) => set("coreTruths", v)}
                boundaries={state.boundaries}
                onBoundariesChange={(v) => set("boundaries", v)}
                vibe={state.vibe}
                onVibeChange={(v) => set("vibe", v)}
                mission={state.mission}
                onMissionChange={(v) => set("mission", v)}
                rules={state.rules}
                onRulesChange={(v) => set("rules", v)}
                priorities={state.priorities}
                onPrioritiesChange={(v) => set("priorities", v)}
                outputFormat={state.outputFormat}
                onOutputFormatChange={(v) => set("outputFormat", v)}
                userName={state.userName}
                onUserNameChange={(v) => set("userName", v)}
                userPronouns={state.userPronouns}
                onUserPronounsChange={(v) => set("userPronouns", v)}
                userTimezone={state.userTimezone}
                onUserTimezoneChange={(v) => set("userTimezone", v)}
                userNotes={state.userNotes}
                onUserNotesChange={(v) => set("userNotes", v)}
              />
            ) : null}

            {/* Step 3: AI & Model */}
            {step === 3 ? (
              <div className="grid gap-4">
                <label className={labelClassName}>
                  {t("modelLabel")}
                  <select
                    className={`mt-1 ${fieldClassName}`}
                    aria-label={t("modelLabel")}
                    value={state.modelKey}
                    onChange={(e) => set("modelKey", e.target.value)}
                  >
                    <option value="">{t("modelDefault")}</option>
                    {Object.entries(groupedModels).map(
                      ([provider, providerModels]) => (
                        <optgroup
                          key={provider}
                          label={providerLabels[provider] ?? provider}
                        >
                          {providerModels.map((m) => (
                            <option
                              key={`${m.provider}/${m.id}`}
                              value={`${m.provider}/${m.id}`}
                            >
                              {m.name}
                              {m.reasoning ? " (Raisonnement)" : ""}
                            </option>
                          ))}
                        </optgroup>
                      ),
                    )}
                  </select>
                </label>

                {models.length === 0 ? (
                  <p className="rounded-md bg-surface-2 px-3 py-2 text-[11px] text-muted-foreground">
                    {t("modelConnectHint")}
                  </p>
                ) : null}

                <div className="rounded-lg border border-border/40 bg-surface-2/30 px-4 py-3">
                  <p className="text-[11px] text-muted-foreground">
                    {t("modelHint", {
                      templateName: state.templateId
                        ? ` ("${tt(`${state.templateId}.name`)}")`
                        : "",
                    })}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Step 4: Capabilities */}
            {step === 4 ? (
              <div className="grid gap-4">
                <div>
                  <div className={labelClassName}>{t("capRunCommands")}</div>
                  <div className="mt-1.5 ui-segment grid-cols-3">
                    {(["off", "ask", "auto"] as const).map((mode) => {
                      const modeLabels: Record<string, string> = {
                        off: "Désactivé",
                        ask: "Demander",
                        auto: "Auto",
                      };
                      return (
                        <button
                          key={mode}
                          type="button"
                          data-active={
                            state.commandMode === mode ? "true" : "false"
                          }
                          className="ui-segment-item px-3 py-1.5 text-[11px] font-medium"
                          onClick={() => set("commandMode", mode)}
                        >
                          {modeLabels[mode]}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {state.commandMode === "off"
                      ? t("capCommandOff")
                      : state.commandMode === "ask"
                        ? t("capCommandAsk")
                        : t("capCommandAuto")}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {t("capWebAccess")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("capWebAccessDesc")}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state.webAccess}
                    className={`h-5 w-9 rounded-full transition-colors ${state.webAccess ? "bg-primary" : "bg-surface-3"}`}
                    onClick={() => set("webAccess", !state.webAccess)}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${state.webAccess ? "translate-x-4" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {t("capFileTools")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t("capFileToolsDesc")}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state.fileTools}
                    className={`h-5 w-9 rounded-full transition-colors ${state.fileTools ? "bg-primary" : "bg-surface-3"}`}
                    onClick={() => set("fileTools", !state.fileTools)}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${state.fileTools ? "translate-x-4" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>

                {submitError ? (
                  <div className="ui-alert-danger rounded-md px-3 py-2 text-xs">
                    {submitError}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border/45 px-6 pb-4 pt-4">
            <div>
              {step > 0 ? (
                <button
                  type="button"
                  className="ui-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium"
                  onClick={goPrev}
                  disabled={busy}
                >
                  <ChevronLeft className="h-3 w-3" aria-hidden="true" />
                  {tc("back")}
                </button>
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  {t("stepOf", { current: step + 1, total: 5 })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isLastStep ? (
                <button
                  type="button"
                  className="ui-btn-primary inline-flex items-center gap-1 px-4 py-1.5 font-mono text-[11px] font-semibold tracking-[0.06em]"
                  onClick={goNext}
                  disabled={!canProceed}
                >
                  {tc("next")}
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  className="ui-btn-primary px-4 py-1.5 font-mono text-[11px] font-semibold tracking-[0.06em] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground"
                  disabled={!state.name.trim() || busy}
                  onClick={handleSubmit}
                >
                  {busy ? t("launching") : t("launchAgent")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AgentCreateModal = ({
  open,
  suggestedName,
  busy = false,
  submitError = null,
  models = [],
  onClose,
  onSubmit,
}: AgentCreateModalProps) => {
  if (!open) return null;
  return (
    <AgentCreateModalContent
      suggestedName={suggestedName}
      busy={busy}
      submitError={submitError}
      models={models}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};
