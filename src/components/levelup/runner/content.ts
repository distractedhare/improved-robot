/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getExternalRunnerContent } from './bridge';
import type { BossDefinition, CharacterDefinition, CharacterId } from './types';

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4;
  category: 'network' | 'plans' | 'objection' | 'discovery' | 'devices' | 'bundles' | 'service' | 'sales';
  healthReward?: number;
  scoreReward?: number;
}

export const T_LIFE_WORD = ['T', '-', 'L', 'I', 'F', 'E'];
export const T_MOBILE_MAGENTA = '#E20074';
export const T_MOBILE_DARK = '#000000';
export const T_MOBILE_WHITE = '#FFFFFF';
export const T_MOBILE_SILVER = '#F1F1F1';
export const T_MOBILE_GREY = '#6A6A6A';

export const T_MOBILE_PALETTE = [
  T_MOBILE_MAGENTA,
  T_MOBILE_WHITE,
  T_MOBILE_SILVER,
  T_MOBILE_GREY,
  '#A10052',
  '#FF5CAD',
  '#6E34FF',
  '#00D9FF',
];

export const LEVEL_PALETTES: Record<number, string[]> = {
  1: [T_MOBILE_MAGENTA, T_MOBILE_WHITE],
  2: [T_MOBILE_MAGENTA, T_MOBILE_SILVER, T_MOBILE_GREY],
  3: [T_MOBILE_MAGENTA, '#A10052', '#FF5CAD'],
  4: [T_MOBILE_MAGENTA, '#6E34FF', '#00D9FF', T_MOBILE_WHITE],
  5: [T_MOBILE_MAGENTA, '#FF5CAD', '#A10052', '#6E34FF', '#00D9FF', T_MOBILE_WHITE],
};

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'apple',
    brand: 'Apple',
    series: 'iPhone Pro Series',
    name: 'Titanium Duelist',
    title: 'Precision engineered for the perfect run.',
    role: 'Precision / Speed',
    rarity: 'Legendary',
    tagline: 'Precision engineered for the perfect run.',
    lore: 'A surgical striker built from premium device DNA. Fast, exact, and clean under pressure.',
    accent: '#9DD9FF',
    secondary: '#EAF7FF',
    armor: '#B8C4D5',
    icon: '◌',
    cardImage: '/levelup/runner/cards/apple_titanium_duelist_card.png',
    signature: 'Titanium armor, camera-cluster shoulder, MagSafe core, sleek black visor.',
    passiveName: 'Perfect Parry',
    passiveDescription: 'Reflects obstacles, sharpens lane recovery, and rewards clean timing windows.',
    abilityName: 'MagSafe Overcharge',
    abilityDescription: 'Pulls nearby coins and power-ups while boosting movement speed.',
    ultimateName: 'A17 Protocol',
    ultimateDescription: 'Drops a time-slow field with a perfect coin magnet and cleaner combo routing.',
    abilities: [
      {
        id: 'perfect_parry',
        name: 'Perfect Parry',
        type: 'passive',
        description: 'Reflects obstacles and stuns enemies.',
        gameplayEffect: 'Clean-hit reflection window with bonus score on near-miss timing.',
      },
      {
        id: 'magsafe_overcharge',
        name: 'MagSafe Overcharge',
        type: 'active',
        description: 'Pulls nearby coins and power-ups while boosting movement speed.',
        gameplayEffect: 'Temporary magnet plus speed buff.',
      },
      {
        id: 'precision_slash',
        name: 'Precision Slash',
        type: 'ultimate',
        description: 'Cuts a clean lane through dense hazard clusters.',
        gameplayEffect: 'Clears a forward path and scores bonus combo.',
      },
      {
        id: 'a17_protocol',
        name: 'A17 Protocol',
        type: 'ultimate',
        description: 'Time-slow field with perfect coin magnet.',
        gameplayEffect: 'Extended route control and pickup dominance during pressure spikes.',
      },
    ],
    flavor: 'Every move lands like a keynote reveal.',
    stats: { speed: 9, agility: 10, power: 7, durability: 8, tech: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.07,
      dashRecharge: 0.22,
      dashBurstMultiplier: 1.18,
      scoreMultiplier: 1.12,
      abilityCooldown: 12,
      maxBatteryBonus: 0,
      triviaBonus: 0.05,
      sidekickCoreAffinity: 1.0,
    },
  },
  {
    id: 'samsung',
    brand: 'Samsung',
    series: 'Galaxy S Series',
    name: 'Foldwing Warrior',
    title: 'Unfold the power within.',
    role: 'Power / Glide',
    rarity: 'Legendary',
    tagline: 'Unfold the power within.',
    lore: 'A feature-heavy battle mech that turns raw capability into pressure and control.',
    accent: '#9B5CFF',
    secondary: '#D7C2FF',
    armor: '#473C66',
    icon: '◭',
    cardImage: '/levelup/runner/cards/samsung_foldwing_warrior_card.png',
    signature: 'Purple-black armor, fold-out wing panels, camera spine, stylus spear.',
    passiveName: 'AMOLED Burst',
    passiveDescription: 'Reveals hidden lanes, doubles coin value windows, and stabilizes glide reads.',
    abilityName: 'Armor Unfold',
    abilityDescription: 'Deploys screen-wings for glide and area shielding.',
    ultimateName: 'Infinity Display',
    ultimateDescription: 'Triggers a full-screen control burst with triple coin value and safer lane pressure.',
    abilities: [
      {
        id: 'armor_unfold',
        name: 'Armor Unfold',
        type: 'active',
        description: 'Deploys screen-wings for glide and area shielding.',
        gameplayEffect: 'Short glide window and temporary barrier.',
      },
      {
        id: 's_pen_spear',
        name: 'S Pen Spear',
        type: 'active',
        description: 'Pierces obstacles and marks targets.',
        gameplayEffect: 'Precise strike with bonus damage to boss weak points.',
      },
      {
        id: 'amoled_burst',
        name: 'AMOLED Burst',
        type: 'passive',
        description: 'Reveals hidden lanes and doubles coins.',
        gameplayEffect: 'Visual clarity boost during dense hazard clusters.',
      },
      {
        id: 'infinity_display',
        name: 'Infinity Display',
        type: 'ultimate',
        description: 'Full-screen mode with triple coin value.',
        gameplayEffect: 'Burst scoring and wider control windows.',
      },
    ],
    flavor: 'A feature-packed thunderstorm with hinges.',
    stats: { speed: 8, agility: 9, power: 10, durability: 8, tech: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.0,
      dashRecharge: 0.18,
      dashBurstMultiplier: 1.12,
      scoreMultiplier: 1.08,
      abilityCooldown: 13,
      maxBatteryBonus: 15,
      triviaBonus: 0.02,
      sidekickCoreAffinity: 1.05,
    },
  },
  {
    id: 'tcl',
    brand: 'TCL',
    series: 'NXTVISION Series',
    name: 'Display Brawler',
    title: 'Built for big moments.',
    role: 'Area Clear / Value Power',
    rarity: 'Epic',
    tagline: 'Built for big moments.',
    lore: 'A bruiser built from screen-first chaos and sheer staying power.',
    accent: '#FF4639',
    secondary: '#FFB0A7',
    armor: '#2E1A1A',
    icon: '▣',
    cardImage: '/levelup/runner/cards/tcl_display_brawler_card.png',
    signature: 'Blocky display chest, speaker-grille limbs, red equalizer core, heavy frame.',
    passiveName: 'Bass Boost',
    passiveDescription: 'Temporarily enlarges the coin magnet radius and turns heavy clears into bigger reward windows.',
    abilityName: 'Equalizer Blast',
    abilityDescription: 'Fires a wide pulse that clears obstacles and pulls nearby coins.',
    ultimateName: 'Cinemax Mode',
    ultimateDescription: 'Turns the lane into a bonus-star rush with heavy stagger resistance.',
    abilities: [
      {
        id: 'equalizer_blast',
        name: 'Equalizer Blast',
        type: 'active',
        description: 'Fires a wide pulse that clears obstacles and pulls nearby coins.',
        gameplayEffect: 'Area clear plus short magnet effect.',
      },
      {
        id: 'sound_pulse',
        name: 'Sound Pulse',
        type: 'active',
        description: 'Stuns enemies and breaks barriers.',
        gameplayEffect: 'Barrier crack plus crowd-control window.',
      },
      {
        id: 'bass_boost',
        name: 'Bass Boost',
        type: 'passive',
        description: 'Temporarily enlarges coin magnet radius.',
        gameplayEffect: 'Larger pickup pull during heavy engagement.',
      },
      {
        id: 'cinemax_mode',
        name: 'Cinemax Mode',
        type: 'ultimate',
        description: 'Turns all coins into bonus stars.',
        gameplayEffect: 'Big conversion moment for value-heavy runs.',
      },
    ],
    flavor: 'The aisle-end display that learned how to punch back.',
    stats: { speed: 6, agility: 5, power: 10, durability: 9, tech: 7 },
    gameplay: {
      baseSpeedMultiplier: 0.97,
      dashRecharge: 0.16,
      dashBurstMultiplier: 1.1,
      scoreMultiplier: 1.15,
      abilityCooldown: 14,
      maxBatteryBonus: 20,
      triviaBonus: 0.0,
      sidekickCoreAffinity: 1.0,
    },
  },
  {
    id: 'motorola',
    brand: 'Motorola',
    series: 'razr Series',
    name: 'Flip Rider',
    title: 'Flip open. Lock in.',
    role: 'Mobility / Burst Speed',
    rarity: 'Legendary',
    tagline: 'Flip open. Lock in.',
    lore: 'A razor-fast mobility mech that wins by rhythm, timing, and lane control.',
    accent: '#2DE6E6',
    secondary: '#A8FFFF',
    armor: '#22363B',
    icon: '⌁',
    cardImage: '/levelup/runner/cards/motorola_flip_rider_card.png',
    signature: 'Matte black speed frame, teal visor, razr chest, hinge joints, burst fins.',
    passiveName: 'Batwing Shield',
    passiveDescription: 'Deflects one clean hit during burst windows and keeps aggressive dashes alive.',
    abilityName: 'Flip Boost',
    abilityDescription: 'Instant surge of speed that converts into a dodge-safe burst.',
    ultimateName: 'Razr Rush',
    ultimateDescription: 'Unleashes a high-speed combo run with stacked mobility bonuses.',
    abilities: [
      {
        id: 'flip_boost',
        name: 'Flip Boost',
        type: 'active',
        description: 'Instant surge of speed.',
        gameplayEffect: 'Burst speed opener.',
      },
      {
        id: 'hinge_dash',
        name: 'Hinge Dash',
        type: 'active',
        description: 'Dashes under low obstacles.',
        gameplayEffect: 'Short mobility spike with invulnerability frames.',
      },
      {
        id: 'batwing_shield',
        name: 'Batwing Shield',
        type: 'defensive',
        description: 'Brief shield that deflects one hit.',
        gameplayEffect: 'One-hit protection during committed runs.',
      },
      {
        id: 'razr_rush',
        name: 'Razr Rush',
        type: 'ultimate',
        description: 'High-speed combo run with massive bonuses.',
        gameplayEffect: 'Multi-dash finisher with amplified combo flow.',
      },
    ],
    flavor: 'Pure arcade velocity in foldable form.',
    stats: { speed: 10, agility: 10, power: 7, durability: 7, tech: 8 },
    gameplay: {
      baseSpeedMultiplier: 1.08,
      dashRecharge: 0.3,
      dashBurstMultiplier: 1.28,
      scoreMultiplier: 1.05,
      abilityCooldown: 11,
      maxBatteryBonus: 0,
      triviaBonus: 0.0,
      sidekickCoreAffinity: 1.0,
    },
  },
  {
    id: 'pixel',
    brand: 'Pixel',
    series: 'Pixel Series',
    name: 'Pixel Scout',
    title: 'See every possibility.',
    role: 'Adaptive / Utility',
    rarity: 'Legendary',
    tagline: 'See every possibility.',
    lore: 'An adaptive AI scout that predicts danger and turns information into speed.',
    accent: '#7B6CFF',
    secondary: '#FFFFFF',
    armor: '#E8EDF6',
    icon: '◎',
    cardImage: '/levelup/runner/cards/pixel_scout_card.png',
    signature: 'Clean white armor, camera-bar visor, subtle multi-color lights, helper drones.',
    passiveName: 'Photon Dash',
    passiveDescription: 'Short dash windows gain invulnerability and route-read clarity.',
    abilityName: 'Drone Swarm',
    abilityDescription: 'Sends drones to scan the track and auto-collect distant rewards.',
    ultimateName: 'Google Lens',
    ultimateDescription: 'Scans ahead, reveals everything, and exposes boss weak points.',
    abilities: [
      {
        id: 'ai_pathfind',
        name: 'AI Pathfind',
        type: 'passive',
        description: 'Reveals optimal path and secrets.',
        gameplayEffect: 'Pathfinding lift with stronger trivia routing.',
      },
      {
        id: 'drone_swarm',
        name: 'Drone Swarm',
        type: 'active',
        description: 'Collects distant coins automatically.',
        gameplayEffect: 'Track reveal plus remote collection.',
      },
      {
        id: 'photon_dash',
        name: 'Photon Dash',
        type: 'defensive',
        description: 'Short dash with invulnerability frames.',
        gameplayEffect: 'Safe repositioning through pressure lanes.',
      },
      {
        id: 'google_lens',
        name: 'Google Lens',
        type: 'ultimate',
        description: 'Scans ahead and reveals everything.',
        gameplayEffect: 'Enhanced pathfinding and crit bonus.',
      },
    ],
    flavor: 'Feels like the lane itself whispered the answer first.',
    stats: { speed: 8, agility: 9, power: 7, durability: 7, tech: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.02,
      dashRecharge: 0.2,
      dashBurstMultiplier: 1.15,
      scoreMultiplier: 1.1,
      abilityCooldown: 10,
      maxBatteryBonus: 5,
      triviaBonus: 0.18,
      sidekickCoreAffinity: 1.1,
    },
  },
  {
    id: 'sidekick_core',
    brand: 'T-Mobile',
    series: 'Reimagined Sidekick Command System',
    name: 'Sidekick Core',
    title: 'Legendary Support Intelligence',
    role: 'Support / Command',
    rarity: 'Legendary',
    tagline: 'Legendary Support Intelligence',
    lore: 'A legendary support intelligence projected from a reimagined Sidekick command system. Sidekick Core links your run, boosts your momentum, and keeps you in the game when it matters most.',
    accent: '#E20074',
    secondary: '#FF8CC6',
    armor: '#290019',
    icon: '✦',
    cardImage: '/levelup/runner/cards/tmobile_sidekick_core_command_card_v2.png',
    signature: 'A reimagined Sidekick command unit that projects Sidekick Core as a holographic support intelligence.',
    supportOnly: true,
    passiveName: 'Un-Carrier Link',
    passiveDescription: 'Improves cooldowns, team synergy, and trivia rewards slightly across the run.',
    abilityName: 'Sidekick Sync',
    abilityDescription: 'Pulls in nearby rewards, reveals the safest lane, and adds a brief score multiplier.',
    ultimateName: 'Magenta Overdrive',
    ultimateDescription: 'Projects a command grid over the whole track, slowing time and amplifying the active runner.',
    abilities: [
      {
        id: 'uncarrier_link',
        name: 'Un-Carrier Link',
        type: 'passive',
        description: 'Improves cooldowns, team synergy, and trivia rewards slightly across the run.',
        gameplayEffect: 'Global support aura.',
      },
      {
        id: 'sidekick_sync',
        name: 'Sidekick Sync',
        type: 'active',
        description: 'Pulls in nearby rewards, reveals the safest lane, and adds a brief score multiplier.',
        gameplayEffect: 'Magnet plus path reveal plus scoring buff.',
      },
      {
        id: 'signal_save',
        name: 'Signal Save',
        type: 'defensive',
        description: 'Prevents one lethal crash when fully charged.',
        gameplayEffect: 'One emergency save per charged run.',
      },
      {
        id: 'magenta_overdrive',
        name: 'Magenta Overdrive',
        type: 'ultimate',
        description: 'Projects a command grid over the whole track, slowing time slightly and amplifying the current run.',
        gameplayEffect: 'Time slow, wide magnet, hazard highlight, and boosted current character identity.',
      },
    ],
    flavor: 'Stay connected. Stay in control. I have got you.',
    stats: { speed: 8, agility: 9, power: 6, durability: 9, tech: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.03,
      dashRecharge: 0.24,
      dashBurstMultiplier: 1.18,
      scoreMultiplier: 1.14,
      abilityCooldown: 12,
      maxBatteryBonus: 10,
      triviaBonus: 0.12,
      sidekickCoreAffinity: 1.4,
    },
  },
];

export const CHARACTER_MAP: Record<CharacterId, CharacterDefinition> = CHARACTERS.reduce((acc, character) => {
  acc[character.id] = character;
  return acc;
}, {} as Record<CharacterId, CharacterDefinition>);

export const PLAYABLE_CHARACTERS = CHARACTERS.filter((character) => !character.supportOnly);
export const SIDEKICK_CORE = CHARACTER_MAP.sidekick_core;

export const RUNNER_BOSSES: BossDefinition[] = [
  {
    id: 'atlas_backbone',
    name: 'Atlas Backbone',
    title: 'Carrier Crusher',
    threatLevel: 'MiniBoss',
    fantasy: 'A colossal infrastructure brute made from armored racks, tower struts, and overloaded backbone cables.',
    visualTheme: 'Iron-magenta spine columns, antenna ribs, and pulsing backbone conduits.',
    mechanics: [
      'Drops tower walls into wide lanes',
      'Forces narrow routing windows',
      'Builds stacked barrier corridors',
    ],
    counterplay: [
      'Use burst mobility to break the tower rhythm',
      'Take the narrow lane early instead of drifting late',
      'Lean on Sidekick route reads when the track compresses',
    ],
    milestoneLevel: 1,
  },
  {
    id: 'redline_commander',
    name: 'Redline Commander',
    title: 'Missile Marshal',
    threatLevel: 'MiniBoss',
    fantasy: 'A ruthless speed-war mech that commands missile volleys and punishes indecisive movement.',
    visualTheme: 'Burnt crimson armor, white heat turbines, and warning-chevron missile racks.',
    mechanics: ['Launches missile waves', 'Punishes center-lane camping', 'Creates heat-check dash windows'],
    counterplay: ['Save dash for missile breaks', 'Use scanner or support hints to pre-read fire lines', 'Punish volleys with precision abilities'],
    milestoneLevel: 2,
  },
  {
    id: 'patchwork_hydra',
    name: 'Patchwork Hydra',
    title: 'False Choice Swarm',
    threatLevel: 'MiniBoss',
    fantasy: 'A stitched-together alert beast built from fake promos, cloned offers, and fractured screens.',
    visualTheme: 'Mismatched chrome heads, magenta-red warning eyes, and cracked promo tiles.',
    mechanics: ['Creates fake safe paths', 'Floods lanes with mixed hazard clusters', 'Baits pickups near danger'],
    counterplay: ['Trust the cleanest lane, not the loudest one', 'Use Sidekick intel to confirm the real opening', 'Clear heads with wide attacks before committing'],
    milestoneLevel: 3,
  },
  {
    id: 'throttle_maw',
    name: 'Throttle Maw',
    title: 'Velocity Hunter',
    threatLevel: 'Boss',
    fantasy: 'A predatory engine beast that eats slow decisions and forces the run into savage tempo shifts.',
    visualTheme: 'Jet-black jaw plating, magenta exhaust scars, and cyan overclock veins.',
    mechanics: ['Speeds up hazard cadence', 'Chains stagger traps', 'Punishes delayed lane swaps'],
    counterplay: ['Keep momentum high', 'Use overclock and dash intentionally', 'Avoid panic cuts once the cadence snaps faster'],
    milestoneLevel: 4,
  },
  {
    id: 'dead_zone_titan',
    name: 'Dead Zone Titan',
    title: 'Signal Eater',
    threatLevel: 'FinalBoss',
    fantasy: 'A corrupted network-devouring mech built from static, broken bars, glitch plates, and dropped-call storms.',
    visualTheme: 'Black-violet static armor, red warning bars, distortion halo, shattered signal icons.',
    mechanics: [
      'Blocks lanes with static walls',
      'Sends out jamming pulses',
      'Creates fake safe paths',
      'Suppresses coin magnet radius',
      'Summons glitch drones',
    ],
    counterplay: [
      'Use scan and reveal skills to expose the real lane',
      'Time dash or shield through pulse windows',
      'Answer boss trivia correctly for bonus damage or protection',
      'Use Sidekick Core ultimate to break the jam phase',
    ],
    milestoneLevel: 5,
  },
];

export const PRIMARY_BOSS = RUNNER_BOSSES.find((boss) => boss.id === 'dead_zone_titan') ?? RUNNER_BOSSES[0];
export const getBossDefinition = (bossId: string | null | undefined) => RUNNER_BOSSES.find((boss) => boss.id === bossId) ?? null;
export const getBossForLevel = (level: number) => RUNNER_BOSSES.find((boss) => boss.milestoneLevel === level) ?? null;
export const getBossForProgress = (level: number) =>
  RUNNER_BOSSES
    .filter((boss) => boss.milestoneLevel <= level)
    .sort((left, right) => right.milestoneLevel - left.milestoneLevel)[0] ?? null;

const LEGACY_TRIVIA: Array<Pick<TriviaQuestion, 'question' | 'options' | 'correctIndex' | 'explanation'>> = [
  {
    question: "Which premium plan offers a 'Yearly Upgrade' benefit and satellite-based service?",
    options: ['Experience Beyond', 'Experience More', 'Essentials Saver', 'Essentials Choice'],
    correctIndex: 0,
    explanation: "Experience Beyond is T-Mobile's top-tier plan featuring yearly upgrades and satellite service integration.",
  },
  {
    question: "What does the T-Mobile '5-Year Price Guarantee' promise to new and existing customers?",
    options: ['Free phones for 5 years', 'No plan price increases for 5 years', '50% off all lines', 'Free Netflix for 5 years'],
    correctIndex: 1,
    explanation: "The 5-Year Price Guarantee ensures that the price of your talk, text, and data won't change for 5 years.",
  },
  {
    question: 'Which of these streaming services can be included with qualifying T-Mobile plans?',
    options: ['Netflix, Hulu, and Apple TV+', 'Only Netflix', 'Disney+ and Max', 'Paramount+ only'],
    correctIndex: 0,
    explanation: 'Many T-Mobile premium plans include Netflix on Us, Hulu on Us, and Apple TV+ for a low monthly cost or even free.',
  },
  {
    question: "What is the benefit of '3rd Line Free' promotions on T-Mobile family plans?",
    options: ['The 3rd line pays double', 'The 3rd line is free via monthly bill credits', 'Only the 3rd line gets 5G', 'A free tablet with the 3rd line'],
    correctIndex: 1,
    explanation: 'T-Mobile frequently offers a 3rd line for free when you switch or add lines, creating massive family value.',
  },
  {
    question: "What does '5G UC' stand for on the T-Mobile network?",
    options: ['5G Ultra Capacity', '5G Universal Coverage', '5G Unlimited Connection', '5G Under Core'],
    correctIndex: 0,
    explanation: '5G UC (Ultra Capacity) provides significantly faster speeds and better performance in densely populated areas.',
  },
  {
    question: "What is the primary benefit of 'Experience More' compared to Essentials plans?",
    options: ['No streaming perks', 'Unlimited Premium Data and higher hotspot limits', 'Only for 55+ customers', 'Requires a 2-year contract'],
    correctIndex: 1,
    explanation: "Experience More provides Unlimited Premium Data that won't slow down based on how much you use, plus more hotspot data.",
  },
  {
    question: "What is the 'Un-carrier' approach to customer pain points?",
    options: ['Charging more for speed', 'Fixing industry issues like contracts and hidden fees', 'Requiring paper billing', 'Only selling one brand of phone'],
    correctIndex: 1,
    explanation: "T-Mobile's Un-carrier identity is built on eliminating traditional wireless industry frustrations.",
  },
  {
    question: 'How can a T-Mobile Sales Advocate best ease friction for a stressed customer?',
    options: ['By talking faster', 'By simplifying plan choices and highlighting total value', 'By ignoring their questions', 'By reading the fine print only'],
    correctIndex: 1,
    explanation: 'Empathy and simplification are key to the T-Mobile experience, ensuring customers feel confident in their choice.',
  },
  {
    question: "Which T-Mobile app provides customers with free weekly 'Thank You' gifts and deals?",
    options: ['T-Life (T-Mobile Tuesdays)', 'T-Mobile Billing', 'Network Test', 'Device Repair'],
    correctIndex: 0,
    explanation: 'T-Life (formerly T-Mobile Tuesdays) is where customers get exclusive deals and free items every week.',
  },
  {
    question: "What is 'Simplified Value' in the context of T-Mobile Essentials plans?",
    options: ['Paying for every individual megabyte', 'A no-frills plan focused on basic unlimited needs', 'A plan with no data included', 'A plan that only works at night'],
    correctIndex: 1,
    explanation: 'Essentials plans focus on providing the core Un-carrier benefits and unlimited talk, text, and data at the lowest price.',
  },
  {
    question: "What is the T-Mobile 'Keep & Switch' program designed to do?",
    options: ['Force you to keep your old carrier', 'Pay off your eligible device up to $800 to help you switch', 'Make you sign a new contract', 'Keep your data speed throttled'],
    correctIndex: 1,
    explanation: "Keep & Switch helps customers escape the trap of phone financing with other carriers by paying off their eligible device up to $800.",
  },
  {
    question: "What feature does T-Mobile's 'Scam Shield' offer?",
    options: ['Sends scam texts to friends', 'Automatically blocks likely scam callers at the network level', 'Charges a fee for blocking calls', 'Blocks all unknown numbers entirely'],
    correctIndex: 1,
    explanation: 'Scam Shield is a suite of tools offered for free to customers to identify and block annoying and dangerous scam calls.',
  },
  {
    question: 'Which team handles elite, hyper-localized customer service at T-Mobile?',
    options: ['The Team of Experts (TEX)', 'The Call Center Central', 'The Support Bot', 'The Network Team'],
    correctIndex: 0,
    explanation: 'T-Mobile pioneered the Team of Experts model, giving customers a dedicated, localized team rather than an automated phone maze.',
  },
  {
    question: "What was T-Mobile's famous 'Binge On' move (which led to today's streaming freedom)?",
    options: ['Charging for video streaming', 'Allowing customers to stream video without using their high-speed data', 'Banning video streaming', 'Throttling all video to 144p'],
    correctIndex: 1,
    explanation: 'Binge On was a massive Un-carrier move that freed customers from worrying about hitting data caps while watching video.',
  },
  {
    question: "How long does the Experience Beyond 'Yearly Upgrade' status require you to wait before upgrading?",
    options: ['2 Years', '1 Year (as long as the phone is half paid off)', '3 Years', '6 Months'],
    correctIndex: 1,
    explanation: 'With the Yearly Upgrade benefit on premium plans, customers can get the same phone deals as new customers every year.',
  },
  {
    question: "What is 'T-Mobile Home Internet' primarily powered by?",
    options: ['Fiber optic cables to the home', 'Dial-up', 'The T-Mobile 5G Network', 'Satellite dishes'],
    correctIndex: 2,
    explanation: 'T-Mobile 5G Home Internet leverages the massive capacity of the 5G network to deliver broadband speeds via a simple gateway.',
  },
  {
    question: "Which of these is considered an 'Un-carrier' principle?",
    options: ['Hidden limits', 'Customer first, always', 'Rigorous contracts', 'Data throttling for all'],
    correctIndex: 1,
    explanation: 'The core of the Un-carrier philosophy is challenging industry norms to put the customer first, treating them right.',
  },
  {
    question: "What happens to the price of a customer's plan when they look at their bill on a premium 'Taxes & Fees Included' plan?",
    options: ['It fluctuates every month', 'It increases due to local taxes', 'What you see is what you pay', 'It includes hidden surcharges'],
    correctIndex: 2,
    explanation: 'For plans like Experience More, T-Mobile covers the taxes and fees, so your bill is exactly the plan price.',
  },
  {
    question: 'Which coverage benefit is often included for T-Mobile customers traveling internationally?',
    options: ['No service abroad', 'Free unlimited 2G data and texting in 215+ countries', 'An instant $100 roaming charge', 'Data is charged by the megabyte'],
    correctIndex: 1,
    explanation: 'T-Mobile fundamentally changed international travel by offering free texting and basic data abroad on qualifying plans.',
  },
  {
    question: 'When a customer brings their own device (BYOD) to T-Mobile, what is their biggest advantage?',
    options: ['They lose their phone number', 'No activation fees on the web and cheaper monthly plan options', 'They must buy a new charger', 'They get worse network priority'],
    correctIndex: 1,
    explanation: 'BYOD makes it incredibly easy and frictionless for a customer to switch without the financial burden of financing a new device.',
  },
  {
    question: 'What makes T-Mobile 5G unique compared to solely relying on mmWave technology?',
    options: ['It only works outdoors', 'It relies entirely on satellites', "It uses a dedicated 'Layer Cake' approach combining low, mid, and high bands", 'It is slower than 4G LTE'],
    correctIndex: 2,
    explanation: "T-Mobile uses a 'layer cake' strategy: Low-band for broad coverage, Mid-band (Ultra Capacity) for speed, and High-band (mmWave) for density.",
  },
  {
    question: 'Why should an employee recommend T-Mobile Tuesdays (T-Life)?',
    options: ['It costs extra each month', 'It forces customers to buy more data', 'It builds brand loyalty by showing appreciation with real perks and freebies', 'It only works for new customers'],
    correctIndex: 2,
    explanation: 'T-Life rewards customers simply for being with T-Mobile, increasing retention and overall satisfaction.',
  },
  {
    question: "What defines the 'Carrier' mentality that T-Mobile opposes?",
    options: ['Treating the customer fairly', 'Locking customers in with complex rules, exploding bills, and poor service', 'Lowering prices over time', 'Offering free device upgrades'],
    correctIndex: 1,
    explanation: 'The traditional carrier model relies on making it difficult for customers to leave and difficult to understand their bills.',
  },
  {
    question: "How does T-Mobile treat 'Simple Global' data roaming on its premium plans?",
    options: ['It slows down to dial-up speeds everywhere', 'You get a bucket of high-speed data (like 5GB) in 215+ countries, then basic speeds', "It doesn't work in Europe", 'It requires a physical SIM swap'],
    correctIndex: 1,
    explanation: 'Premium plans like Experience Beyond include high-speed data buckets abroad, eliminating the anxiety of international roaming.',
  },
  {
    question: "What is 'JUMP! On Demand'?",
    options: ['A trampoline park discount', 'An older program that allows customers to upgrade their leased device rapidly', 'A new 5G speed tier', 'A premium streaming service'],
    correctIndex: 1,
    explanation: 'JUMP! On Demand was one of the first programs to let customers constantly have the latest smartphone via a lease agreement.',
  },
  {
    question: "HESITATION: 'I like my current carrier, I don't see why I should go through the hassle of switching.'",
    options: ['Tell them they are wrong', 'Offer an incredible phone deal, lower monthly costs, and VIP perks like Netflix on Us to show total value', 'Focus only on network speed', 'Tell them switching takes weeks'],
    correctIndex: 1,
    explanation: "Overcome complacency by uncovering pain points they've accepted as 'normal' and highlighting immediate, tangible value.",
  },
  {
    question: "HESITATION: 'I am worried about coverage outside the city.'",
    options: ["Assure them it's fine, even if you don't know", 'Say we only cover cities', 'Explain our 5G layer-cake strategy and offer a 3-month free Network Pass to test it themselves', 'Blame the terrain'],
    correctIndex: 2,
    explanation: 'Network Pass is the ultimate trump card for coverage objections. It lets them see the network power for free with zero risk.',
  },
  {
    question: "HESITATION: 'I owe $600 on my phone with Verizon right now.'",
    options: ['Tell them to wait a year', 'Show them how Keep & Switch will pay off up to $800 of their eligible device to escape the trap', 'Ask them to take out a loan', 'Tell them to sell their phone online'],
    correctIndex: 1,
    explanation: "Keep & Switch completely removes the friction of being financially locked into another carrier's device.",
  },
  {
    question: "HESITATION: 'T-Mobile's premium plan is slightly more expensive per line than my prepaid setup.'",
    options: ['Give up on the sale', 'Tell them prepaid is garbage', 'Calculate total value, including included taxes and fees, Netflix, Apple TV+, and AAA, showing them they save money overall', 'Offer an unauthorized discount'],
    correctIndex: 2,
    explanation: "Prepaid looks cheap until you calculate the missing perks and add taxes. Uncover the 'Total Cost of Ownership'.",
  },
  {
    question: "HESITATION: 'I travel to Europe a lot, and data roaming is too expensive.'",
    options: ['Tell them to buy a new phone over there', 'Explain that Simple Global includes free texting and data in 215+ countries without needing a new SIM', 'Say they should use hotel Wi-Fi only', 'Offer them an expensive daily pass'],
    correctIndex: 1,
    explanation: 'Simple Global obliterates roaming hesitation by giving peace of mind immediately when touching down internationally.',
  },
  {
    question: "HESITATION: 'I do not want to buy a new phone, I like the one I have.'",
    options: ['Refuse to activate service', 'Tell them their phone is obsolete', 'Welcome them with Bring Your Own Device (BYOD) and check if they qualify for a Keep & Switch rebate', 'Force them into a lease'],
    correctIndex: 2,
    explanation: 'BYOD is the lowest-friction way to acquire a customer. Always embrace a customer who loves their current device.',
  },
  {
    question: "HESITATION: 'Is T-Mobile Home Internet really fast enough for gaming and streaming?'",
    options: ["Say it's better than fiber", 'Ignore the question', 'Explain it is powered by 5G and offer the 15-day Test Drive so they can prove it in their own home risk-free', 'Tell them to keep their cable'],
    correctIndex: 2,
    explanation: 'The 15-Day Test Drive overcomes all Home Internet performance hesitations by letting the customer be the judge.',
  },
  {
    question: "HESITATION: 'I hate dealing with complicated bills that change every month.'",
    options: ['Tell them to set up autopay and look away', 'Agree that billing is confusing', 'Highlight that on our premium plans, taxes and fees are already included, so the price they see is the exact price they pay', 'Say the government changes the taxes'],
    correctIndex: 2,
    explanation: "Taxes and fees included is a massive differentiator that directly addresses the pain point of 'bill shock'.",
  },
  {
    question: "HESITATION: 'I am afraid I'll hate the service after I switch.'",
    options: ['Make them sign a 2-year contract just in case', "Say 'too bad'", "Remind them T-Mobile has zero annual service contracts and they aren't locked in", 'Offer a refund on the spot'],
    correctIndex: 2,
    explanation: "Reminding a customer that they aren't trapped by a contract relieves massive anxiety at the point of sale.",
  },
  {
    question: "HESITATION: 'I don't know how to set up my new phone or move my photos.'",
    options: ['Hand them the box and say good luck', 'Tell them to go to the Apple or Samsung store', 'Assure them you will provide full VIP onboarding and handle the data transfer before they even leave the store', 'Tell them their kids can do it'],
    correctIndex: 2,
    explanation: 'Offering full onboarding eliminates the technical friction and fear of losing precious memories during an upgrade.',
  },
  {
    question: "HESITATION: 'The trade-in deals always seem like a scam where I get nothing.'",
    options: ['Agree with them', 'Walk them through the easy trade-in process, showing exactly what their device is worth today and explaining the promotional bill credits clearly', 'Tell them to sell it on Craigslist instead', 'Deflect to another topic'],
    correctIndex: 1,
    explanation: 'Transparency is key. Breaking down exactly how the promotional credits work builds trust right when they expect a trick.',
  },
  {
    question: "HESITATION: 'There's a lot of fine print, right?'",
    options: ['Tell them not to read it', 'Hand them a magnifying glass', 'Emphasize our Un-carrier philosophy: no hidden fees, no annual service contracts, and what you see is what you pay', 'Offer to skip the paperwork'],
    correctIndex: 2,
    explanation: 'Leaning on the Un-carrier identity reassures them that T-Mobile structurally operates differently than the competitors.',
  },
  {
    question: "HESITATION: 'I need to talk to my spouse before I commit.'",
    options: ["Tell them their spouse will be fine with it", 'Let them leave without any materials', 'Text them a personalized quote link with all the savings clearly mapped out, so they can easily review it together at home', 'Pressure them to sign immediately'],
    correctIndex: 2,
    explanation: 'Providing a clear, persistent quote empowers them to champion the deal at home without feeling high-pressure sales tactics.',
  },
  {
    question: "HESITATION: 'I get lots of scam calls, how does T-Mobile help?'",
    options: ['Tell them to stop answering the phone', "Say it's a global issue nobody can fix", 'Show them the free Scam Shield app that blocks millions of scam calls at the network level', 'Offer them a paid third-party app'],
    correctIndex: 2,
    explanation: 'Scam Shield is an incredible free tool that directly targets a massive consumer frustration.',
  },
  {
    question: "HESITATION: 'I am worried about losing my number if I switch.'",
    options: ['Tell them a new number is a fresh start', 'Say the system sometimes loses numbers', 'Explain the smooth porting process that safely brings their number over, often within minutes', 'Refuse to port their number'],
    correctIndex: 2,
    explanation: 'Porting fear is common. Reassuring the customer of the speed and safety of the system closes the door on this hesitation.',
  },
] as const;

const ADVANCED_TRIVIA: TriviaQuestion[] = [
  {
    id: 'advanced-discovery-1',
    question: 'A customer says “I just want the cheapest option.” What is the strongest next move?',
    options: [
      'Immediately quote the lowest plan and stop there',
      'Ask one discovery question about usage so value does not get mismatched to need',
      'Push the most expensive plan to anchor them high',
      'Switch the conversation to accessories',
    ],
    correctIndex: 1,
    explanation: '“Cheapest” often means “lowest risk.” A single discovery question prevents under-selling or putting the customer in the wrong plan.',
    difficulty: 2,
    category: 'discovery',
  },
  {
    id: 'advanced-discovery-2',
    question: 'Which discovery question best opens the door to a stronger bundle conversation?',
    options: [
      'What color phone do you want?',
      'How many lines, devices, or internet needs are in your household today?',
      'Do you prefer paper or email receipts?',
      'Would you like a case with that?',
    ],
    correctIndex: 1,
    explanation: 'Household scope is the hinge that opens lines, internet, wearable, and entertainment value all at once.',
    difficulty: 2,
    category: 'bundles',
  },
  {
    id: 'advanced-sales-1',
    question: 'When a customer becomes overwhelmed by too many options, what usually closes the sale faster?',
    options: [
      'Adding even more options to prove flexibility',
      'Narrowing to a confident top-two recommendation with a clear “why”',
      'Reading every available promotion out loud',
      'Letting them browse silently without guidance',
    ],
    correctIndex: 1,
    explanation: 'Confident curation lowers friction. Great reps reduce complexity instead of decorating it.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-sales-2',
    question: 'A shopper cares most about photos, intelligent tools, and a “smart” experience. Which device direction best fits that language?',
    options: ['Pixel-style recommendation', 'A random entry device', 'Only a hotspot line', 'A tablet bundle first'],
    correctIndex: 0,
    explanation: 'Match the device story to the customer story. When AI, camera, and “smart help” language shows up, Pixel framing fits naturally.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-sales-3',
    question: 'A customer wants premium build quality and a polished ecosystem feeling. Which archetype should rise first?',
    options: ['TCL-style value pick', 'Apple-style recommendation', 'Only prepaid', 'Home Internet before phones'],
    correctIndex: 1,
    explanation: 'Premium feel, polish, and ecosystem language are usually strong signals for an Apple-led recommendation.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-sales-4',
    question: 'A customer says they multitask, take notes constantly, and want a “do-everything” phone. Which direction is strongest?',
    options: ['Samsung-style flagship recommendation', 'Flip immediately to accessories only', 'A single-line watch plan', 'Avoid recommending a device at all'],
    correctIndex: 0,
    explanation: 'When the customer describes productivity, power, and feature depth, a Samsung flagship story usually lands well.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-sales-5',
    question: 'A customer wants the “best value” with a large screen and less payment stress. Which framing is strongest?',
    options: ['Lead with a TCL-style value story', 'Lead with the priciest model possible', 'Avoid talking about budget', 'Say every phone is basically the same'],
    correctIndex: 0,
    explanation: 'Value-plus-display language is a natural opening for TCL-style positioning.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-sales-6',
    question: 'A customer wants something sleek, fast, and a little different. Which archetype matches best?',
    options: ['Motorola / foldable speed story', 'Only home internet', 'A fixed wireless gateway first', 'No device recommendation'],
    correctIndex: 0,
    explanation: 'Reps win when they match vibe as well as specs. Distinctive, fast, and stylish cues fit Motorola’s lane well.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-objection-1',
    question: 'A customer says, “I need time to think.” What keeps the sale alive without feeling pushy?',
    options: [
      'Tell them the deal expires in ten minutes no matter what',
      'Send a simple recap with savings, trade details, and next-step clarity',
      'Call them repeatedly until they answer',
      'End the conversation with no follow-up option',
    ],
    correctIndex: 1,
    explanation: 'Good follow-up lowers mental load. A clean recap keeps momentum without pressure.',
    difficulty: 2,
    category: 'objection',
  },
  {
    id: 'advanced-objection-2',
    question: 'A customer focuses only on monthly cost. What do top reps do next?',
    options: [
      'Ignore value and talk only about color options',
      'Translate perks, taxes, switching help, and device costs into total monthly reality',
      'Refuse to discuss budget',
      'Promise a rate you cannot verify',
    ],
    correctIndex: 1,
    explanation: 'Monthly sticker price without context hides the real story. Total value selling closes the gap.',
    difficulty: 3,
    category: 'sales',
  },
  {
    id: 'advanced-objection-3',
    question: 'A shopper is loyal to another carrier but seems curious. What is the strongest low-friction move?',
    options: [
      'Attack the other carrier personally',
      'Invite them into a risk-reduced test or switching path with simple proof points',
      'Tell them to come back next year',
      'Skip discovery and just print a receipt',
    ],
    correctIndex: 1,
    explanation: 'Curious customers rarely need pressure. They need proof, simplicity, and a low-friction next step.',
    difficulty: 3,
    category: 'objection',
  },
  {
    id: 'advanced-bundle-1',
    question: 'A family asks about phones for three lines, streaming value, and internet at home. What sales posture usually wins?',
    options: [
      'Quote each item separately with no story',
      'Build one connected household solution and show the stacked value clearly',
      'Only discuss one phone and ignore the rest',
      'Recommend they split services across multiple carriers',
    ],
    correctIndex: 1,
    explanation: 'Household selling is orchestration. The more clearly the bundle story hangs together, the easier the yes becomes.',
    difficulty: 3,
    category: 'bundles',
  },
  {
    id: 'advanced-bundle-2',
    question: 'What is the biggest mistake when bundling several services in one conversation?',
    options: [
      'Connecting the recommendation back to their goals',
      'Piling on items without a clear reason for each one',
      'Summarizing savings cleanly',
      'Checking whether every item solves a real need',
    ],
    correctIndex: 1,
    explanation: 'Bundles should feel elegant, not stuffed. Every line item needs a purpose the customer can repeat later.',
    difficulty: 3,
    category: 'bundles',
  },
  {
    id: 'advanced-service-1',
    question: 'When helping someone port their number, what feeling are you trying to create most of all?',
    options: ['Urgency without explanation', 'Confidence that the process is safe and guided', 'Confusion so they stop asking', 'Dependence on guesswork'],
    correctIndex: 1,
    explanation: 'Port anxiety is emotional before it is technical. Guided confidence keeps the sale steady.',
    difficulty: 2,
    category: 'service',
  },
  {
    id: 'advanced-service-2',
    question: 'Which onboarding promise creates the most trust after a device upgrade?',
    options: ['We will get you out fast, even if setup is incomplete', 'We will help you leave with your essentials transferred and confidence to use the phone', 'There is no support after purchase', 'You should read forums later'],
    correctIndex: 1,
    explanation: 'People do not buy only the phone. They buy the confidence that life will work on the new phone right away.',
    difficulty: 2,
    category: 'service',
  },
  {
    id: 'advanced-sales-7',
    question: 'A rep has explained features for five straight minutes and the customer looks glazed over. What is the best rescue?',
    options: ['Double the pace and add more detail', 'Pause and ask which one or two outcomes matter most to them', 'Switch to reading legal disclaimers', 'Start over from the beginning'],
    correctIndex: 1,
    explanation: 'When attention drops, return to outcomes. Customers buy answers to priorities, not feature avalanches.',
    difficulty: 3,
    category: 'discovery',
  },
  {
    id: 'advanced-sales-8',
    question: 'Which closing question is strongest after a customer has clearly reacted well to the recommendation?',
    options: ['Do you maybe sorta want this one?', 'Would you like me to set this up with your number and trade-in now?', 'Should I list every other option again?', 'Want to decide later with no next step?'],
    correctIndex: 1,
    explanation: 'Great closes feel natural, confident, and operational. They move the customer into the next easy action.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-sales-9',
    question: 'A customer says, “That perk is nice, but I do not use it.” What is the right move?',
    options: ['Keep repeating the same perk louder', 'Shift the value story to benefits they actually care about', 'Drop the sale completely', 'Argue that they are wrong about themselves'],
    correctIndex: 1,
    explanation: 'Relevant value converts. Irrelevant value is wallpaper.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-objection-4',
    question: 'A customer worries that switching sounds like a hassle because their family is busy. What response is strongest?',
    options: ['Tell them busy people should not switch', 'Position the process as guided, supported, and designed to remove busywork from them', 'Ask them to do everything at home alone', 'Say hassle is normal in wireless'],
    correctIndex: 1,
    explanation: 'When the real objection is time and energy, the answer is friction removal.',
    difficulty: 3,
    category: 'objection',
  },
  {
    id: 'advanced-sales-10',
    question: 'Which habit most often separates a good sales conversation from a great one?',
    options: ['Feature dumping', 'Linking every recommendation back to a customer-stated need', 'Talking over objections', 'Skipping recap'],
    correctIndex: 1,
    explanation: 'The strongest sales conversations feel customized because they literally are.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-bundles-3',
    question: 'A customer is interested in Home Internet but is still unsure. What pushes confidence without pressure?',
    options: ['Telling them every home is exactly the same', 'Offering a proof-oriented trial or test-drive mindset', 'Avoiding performance discussion entirely', 'Guaranteeing impossible speed numbers'],
    correctIndex: 1,
    explanation: 'When performance anxiety is the barrier, proof beats persuasion.',
    difficulty: 3,
    category: 'bundles',
  },
  {
    id: 'advanced-discovery-3',
    question: 'A customer asks, “Which phone should I get?” What is the strongest first answer?',
    options: ['The most expensive one, obviously', 'Tell me what matters most: camera, battery, ecosystem, value, or something else', 'Any phone is fine', 'Read five random spec sheets'],
    correctIndex: 1,
    explanation: 'The right recommendation starts with a filter, not a guess.',
    difficulty: 1,
    category: 'discovery',
  },
  {
    id: 'advanced-sales-11',
    question: 'When should a rep introduce accessories or add-ons most effectively?',
    options: ['Before needs are clear', 'After the core solution is trusted and the add-on clearly protects or improves that choice', 'Before greeting the customer', 'Only after the customer leaves'],
    correctIndex: 1,
    explanation: 'Add-ons land best when they feel like protection or enhancement, not detours.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-sales-12',
    question: 'Which statement best describes a high-trust quote recap?',
    options: ['Dense, fast, and hard to repeat later', 'Clear on monthly reality, trade terms, perks, and what happens next', 'Only focused on the flashiest promotion', 'Vague on purpose'],
    correctIndex: 1,
    explanation: 'If the customer cannot repeat your offer simply, the close is still fragile.',
    difficulty: 3,
    category: 'sales',
  },
  {
    id: 'advanced-objection-5',
    question: 'A customer keeps circling back to price even after value was shown. What might be the hidden issue?',
    options: ['They hate all wireless stores', 'They may still feel uncertain, rushed, or unconvinced on fit', 'They probably did not hear anything you said', 'There is no issue at all'],
    correctIndex: 1,
    explanation: 'Price is often the surface objection sitting on top of confidence, fit, or timing.',
    difficulty: 4,
    category: 'objection',
  },
  {
    id: 'advanced-sales-13',
    question: 'In a strong recommendation, what should come right after “Here is what I’d do if I were in your shoes”?',
    options: ['A concrete why tied to their needs', 'A random joke', 'An unrelated accessory pitch', 'Nothing at all'],
    correctIndex: 0,
    explanation: 'Authority without reasoning feels pushy. Authority with relevant reasoning feels helpful.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-service-3',
    question: 'What keeps a customer from feeling buyer’s remorse right after they say yes?',
    options: ['Silence', 'A calm confirmation of what they chose, why it fits, and what happens next', 'A brand-new upsell immediately', 'A technical lecture'],
    correctIndex: 1,
    explanation: 'The moment right after yes is when confidence either settles in or leaks out.',
    difficulty: 3,
    category: 'service',
  },
  {
    id: 'advanced-bundle-4',
    question: 'What is the smartest way to use a family decision-maker who needs to sell the idea at home?',
    options: ['Push them to decide before they leave', 'Equip them with a crisp summary they can champion later', 'Tell them not to mention cost', 'Give them only verbal details'],
    correctIndex: 1,
    explanation: 'Great reps create internal advocates, not just momentary agreement.',
    difficulty: 3,
    category: 'bundles',
  },
  {
    id: 'advanced-service-4',
    question: 'A customer is anxious about learning a new phone. Which reply lowers friction the fastest?',
    options: ['You will figure it out eventually', 'We will get you started, transfer what matters, and show you the essentials before you go', 'Maybe ask someone younger later', 'Just watch videos online'],
    correctIndex: 1,
    explanation: 'Confidence grows when support is concrete, immediate, and human.',
    difficulty: 2,
    category: 'service',
  },
];

const inferLegacyCategory = (question: string): TriviaQuestion['category'] => {
  const q = question.toLowerCase();
  if (q.startsWith('hesitation')) return 'objection';
  if (q.includes('5g') || q.includes('network') || q.includes('coverage') || q.includes('roaming')) return 'network';
  if (q.includes('plan') || q.includes('price') || q.includes('taxes') || q.includes('upgrade')) return 'plans';
  if (q.includes('home internet') || q.includes('third line') || q.includes('netflix') || q.includes('hulu') || q.includes('apple tv')) return 'bundles';
  if (q.includes('customer') || q.includes('switch') || q.includes('onboarding')) return 'sales';
  return 'service';
};

const inferLegacyDifficulty = (question: string): 1 | 2 | 3 | 4 => {
  const q = question.toLowerCase();
  if (q.startsWith('hesitation')) return 3;
  if (q.includes('layer cake') || q.includes('simple global') || q.includes('yearly upgrade')) return 2;
  return 1;
};

const sanitizeTriviaQuestion = (question: Partial<TriviaQuestion>, fallbackId: string): TriviaQuestion | null => {
  if (!question.question || !question.options || typeof question.correctIndex !== 'number' || !question.explanation) return null;
  if (!Array.isArray(question.options) || question.options.length < 2) return null;

  const difficultyRaw = question.difficulty ?? 2;
  const difficulty = ([1, 2, 3, 4].includes(difficultyRaw as number) ? difficultyRaw : 2) as 1 | 2 | 3 | 4;
  const category = (question.category || 'sales') as TriviaQuestion['category'];

  return {
    id: question.id || fallbackId,
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    difficulty,
    category,
    healthReward: question.healthReward,
    scoreReward: question.scoreReward,
  };
};

const BASE_TRIVIA_DECK: TriviaQuestion[] = LEGACY_TRIVIA.map((q, index) => ({
  id: `legacy-${index}`,
  question: q.question,
  options: [...q.options],
  correctIndex: q.correctIndex,
  explanation: q.explanation,
  difficulty: inferLegacyDifficulty(q.question),
  category: inferLegacyCategory(q.question),
})).concat(ADVANCED_TRIVIA);

export const T_MOBILE_TRIVIA: TriviaQuestion[] = BASE_TRIVIA_DECK;

export const T_MOBILE_FACTS: string[] = [
  "T-Mobile's 5-Year Price Guarantee ensures your core plan cost won't go up.",
  "T-Mobile's 5G Ultra Capacity covers over 300 million people.",
  'T-Life (formerly T-Mobile Tuesdays) gives you free stuff every week.',
  'Many premium plans include Apple TV+, Netflix, and Hulu on Us.',
  'T-Mobile provides free in-flight Wi-Fi on select domestic flights.',
  'T-Mobile often offers a 3rd line free when adding multiple lines.',
  'Experience Beyond plans include yearly device upgrades.',
  "T-Mobile can pay off your devices when you 'Keep & Switch'.",
  'Scam Shield protects customers by blocking millions of scam calls daily.',
  "T-Mobile is America's largest, fastest, and most awarded 5G network.",
  'No hidden taxes or fees on premium plans like Experience Más.',
  'Un-carrier moves are built to eliminate industry friction points.',
  'Discovery-first selling beats feature dumping almost every time.',
  'A clean recap is one of the highest-leverage moves in wireless sales.',
  'The best bundle stories feel simpler, not busier.',
  'Confidence grows when setup help is specific and immediate.',
  'Great reps lower friction before they try to raise excitement.',
  'When price is the objection, clarity is often the answer.',
];

export const getCharacterDefinition = (characterId: CharacterId) => CHARACTER_MAP[characterId] || CHARACTER_MAP.apple;

export const getTriviaDeck = (): TriviaQuestion[] => {
  const external = getExternalRunnerContent();
  const externalTrivia = (external.trivia || [])
    .map((question, index) => sanitizeTriviaQuestion(question, `external-${index}`))
    .filter(Boolean) as TriviaQuestion[];

  const unique = new Map<string, TriviaQuestion>();
  [...BASE_TRIVIA_DECK, ...externalTrivia].forEach((question) => {
    unique.set(question.id, question);
  });

  return Array.from(unique.values());
};

export const getFactDeck = (): string[] => {
  const external = getExternalRunnerContent();
  const facts = [...T_MOBILE_FACTS, ...(external.facts || [])].filter(Boolean);
  return Array.from(new Set(facts));
};
