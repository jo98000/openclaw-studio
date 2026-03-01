"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Mic, MicOff, Volume2, VolumeX, Settings2 } from "lucide-react";
import type { VoiceProvider } from "../types";
import { VOICE_PROVIDERS } from "../types";
import {
  initVoiceStore,
  getVoiceConfigs,
  upsertVoiceConfig,
  removeVoiceConfig,
  getVoiceSession,
  setVoiceSessionState,
} from "../voiceStore";

type VoiceControlsProps = {
  agentId?: string;
};

export const VoiceControls = ({ agentId }: VoiceControlsProps) => {
  const t = useTranslations("voice");
  const [, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initVoiceStore();
  }, []);

  const configs = getVoiceConfigs();
  const currentConfig = agentId
    ? configs.find((c) => c.agentId === agentId)
    : undefined;
  const session = agentId ? getVoiceSession(agentId) : undefined;

  const [provider, setProvider] = useState<VoiceProvider>(
    currentConfig?.provider ?? "browser",
  );
  const [language, setLanguage] = useState(currentConfig?.language ?? "fr-FR");
  const [speed, setSpeed] = useState(currentConfig?.speed ?? 1.0);
  const [autoListen, setAutoListen] = useState(
    currentConfig?.autoListen ?? false,
  );

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleSave = useCallback(() => {
    if (!agentId) return;
    upsertVoiceConfig({
      agentId,
      provider,
      enabled: true,
      voiceId: "default",
      language,
      speed,
      pitch: 1.0,
      autoListen,
    });
    setShowSettings(false);
    refresh();
  }, [agentId, provider, language, speed, autoListen, refresh]);

  const handleRemove = useCallback(() => {
    if (!agentId) return;
    removeVoiceConfig(agentId);
    setShowSettings(false);
    refresh();
  }, [agentId, refresh]);

  const toggleListening = useCallback(() => {
    if (!agentId) return;
    const s = getVoiceSession(agentId);
    if (s.state === "listening") {
      setVoiceSessionState(agentId, "idle");
    } else {
      setVoiceSessionState(agentId, "listening");
    }
    refresh();
  }, [agentId, refresh]);

  const toggleSpeaking = useCallback(() => {
    if (!agentId) return;
    const s = getVoiceSession(agentId);
    if (s.state === "speaking") {
      setVoiceSessionState(agentId, "idle");
    } else {
      setVoiceSessionState(agentId, "speaking");
    }
    refresh();
  }, [agentId, refresh]);

  const providerInfo = VOICE_PROVIDERS.find((p) => p.id === provider);

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="voice-controls">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <Mic className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
        {currentConfig ? (
          <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-600">
            {t("active")}
          </span>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-4 text-xs text-muted-foreground">{t("description")}</p>

        {!agentId ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            {t("selectAgent")}
          </p>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  session?.state === "listening"
                    ? "bg-red-500 text-white"
                    : "bg-surface-2 text-foreground hover:bg-surface-3"
                }`}
              >
                {session?.state === "listening" ? (
                  <MicOff className="h-3.5 w-3.5" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
                {session?.state === "listening"
                  ? t("stopListening")
                  : t("startListening")}
              </button>

              <button
                type="button"
                onClick={toggleSpeaking}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  session?.state === "speaking"
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-2 text-foreground hover:bg-surface-3"
                }`}
              >
                {session?.state === "speaking" ? (
                  <VolumeX className="h-3.5 w-3.5" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
                {session?.state === "speaking" ? t("stopSpeaking") : t("speak")}
              </button>

              <button
                type="button"
                onClick={() => setShowSettings((prev) => !prev)}
                className="ml-auto rounded-lg bg-surface-2 p-2 text-muted-foreground transition-colors hover:bg-surface-3"
                aria-label={t("settings")}
              >
                <Settings2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {session?.state !== "idle" ? (
              <div className="mb-4 rounded-lg bg-surface-2 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-xs font-medium text-foreground capitalize">
                    {t(session?.state ?? "idle")}
                  </span>
                </div>
              </div>
            ) : null}

            {showSettings ? (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("providerLabel")}
                  </label>
                  <select
                    value={provider}
                    onChange={(e) =>
                      setProvider(e.target.value as VoiceProvider)
                    }
                    className="ui-input w-full text-xs"
                  >
                    {VOICE_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("languageLabel")}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="ui-input w-full text-xs"
                  >
                    {(providerInfo?.languages ?? []).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("speedLabel")} ({speed.toFixed(1)}x)
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={autoListen}
                    onChange={(e) => setAutoListen(e.target.checked)}
                    className="rounded border-border"
                  />
                  {t("autoListen")}
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    {t("save")}
                  </button>
                  {currentConfig ? (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive"
                    >
                      {t("remove")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="rounded-md bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            ) : null}

            {currentConfig ? (
              <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("currentConfig")}
                </p>
                <p className="mt-1 text-xs text-foreground">
                  {
                    VOICE_PROVIDERS.find((p) => p.id === currentConfig.provider)
                      ?.label
                  }{" "}
                  — {currentConfig.language} — {currentConfig.speed}x
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
