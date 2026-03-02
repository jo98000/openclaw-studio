export type DetectedCliCredential = {
  serviceType: string;
  source: string;
  fields: Array<{ key: string; value: string; sensitive: boolean }>;
  note?: string;
};

type CliDetectResponse =
  | { detected: DetectedCliCredential[] }
  | { error: string };

export const detectCliCredentials = async (): Promise<
  DetectedCliCredential[]
> => {
  const res = await fetch("/api/credentials/cli-detect");
  const data = (await res.json()) as CliDetectResponse;
  if ("error" in data) throw new Error(data.error);
  return data.detected;
};
