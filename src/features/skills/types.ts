export type SkillCategory =
  | "communication"
  | "productivity"
  | "data"
  | "development"
  | "marketing"
  | "finance"
  | "security"
  | "custom";

export type SkillDefinition = {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: string;
  author: string;
  version: string;
  rating: number;
  installs: number;
  tags: string[];
};

export type InstalledSkill = {
  skillId: string;
  installedAt: string;
  agentId?: string;
};
