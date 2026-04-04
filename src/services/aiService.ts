/**
 * AI Service — Abstraction layer over content generation.
 *
 * Routes to Gemma 4 (local WebGPU inference) when available,
 * falls back to template-based generation (fully offline).
 */

import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
import { WeeklyUpdate } from './weeklyUpdateSchema';
import {
  generateScript as localGenerateScript,
  analyzeObjectionLocal,
} from './localGenerationService';
import {
  isGemmaAvailable,
  getGemmaStatusLabel,
  getGemmaLoadingState,
  gemmaGenerateScript,
  gemmaAnalyzeObjection,
} from './gemmaService';
import type { GemmaLoadingState } from './gemmaService';

export type AIProvider = 'local' | 'gemma';

export interface AIServiceStatus {
  provider: AIProvider;
  label: string;
  isAvailable: boolean;
  gemmaState: GemmaLoadingState;
}

/**
 * Returns the current AI provider status.
 * Used by UI to show "AI: Local Engine" or "AI: Gemma 4" badge.
 */
export function getAIStatus(): AIServiceStatus {
  const { state } = getGemmaLoadingState();
  if (isGemmaAvailable()) {
    return { provider: 'gemma', label: getGemmaStatusLabel(), isAvailable: true, gemmaState: state };
  }
  return { provider: 'local', label: 'Local Engine', isAvailable: true, gemmaState: state };
}

/**
 * Generate a sales script for the given context.
 * Tries Gemma first, falls back to templates.
 */
export async function generateSalesScript(
  context: SalesContext,
  weeklyData: WeeklyUpdate | null,
): Promise<SalesScript> {
  if (isGemmaAvailable()) {
    try {
      return await gemmaGenerateScript(context, weeklyData);
    } catch (err) {
      console.warn('Gemma generation failed, falling back to templates:', err);
    }
  }
  return localGenerateScript(context, weeklyData);
}

/**
 * Analyze customer objections and generate rebuttals.
 * Tries Gemma first, falls back to templates.
 */
export async function analyzeObjection(
  objection: string,
  context: SalesContext,
  script: SalesScript | null,
  selectedItems: string[],
  weeklyData: WeeklyUpdate | null,
): Promise<ObjectionAnalysis> {
  if (isGemmaAvailable()) {
    try {
      return await gemmaAnalyzeObjection(objection, context, script, selectedItems, weeklyData);
    } catch (err) {
      console.warn('Gemma objection analysis failed, falling back to templates:', err);
    }
  }
  return analyzeObjectionLocal(objection, context, script, selectedItems, weeklyData);
}
