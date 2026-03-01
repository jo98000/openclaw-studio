export type RoutingRuleId = string;

export type RoutingConditionType =
  | "channel"
  | "keyword"
  | "language"
  | "sentiment"
  | "time-range"
  | "custom";

export type RoutingCondition = {
  type: RoutingConditionType;
  /** Operator: equals, contains, matches, gt, lt */
  operator: "equals" | "contains" | "matches" | "gt" | "lt";
  value: string;
};

export type RoutingRule = {
  id: RoutingRuleId;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: RoutingCondition[];
  /** Target agent ID to route to */
  targetAgentId: string;
  /** Fallback agent ID if target is unavailable */
  fallbackAgentId?: string;
};

export type RoutingConfig = {
  rules: RoutingRule[];
  defaultAgentId: string;
};
