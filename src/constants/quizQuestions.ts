export type QuizCategory = 'sales' | 'products' | 'tmobile' | 'competitors';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 1 | 2 | 3;
}

const SALES_QUESTIONS: QuizQuestion[] = [
  {
    id: 'sq-1', category: 'sales', difficulty: 1,
    question: 'What\'s the strongest opener on an inbound sales call?',
    options: ['Jump straight to the promo', 'Ask what brought them in today', 'Start listing plan options', 'Tell them about the latest device'],
    correctIndex: 1,
    explanation: 'Discovery first. Understanding why they called shapes the entire pitch.',
  },
  {
    id: 'sq-2', category: 'sales', difficulty: 1,
    question: 'When should you check credit on a new customer?',
    options: ['After you close', 'Only if they ask', 'Early — before the offer takes shape', 'Never, it scares people off'],
    correctIndex: 2,
    explanation: 'Checking credit early lets you build an offer that actually works. No surprises at the finish.',
  },
  {
    id: 'sq-3', category: 'sales', difficulty: 2,
    question: 'A customer says "I need to think about it." Best response?',
    options: ['Give them your number and let them go', 'Push harder on urgency', 'Ask "What part are you still weighing?"', 'Offer a bigger discount'],
    correctIndex: 2,
    explanation: '"Think about it" usually hides a specific concern. One focused question can reopen the close.',
  },
  {
    id: 'sq-4', category: 'sales', difficulty: 2,
    question: 'Which close technique uses "Would you prefer the 128GB or 256GB?" instead of "Want to buy this?"',
    options: ['Assumptive close', 'Choice close', 'Urgency close', 'Summary close'],
    correctIndex: 1,
    explanation: 'A choice close removes the yes/no question entirely. Both answers move the sale forward.',
  },
  {
    id: 'sq-5', category: 'sales', difficulty: 1,
    question: 'The AutoPay discount should be mentioned:',
    options: ['Only if the customer asks', 'When quoting the monthly total', 'After they sign up', 'Never — it reduces revenue'],
    correctIndex: 1,
    explanation: 'AutoPay is part of the real monthly price. Include it from the start so the number is honest.',
  },
  {
    id: 'sq-6', category: 'sales', difficulty: 3,
    question: 'What\'s the "silence technique" in closing?',
    options: ['Muting your mic to hide background noise', 'Asking for the sale, then waiting without talking', 'Whispering the price so it sounds smaller', 'Not mentioning competitor names'],
    correctIndex: 1,
    explanation: 'After you ask for the order, silence puts the decision in their hands. Most reps fill the gap and lose the moment.',
  },
  {
    id: 'sq-7', category: 'sales', difficulty: 2,
    question: 'A customer is angry about their bill. What do you do first?',
    options: ['Immediately start pitching upgrades', 'Acknowledge the frustration and solve the billing issue', 'Transfer to billing', 'Offer a free month'],
    correctIndex: 1,
    explanation: 'Fix the fire first, earn trust, then you have permission to open a sales path.',
  },
  {
    id: 'sq-8', category: 'sales', difficulty: 1,
    question: 'Protection 360 should be positioned as:',
    options: ['An optional add-on if they want it', 'Part of the phone setup — essential from day one', 'Only for expensive phones', 'Something to add later'],
    correctIndex: 1,
    explanation: 'When P360 is framed as "part of the setup" rather than an upsell, attach rates go way up.',
  },
  {
    id: 'sq-9', category: 'sales', difficulty: 2,
    question: 'The 3+ accessory bundle works because:',
    options: ['Bigger basket size', 'Customers feel they get a deal', 'It solves the "what else do I need?" anxiety', 'All of the above'],
    correctIndex: 3,
    explanation: 'Bundling accessories into one recommendation removes decision fatigue and lifts the average order.',
  },
  {
    id: 'sq-10', category: 'sales', difficulty: 3,
    question: 'When a customer says "Verizon offered me a better deal," the best reframe is:',
    options: ['Say Verizon is more expensive overall', 'Match their offer dollar-for-dollar', 'Ask specifically what was offered and compare total value', 'Trash-talk the competitor'],
    correctIndex: 2,
    explanation: 'Get the details. Most "better deals" fall apart when you compare total monthly cost, perks, and trade-in value side by side.',
  },
  {
    id: 'sq-11', category: 'sales', difficulty: 3,
    question: 'A customer calls about a billing issue but mentions they also need a new phone. You should:',
    options: ['Handle the phone first — it\'s the bigger sale', 'Fix the billing issue completely, then transition naturally to the phone need', 'Transfer to billing and start fresh with the phone', 'Ignore the billing issue and pitch the phone'],
    correctIndex: 1,
    explanation: 'Trust first, sell second. Solving their real problem earns permission to recommend. "Now that\'s sorted — tell me about the phone situation."',
  },
  {
    id: 'sq-12', category: 'sales', difficulty: 3,
    question: 'A customer has pushed back on price, coverage, AND timing in the same call. After handling all three, the strongest close is:',
    options: ['Summarize all three solutions and ask "Does this cover everything?"', 'Give them a deadline', 'Lower the price', 'Ask if they have any more concerns'],
    correctIndex: 0,
    explanation: 'After handling multiple objections, a summary close ties everything together. "We addressed the pricing, confirmed your coverage, and locked the timing — ready to move forward?"',
  },
  {
    id: 'sq-13', category: 'sales', difficulty: 3,
    question: 'A customer on a $160/mo plan with 2 lines asks if they can save money without losing anything. The best approach is:',
    options: ['Tell them their plan is already good', 'Analyze their actual usage (data, hotspot, streaming) and match a right-sized tier', 'Suggest the cheapest plan available', 'Offer autopay and call it done'],
    correctIndex: 1,
    explanation: 'Right-sizing builds trust. If they are on Beyond but never use premium perks, moving to More saves money and earns loyalty. That loyalty turns into referrals and add-lines.',
  },
  {
    id: 'sq-14', category: 'sales', difficulty: 2,
    question: 'A warm transfer should include:',
    options: ['Just the customer\'s name', 'The customer\'s name, why they called, what you already covered, and what they need next', 'A request for the next rep to "help this customer"', 'Nothing — let the customer re-explain'],
    correctIndex: 1,
    explanation: 'A real warm transfer hands off context, not just a person. The customer should never have to repeat their story.',
  },
];

const PRODUCT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'pq-1', category: 'products', difficulty: 1,
    question: 'What\'s the key selling point of Galaxy AI on the S25?',
    options: ['It makes the phone faster', 'It provides real-time shortcuts like live translate and photo cleanup', 'It replaces Google Assistant', 'It only works on Wi-Fi'],
    correctIndex: 1,
    explanation: 'Galaxy AI shines when positioned as everyday shortcuts — not tech jargon.',
  },
  {
    id: 'pq-2', category: 'products', difficulty: 1,
    question: 'Home Internet All-In pricing starts at:',
    options: ['$35/mo', '$45/mo', '$55/mo', '$65/mo'],
    correctIndex: 2,
    explanation: '$55/mo with bundled perks makes HINT competitive against most cable providers.',
  },
  {
    id: 'pq-3', category: 'products', difficulty: 2,
    question: 'The 15-day Home Internet test drive exists to:',
    options: ['Give customers free internet', 'Lower the risk so hesitant customers try it', 'Meet a regulatory requirement', 'Test the network in their area'],
    correctIndex: 1,
    explanation: 'The test drive removes commitment fear. It turns "maybe" into "let me try."',
  },
  {
    id: 'pq-4', category: 'products', difficulty: 1,
    question: 'Experience More vs. Beyond — the key difference is:',
    options: ['Speed', 'Premium perks and streaming bundles', 'Coverage area', 'Phone compatibility'],
    correctIndex: 1,
    explanation: 'Beyond adds premium streaming and perks. More is strong everyday value. Match to the customer.',
  },
  {
    id: 'pq-5', category: 'products', difficulty: 2,
    question: 'SyncUP Tracker is best positioned for:',
    options: ['Replacing a phone', 'Tracking pets, luggage, or kids\' backpacks', 'Improving internet speed', 'Backup storage'],
    correctIndex: 1,
    explanation: 'At $5/mo for peace of mind, the tracker sells itself when you match it to a real worry.',
  },
  {
    id: 'pq-6', category: 'products', difficulty: 2,
    question: 'When a customer is choosing between iPhone and Samsung, the best approach is:',
    options: ['Always recommend the more expensive one', 'Ask what apps and ecosystem they already use', 'Pick whichever has the best promo', 'Let them decide on their own'],
    correctIndex: 1,
    explanation: 'Ecosystem loyalty drives satisfaction. Find out if they\'re Apple, Google, or Samsung first.',
  },
  {
    id: 'pq-7', category: 'products', difficulty: 3,
    question: 'The mesh Wi-Fi extender for HINT is most valuable when:',
    options: ['The customer has a small apartment', 'The customer has dead zones in a larger home', 'The customer only uses one device', 'It\'s always included free'],
    correctIndex: 1,
    explanation: 'Dead zones kill the HINT experience. The extender is the objection-killer for big homes.',
  },
  {
    id: 'pq-8', category: 'products', difficulty: 1,
    question: 'What\'s the strongest Pixel camera selling point?',
    options: ['Megapixel count', 'Low-light photos and computational photography', 'It shoots video in 8K', 'Interchangeable lenses'],
    correctIndex: 1,
    explanation: 'Pixel wins on photo quality in real conditions — low light, moving subjects, natural colors.',
  },
  {
    id: 'pq-9', category: 'products', difficulty: 2,
    question: 'A kids\' watch line sells best when you position it as:',
    options: ['A cheaper alternative to a phone', 'GPS + messaging safety without giving a kid a full phone', 'A fitness tracker for children', 'A toy'],
    correctIndex: 1,
    explanation: 'Parents want to reach their kids safely. The watch solves that without the smartphone worry.',
  },
  {
    id: 'pq-10', category: 'products', difficulty: 1,
    question: 'Trade-in value should be brought up:',
    options: ['Only at the very end', 'When it helps soften the monthly device payment', 'Only for iPhones', 'Never — it complicates things'],
    correctIndex: 1,
    explanation: 'Trade-in can be the difference between "too expensive" and "actually, that works."',
  },
];

const TMOBILE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'tq-1', category: 'tmobile', difficulty: 2,
    question: 'What is T-Mobile\'s "Un-carrier" philosophy about?',
    options: ['Being the cheapest option', 'Eliminating industry pain points that frustrate customers', 'Only selling unlocked phones', 'No stores, online only'],
    correctIndex: 1,
    explanation: 'Un-carrier means leading by removing friction — no contracts, no overages, transparent pricing. Use this when customers assume all carriers are the same.',
  },
  {
    id: 'tq-2', category: 'tmobile', difficulty: 2,
    question: 'What does "Price Lock" guarantee mean?',
    options: ['Your phone price never changes', 'T-Mobile won\'t raise your plan price, or they\'ll pay your final bill', 'You\'re locked into a contract', 'Accessories are price-matched'],
    correctIndex: 1,
    explanation: 'Price Lock is a powerful trust-builder. If they raise the price, they pay your last month\'s bill to let you leave. Lead with this against "what if prices go up?" objections.',
  },
  {
    id: 'tq-3', category: 'tmobile', difficulty: 2,
    question: 'Which streaming perk comes bundled with select T-Mobile plans?',
    options: ['Disney+ Premium', 'Netflix Standard', 'Hulu No Ads', 'Apple TV+'],
    correctIndex: 3,
    explanation: 'Apple TV+ comes bundled with select plans. When a customer is weighing plan tiers, the streaming value tips the scale.',
  },
  {
    id: 'tq-4', category: 'tmobile', difficulty: 3,
    question: 'A customer says "I switched to T-Mobile last year and my bill is higher than promised." Your best move is:',
    options: ['Apologize and offer a credit', 'Pull up their account, verify the line items, and explain each charge clearly before discussing changes', 'Transfer to billing', 'Offer to switch their plan'],
    correctIndex: 1,
    explanation: 'Transparency first. Show them exactly what each line costs. Once they trust the numbers, you can optimize their plan and turn frustration into a save.',
  },
  {
    id: 'tq-5', category: 'tmobile', difficulty: 3,
    question: 'A family of 4 on Verizon pays $220/mo. They want equivalent coverage and are skeptical of T-Mobile. Your strongest opening move is:',
    options: ['Quote T-Mobile\'s cheapest plan', 'Run a side-by-side monthly comparison including all fees, AutoPay, and streaming perks', 'Promise better coverage', 'Offer a free phone to sweeten the deal'],
    correctIndex: 1,
    explanation: 'The side-by-side kills sticker shock. Include taxes, fees, AutoPay savings, and perk value. Let the math do the selling — never promise "better coverage" without proof.',
  },
  {
    id: 'tq-6', category: 'tmobile', difficulty: 3,
    question: 'T-Mobile Tuesdays gives free weekly perks. When is the best time to mention it in a sales call?',
    options: ['Right at the start as a hook', 'When justifying plan value against a competitor', 'Never — it\'s not a sales tool', 'Only when the customer asks about perks'],
    correctIndex: 1,
    explanation: 'T-Mobile Tuesdays adds unexpected value when a customer is comparing plans dollar-for-dollar. "Plus you get free stuff every week" can tip a close.',
  },
  {
    id: 'tq-7', category: 'tmobile', difficulty: 3,
    question: 'A customer has 3 lines, one is mid-device-payment on another carrier. What\'s your first move?',
    options: ['Tell them to come back when the device is paid off', 'Calculate the payoff vs. trade-in value and show if switching still saves money', 'Ignore the device payment', 'Offer to pay it off entirely'],
    correctIndex: 1,
    explanation: 'Do the math live. Often the trade-in value plus switching credits cover or exceed the remaining payments. Show the numbers, don\'t just promise.',
  },
  {
    id: 'tq-8', category: 'tmobile', difficulty: 2,
    question: 'The strongest way to use T-Mobile\'s 5G network advantage in a pitch is:',
    options: ['Say "we have the best 5G"', 'Explain mid-band coverage area is wider than Verizon\'s mmWave', 'Show a speed test', 'It\'s not relevant anymore'],
    correctIndex: 1,
    explanation: 'Specificity wins. "Our mid-band 5G covers more geography than Verizon\'s spotty mmWave" is provable and credible. Vague claims get dismissed.',
  },
];

const COMPETITOR_QUESTIONS: QuizQuestion[] = [
  {
    id: 'cq-1', category: 'competitors', difficulty: 2,
    question: 'Verizon\'s biggest weakness that T-Mobile can exploit is:',
    options: ['Coverage', 'Price — Verizon is consistently more expensive for comparable plans', 'Phone selection', 'Store locations'],
    correctIndex: 1,
    explanation: 'Verizon charges more for similar service. When you compare total monthly cost, T-Mobile wins.',
  },
  {
    id: 'cq-2', category: 'competitors', difficulty: 2,
    question: 'AT&T\'s "unlimited" plans often:',
    options: ['Have no restrictions at all', 'Include hidden throttling and deprioritization at lower tiers', 'Are cheaper than T-Mobile', 'Include international roaming free'],
    correctIndex: 1,
    explanation: 'AT&T\'s lower tiers throttle video and deprioritize data. Always compare at the plan level.',
  },
  {
    id: 'cq-3', category: 'competitors', difficulty: 1,
    question: 'When a customer says "I\'ve been with [carrier] for 15 years," you should:',
    options: ['Tell them loyalty doesn\'t matter', 'Acknowledge the loyalty, then show how switching actually rewards them more', 'Offer a bigger discount', 'Give up — they\'re not switching'],
    correctIndex: 1,
    explanation: 'Respect the loyalty, then reframe: "15 years of loyalty and they never lowered your bill?"',
  },
  {
    id: 'cq-4', category: 'competitors', difficulty: 3,
    question: 'Cable companies selling wireless (Xfinity Mobile, Spectrum) rely on:',
    options: ['Their own cell towers', 'Borrowing network access from major carriers, primarily Verizon', 'Satellite connections', 'Only Wi-Fi'],
    correctIndex: 1,
    explanation: 'MVNOs like Xfinity Mobile ride on Verizon\'s network but with lower priority. T-Mobile owns its network.',
  },
  {
    id: 'cq-5', category: 'competitors', difficulty: 2,
    question: 'The best way to handle "AT&T gave me a BOGO deal" is:',
    options: ['Match it immediately', 'Explain T-Mobile likely has a comparable or better offer, then verify in PromoHub', 'Ignore it', 'Say BOGO deals are scams'],
    correctIndex: 1,
    explanation: 'Never dismiss their offer. Compare it apples-to-apples — often T-Mobile\'s total value wins.',
  },
  {
    id: 'cq-6', category: 'competitors', difficulty: 2,
    question: 'T-Mobile\'s 5G advantage over Verizon is primarily:',
    options: ['Faster speeds everywhere', 'Much broader coverage area using mid-band spectrum', 'Better phones', 'More stores'],
    correctIndex: 1,
    explanation: 'T-Mobile\'s mid-band 5G covers far more geography than Verizon\'s spotty mmWave deployment.',
  },
  {
    id: 'cq-7', category: 'competitors', difficulty: 3,
    question: 'A customer says "My friend switched to T-Mobile and gets dropped calls all the time." Your best response:',
    options: ['Say their friend probably has a bad phone', 'Acknowledge the concern, ask for the friend\'s location, and offer the 15-day test drive to prove it in their area', 'Promise it won\'t happen to them', 'Blame it on Wi-Fi calling'],
    correctIndex: 1,
    explanation: 'Don\'t argue anecdotes. Make it personal and provable: "Let\'s test it where you actually live and work. If it doesn\'t work, you can walk away."',
  },
  {
    id: 'cq-8', category: 'competitors', difficulty: 3,
    question: 'A customer is comparing T-Mobile vs. a cable company bundle (internet + mobile). The strongest angle is:',
    options: ['Ignore the internet and focus on mobile', 'Show that T-Mobile Home Internet + mobile together often beats the cable bundle price with better flexibility and no contracts', 'Say cable internet is bad', 'Only compete on mobile pricing'],
    correctIndex: 1,
    explanation: 'Fight bundle with bundle. HINT + mobile often matches or beats cable combo pricing, and there is no annual contract trapping them.',
  },
  {
    id: 'cq-9', category: 'competitors', difficulty: 3,
    question: 'A customer says "I\'m staying with AT&T because I get a military discount." What should you do?',
    options: ['Move on — can\'t beat military discounts', 'Ask what discount they actually receive, then compare against T-Mobile\'s military/veteran plan which may offer more value', 'Offer a bigger discount', 'Say T-Mobile respects the military more'],
    correctIndex: 1,
    explanation: 'Many customers don\'t know the exact discount amount. T-Mobile\'s military plans are often more competitive. Always compare real numbers, not brand perception.',
  },
];

export const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  ...SALES_QUESTIONS,
  ...PRODUCT_QUESTIONS,
  ...TMOBILE_QUESTIONS,
  ...COMPETITOR_QUESTIONS,
];

export function getRandomQuestions(count: number, categories?: QuizCategory[]): QuizQuestion[] {
  let pool = ALL_QUIZ_QUESTIONS;
  if (categories && categories.length > 0) {
    pool = pool.filter((q) => categories.includes(q.category));
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export const CATEGORY_META: Record<QuizCategory, { label: string; color: string }> = {
  sales: { label: 'Sales', color: '#E20074' },
  products: { label: 'Products', color: '#861B54' },
  tmobile: { label: 'T-Mobile', color: '#E20074' },
  competitors: { label: 'Competitors', color: '#333333' },
};
