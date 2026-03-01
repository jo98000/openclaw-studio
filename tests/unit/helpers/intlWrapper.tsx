import { createElement, type ReactElement } from "react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/en.json";

/**
 * Wraps a React element with NextIntlClientProvider for testing.
 * Uses English messages by default.
 */
export const withIntl = (ui: ReactElement): ReactElement =>
  createElement(NextIntlClientProvider, { locale: "en", messages, children: ui });
