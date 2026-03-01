export type CanvasElementType = "text" | "button" | "input" | "image" | "card" | "list" | "chart" | "table";

export type CanvasElement = {
  id: string;
  type: CanvasElementType;
  props: Record<string, unknown>;
  children?: CanvasElement[];
};

export type CanvasLayout = {
  id: string;
  agentId: string;
  elements: CanvasElement[];
  timestamp: number;
};
