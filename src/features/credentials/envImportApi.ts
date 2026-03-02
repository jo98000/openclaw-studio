export type EnvImportProvider = {
  serviceType: string;
  apiKey: string;
  source: string;
};

export type EnvImportCredential = {
  serviceType: string;
  fields: Array<{ key: string; value: string; sensitive: boolean }>;
  source: string;
};

export type EnvImportResult = {
  providers: EnvImportProvider[];
  credentials: EnvImportCredential[];
  unmatched: string[];
};

type EnvImportResponse = EnvImportResult | { error: string };

export const importFromEnvContent = async (
  content: string,
): Promise<EnvImportResult> => {
  const res = await fetch("/api/credentials/env-import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const data = (await res.json()) as EnvImportResponse;
  if ("error" in data) throw new Error(data.error);
  return data;
};
