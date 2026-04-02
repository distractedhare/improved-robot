import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
import { WeeklyUpdate, WeeklyUpdateMetadata, validateWeeklyUpdate, getWeeklyUpdateValidationError } from './weeklyUpdateSchema';
import { getTemplateScript, OBJECTION_TEMPLATES, BTS_IOT_VALUE_PROPS, COMPETITORS } from '../data';

// --- Weekly Update Loading ---

let cachedWeeklyUpdate: WeeklyUpdate | null = null;
let cachedWeeklySource: WeeklyUpdateSource = 'placeholder';

const UPLOADED_WEEKLY_UPDATE_KEY = 'weeklyUpdate';

export type WeeklyUpdateSource = 'uploaded' | 'bundled' | 'placeholder';

export interface WeeklyUpdateLoadResult {
  data: WeeklyUpdate;
  source: WeeklyUpdateSource;
}

export interface WeeklyUpdateUploadResult {
  success: boolean;
  error?: string;
  metadata?: WeeklyUpdateMetadata;
  source?: WeeklyUpdateSource;
}

function readUploadedWeeklyUpdate(): WeeklyUpdateLoadResult | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(UPLOADED_WEEKLY_UPDATE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    if (!validateWeeklyUpdate(parsed)) {
      console.warn('Stored weekly update is invalid, falling back to bundled data');
      return null;
    }

    cachedWeeklyUpdate = parsed;
    cachedWeeklySource = 'uploaded';
    return { data: parsed, source: 'uploaded' };
  } catch {
    console.warn('Stored weekly update could not be parsed, falling back to bundled data');
    return null;
  }
}

/** Load weekly update: uploaded local data → bundled file → placeholder */
export async function loadWeeklyUpdate(): Promise<WeeklyUpdateLoadResult> {
  const uploaded = readUploadedWeeklyUpdate();
  if (uploaded) return uploaded;

  try {
    const response = await fetch('/weekly-update.json');
    const data = await response.json();
    if (validateWeeklyUpdate(data)) {
      cachedWeeklyUpdate = data;
      cachedWeeklySource = 'bundled';
      return { data, source: 'bundled' };
    }
    console.warn('Bundled weekly update failed validation, falling back to placeholder');
  } catch {
    console.warn('Failed to load bundled weekly-update.json');
  }

  cachedWeeklyUpdate = getPlaceholderUpdate();
  cachedWeeklySource = 'placeholder';
  return { data: cachedWeeklyUpdate, source: cachedWeeklySource };
}

/** Get cached weekly update (call loadWeeklyUpdate first) */
export function getCachedWeeklyUpdate(): WeeklyUpdate | null {
  return cachedWeeklyUpdate;
}

export function getCachedWeeklyUpdateSource(): WeeklyUpdateSource {
  return cachedWeeklySource;
}

/** Upload a new weekly update (validates, stores in localStorage) */
export function uploadWeeklyUpdate(jsonString: string): WeeklyUpdateUploadResult {
  try {
    const parsed = JSON.parse(jsonString);
    const validationError = getWeeklyUpdateValidationError(parsed);
    if (validationError) {
      return { success: false, error: `Invalid weekly-update.json: ${validationError}` };
    }

    if (typeof window === 'undefined') {
      return { success: false, error: 'Uploads are only available in the browser.' };
    }

    localStorage.setItem(UPLOADED_WEEKLY_UPDATE_KEY, jsonString);
    cachedWeeklyUpdate = parsed;
    cachedWeeklySource = 'uploaded';
    return { success: true, metadata: parsed.metadata, source: 'uploaded' };
  } catch {
    return { success: false, error: 'Invalid JSON. Could not parse the file.' };
  }
}

/** Clear uploaded weekly update (revert to bundled) */
export function clearUploadedUpdate(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(UPLOADED_WEEKLY_UPDATE_KEY);
  }
  cachedWeeklyUpdate = null;
  cachedWeeklySource = 'placeholder';
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
  const triedCategories = getTriedCategories(selectedGamePlanItems, currentScript);

  const talkingPoints: string[] = [];
  const counterArguments: string[] = [];
  const carrierSpecificArguments: string[] = [];

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

  const tried = new Set(selectedGamePlanItems || []);
  const filteredPoints = talkingPoints.filter(p => !tried.has(p));

  const carrier = context.currentCarrier;
  const competitor = carrier && carrier !== 'Not Specified' && carrier !== 'Other'
    ? COMPETITORS[carrier]
    : null;

  if (competitor) {
    carrierSpecificArguments.push(...competitor.vulnerabilities.slice(0, 2));
  }

  if (weekly && carrier && carrier !== 'Not Specified' && carrier !== 'Other') {
    const intel = weekly.competitiveIntel
      .filter(c => c.carrier === carrier || c.carrier.includes(carrier));
    carrierSpecificArguments.push(...intel.map(c => c.talkingPoint));
  }

  const isSupport = ['order support', 'tech support', 'account support'].includes(context.purchaseIntent);
  if (isSupport) {
    carrierSpecificArguments.push(
      `SERVICE-TO-SALES: ${BTS_IOT_VALUE_PROPS.watches.props[0]}`,
      `SERVICE-TO-SALES: ${BTS_IOT_VALUE_PROPS.trackers.props[0]}`
    );
  }

  const pivotPlays = buildPivotPlays({
    objectionKeys,
    context,
    triedCategories,
    weekly,
    competitorVulnerability: competitor?.vulnerabilities?.[0],
  });

  const triedAcknowledgement = selectedGamePlanItems && selectedGamePlanItems.length > 0
    ? `You've already hit them with ${describeTriedCategories(triedCategories)}. Good. Don't recycle the same lane — pivot to something they haven't heard yet.`
    : null;

  const coachsCorner = [
    triedAcknowledgement,
    'Acknowledge the concern first, then redirect. Never argue — show empathy and offer a different angle.',
  ].filter(Boolean).join(' ');

  return {
    talkingPoints: filteredPoints.length > 0 ? filteredPoints.slice(0, 6) : ['Address their specific concern directly and offer to show them the numbers.'],
    counterArguments: counterArguments.length > 0 ? counterArguments.slice(0, 3) : ['Let me show you what this actually looks like with the numbers.'],
    pivotPlays,
    carrierSpecificArguments: [...new Set(carrierSpecificArguments)].slice(0, 3),
    coachsCorner,
    complianceNotes: 'All plan prices are before taxes and fees. Do not guarantee specific credit amounts without verifying eligibility. CPNI: no PII in this tool.',
  };
}

type TriedCategory = 'openers' | 'discovery' | 'value';

function getTriedCategories(
  selectedGamePlanItems?: string[],
  currentScript?: SalesScript | null,
): Set<TriedCategory> {
  const categories = new Set<TriedCategory>();
  if (!selectedGamePlanItems?.length || !currentScript) return categories;

  for (const item of selectedGamePlanItems) {
    if (currentScript.welcomeMessages.includes(item)) categories.add('openers');
    if (currentScript.discoveryQuestions.includes(item)) categories.add('discovery');
    if (currentScript.valuePropositions.includes(item)) categories.add('value');
  }

  return categories;
}

function describeTriedCategories(categories: Set<TriedCategory>): string {
  if (categories.size === 0) return 'a few earlier moves';

  const labels: Record<TriedCategory, string> = {
    openers: 'your opening setup',
    discovery: 'discovery questions',
    value: 'value props',
  };

  const values = [...categories].map(category => labels[category]);
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

function buildPivotPlays({
  objectionKeys,
  context,
  triedCategories,
  weekly,
  competitorVulnerability,
}: {
  objectionKeys: string[];
  context: SalesContext;
  triedCategories: Set<TriedCategory>;
  weekly?: WeeklyUpdate | null;
  competitorVulnerability?: string;
}): { strategy: string; script: string }[] {
  const pivots: { id: string; strategy: string; script: string }[] = [];
  const primaryObjection = objectionKeys[0] || 'their hesitation';
  const carrier = context.currentCarrier && context.currentCarrier !== 'Not Specified' && context.currentCarrier !== 'Other'
    ? context.currentCarrier
    : null;

  if (!triedCategories.has('discovery')) {
    pivots.push({
      id: 'discovery-reset',
      strategy: 'Go Narrower',
      script: `Before I keep pitching, let me make sure I'm solving the right problem. When you say "${primaryObjection}," is that mostly about the monthly bill, the switching hassle, or just not seeing a reason to change yet?`,
    });
  }

  if (!triedCategories.has('value')) {
    pivots.push({
      id: 'math-reframe',
      strategy: 'Show the Real Math',
      script: 'Let me come at it a different way. Instead of the sticker price, let’s compare what you are paying now once the fees, perks, and extras are all in the picture. That is usually where the real gap shows up.',
    });
  }

  if (!triedCategories.has('openers')) {
    pivots.push({
      id: 'priority-restart',
      strategy: 'Restart on Their Priority',
      script: 'Forget the promo for a second. If I could fix the one thing you are most annoyed with on your current setup, what would you want that to be first?',
    });
  }

  if (carrier && competitorVulnerability) {
    pivots.push({
      id: 'carrier-weak-spot',
      strategy: `Use ${carrier}'s Weak Spot`,
      script: `The part I would pressure-test is this: ${competitorVulnerability} If that is already bothering you, this is where T-Mobile gives you a cleaner answer.`,
    });
  }

  const promoPivot = weekly?.currentPromos
    .find(promo => promo.appliesToIntents.includes(context.purchaseIntent));
  if (promoPivot) {
    pivots.push({
      id: 'promo-window',
      strategy: 'Use This Week\'s Window',
      script: `Totally fair. The only reason I would put this back on the table today is ${promoPivot.name}. ${promoPivot.details} If that promo makes the math work, it is worth looking at before it changes.`,
    });
  }

  if (['order support', 'tech support', 'account support'].includes(context.purchaseIntent)) {
    pivots.push({
      id: 'support-to-sales',
      strategy: 'Solve Then Pivot',
      script: `Now that the original issue is handled, let me leave you with one quick value move: ${BTS_IOT_VALUE_PROPS.watches.props[0]} If that is not the fit, we can look at a tracker or Home Internet instead.`,
    });
  }

  if (pivots.length === 0) {
    pivots.push({
      id: 'empathy-reset',
      strategy: 'Acknowledge and Reset',
      script: 'I hear you. You do not need another generic pitch from me. Let me reset and show you the one angle that actually changes the decision instead of repeating what you have already heard.',
    });
  }

  return pivots
    .filter((pivot, index, arr) => arr.findIndex(candidate => candidate.id === pivot.id) === index)
    .slice(0, 3)
    .map(({ strategy, script }) => ({ strategy, script }));
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
