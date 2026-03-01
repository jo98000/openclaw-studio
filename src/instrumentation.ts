import { registerOTel } from "@vercel/otel";
import * as Sentry from "@sentry/nextjs";

export const register = () => {
  registerOTel({ serviceName: "openclaw-studio" });
};

export const onRequestError = Sentry.captureRequestError;
