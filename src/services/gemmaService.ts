/**
 * Gemma 4 integration stub.
 *
 * This module provides the abstraction for future Gemma 4 integration.
 * Current status: COMING SOON — the app runs on local template generation.
 *
 * When Gemma 4 is ready, this module will:
 * 1. Load a quantized Gemma 2B model via MediaPipe LLM Inference API (WebGPU)
 *    OR connect to Google AI Gateway / Gemini API for hosted inference
 * 2. Cache the model in IndexedDB for offline use (if local)
 * 3. Provide streaming token output for responsive UX
 * 4. Fall back to template generation if model is unavailable
 *
 * Target model options:
 * - Gemma 2B int8 (~1.2GB) — local via WebGPU + MediaPipe
 * - Gemma 4 via Gemini API — hosted, requires API key
 * - Gemma 4 via Vercel AI Gateway — hosted, managed routing
 */

export const GEMMA_STATUS = 'coming-soon' as const;

export function isGemmaAvailable(): boolean {
  return false;
}

export function getGemmaStatusLabel(): string {
  return 'Local Engine';
}
