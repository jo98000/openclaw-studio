"use client";

import { useCallback, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  fileName: string;
  placeholder?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MarkdownEditor = ({
  value,
  onChange,
  fileName,
  placeholder,
}: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize to fit content
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          {fileName}
        </span>
      </span>
      <textarea
        ref={textareaRef}
        className="w-full resize-none rounded-md border border-border/80 bg-background px-3 py-2 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        onInput={resize}
      />
    </div>
  );
};
