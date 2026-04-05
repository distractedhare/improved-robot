/**
 * Gemma 4 Local Inference Service
 *
 * Runs Gemma 4 E2B directly in the browser via MediaPipe LLM Inference API + WebGPU.
 * Model (~2GB) downloads once and caches in IndexedDB for offline use.
 * Falls back to template generation if WebGPU unavailable or model not loaded.
 */

import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';
import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
import { WeeklyUpdate } from './weeklyUpdateSchema';

// ---------------------------------------------------------------------------
// Model configuration
// ---------------------------------------------------------------------------

const MODEL_URL =
  'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task';

const MODEL_VERSION_KEY = 'gemma-model-version';
const CURRENT_MODEL_VERSION = 'gemma-4-e2b';

const WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/wasm';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export type GemmaLoadingState = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';

let llmInstance: LlmInference | null = null;
let loadingState: GemmaLoadingState = 'idle';
let loadError: string | null = null;

type StatusListener = () => void;
const listeners = new Set<StatusListener>();

function notifyListeners() {
  listeners.forEach((fn) => {
    try { fn(); } catch { /* ignore */ }
  });
}

// ---------------------------------------------------------------------------
// Public status API
// ---------------------------------------------------------------------------

export function onGemmaStatusChange(fn: StatusListener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getGemmaLoadingState(): { state: GemmaLoadingState; error: string | null } {
  return { state: loadingState, error: loadError };
}

export function isGemmaAvailable(): boolean {
  return loadingState === 'ready' && llmInstance !== null;
}

export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

export function isFirstGemmaLoad(): boolean {
  try {
    return !localStorage.getItem(MODEL_VERSION_KEY);
  } catch { return true; }
}

export function getGemmaStatusLabel(): string {
  switch (loadingState) {
    case 'ready': return 'Gemma 4';
    case 'loading': return 'Loading Gemma…';
    case 'error': return 'Local Engine';
    case 'unsupported': return 'Local Engine';
    default: return 'Local Engine';
  }
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

export async function initializeGemma(): Promise<void> {
  if (loadingState === 'ready' || loadingState === 'loading') return;

  if (!isWebGPUSupported()) {
    loadingState = 'unsupported';
    loadError = 'WebGPU is not supported in this browser.';
    notifyListeners();
    return;
  }

  loadingState = 'loading';
  loadError = null;
  notifyListeners();

  try {
    // Request persistent storage so the browser doesn't evict the cached model
    if (navigator.storage?.persist) {
      await navigator.storage.persist().catch(() => {});
    }

    const genai = await FilesetResolver.forGenAiTasks(WASM_URL);

    llmInstance = await LlmInference.createFromOptions(genai, {
      baseOptions: { modelAssetPath: MODEL_URL },
      maxTokens: 4096,
      topK: 40,
      temperature: 0.7,
      randomSeed: 42,
    });

    loadingState = 'ready';
    loadError = null;

    // Track model version and clean up old caches
    const prevVersion = localStorage.getItem(MODEL_VERSION_KEY);
    if (prevVersion && prevVersion !== CURRENT_MODEL_VERSION) {
      cleanupOldModelCaches().catch(() => {});
    }
    localStorage.setItem(MODEL_VERSION_KEY, CURRENT_MODEL_VERSION);
  } catch (err) {
    loadingState = 'error';
    loadError = err instanceof Error ? err.message : 'Failed to load Gemma model';
    llmInstance = null;
  }

  notifyListeners();
}

// ---------------------------------------------------------------------------
// Old model cache cleanup
// ---------------------------------------------------------------------------

async function cleanupOldModelCaches(): Promise<void> {
  if (!('indexedDB' in globalThis) || !indexedDB.databases) return;
  try {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      // MediaPipe caches models in IDB databases with predictable names
      if (db.name && /gemma.?3/i.test(db.name)) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  } catch {
    // Non-critical — old cache will just take up space
  }
}

// ---------------------------------------------------------------------------
// Prompt engineering
// ---------------------------------------------------------------------------

function buildScriptPrompt(context: SalesContext, weeklyData: WeeklyUpdate | null): string {
  const products = context.product.join(', ');
  const carrier = context.currentCarrier || 'Unknown';

  let weeklyContext = '';
  if (weeklyData?.weeklyFocus) {
    weeklyContext = `\nCURRENT PROMOTIONS:\n- Focus: ${weeklyData.weeklyFocus.headline}\n- Details: ${weeklyData.weeklyFocus.context}`;
  }
  if (weeklyData?.currentPromos?.length) {
    weeklyContext += '\n- Current Promos: ' + weeklyData.currentPromos.map(p => p.name).join('; ');
  }

  return `You are a T-Mobile Virtual Retail sales coach AI. Generate a personalized sales game plan.

CUSTOMER CONTEXT:
- Age group: ${context.age}
- Region: ${context.region}${context.state ? ` (${context.state})` : ''}
- Products interested in: ${products}
- Purchase intent: ${context.purchaseIntent}
- Current carrier: ${carrier}
${weeklyContext}

RULES:
- Be enthusiastic but professional (T-Mobile brand voice)
- Never reference specific account numbers, SSNs, or customer PII
- Focus on value-driven selling, not pressure tactics
- Tailor advice to the customer's age group and region
- If switching from a competitor, highlight T-Mobile advantages

Respond with ONLY valid JSON matching this exact structure (no markdown, no extra text):
{
  "welcomeMessages": ["string - 2-3 warm welcome options"],
  "smallTalk": [{"category": "string", "text": "string"}, ...2-3 items],
  "discoveryQuestions": ["string - 4-5 questions to understand needs"],
  "valuePropositions": ["string - 4-5 key selling points"],
  "objectionHandling": [{"concern": "string", "reassurance": "string"}, ...3-4 items],
  "accessoryRecommendations": [{"name": "string", "why": "string", "priceRange": "string", "brands": ["string"], "bundleEligible": true/false}, ...2-3 items],
  "purchaseSteps": ["string - 4-5 steps to close"],
  "coachsCorner": "string - brief coaching tip for this specific scenario"
}`;
}

function buildObjectionPrompt(
  objection: string,
  context: SalesContext,
  _script: SalesScript | null,
  selectedItems: string[],
  weeklyData: WeeklyUpdate | null,
): string {
  const carrier = context.currentCarrier || 'Unknown';
  const products = context.product.join(', ');

  let alreadyTried = '';
  if (selectedItems.length > 0) {
    alreadyTried = `\nSTRATEGIES ALREADY TRIED (do NOT repeat these):\n- ${selectedItems.join('\n- ')}`;
  }

  let weeklyContext = '';
  if (weeklyData?.weeklyFocus) {
    weeklyContext = `\nCURRENT PROMOTIONS: ${weeklyData.weeklyFocus.headline}`;
  }

  return `You are a T-Mobile Virtual Retail sales coach AI. Help handle a customer objection.

CUSTOMER CONTEXT:
- Age group: ${context.age}
- Region: ${context.region}
- Products: ${products}
- Intent: ${context.purchaseIntent}
- Current carrier: ${carrier}

OBJECTION(S): "${objection}"
${alreadyTried}${weeklyContext}

RULES:
- Be empathetic and understanding — acknowledge the concern first
- Never be pushy or dismissive
- Provide specific, factual counterpoints
- If carrier-specific, highlight T-Mobile advantages over ${carrier}
- Focus on value, not just price
- Never reference specific account numbers, SSNs, or customer PII

Respond with ONLY valid JSON matching this exact structure (no markdown, no extra text):
{
  "talkingPoints": ["string - 3-4 key points to address the concern"],
  "counterArguments": ["string - 3-4 factual rebuttals"],
  "pivotPlays": [{"strategy": "string", "script": "string"}, ...2-3 pivot strategies],
  "carrierSpecificArguments": ["string - 2-3 points if switching from ${carrier}"],
  "coachsCorner": "string - coaching tip for handling this type of objection",
  "complianceNotes": "string - any compliance reminders"
}`;
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

function extractJSON(raw: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch { /* continue */ }

  // Try extracting from markdown code blocks
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch { /* continue */ }
  }

  // Try finding first { to last }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch { /* continue */ }
  }

  throw new Error('Could not extract valid JSON from Gemma response');
}

function ensureStringArray(val: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(val)) return fallback;
  return val.filter((v): v is string => typeof v === 'string');
}

function parseScriptResponse(raw: string): SalesScript {
  const data = extractJSON(raw) as Record<string, unknown>;

  return {
    welcomeMessages: ensureStringArray(data.welcomeMessages, ['Welcome to T-Mobile! How can I help you today?']),
    smallTalk: Array.isArray(data.smallTalk)
      ? data.smallTalk.map((s: { category?: string; text?: string }) => ({
          category: String(s?.category || 'General'),
          text: String(s?.text || ''),
        })).filter(s => s.text)
      : [],
    discoveryQuestions: ensureStringArray(data.discoveryQuestions, ['What brings you to T-Mobile today?']),
    valuePropositions: ensureStringArray(data.valuePropositions, ['T-Mobile offers the best value in wireless.']),
    objectionHandling: Array.isArray(data.objectionHandling)
      ? data.objectionHandling.map((o: { concern?: string; reassurance?: string }) => ({
          concern: String(o?.concern || ''),
          reassurance: String(o?.reassurance || ''),
        })).filter(o => o.concern && o.reassurance)
      : [],
    accessoryRecommendations: Array.isArray(data.accessoryRecommendations)
      ? data.accessoryRecommendations.map((a: { name?: string; why?: string; priceRange?: string; brands?: string[]; bundleEligible?: boolean }) => ({
          name: String(a?.name || 'Accessory'),
          why: String(a?.why || ''),
          priceRange: String(a?.priceRange || ''),
          brands: ensureStringArray(a?.brands),
          bundleEligible: Boolean(a?.bundleEligible),
        }))
      : [],
    purchaseSteps: ensureStringArray(data.purchaseSteps, ['Review the customer\'s needs', 'Present the best plan option']),
    coachsCorner: String(data.coachsCorner || 'Stay confident and listen actively!'),
  };
}

function parseObjectionResponse(raw: string): ObjectionAnalysis {
  const data = extractJSON(raw) as Record<string, unknown>;

  return {
    talkingPoints: ensureStringArray(data.talkingPoints, ['I understand your concern.']),
    counterArguments: ensureStringArray(data.counterArguments, ['T-Mobile offers great value.']),
    pivotPlays: Array.isArray(data.pivotPlays)
      ? data.pivotPlays.map((p: { strategy?: string; script?: string }) => ({
          strategy: String(p?.strategy || ''),
          script: String(p?.script || ''),
        })).filter(p => p.strategy && p.script)
      : undefined,
    carrierSpecificArguments: ensureStringArray(data.carrierSpecificArguments),
    coachsCorner: String(data.coachsCorner || 'Empathy first, facts second.'),
    complianceNotes: String(data.complianceNotes || 'Follow all CPNI guidelines. Never share customer data.'),
  };
}

// ---------------------------------------------------------------------------
// Generation functions
// ---------------------------------------------------------------------------

export async function gemmaGenerateScript(
  context: SalesContext,
  weeklyData: WeeklyUpdate | null,
): Promise<SalesScript> {
  if (!llmInstance) throw new Error('Gemma not initialized');
  const prompt = buildScriptPrompt(context, weeklyData);
  const response = await llmInstance.generateResponse(prompt);
  return parseScriptResponse(response);
}

export async function gemmaAnalyzeObjection(
  objection: string,
  context: SalesContext,
  script: SalesScript | null,
  selectedItems: string[],
  weeklyData: WeeklyUpdate | null,
): Promise<ObjectionAnalysis> {
  if (!llmInstance) throw new Error('Gemma not initialized');
  const prompt = buildObjectionPrompt(objection, context, script, selectedItems, weeklyData);
  const response = await llmInstance.generateResponse(prompt);
  return parseObjectionResponse(response);
}
