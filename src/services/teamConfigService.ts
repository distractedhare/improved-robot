/**
 * Team Configuration Service
 *
 * Allows teams to customize:
 * - Team name and mascot/avatar
 * - Weekly focus areas
 * - Custom goal text
 *
 * Data stored in localStorage. Can be imported/exported as JSON.
 * No server dependency — designed for the pilot.
 */

const TEAM_CONFIG_KEY = 'team-config-v1';

export const MASCOT_OPTIONS = [
  { id: 'rocket', emoji: '\u{1F680}', label: 'Rocket' },
  { id: 'fire', emoji: '\u{1F525}', label: 'Fire' },
  { id: 'lightning', emoji: '\u{26A1}', label: 'Lightning' },
  { id: 'trophy', emoji: '\u{1F3C6}', label: 'Trophy' },
  { id: 'crown', emoji: '\u{1F451}', label: 'Crown' },
  { id: 'star', emoji: '\u{2B50}', label: 'Star' },
  { id: 'diamond', emoji: '\u{1F48E}', label: 'Diamond' },
  { id: 'shield', emoji: '\u{1F6E1}\u{FE0F}', label: 'Shield' },
  { id: 'target', emoji: '\u{1F3AF}', label: 'Target' },
  { id: 'muscle', emoji: '\u{1F4AA}', label: 'Muscle' },
  { id: 'eagle', emoji: '\u{1F985}', label: 'Eagle' },
  { id: 'wolf', emoji: '\u{1F43A}', label: 'Wolf' },
  { id: 'lion', emoji: '\u{1F981}', label: 'Lion' },
  { id: 'dragon', emoji: '\u{1F409}', label: 'Dragon' },
  { id: 'phoenix', emoji: '\u{1F426}\u{200D}\u{1F525}', label: 'Phoenix' },
  { id: 'bear', emoji: '\u{1F43B}', label: 'Bear' },
  { id: 'shark', emoji: '\u{1F988}', label: 'Shark' },
  { id: 'octopus', emoji: '\u{1F419}', label: 'Octopus' },
  { id: 'bee', emoji: '\u{1F41D}', label: 'Bee' },
  { id: 'unicorn', emoji: '\u{1F984}', label: 'Unicorn' },
] as const;

export type MascotId = (typeof MASCOT_OPTIONS)[number]['id'];

export interface TeamConfig {
  teamName: string;
  mascotId: MascotId;
  customLogoUrl: string | null; // optional image URL
  weeklyFocus: string;
  goalText: string;
  managerName: string;
  updatedAt: string; // ISO date
}

export function defaultTeamConfig(): TeamConfig {
  return {
    teamName: '',
    mascotId: 'rocket',
    customLogoUrl: null,
    weeklyFocus: 'Sales Fundamentals',
    goalText: '',
    managerName: '',
    updatedAt: new Date().toISOString(),
  };
}

export function getTeamConfig(): TeamConfig {
  try {
    const raw = localStorage.getItem(TEAM_CONFIG_KEY);
    if (!raw) return defaultTeamConfig();
    const parsed = JSON.parse(raw) as Partial<TeamConfig>;
    return {
      ...defaultTeamConfig(),
      ...parsed,
    };
  } catch {
    return defaultTeamConfig();
  }
}

export function saveTeamConfig(config: TeamConfig): void {
  try {
    config.updatedAt = new Date().toISOString();
    localStorage.setItem(TEAM_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Silently fail
  }
}

export function getMascotEmoji(mascotId: MascotId): string {
  return MASCOT_OPTIONS.find((m) => m.id === mascotId)?.emoji ?? '\u{1F680}';
}

export function exportTeamConfigJSON(): string {
  return JSON.stringify(getTeamConfig(), null, 2);
}

export function importTeamConfigJSON(json: string): TeamConfig | null {
  try {
    const parsed = JSON.parse(json) as Partial<TeamConfig>;
    if (!parsed.teamName) return null;
    const config: TeamConfig = {
      ...defaultTeamConfig(),
      ...parsed,
      updatedAt: new Date().toISOString(),
    };
    saveTeamConfig(config);
    return config;
  } catch {
    return null;
  }
}
