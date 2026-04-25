import type { ObjectionAnalysis, SalesContext, SalesScript } from '../types';

export type KipMode = 'live' | 'learn' | 'level-up';
export type KipTone = 'operator' | 'coach' | 'mission';

export interface KipMessage {
  id: string;
  mode: KipMode;
  tone: KipTone;
  headline: string;
  body: string;
  sourceReason?: string;
}

export interface KipRecommendation {
  id: string;
  mode: KipMode;
  tone: KipTone;
  headline: string;
  action: string;
  sayThis?: string;
  askThis?: string;
  watchOut?: string;
  optionalAttach?: string;
  confidence: 'high' | 'medium' | 'low';
  sourceReason: string;
}

export type KipLearnSection = 'briefing' | 'devices' | 'plans' | 'homeinternet' | 'playbook' | 'edge';
export type KipLevelUpArea = 'bingo' | 'practice' | 'runner' | 'prizes';

export interface LiveKipRecommendationInput {
  context: SalesContext;
  script: SalesScript;
  activeTab?: string;
  objectionResult?: ObjectionAnalysis | null;
}

export interface LearnKipNoteInput {
  section: KipLearnSection;
}

export interface LevelUpKipBriefingInput {
  area: KipLevelUpArea;
}
