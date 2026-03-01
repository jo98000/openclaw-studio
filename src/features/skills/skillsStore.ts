import type { InstalledSkill } from "./types";

const STORAGE_KEY = "openclaw-studio:installed-skills";

export const loadInstalledSkills = (): InstalledSkill[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InstalledSkill[];
  } catch {
    return [];
  }
};

export const persistInstalledSkills = (skills: InstalledSkill[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
};

export const installSkill = (skills: InstalledSkill[], skillId: string, agentId?: string): InstalledSkill[] => [
  ...skills,
  { skillId, installedAt: new Date().toISOString(), agentId },
];

export const uninstallSkill = (skills: InstalledSkill[], skillId: string): InstalledSkill[] =>
  skills.filter((s) => s.skillId !== skillId);

export const isSkillInstalled = (skills: InstalledSkill[], skillId: string): boolean =>
  skills.some((s) => s.skillId === skillId);
