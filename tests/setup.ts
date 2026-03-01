import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import messages from "../messages/en.json";

/* ---------- Global next-intl mock ----------
 * Provides English translations to ALL component tests so that
 * useTranslations() works without wrapping each test in NextIntlClientProvider.
 * Tests that use the withIntl() helper will override this mock.
 */
const resolve = (obj: Record<string, unknown>, path: string): string => {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : path;
};

vi.mock("next-intl", async (importOriginal) => {
  const original = await importOriginal<typeof import("next-intl")>();
  return {
    ...original,
    useTranslations: (namespace?: string) => {
      const ns = namespace
        ? (messages as Record<string, unknown>)[namespace]
        : messages;
      return (key: string, values?: Record<string, unknown>) => {
        const raw = typeof ns === "object" && ns ? resolve(ns as Record<string, unknown>, key) : key;
        if (!values) return raw;
        return raw.replace(/\{(\w+)\}/g, (_, k: string) =>
          values[k] != null ? String(values[k]) : `{${k}}`
        );
      };
    },
    useLocale: () => "en",
    NextIntlClientProvider: original.NextIntlClientProvider,
  };
});

const ensureLocalStorage = () => {
  if (typeof window === "undefined") return;
  const existing = window.localStorage as unknown as Record<string, unknown> | undefined;
  if (
    existing &&
    typeof existing.getItem === "function" &&
    typeof existing.setItem === "function" &&
    typeof existing.removeItem === "function" &&
    typeof existing.clear === "function"
  ) {
    return;
  }

  const store = new Map<string, string>();
  const storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(String(key)) ? store.get(String(key)) ?? null : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(String(key));
    },
    setItem(key: string, value: string) {
      store.set(String(key), String(value));
    },
  };

  Object.defineProperty(window, "localStorage", {
    value: storage,
    configurable: true,
  });
};

ensureLocalStorage();
