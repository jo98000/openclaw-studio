export type InterAgentMessage = {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  timestamp: number;
  type: "text" | "handoff" | "data" | "error";
};
