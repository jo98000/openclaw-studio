"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

type CredentialFieldInputProps = {
  fieldKey: string;
  value: string;
  sensitive: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const CredentialFieldInput = ({
  fieldKey,
  value,
  sensitive,
  onChange,
  placeholder,
}: CredentialFieldInputProps) => {
  const t = useTranslations("credentials");
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={sensitive && !show ? "password" : "text"}
        className="ui-input w-full rounded-lg border border-border bg-surface-2 px-3 py-2 pr-10 font-mono text-xs"
        placeholder={placeholder ?? fieldKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        aria-label={fieldKey}
      />
      {sensitive ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setShow(!show)}
          aria-label={show ? t("hideValue") : t("showValue")}
        >
          {show ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      ) : null}
    </div>
  );
};
