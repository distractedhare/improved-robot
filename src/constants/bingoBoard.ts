export interface BingoCell {
  id: string;
  label: string;
  category: 'sales' | 'skill' | 'vibe';
  description: string;
  countsWhen: string;
  example: string;
}

/**
 * 25 bingo cells — 24 real + 1 free space (always index 12 after shuffle).
 * All self-reported, honor system. No customer data involved.
 */
export const BINGO_CELLS: BingoCell[] = [
  // Sales (9)
  {
    id: 'sold-p360',
    label: 'Sold P360',
    category: 'sales',
    description: 'Added Protection 360 to an order',
    countsWhen: 'Mark this when the customer clearly accepted Protection 360 on a phone, tablet, or wearable order.',
    example: 'Basic example: the caller upgrades to a new iPhone, says they are rough on phones, and you add P360 so drops or theft do not turn into a big repair bill.',
  },
  {
    id: '1k-accessories',
    label: '$1K+ Acc Day',
    category: 'sales',
    description: 'Hit $1,000+ in accessory sales today',
    countsWhen: 'Mark this once your accessory revenue for the shift passes $1,000, even if it took multiple calls.',
    example: 'Basic example: you stacked bundles on a few upgrade calls, landed premium audio on another, and by mid-shift your accessory total pushed past the $1K mark.',
  },
  {
    id: 't-complete',
    label: 'T-Complete',
    category: 'sales',
    description: 'Same-day combo: Experience More/Beyond plan + BTS device + essential accessory + P360',
    countsWhen: 'Mark this when one customer ends up with the full-stack sale: premium plan, connected device, at least one essential accessory, and P360.',
    example: 'Basic example: the caller upgrades to Experience Beyond, adds an Apple Watch line, takes a screen protector, and accepts P360 on the main phone.',
  },
  {
    id: 'closed-switcher',
    label: 'Closed a Switcher',
    category: 'sales',
    description: 'Brought someone over from another carrier',
    countsWhen: 'Mark this when you moved a customer from another carrier to T-Mobile and got the order across the line.',
    example: 'Basic example: a Verizon customer calls exploring options, you position the savings and trade-in value, and they port over two voice lines.',
  },
  {
    id: 'sold-big-add',
    label: 'Sold a Big Add',
    category: 'sales',
    description: 'Sold a premium accessory (AirPods, Buds, Backbone, Ray-Ban, etc.)',
    countsWhen: 'Mark this when you land a premium add-on instead of only the low-ticket essentials.',
    example: 'Basic example: the caller buys a new iPhone, mentions flights and work calls, and you close AirPods Pro as the premium add-on.',
  },
  {
    id: 'sold-hi',
    label: 'Sold Home Internet',
    category: 'sales',
    description: 'Added a Home Internet line',
    countsWhen: 'Mark this when a customer adds T-Mobile Home Internet during or after the call.',
    example: 'Basic example: while reviewing their phone plan, the customer says Xfinity feels expensive, so you pivot and close Home Internet too.',
  },
  {
    id: 'multi-line',
    label: 'Multi-Line Add',
    category: 'sales',
    description: 'Added 2+ lines on one order',
    countsWhen: 'Mark this when a single transaction includes two or more added voice lines.',
    example: 'Basic example: a parent starts with one upgrade but ends up adding two lines for kids so the whole family is on one account.',
  },
  {
    id: 'tablet-watch',
    label: 'Tablet or Watch Add',
    category: 'sales',
    description: 'Added a connected device (tablet, watch, or hotspot)',
    countsWhen: 'Mark this when you add a tablet, watch, hotspot, or similar connected line to the order.',
    example: 'Basic example: the customer upgrades their phone, likes the ecosystem story, and adds an Apple Watch line before the call ends.',
  },
  {
    id: 'bundle-3plus',
    label: '3+ Bundle',
    category: 'sales',
    description: 'Sold 3+ accessories for the 25% bundle discount',
    countsWhen: 'Mark this when the customer buys at least three eligible accessories on the same order and gets the bundle pricing.',
    example: 'Basic example: you package the case, glass, and charger together as the easy setup bundle and the caller takes all three.',
  },

  // Skill (8)
  {
    id: 'tech-to-sales',
    label: 'Tech → Sales',
    category: 'skill',
    description: 'Turned a tech support call into a sales opportunity',
    countsWhen: 'Mark this when you solved the service issue first and then naturally opened a real sales conversation.',
    example: 'Basic example: you fix a voicemail issue, then ask whether their older phone battery has been giving them trouble and transition into an upgrade discussion.',
  },
  {
    id: 'hit-behaviors',
    label: 'Hit All Behaviors',
    category: 'skill',
    description: 'Nailed every expected behavior on a single call',
    countsWhen: 'Mark this when one call felt complete: strong opener, discovery, clear value, confident ask, and clean closeout.',
    example: 'Basic example: you built rapport, asked the right discovery questions, positioned the fit clearly, and confidently asked for the sale before ending the call.',
  },
  {
    id: 'pivot-play',
    label: 'Used a Pivot',
    category: 'skill',
    description: 'Pivoted to a different product or service mid-call',
    countsWhen: 'Mark this when your first angle stalled and you successfully changed direction to something that fit better.',
    example: 'Basic example: the caller says no to the flagship phone price, so you pivot to a value phone plus accessories instead of forcing the same pitch.',
  },
  {
    id: 'bundle-pitch',
    label: 'Nailed the Bundle',
    category: 'skill',
    description: 'Delivered a smooth bundle pitch that landed',
    countsWhen: 'Mark this when you packaged multiple items together in a way that felt natural and the customer bought in.',
    example: 'Basic example: instead of pitching case, glass, and charger one by one, you frame them as the full new-phone setup and the customer says yes.',
  },
  {
    id: 'overcame-3',
    label: 'Beat 3 Objections',
    category: 'skill',
    description: 'Overcame 3+ objections on a single call',
    countsWhen: 'Mark this when the customer gave you three real objections and you worked through them without losing control of the call.',
    example: 'Basic example: they push back on price, say they want to think about it, and claim their current phone is fine, but you still close the upgrade.',
  },
  {
    id: 'ecosystem-pitch',
    label: 'Ecosystem Pitch',
    category: 'skill',
    description: 'Pitched the full ecosystem (phone + watch + tablet + accessories)',
    countsWhen: 'Mark this when you clearly explained how multiple devices or add-ons work together instead of only naming products.',
    example: 'Basic example: you explain how the new iPhone, Apple Watch, and AirPods all work together so the caller sees the ecosystem value, not just the phone price.',
  },
  {
    id: 'asked-for-sale',
    label: 'Asked for the Sale',
    category: 'skill',
    description: 'Confidently asked for the sale instead of waiting',
    countsWhen: 'Mark this when you made a direct close attempt instead of hoping the customer would volunteer a yes.',
    example: 'Basic example: after positioning the fit, you say, "Want me to lock that in for you today?" instead of stopping at the value prop.',
  },
  {
    id: 'warm-transfer',
    label: 'Warm Transfer Win',
    category: 'skill',
    description: 'Warm-transferred and the next rep closed it',
    countsWhen: 'Mark this when you handed the call off with real context and the next step actually closed successfully.',
    example: 'Basic example: you stay on the line, explain the customer need to the next rep, and the transferred call ends in a Home Internet or line-add close.',
  },

  // Vibe (7)
  {
    id: 'simply-proud',
    label: 'Simply Proud',
    category: 'vibe',
    description: "Didn't sell anything but it was a HELL of a call",
    countsWhen: 'Mark this when the outcome was not a sale but you know you handled the call at a high level.',
    example: 'Basic example: the caller could not buy today, but you de-escalated the issue, explained everything clearly, and left them feeling taken care of.',
  },
  {
    id: 'good-feels',
    label: 'Good Feels',
    category: 'vibe',
    description: 'Helped someone get a magenta experience — great vibes after',
    countsWhen: 'Mark this when the overall interaction felt genuinely positive for both you and the customer.',
    example: 'Basic example: you helped them choose the right setup, kept the call easy, and they ended the conversation sounding excited instead of stressed.',
  },
  {
    id: 'made-day',
    label: "Made Someone's Day",
    category: 'vibe',
    description: 'Customer was noticeably happier by the end of the call',
    countsWhen: 'Mark this when the customer clearly finished the call in a better mood than they started it.',
    example: 'Basic example: the caller starts frustrated about an issue, but by the end they thank you and say you made the whole thing easier than expected.',
  },
  {
    id: 'coached-teammate',
    label: 'Coached a Teammate',
    category: 'vibe',
    description: 'Helped a teammate with a call or question',
    countsWhen: 'Mark this when you gave useful help to a teammate during the shift.',
    example: 'Basic example: a teammate asks how to position a switcher deal, and you help them phrase the close before they go back to the caller.',
  },
  {
    id: 'customer-shoutout',
    label: 'Got a Shoutout',
    category: 'vibe',
    description: 'Customer gave you a compliment or positive feedback',
    countsWhen: 'Mark this when the customer directly praises your help, patience, knowledge, or attitude.',
    example: 'Basic example: the caller says, "You were the first person who actually explained this clearly," before hanging up.',
  },
  {
    id: 'stayed-positive',
    label: 'Stayed Positive',
    category: 'vibe',
    description: 'Kept a great attitude on a tough or frustrating call',
    countsWhen: 'Mark this when the call was messy or stressful and you still kept your tone steady and helpful.',
    example: 'Basic example: the customer is upset and the process is dragging, but you stay calm, kind, and solution-focused the whole time.',
  },
  {
    id: 'learned-new',
    label: 'Learned Something',
    category: 'vibe',
    description: 'Picked up a new product fact, process, or technique today',
    countsWhen: 'Mark this when you leave the shift with one useful new fact or move you can use again.',
    example: 'Basic example: you learn a cleaner way to explain Home Internet or a better watch add-on transition and use it later that day.',
  },
];

/** The free space — always placed at center (index 12) */
export const FREE_SPACE: BingoCell = {
  id: 'free-space',
  label: 'FREE',
  category: 'vibe',
  description: "You showed up. That's a win.",
  countsWhen: 'This one is always yours.',
  example: 'Basic example: you clocked in and showed up ready to work.',
};
