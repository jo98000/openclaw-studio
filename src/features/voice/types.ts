export type VoiceProvider = "browser" | "elevenlabs" | "azure" | "google" | "openai";

export type VoiceConfig = {
  id: string;
  agentId: string;
  provider: VoiceProvider;
  enabled: boolean;
  voiceId: string;
  language: string;
  speed: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  autoListen: boolean;
};

export type VoiceSession = {
  agentId: string;
  state: "idle" | "listening" | "processing" | "speaking";
  startedAt: number | null;
};

export const VOICE_PROVIDERS: { id: VoiceProvider; label: string; languages: string[] }[] = [
  { id: "browser", label: "Browser (Web Speech API)", languages: ["fr-FR", "en-US", "en-GB", "es-ES", "de-DE"] },
  { id: "elevenlabs", label: "ElevenLabs", languages: ["fr-FR", "en-US", "en-GB", "es-ES", "de-DE", "it-IT", "pt-BR", "ja-JP"] },
  { id: "azure", label: "Azure Cognitive Services", languages: ["fr-FR", "en-US", "en-GB", "es-ES", "de-DE", "zh-CN", "ja-JP", "ko-KR"] },
  { id: "google", label: "Google Cloud TTS", languages: ["fr-FR", "en-US", "en-GB", "es-ES", "de-DE", "it-IT", "nl-NL", "pt-BR"] },
  { id: "openai", label: "OpenAI TTS", languages: ["fr-FR", "en-US", "en-GB", "es-ES", "de-DE", "it-IT", "pt-BR", "ja-JP", "zh-CN"] },
];
