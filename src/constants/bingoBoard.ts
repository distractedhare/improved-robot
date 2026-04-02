export interface BingoCell {
  id: string;
  label: string;
  category: 'sales' | 'skill' | 'vibe';
  description: string;
}

/**
 * 25 bingo cells — 24 real + 1 free space (always index 12 after shuffle).
 * All self-reported, honor system. No customer data involved.
 */
export const BINGO_CELLS: BingoCell[] = [
  // Sales (9)
  { id: 'sold-p360', label: 'Sold P360', category: 'sales', description: 'Added Protection 360 to an order' },
  { id: '1k-accessories', label: '$1K+ Acc Day', category: 'sales', description: 'Hit $1,000+ in accessory sales today' },
  { id: 't-complete', label: 'T-Complete', category: 'sales', description: 'Same-day combo: Experience More/Beyond plan + BTS device + essential accessory + P360' },
  { id: 'closed-switcher', label: 'Closed a Switcher', category: 'sales', description: 'Brought someone over from another carrier' },
  { id: 'sold-big-add', label: 'Sold a Big Add', category: 'sales', description: 'Sold a premium accessory (AirPods, Buds, Backbone, Ray-Ban, etc.)' },
  { id: 'sold-hi', label: 'Sold Home Internet', category: 'sales', description: 'Added a Home Internet line' },
  { id: 'multi-line', label: 'Multi-Line Add', category: 'sales', description: 'Added 2+ lines on one order' },
  { id: 'tablet-watch', label: 'Tablet or Watch Add', category: 'sales', description: 'Added a connected device (tablet, watch, or hotspot)' },
  { id: 'bundle-3plus', label: '3+ Bundle', category: 'sales', description: 'Sold 3+ accessories for the 25% bundle discount' },

  // Skill (8)
  { id: 'tech-to-sales', label: 'Tech → Sales', category: 'skill', description: 'Turned a tech support call into a sales opportunity' },
  { id: 'hit-behaviors', label: 'Hit All Behaviors', category: 'skill', description: 'Nailed every expected behavior on a single call' },
  { id: 'pivot-play', label: 'Used a Pivot', category: 'skill', description: 'Pivoted to a different product or service mid-call' },
  { id: 'bundle-pitch', label: 'Nailed the Bundle', category: 'skill', description: 'Delivered a smooth bundle pitch that landed' },
  { id: 'overcame-3', label: 'Beat 3 Objections', category: 'skill', description: 'Overcame 3+ objections on a single call' },
  { id: 'ecosystem-pitch', label: 'Ecosystem Pitch', category: 'skill', description: 'Pitched the full ecosystem (phone + watch + tablet + accessories)' },
  { id: 'asked-for-sale', label: 'Asked for the Sale', category: 'skill', description: 'Confidently asked for the sale instead of waiting' },
  { id: 'warm-transfer', label: 'Warm Transfer Win', category: 'skill', description: 'Warm-transferred and the next rep closed it' },

  // Vibe (7)
  { id: 'simply-proud', label: 'Simply Proud', category: 'vibe', description: "Didn't sell anything but it was a HELL of a call" },
  { id: 'good-feels', label: 'Good Feels', category: 'vibe', description: 'Helped someone get a magenta experience — great vibes after' },
  { id: 'made-day', label: "Made Someone's Day", category: 'vibe', description: 'Customer was noticeably happier by the end of the call' },
  { id: 'coached-teammate', label: 'Coached a Teammate', category: 'vibe', description: 'Helped a teammate with a call or question' },
  { id: 'customer-shoutout', label: 'Got a Shoutout', category: 'vibe', description: 'Customer gave you a compliment or positive feedback' },
  { id: 'stayed-positive', label: 'Stayed Positive', category: 'vibe', description: 'Kept a great attitude on a tough or frustrating call' },
  { id: 'learned-new', label: 'Learned Something', category: 'vibe', description: 'Picked up a new product fact, process, or technique today' },
];

/** The free space — always placed at center (index 12) */
export const FREE_SPACE: BingoCell = {
  id: 'free-space',
  label: 'FREE',
  category: 'vibe',
  description: "You showed up. That's a win.",
};
