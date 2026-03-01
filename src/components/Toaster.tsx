"use client";

import { Toaster as SonnerToaster } from "sonner";

export const Toaster = () => (
  <SonnerToaster
    position="bottom-right"
    toastOptions={{
      className:
        "!bg-card !text-foreground !border-border !shadow-lg !rounded-xl !font-sans !text-sm",
      descriptionClassName: "!text-muted-foreground",
    }}
    gap={8}
    offset={16}
  />
);
