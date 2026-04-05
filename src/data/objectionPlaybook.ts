// --- Objection Handling Playbook ---
// Pre-baked objection scenarios with instant responses (no API calls needed).
// 7 categories, 30 scenarios. Each has a quickResponse, tip, optional steps, and deepDiveKeys.

export interface ObjectionStep {
  label: string;
  script: string;
}

export interface ObjectionScenario {
  id: string;
  title: string;
  quickResponse: string;
  tip: string;
  steps?: ObjectionStep[];
  deepDiveKeys?: string[];
}

export interface ObjectionCategory {
  id: string;
  label: string;
  icon: string;
  scenarios: ObjectionScenario[];
}

export const OBJECTION_PLAYBOOK: ObjectionCategory[] = [
  {
    id: 'pricing',
    label: 'Pricing & Value',
    icon: 'CircleDollarSign',
    scenarios: [
      {
        id: 'price-too-high',
        title: 'Price is too high',
        quickResponse: "I totally get that — let's look at the full picture. When you add Netflix, Hulu, Apple TV+, and international roaming, T-Mobile actually saves most families $30-50/month vs what they're paying now. Plus our 5-Year Price Guarantee means no surprise increases.",
        tip: "Don't defend the price — reframe the value. Ask what they're paying now with everything included.",
        deepDiveKeys: ['price-objection', 'value-reframe'],
      },
      {
        id: 'cheaper-elsewhere',
        title: 'Cheaper plan elsewhere',
        quickResponse: "Let's compare apples to apples. Those cheaper plans usually strip out premium data, hotspot, and streaming perks. When you add those back, T-Mobile's Experience Beyond is actually the best deal per feature dollar.",
        tip: "Pull up the competitor plan side-by-side. Let the math do the selling.",
        deepDiveKeys: ['price-objection', 'competitor-comparison'],
      },
      {
        id: 'hidden-fees',
        title: 'Worried about hidden fees',
        quickResponse: "Great question. T-Mobile shows you the real price upfront — no hidden fees, no activation charges on most plans. The price you see is the price you pay, plus standard taxes. And with our 5-Year Price Guarantee, it stays that way.",
        tip: "Transparency builds trust. Show the actual bill breakdown — it's our competitive advantage.",
        deepDiveKeys: ['price-objection'],
      },
      {
        id: 'device-too-expensive',
        title: 'Device cost too high',
        quickResponse: "I hear you — flagship phones aren't cheap. But with trade-in (we take ANY condition), you can get up to $1,100 off. Plus monthly payments spread the cost out with 0% interest. Many customers end up paying $0-5/month for their new phone.",
        tip: "Always check trade-in value first. The gap between sticker price and actual cost is your best weapon.",
        deepDiveKeys: ['price-objection', 'device-promo'],
      },
    ],
  },
  {
    id: 'switching',
    label: 'Switching & Porting',
    icon: 'ArrowRightLeft',
    scenarios: [
      {
        id: 'hassle-to-switch',
        title: 'Too much hassle to switch',
        quickResponse: "I get it — switching sounds like a headache. But we handle everything: number porting takes about 15 minutes, we transfer your data right here, and Family Freedom covers up to $800/line to pay off your old devices. Most people are surprised how easy it is.",
        tip: "Make it tangible: 'In 15 minutes you'll have the same number, all your apps, and a better deal.'",
        deepDiveKeys: ['switching-ease', 'family-freedom'],
      },
      {
        id: 'contract-locked',
        title: 'Locked in a contract / ETF',
        quickResponse: "Good news — Family Freedom covers up to $800/line via prepaid Mastercard to pay off your remaining device balance. And T-Mobile never locks you into a service contract. Let's check what you owe and see if the math works.",
        tip: "Calculate the break-even: remaining balance vs monthly savings over 12-24 months. The math usually wins.",
        deepDiveKeys: ['switching-ease', 'family-freedom'],
      },
      {
        id: 'spouse-approval',
        title: 'Need to talk to my spouse',
        quickResponse: "Absolutely — smart move. Let me put together a quick summary with the deal details you can share. I'll include the comparison with what you're paying now so the conversation is easy. Want to give them a quick call? We've got great Wi-Fi in here.",
        tip: "Don't push. Make it easy for them to sell it at home: printed comparison, your card, and a follow-up time.",
        deepDiveKeys: ['decision-delay'],
      },
      {
        id: 'waiting-for-launch',
        title: 'Waiting for next phone launch',
        quickResponse: "Smart thinking! But here's the thing — current promos are some of the best we've had, and trade-in values actually drop when new models release because everyone trades in at once. Lock in the deal now, and with Experience Beyond you get yearly upgrades anyway.",
        tip: "Create urgency without pressure. The trade-in value depreciation angle is very effective.",
        deepDiveKeys: ['decision-delay', 'device-promo'],
      },
    ],
  },
  {
    id: 'network',
    label: 'Network & Coverage',
    icon: 'WifiOff',
    scenarios: [
      {
        id: 'coverage-concerns',
        title: 'Worried about coverage',
        quickResponse: "That's the #1 thing I hear, and T-Mobile has changed dramatically. We're now #1 in network quality by JD Power in 5 of 6 regions, our 5G covers 325M+ Americans, and with T-Satellite (Starlink) we even cover areas with zero cell towers.",
        tip: "Ask WHERE they're worried about coverage, then check the map together. Data beats assumptions.",
        deepDiveKeys: ['network-quality', 'coverage-proof'],
      },
      {
        id: 'rural-coverage',
        title: 'Live in a rural area',
        quickResponse: "Rural coverage is where we've invested the most. T-Mobile's Extended Range 5G reaches further than ever, and T-Satellite with Starlink covers 500,000+ square miles where there are literally zero cell towers. Plus the 15-day Home Internet test drive lets you try risk-free.",
        tip: "T-Satellite is the ultimate closer for rural customers. It's free on Experience Beyond.",
        deepDiveKeys: ['network-quality', 'coverage-proof'],
      },
      {
        id: 'speed-doubts',
        title: 'Heard T-Mobile is slow',
        quickResponse: "I'd love to show you the actual data. Ookla certified T-Mobile at 309 Mbps median 5G — that's literally 2x faster than AT&T. We're the most awarded 5G network in America. Want to run a speed test right here?",
        tip: "A live speed test in-store is the most convincing argument. Let them see it.",
        deepDiveKeys: ['network-quality'],
      },
    ],
  },
  {
    id: 'device-account',
    label: 'Device & Account Issues',
    icon: 'Smartphone',
    scenarios: [
      {
        id: 'no-passcode',
        title: "Customer doesn't know passcode",
        quickResponse: "No worries — this happens more than you'd think. Let's try a few things: for iPhone, we can reset via Apple ID at iforgot.apple.com. For Samsung, try your Samsung account. If neither works, a factory reset is the last resort but we'll back up what we can first.",
        tip: "Always try the least destructive option first. Check if they have iCloud/Google backup before a factory reset.",
        steps: [
          { label: 'Try biometrics', script: "Let's try your fingerprint or face unlock first — sometimes those still work even when you forget the PIN." },
          { label: 'Apple ID / Samsung account reset', script: "We can reset through your Apple ID or Samsung account. Do you remember that password?" },
          { label: 'Backup & factory reset', script: "Last resort — we'll back up to iCloud/Google first, then reset the device. You won't lose anything important." },
        ],
        deepDiveKeys: ['tech-support-flow'],
      },
      {
        id: 'dont-need-new-phone',
        title: "Don't need a new phone",
        quickResponse: "Totally respect that. But check this out — trade-in values are at peak right now, up to $1,100 for flagships. We take devices in ANY condition. Sometimes the deal is so good it actually saves money to upgrade now vs waiting.",
        tip: "Don't push the device — pivot to plan savings. If they're happy with their phone, sell the network and perks.",
        deepDiveKeys: ['device-promo', 'value-reframe'],
      },
      {
        id: 'phone-not-working',
        title: 'Phone not working properly',
        quickResponse: "Let's troubleshoot that right now. Is it a software issue (freezing, crashing, battery drain) or hardware (cracked screen, won't charge)? For software, a settings reset usually fixes it. For hardware, Protection 360 covers repairs at $0 deductible for screen fixes.",
        tip: "This is a service-to-sales opportunity. Fix the issue, build trust, then mention what P360 covers for next time.",
        deepDiveKeys: ['tech-support-flow', 'protection-360'],
      },
    ],
  },
  {
    id: 'trust',
    label: 'Trust & Past Experience',
    icon: 'KeyRound',
    scenarios: [
      {
        id: 'bad-past-experience',
        title: 'Bad past experience with T-Mobile',
        quickResponse: "I appreciate you being honest about that. A lot has changed — we're now #1 in customer satisfaction (JD Power), #1 in network quality, and our 5-Year Price Guarantee means no more surprise increases. What specifically went wrong last time? I want to make sure that's been fixed.",
        tip: "Listen first. Acknowledge the pain, then show what's different. Never dismiss their experience.",
        deepDiveKeys: ['trust-rebuild', 'network-quality'],
      },
      {
        id: 'dont-trust-promos',
        title: "Don't trust promotional deals",
        quickResponse: "I get the skepticism — some carriers do bait-and-switch. Here's how T-Mobile promos work: bill credits apply monthly over 24-36 months, and the 5-Year Price Guarantee locks your plan rate. I'll show you exactly what your bill looks like month 1, month 12, and month 36.",
        tip: "Transparency is the antidote to distrust. Walk them through the actual bill month by month.",
        deepDiveKeys: ['trust-rebuild', 'price-objection'],
      },
      {
        id: 'read-bad-reviews',
        title: 'Read bad reviews online',
        quickResponse: "Reviews are tricky — unhappy people post way more than happy ones. But here's what the data says: JD Power ranks T-Mobile #1 in customer satisfaction, Ookla certifies us as the fastest network, and we've had 14 straight quarters of industry-leading growth. Want to see for yourself?",
        tip: "Don't argue with reviews. Redirect to authoritative third-party data (JD Power, Ookla, OpenSignal).",
        deepDiveKeys: ['trust-rebuild'],
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical & Setup',
    icon: 'Wrench',
    scenarios: [
      {
        id: 'pin-reset',
        title: 'PIN/password reset needed',
        quickResponse: "Let's get that sorted right now. I'll verify your identity and we can reset your T-Mobile PIN in a few minutes. For security, I'll need your account holder's name and the last 4 of the SSN on the account.",
        tip: "PIN resets are quick wins that build trust. Use this as a door-opener to check if their plan is optimized.",
        steps: [
          { label: 'Verify identity', script: "I'll need the account holder's full name and last 4 of the SSN to verify. This is for your security." },
          { label: 'Reset PIN', script: "Great, verified. I'm resetting your PIN now — pick a new 4-8 digit number you'll remember." },
          { label: 'Confirm & pivot', script: "All set! While I've got your account up, mind if I check if you're on the best plan for what you use?" },
        ],
        deepDiveKeys: ['tech-support-flow'],
      },
      {
        id: 'data-transfer-worry',
        title: 'Worried about losing data',
        quickResponse: "100% valid concern. We do the data transfer right here — photos, contacts, apps, messages all come over. For iPhone to iPhone it's seamless with iCloud. Android to anything, we use Smart Switch or Google backup. Nothing gets lost.",
        tip: "Offer to do it in-store. Removing the fear of data loss removes a huge switching barrier.",
        deepDiveKeys: ['switching-ease'],
      },
      {
        id: 'esim-confusion',
        title: "Don't understand eSIM",
        quickResponse: "eSIM is actually simpler than it sounds — it's a digital SIM built into your phone, so no tiny card to swap. We activate it by scanning a QR code, takes about 2 minutes. Bonus: you can have two numbers on one phone (work and personal). Most modern phones support it.",
        tip: "Demo it live if possible. Seeing the QR scan activation demystifies it instantly.",
        deepDiveKeys: ['tech-support-flow'],
      },
    ],
  },
  {
    id: 'specific-promos',
    label: 'Promo & Offer Pushback',
    icon: 'MessageSquareWarning',
    scenarios: [
      {
        id: 'promo-expiring-pressure',
        title: 'Feels pressured by expiring promo',
        quickResponse: "I never want you to feel pressured. Here's the deal: this promo IS time-limited, but I'd rather you make the right decision than a rushed one. Let me give you all the details to take home, and if the promo changes, I'll find you the next best thing.",
        tip: "Anti-pressure is the best pressure. Giving them space to decide builds more trust than urgency tactics.",
        deepDiveKeys: ['decision-delay'],
      },
      {
        id: 'bill-credits-skepticism',
        title: "Don't like bill credits (want instant discount)",
        quickResponse: "I hear you — everyone wants the upfront discount. Here's why bill credits actually work in your favor: you get the FULL value guaranteed over 24-36 months, and if T-Mobile raises plan prices (they won't with the 5-Year Guarantee), you still get your credits. It's actually more secure than an instant discount.",
        tip: "Reframe bill credits as a guarantee, not a delay. Show the total savings over the commitment period.",
        deepDiveKeys: ['price-objection', 'trust-rebuild'],
      },
      {
        id: 'hint-mailer-disappointment',
        title: 'Mailer/ad promised something different',
        quickResponse: "Let me take a look at what you received. Sometimes the fine print has conditions that aren't obvious. If the offer doesn't match, I'll find you something equal or better. Our current in-store promos are actually some of the strongest right now.",
        tip: "Never blame the customer for misreading. Validate their expectation, then redirect to what IS available.",
        deepDiveKeys: ['trust-rebuild', 'price-objection'],
      },
      {
        id: 'trade-in-value-low',
        title: 'Trade-in value seems low',
        quickResponse: "I get that — your phone still works great, so the value feels low. But trade-in is just one part of the deal. When you combine it with the bill credits, you're getting up to $1,100 total off. Plus we take phones in ANY condition — cracked screens, water damage, anything.",
        tip: "Shift focus from trade-in alone to total deal value. Trade-in + bill credits + perks = the real number.",
        deepDiveKeys: ['device-promo', 'value-reframe'],
      },
    ],
  },
];

/** Get all scenarios across all categories as a flat list */
export function getAllScenarios(): ObjectionScenario[] {
  return OBJECTION_PLAYBOOK.flatMap(cat => cat.scenarios);
}

/** Find a scenario by its ID */
export function findScenario(id: string): ObjectionScenario | undefined {
  for (const category of OBJECTION_PLAYBOOK) {
    const found = category.scenarios.find(s => s.id === id);
    if (found) return found;
  }
  return undefined;
}

/** Get suggested categories based on customer context keywords */
export function getSuggestedCategories(keywords: string[]): ObjectionCategory[] {
  const lower = keywords.map(k => k.toLowerCase());
  return OBJECTION_PLAYBOOK.filter(cat =>
    cat.scenarios.some(s =>
      lower.some(kw =>
        s.title.toLowerCase().includes(kw) ||
        s.id.includes(kw) ||
        s.quickResponse.toLowerCase().includes(kw)
      )
    )
  );
}
