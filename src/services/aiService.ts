/**
 * AI Service — Abstraction layer over content generation.
 *
 * Today: delegates to localGenerationService (template-based, fully offline).
 * Future: routes to Gemma 4 when available for richer, personalized generation.
 *
 * This layer exists so the app can transparently upgrade from templates to LLM
 * without changing any component code.
 */

import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
import { WeeklyUpdate } from './weeklyUpdateSchema';
import {
  generateScript as localGenerateScript,
  analyzeObjectionLocal,
} from './localGenerationService';
import { isGemmaAvailable, getGemmaStatusLabel } from './gemmaService';

export type AIProvider = 'local' | 'gemma';

export interface AIServiceStatus {
  provider: AIProvider;
  label: string;
  isAvailable: boolean;
}

/**
 * Returns the current AI provider status.
 * Used by UI to show "AI: Local Engine" or "AI: Gemma 4" badge.
 */
export function getAIStatus(): AIServiceStatus {
  if (isGemmaAvailable()) {
    return { provider: 'gemma', label: getGemmaStatusLabel(), isAvailable: true };
  }
  return { provider: 'local', label: 'Local Engine', isAvailable: true };
}

/**
 * Generate a sales script for the given context.
 * Routes to the best available provider.
 */
export function generateSalesScript(
  context: SalesContext,
  weeklyData: WeeklyUpdate | null,
): SalesScript {
  // Future: if (isGemmaAvailable()) return gemmaGenerateScript(context, weeklyData);
  return localGenerateScript(context, weeklyData);
}

/**
 * Analyze customer objections and generate rebuttals.
 * Routes to the best available provider.
 */
export function analyzeObjection(
  objection: string,
  context: SalesContext,
  script: SalesScript | null,
  selectedItems: string[],
  weeklyData: WeeklyUpdate | null,
): ObjectionAnalysis {
  // Future: if (isGemmaAvailable()) return gemmaAnalyzeObjection(...)
  return analyzeObjectionLocal(objection, context, script, selectedItems, weeklyData);
}
