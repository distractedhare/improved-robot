import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
import { WeeklyUpdate, validateWeeklyUpdate } from './weeklyUpdateSchema';
import { getTemplateScript, OBJECTION_TEMPLATES, BTS_IOT_VALUE_PROPS } from '../data';

// --- Weekly Update Loading ---

let cachedWeeklyUpdate: WeeklyUpdate | null = null;

// Remote URL for weekly update — set this to your hosted file location.
// Supports: Google Drive (shared link), Dropbox, GitHub raw, any public HTTPS URL.
// The app tries this URL first, then falls back to the bundled /public/weekly-update.json.
const REMOTE_UPDATE_URL = '';
// Examples:
// Google Drive: 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID'
// Dropbox: 'https://dl.dropboxusercontent.com/s/YOUR_LINK/weekly-update.json'
// GitHub: 'https://raw.githubusercontent.com/USER/REPO/main/weekly-update.json'

/** Load weekly update: remote URL → bundled file → placeholder */
export async function loadWeeklyUpdate(): Promise<WeeklyUpdate> {
  // 1. Try remote URL first (your hosted weekly update — no rebuild needed)
  if (REMOTE_UPDATE_URL) {
    try {
      const response = await fetch(REMOTE_UPDATE_URL, { cache: 'no-cache' });
      if (response.ok) {
        const data = await response.json();
        if (validateWeeklyUpdate(data)) {
          cachedWeeklyUpdate = data;
          return data;
        }
      }
    } catch {
      console.warn('Remote weekly update unavailable, falling back to bundled version');
    }
  }

  // 2. Fall back to bundled /public/weekly-update.json
  try {
    const response = await fetch('/weekly-update.json');
    const data = await response.json();
    if (validateWeeklyUpdate(data)) {
      cachedWeeklyUpdate = data;
      return data;
    }
  } catch {
    console.warn('Failed to load bundled weekly-update.json');
  }

  // 3. Last resort: return minimal placeholder
  cachedWeeklyUpdate = getPlaceholderUpdate();
  return cachedWeeklyUpdate;
}

/** Get cached weekly update (call loadWeeklyUpdate first) */
export function getCachedWeeklyUpdate(): WeeklyUpdate | null {
  return cachedWeeklyUpdate;
}

/** Upload a new weekly update (validates, stores in localStorage) */
export function uploadWeeklyUpdate(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!validateWeeklyUpdate(parsed)) {
      return { success: false, error: 'Invalid weekly-update.json format. Check the schema.' };
    }
    localStorage.setItem('weeklyUpdate', jsonString);
    cachedWeeklyUpdate = parsed;
    return { success: true };
  } catch {
    return { success: false, error: 'Invalid JSON. Could not parse the file.' };
  }
}

/** Clear uploaded weekly update (revert to bundled) */
export function clearUploadedUpdate(): void {
  localStorage.removeItem('weeklyUpdate');
  cachedWeeklyUpdate = null;
}

// --- Script Generation (fully offline) ---

/** Generate a complete sales script from embedded data + weekly update */
export function generateScript(context: SalesContext, weeklyData?: WeeklyUpdate | null): SalesScript {
  const weekly = weeklyData || cachedWeeklyUpdate;
  const intent = context.purchaseIntent;

  // Start with template-driven base from embedded data
  const template = getTemplateScript(context) as SalesScript;

  if (!weekly) return template;

  // Get the intent-specific playbook
  const playbook = weekly.intentPlaybooks[intent];

  // Build enriched script
  const welcomeMessages = playbook?.openers?.length
    ? playbook.openers
    : template.welcomeMessages;

  const discoveryQuestions = playbook?.discovery?.length
    ? [...playbook.discovery, ...template.discoveryQuestions.slice(0, 4)]
    : template.discoveryQuestions;

  // Value props: combine matching promos + template props
  const matchingPromos = weekly.currentPromos
    .filter(p => p.appliesToIntents.includes(intent))
    .map(p => `${p.name}: ${p.details}`);

  // Competitive intel for this intent
  const matchingIntel = weekly.competitiveIntel
    .filter(c => !c.appliesToIntents || c.appliesToIntents.includes(intent))
    .map(c => c.talkingPoint);

  const valuePropositions = [
    ...matchingPromos.slice(0, 3),
    ...matchingIntel.slice(0, 2),
    ...template.valuePropositions.slice(0, 3),
  ].slice(0, 8);

  // Objection handling: combine promo objections + template
  const promoObjections = weekly.currentPromos
    .flatMap(p => p.commonObjections)
    .map(o => ({ concern: o.objection, reassurance: o.response }));

  const objectionHandling = promoObjections.length > 0
    ? [...promoObjections.slice(0, 2), ...template.objectionHandling.slice(0, 2)]
    : template.objectionHandling;

  // Purchase steps from playbook key moves + template steps
  const purchaseSteps = playbook?.keyMoves?.length
    ? playbook.keyMoves
    : template.purchaseSteps;

  // Coach's corner: keep it short and actionable
  const closingTip = playbook?.closingTips?.[0] || '';
  const avoidNote = playbook?.avoidMoves?.[0] || '';
  const coachsCorner = closingTip
    ? `${closingTip}${avoidNote ? ` Watch out: ${avoidNote}` : ''}`
    : template.coachsCorner;

  // Known issues relevant to this intent
  const matchingIssues = weekly.knownIssues
    .filter(issue => issue.appliesToIntents.includes(intent));

  // Build conversation builders (replaces small talk — mid-call rapport, not greetings)
  const conversationBuilders = matchingIssues.length > 0
    ? matchingIssues.map(issue => ({
        category: 'Heads Up',
        text: `${issue.issue} — ${issue.workaround}`
      }))
    : [{ category: 'Weekly Focus', text: weekly.weeklyFocus.headline }];

  return {
    welcomeMessages,
    discoveryQuestions: [...new Set(discoveryQuestions)].slice(0, 8),
    valuePropositions,
    objectionHandling,
    accessoryRecommendations: template.accessoryRecommendations || [],
    purchaseSteps,
    coachsCorner,
    smallTalk: conversationBuilders,
    nearbyStores: [], // No longer available offline
    groundingSources: [], // No longer available offline
  };
}

// --- Objection Analysis (fully offline) ---

/** Analyze objections using embedded data + weekly update (replaces Gemini) */
export function analyzeObjectionLocal(
  objection: string,
  context: SalesContext,
  currentScript?: SalesScript | null,
  selectedGamePlanItems?: string[],
  weeklyData?: WeeklyUpdate | null,
): ObjectionAnalysis {
  const weekly = weeklyData || cachedWeeklyUpdate;
  const objectionKeys = objection.split(', ').map(o => o.trim());

  // Collect talking points from templates
  const talkingPoints: string[] = [];
  const counterArguments: string[] = [];

  for (const key of objectionKeys) {
    const template = OBJECTION_TEMPLATES[key];
    if (template) {
      talkingPoints.push(...template.talkingPoints.slice(0, 3));
      counterArguments.push(template.rebuttal);
    }
  }

  // Add weekly promo-specific objection responses
  if (weekly) {
    for (const promo of weekly.currentPromos) {
      for (const promoObj of promo.commonObjections) {
        if (objectionKeys.some(k => promoObj.objection.toLowerCase().includes(k.toLowerCase()) ||
            k.toLowerCase().includes(promoObj.objection.toLowerCase().slice(0, 20)))) {
          talkingPoints.push(`${promo.name}: ${promoObj.response}`);
        }
      }
    }
  }

  // Filter out items the rep has already tried
  const tried = new Set(selectedGamePlanItems || []);
  const filteredPoints = talkingPoints.filter(p => !tried.has(p));

  // Carrier-specific arguments
  const carrierSpecificArguments: string[] = [];
  if (weekly && context.currentCarrier && context.currentCarrier !== 'Not Specified') {
    const intel = weekly.competitiveIntel
      .filter(c => c.carrier === context.currentCarrier || c.carrier.includes(context.currentCarrier || ''));
    carrierSpecificArguments.push(...intel.map(c => c.talkingPoint));
  }

  // BTS/IOT for support intents
  const isSupport = ['order support', 'tech support', 'account support'].includes(context.purchaseIntent);
  if (isSupport) {
    carrierSpecificArguments.push(
      `SERVICE-TO-SALES: ${BTS_IOT_VALUE_PROPS.watches.props[0]}`,
      `SERVICE-TO-SALES: ${BTS_IOT_VALUE_PROPS.trackers.props[0]}`
    );
  }

  // Coach's corner — use humanized tip, not raw reference file content
  const coachsCorner = 'Acknowledge the concern first, then redirect. Never argue — show empathy and offer a different angle.';

  return {
    talkingPoints: filteredPoints.length > 0 ? filteredPoints.slice(0, 6) : ['Address their specific concern directly and offer to show them the numbers.'],
    counterArguments: counterArguments.length > 0 ? counterArguments.slice(0, 3) : ['Let me show you what this actually looks like with the numbers.'],
    carrierSpecificArguments: carrierSpecificArguments.slice(0, 3),
    coachsCorner,
    complianceNotes: 'All plan prices are before taxes and fees. Do not guarantee specific credit amounts without verifying eligibility. CPNI: no PII in this tool.',
  };
}

// --- Placeholder ---

function getPlaceholderUpdate(): WeeklyUpdate {
  return {
    metadata: { updatedDate: '2026-01-01', validUntil: '2026-01-08', version: '0.0.0-placeholder' },
    weeklyFocus: { headline: 'No weekly update loaded', context: 'Upload a weekly-update.json to get current promos and intel.' },
    currentPromos: [],
    planUpdates: [],
    competitiveIntel: [],
    knownIssues: [],
    intentPlaybooks: {},
  };
}
