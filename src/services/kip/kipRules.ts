import type {
  KipMessage,
  KipRecommendation,
  LearnKipNoteInput,
  LevelUpKipBriefingInput,
  LiveKipRecommendationInput,
} from '../../types/kip';
import { getSupportFocusOption } from '../../constants/supportFocus';

const FIRST_FALLBACK_SAY_THIS = 'Let me narrow this down so we get you the best fit without overbuilding the quote.';
const FIRST_FALLBACK_ASK_THIS = 'Are you mostly trying to lower the bill, upgrade the phone, or add something useful today?';

function firstUseful(values: string[] | undefined, fallback: string): string {
  return values?.find((value) => value.trim().length > 0) ?? fallback;
}

function cleanLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function conciseLine(value: string, maxLength = 180): string {
  const line = cleanLine(value);
  return line.length > maxLength ? `${line.slice(0, maxLength - 3).trimEnd()}...` : line;
}

function getIntentHeadline(input: LiveKipRecommendationInput): string {
  const { context } = input;
  const supportFocus = getSupportFocusOption(context.supportFocus);

  if (supportFocus) {
    return `Stabilize the ${supportFocus.shortLabel.toLowerCase()} lane first.`;
  }

  switch (context.purchaseIntent) {
    case 'ready to buy':
      return 'Keep this call moving toward the close.';
    case 'upgrade / add a line':
      return 'Turn the upgrade into a clean value story.';
    case 'tech support':
      return 'Fix the issue first, then earn the pivot.';
    case 'account support':
      return 'Make the account question feel simple and safe.';
    case 'order support':
      return 'Lower order anxiety before offering the next step.';
    case 'exploring':
    default:
      return 'Find the real reason before pitching.';
  }
}

function getIntentWatchOut(input: LiveKipRecommendationInput): string {
  const { context, script, objectionResult } = input;
  const supportFocus = getSupportFocusOption(context.supportFocus);

  if (objectionResult?.complianceNotes) {
    return conciseLine(objectionResult.complianceNotes);
  }

  if (supportFocus) {
    return supportFocus.planCue.coach;
  }

  if (context.product.includes('Home Internet') && context.hintAvailable === undefined) {
    return 'Do not promise Home Internet until availability is checked.';
  }

  if (context.product.includes('Home Internet') && context.hintAvailable === false) {
    return 'HINT is not the close right now. Pivot to priority list, voice lines, or a clean mobile value story.';
  }

  if (script.coachsCorner) {
    return conciseLine(script.coachsCorner);
  }

  return 'Do not stack add-ons before confirming the main need.';
}

function getOptionalAttach(input: LiveKipRecommendationInput): string | undefined {
  const { context, script } = input;
  const hasPrimaryProductFit = context.product.some((product) => product === 'Phone' || product === 'BTS' || product === 'IOT');
  const firstAttach = script.accessoryRecommendations?.[0];

  if (!hasPrimaryProductFit || !firstAttach) return undefined;

  return conciseLine(`${firstAttach.name}: ${firstAttach.why}`);
}

export function buildLiveKipRecommendation(input: LiveKipRecommendationInput): KipRecommendation {
  const { script } = input;
  const supportFocus = getSupportFocusOption(input.context.supportFocus);
  const action = supportFocus?.planCue.step
    ?? firstUseful(script.valuePropositions, firstUseful(script.purchaseSteps, 'Lead with one strong path, then ask one narrowing question.'));

  return {
    id: `kip-live-${input.context.purchaseIntent.replaceAll(' ', '-')}`,
    mode: 'live',
    tone: 'operator',
    headline: getIntentHeadline(input),
    action: conciseLine(action),
    sayThis: conciseLine(firstUseful(script.welcomeMessages, FIRST_FALLBACK_SAY_THIS)),
    askThis: conciseLine(firstUseful(script.discoveryQuestions, FIRST_FALLBACK_ASK_THIS)),
    watchOut: getIntentWatchOut(input),
    optionalAttach: getOptionalAttach(input),
    confidence: supportFocus || script.welcomeMessages.length > 0 ? 'high' : 'medium',
    sourceReason: 'Built from the local sales plan, selected intent, support focus, HINT state, and attach recommendations.',
  };
}

export function buildLearnKipNote({ section }: LearnKipNoteInput): KipMessage {
  const notes: Record<LearnKipNoteInput['section'], KipMessage> = {
    briefing: {
      id: 'kip-learn-briefing',
      mode: 'learn',
      tone: 'coach',
      headline: 'Why this works',
      body: 'Start with the freshest briefing item, then translate it into one sentence a customer can understand on a live call.',
      sourceReason: 'Briefing guidance should shorten the path from weekly intel to a usable talk track.',
    },
    devices: {
      id: 'kip-learn-devices',
      mode: 'learn',
      tone: 'coach',
      headline: 'Use this when the caller needs a winner',
      body: 'Pick two or three real fits, name the tradeoff, and avoid turning the comparison into a spec recital.',
      sourceReason: 'Device learning is most useful when it creates faster call decisions.',
    },
    plans: {
      id: 'kip-learn-plans',
      mode: 'learn',
      tone: 'coach',
      headline: 'Common mistake',
      body: 'Do not list every plan. Anchor on the customer reason, then show the one plan move that changes the math.',
    },
    homeinternet: {
      id: 'kip-learn-homeinternet',
      mode: 'learn',
      tone: 'coach',
      headline: 'Use this when HINT is actually in play',
      body: 'Check availability before pitching value. If spots are full, move to priority list or mobile-network proof.',
    },
    playbook: {
      id: 'kip-learn-playbook',
      mode: 'learn',
      tone: 'coach',
      headline: 'Why this talk track works',
      body: 'The best line makes the customer feel understood before it asks them to choose.',
    },
    edge: {
      id: 'kip-learn-edge',
      mode: 'learn',
      tone: 'coach',
      headline: 'Coach the behavior, not just the answer',
      body: 'Use edge cases to practice safer pivots, especially when support pressure starts to crowd the sale.',
    },
  };

  return notes[section];
}

export function buildLevelUpMissionBriefing({ area }: LevelUpKipBriefingInput): KipMessage {
  const briefings: Record<LevelUpKipBriefingInput['area'], KipMessage> = {
    bingo: {
      id: 'kip-level-up-bingo',
      mode: 'level-up',
      tone: 'mission',
      headline: 'Mission focus: repeatable call habits',
      body: 'Use Bingo to reward the behaviors reps should repeat on real calls: discovery, clean pivots, and confident closes.',
    },
    practice: {
      id: 'kip-level-up-practice',
      mode: 'level-up',
      tone: 'mission',
      headline: 'Mission focus: rehearse before the call',
      body: 'Pick one scenario, then jump into Live with the plan already loaded so practice turns into a usable rep motion.',
    },
    runner: {
      id: 'kip-level-up-runner',
      mode: 'level-up',
      tone: 'mission',
      headline: 'Mission focus: attention under pressure',
      body: 'Runner trains quick reads: dodge distractions, collect the right signals, and recover fast after a mistake.',
    },
    prizes: {
      id: 'kip-level-up-prizes',
      mode: 'level-up',
      tone: 'mission',
      headline: 'Mission focus: momentum, not noise',
      body: 'Use rewards to reinforce useful behavior, not to bury reps in a checklist.',
    },
  };

  return briefings[area];
}
