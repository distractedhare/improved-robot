export type BingoCategory = 'sales' | 'skill' | 'vibe';

export interface BingoCell {
  id: string;
  label: string;
  category: BingoCategory;
  description: string;
  countsWhen: string;
  example: string;
}

export interface BingoBoardDefinition {
  id: string;
  name: string;
  subtitle: string;
  cells: BingoCell[];
}

function makeCell(
  id: string,
  label: string,
  category: BingoCategory,
  description: string,
  countsWhen: string,
  example: string,
): BingoCell {
  return { id, label, category, description, countsWhen, example };
}

export const FREE_SPACE: BingoCell = makeCell(
  'free-space',
  'FREE',
  'vibe',
  'You showed up ready to work.',
  'This square is always counted at the center of the board.',
  'Example: you clocked in, opened the app, and got after the day.',
);

const SALES_FUNDAMENTALS_CELLS: BingoCell[] = [
  makeCell('sf-open-question', 'Open Q', 'skill', 'Started with a real discovery question.', 'Count it when you lead with curiosity instead of a product pitch.', 'Example: "What are you hoping the next phone or plan fixes for you?"'),
  makeCell('sf-confirm-reason', 'Why Now', 'skill', 'Confirmed what brought them in today.', 'Count it when the customer clearly says why this call matters right now.', 'Example: you uncover that a cracked phone, bill pain, or move is driving the call.'),
  makeCell('sf-check-credit', 'Credit First', 'sales', 'Checked credit early enough to shape the path.', 'Count it when you verify credit before the close gets messy.', 'Example: you check credit up front so the trade-in and line-add path stays clean.'),
  makeCell('sf-quote-total', 'Quote Total', 'sales', 'Quoted the monthly total in plain language.', 'Count it when you clearly say what the customer will pay per month.', 'Example: you roll plan, device, and protection into one simple monthly number.'),
  makeCell('sf-check-carrier', 'Carrier', 'skill', 'Confirmed who they have now and what is frustrating them.', 'Count it when the current carrier becomes part of the story.', 'Example: you learn they are with Verizon and tired of price creep.'),
  makeCell('sf-hint-check', 'HINT Check', 'sales', 'Checked Home Internet availability.', 'Count it when you run the address or clearly ask for it.', 'Example: every phone-plan call still gets a quick Home Internet check.'),
  makeCell('sf-fit-tier', 'Plan Fit', 'skill', 'Matched the recommendation to the right plan tier.', 'Count it when you position the plan around needs instead of naming every option.', 'Example: you move a value-focused customer to Experience More instead of overselling Beyond.'),
  makeCell('sf-experience-story', 'Exp Story', 'skill', 'Explained the Experience lineup cleanly.', 'Count it when a customer can tell the difference between More and Beyond after you explain it.', 'Example: you anchor Beyond on premium perks and More on strong everyday value.'),
  makeCell('sf-p360', 'P360 Ask', 'sales', 'Asked for Protection 360 directly.', 'Count it when you confidently ask for P360 instead of hoping they request it.', 'Example: you frame P360 as part of the setup, not a side note.'),
  makeCell('sf-bundle', '3+ Bundle', 'sales', 'Positioned the 3+ accessory bundle.', 'Count it when you package the essentials instead of pitching one item at a time.', 'Example: case, glass, and charger land as the easy first-day bundle.'),
  makeCell('sf-ask-sale', 'Ask Sale', 'skill', 'Made a direct close attempt.', 'Count it when you clearly ask for the order.', 'Example: "Want me to lock that in for you today?"'),
  makeCell('sf-recap', 'Recap Next', 'skill', 'Recapped the next steps before ending the call.', 'Count it when the customer leaves knowing exactly what happens next.', 'Example: you confirm shipping, order timing, and any follow-up steps.'),
  makeCell('sf-tradein', 'Trade-In', 'sales', 'Brought trade-in value into the conversation.', 'Count it when the trade-in meaningfully helps the close.', 'Example: you use the old phone value to soften a premium-device payment.'),
  makeCell('sf-autopay', 'AutoPay', 'sales', 'Included AutoPay in the value story.', 'Count it when AutoPay helps clarify the final monthly price.', 'Example: you explain the price with AutoPay already baked in.'),
  makeCell('sf-name', 'Use Name', 'vibe', 'Used the customer’s name naturally.', 'Count it when you personalize the call without sounding robotic.', 'Example: you use their name in the opener and close.'),
  makeCell('sf-reset-objection', 'Reset Calm', 'skill', 'Stayed calm and reset after pushback.', 'Count it when you slow the call down instead of sounding defensive.', 'Example: you acknowledge the concern, then guide the customer back to one clear option.'),
  makeCell('sf-upgrade-path', 'Upgrade Path', 'sales', 'Mapped the cleanest upgrade path.', 'Count it when you explain the best route without overcomplicating the account.', 'Example: you show whether upgrade, add-a-line, or switcher math lands best.'),
  makeCell('sf-add-line', 'Add Line', 'sales', 'Opened a real add-a-line angle.', 'Count it when you plant or close a connected voice-line opportunity.', 'Example: a family plan conversation turns into a kid-line discussion.'),
  makeCell('sf-accessory', 'Attach Gear', 'sales', 'Positioned at least one accessory with purpose.', 'Count it when the add-on solves a real daily friction point.', 'Example: you recommend a car mount because they mention maps and commuting.'),
  makeCell('sf-bill-fix', 'Bill First', 'skill', 'Solved the billing question before selling.', 'Count it when you earn trust by handling the real issue first.', 'Example: you explain the charge clearly, then transition into savings.'),
  makeCell('sf-simple-language', 'Keep Simple', 'skill', 'Kept the language clean and non-jargony.', 'Count it when the explanation feels fast and customer-facing.', 'Example: you skip the internal lingo and use one clear monthly comparison.'),
  makeCell('sf-second-question', '2nd Q', 'skill', 'Asked one more discovery question than expected.', 'Count it when the extra question uncovers the real need.', 'Example: the second question reveals the customer really cares about hotspot and travel.'),
  makeCell('sf-fulfillment', 'Pickup/Ship', 'sales', 'Confirmed fulfillment cleanly.', 'Count it when shipping, pickup, or delivery is handled without confusion.', 'Example: you clarify whether the device arrives or is ready in-store.'),
  makeCell('sf-close-clean', 'End Strong', 'vibe', 'Ended with confidence and gratitude.', 'Count it when the call ends feeling clear, calm, and complete.', 'Example: the customer knows you handled it and thanks you before hanging up.'),
];

const PRODUCT_PRO_CELLS: BingoCell[] = [
  makeCell('pp-iphone-fit', 'iPhone Fit', 'skill', 'Matched an iPhone story to the customer.', 'Count it when you connect the right iPhone feature to their real use case.', 'Example: you lead with battery, camera, or ecosystem instead of listing specs.'),
  makeCell('pp-s25-ai', 'S25 AI', 'skill', 'Used Galaxy AI as a customer-facing benefit.', 'Count it when AI is positioned as a shortcut, not jargon.', 'Example: you show how live translate or photo cleanup solves a real problem.'),
  makeCell('pp-pixel-camera', 'Pixel Cam', 'skill', 'Used the Pixel camera story well.', 'Count it when the photography angle clearly fits the caller.', 'Example: you position the Pixel for low-light photos and clean family shots.'),
  makeCell('pp-watch-line', 'Watch Line', 'sales', 'Pitched a watch as a real new-line add.', 'Count it when a watch line becomes part of the recommendation.', 'Example: a fitness-focused customer leaves with a watch line added.'),
  makeCell('pp-tablet-angle', 'Tablet Case', 'sales', 'Used a tablet use case that landed.', 'Count it when you move beyond "maybe a tablet too?" and give a reason.', 'Example: homework, travel, or streaming makes the tablet add feel obvious.'),
  makeCell('pp-hint-allin', 'All-In', 'sales', 'Positioned Home Internet All-In confidently.', 'Count it when All-In becomes the clear best-fit recommendation.', 'Example: you frame $55 and bundled perks against their current cable bill.'),
  makeCell('pp-rebate', 'HI Rebate', 'sales', 'Used the Home Internet rebate story cleanly.', 'Count it when the rebate or month-on-us detail helps the close.', 'Example: the customer sees the first-bill relief right away.'),
  makeCell('pp-test-drive', '15-Day', 'skill', 'Used the 15-day test drive to lower risk.', 'Count it when you use the try-it angle to unlock a hesitant customer.', 'Example: the customer agrees because they can test it before committing.'),
  makeCell('pp-p360-benefit', 'P360 Proof', 'skill', 'Explained the strongest P360 benefit for that device.', 'Count it when the protection story feels specific to the caller.', 'Example: screen repair or theft replacement becomes the deciding factor.'),
  makeCell('pp-apple-eco', 'Apple Eco', 'skill', 'Told a clean Apple ecosystem story.', 'Count it when phone, watch, and audio feel like one setup.', 'Example: you connect iPhone, Apple Watch, and AirPods around convenience.'),
  makeCell('pp-samsung-eco', 'Samsung Eco', 'skill', 'Told a clean Samsung ecosystem story.', 'Count it when Galaxy devices feel built to work together.', 'Example: phone, watch, and Buds become one simple productivity pitch.'),
  makeCell('pp-pixel-eco', 'Pixel Eco', 'skill', 'Used Pixel + Google services as a story.', 'Count it when Pixel lands because the Google workflow fits them.', 'Example: photos, Gemini, and smart-home tie-ins make the pitch stronger.'),
  makeCell('pp-syncup-tracker', 'Tracker', 'sales', 'Recommended SyncUP Tracker naturally.', 'Count it when tracker feels useful instead of random.', 'Example: pets, luggage, or a kid backpack makes the $5 line make sense.'),
  makeCell('pp-syncup-drive', 'DRIVE', 'sales', 'Recommended SyncUP DRIVE with a real need.', 'Count it when connected-car value is part of the story.', 'Example: a parent wants in-car Wi-Fi and location visibility.'),
  makeCell('pp-hotspot-use', 'Hotspot', 'skill', 'Used hotspot needs in the plan conversation.', 'Count it when hotspot demand clearly shapes the recommendation.', 'Example: travel or remote work points the customer to a stronger plan tier.'),
  makeCell('pp-kids-watch', 'Kids Watch', 'sales', 'Positioned a kids watch well.', 'Count it when the parent clearly sees the watch-line value.', 'Example: GPS and messaging land for a family that is not ready for a phone.'),
  makeCell('pp-mesh-value', 'Mesh Value', 'skill', 'Used mesh/extender value in the HINT story.', 'Count it when better in-home coverage helps the pitch.', 'Example: the customer worries about dead zones and you position the extender.'),
  makeCell('pp-audio-upgrade', 'Audio Fit', 'sales', 'Matched the right audio add-on to the customer.', 'Count it when premium audio solves a real routine.', 'Example: commute, workouts, or work calls point to the right earbuds.'),
  makeCell('pp-charge-mount', 'Mount/Charge', 'sales', 'Used charging or mounting as the friction fixer.', 'Count it when convenience gear becomes the easy yes.', 'Example: you solve a dead-battery problem with charger + cable.'),
  makeCell('pp-case-glass', 'Case + Glass', 'sales', 'Explained why setup protection matters on day one.', 'Count it when the caller sees case and glass as essential, not optional.', 'Example: a new phone order leaves with both protection basics.'),
  makeCell('pp-plan-compare', 'More vs Beyond', 'skill', 'Compared Experience More and Beyond clearly.', 'Count it when the customer understands the value gap quickly.', 'Example: you anchor Beyond on premium perks and More on strong daily value.'),
  makeCell('pp-value-pivot', 'Value Pivot', 'skill', 'Pivoted from flagship to value device cleanly.', 'Count it when you save the sale without sounding like a downgrade.', 'Example: you move from a premium phone to a smarter monthly fit.'),
  makeCell('pp-streaming-story', 'Perk Story', 'skill', 'Used streaming or bundle perks in a clean way.', 'Count it when perks help, but do not overwhelm the close.', 'Example: Hulu and Apple TV+ become part of the value math.'),
  makeCell('pp-promo-verify', 'Verify Promo', 'vibe', 'Checked PromoHub or verified pricing before promising.', 'Count it when you protect the demo with a real verification step.', 'Example: you verify the latest offer before quoting the close.'),
];

const CLOSERS_CLUB_CELLS: BingoCell[] = [
  makeCell('cc-price-reframe', 'Price Reframe', 'skill', 'Reframed a price objection into monthly value.', 'Count it when you move the conversation from sticker shock to fit and savings.', 'Example: you compare their current monthly spend to the all-in T-Mobile setup.'),
  makeCell('cc-coverage-proof', 'Coverage Proof', 'skill', 'Handled coverage fear with proof, not hype.', 'Count it when you use local logic, test drive, or verification instead of arguing.', 'Example: you ground the coverage answer in their address and trial path.'),
  makeCell('cc-think-it-over', 'Need to Think', 'skill', 'Worked through "I need to think about it."', 'Count it when you ask the question behind the delay and keep the call moving.', 'Example: you uncover that the real concern is payment, not timing.'),
  makeCell('cc-close-switcher', 'Close Switcher', 'sales', 'Closed a switcher with confidence.', 'Count it when the caller leaves another carrier and commits.', 'Example: you land the port because the savings and device payoff story clicks.'),
  makeCell('cc-close-aal', 'Close AAL', 'sales', 'Closed an add-a-line opportunity.', 'Count it when a second line becomes part of the final order.', 'Example: you turn one upgrade call into a family-line add.'),
  makeCell('cc-hint-bill', 'Bill to HI', 'sales', 'Moved a billing conversation into Home Internet.', 'Count it when savings pain becomes a clean HINT pivot.', 'Example: after fixing the bill confusion, you compare internet spend and close HINT.'),
  makeCell('cc-premium-audio', 'Premium Audio', 'sales', 'Closed a premium audio add-on.', 'Count it when the customer takes the premium accessory, not just the basics.', 'Example: AirPods Pro or Buds Pro land because the use case fits perfectly.'),
  makeCell('cc-premium-bundle', 'Premium Bundle', 'sales', 'Closed a higher-value full bundle.', 'Count it when essentials plus one premium add-on land together.', 'Example: case, glass, charger, and audio all go on the same order.'),
  makeCell('cc-assumption-close', 'Assume Close', 'skill', 'Used a confident assumption close.', 'Count it when you move naturally into the next step instead of asking timidly.', 'Example: "Perfect, I’ll lock in the black one and add the glass."'),
  makeCell('cc-silence', 'Use Silence', 'skill', 'Held the silence after the close ask.', 'Count it when you resist filling the gap and let the customer decide.', 'Example: you ask for the order and stay quiet long enough for the yes.'),
  makeCell('cc-choice-close', 'Choice Close', 'skill', 'Used a choice close instead of yes/no.', 'Count it when the customer picks between two good options.', 'Example: you ask whether they want More or Beyond, not whether they want anything at all.'),
  makeCell('cc-payment-focus', 'Payment Fit', 'skill', 'Solved around the monthly payment target.', 'Count it when you reshape the offer around what they can really do today.', 'Example: trade-in, plan fit, or device pivot gets the monthly number in range.'),
  makeCell('cc-urgency-clean', 'Clean Urgency', 'skill', 'Created urgency without pressure.', 'Count it when you use timing cleanly and compliantly.', 'Example: you mention current promos ending without sounding pushy or made-up.'),
  makeCell('cc-deescalate', 'De-Escalate', 'vibe', 'De-escalated first, then sold second.', 'Count it when you calm the room before trying to close anything.', 'Example: the caller starts hot, you reset the tone, then reopen the sales path.'),
  makeCell('cc-tech-to-sale', 'Tech to Sale', 'sales', 'Turned a service call into a real sales path.', 'Count it when fixing the issue naturally opens a valid recommendation.', 'Example: you solve a device problem, then close the upgrade or P360.'),
  makeCell('cc-warm-transfer', 'Warm Transfer', 'skill', 'Made a warm transfer that stayed usable.', 'Count it when the handoff includes real context and momentum.', 'Example: the next rep knows the need before the customer repeats the story.'),
  makeCell('cc-recovery-close', 'Recover Close', 'skill', 'Recovered after a rough moment and still closed.', 'Count it when the call slips but you recover cleanly.', 'Example: pricing confusion happens, you reset the numbers, and still win the order.'),
  makeCell('cc-keep-control', 'Keep Control', 'skill', 'Kept the conversation moving with purpose.', 'Count it when the call stays structured without sounding robotic.', 'Example: you guide the customer from discovery to close without getting lost in side paths.'),
  makeCell('cc-three-objections', 'Beat Three', 'skill', 'Worked through three objections on one call.', 'Count it when you overcome repeated pushback without losing the tone.', 'Example: price, timing, and trust all show up, and you still land the order.'),
  makeCell('cc-competitor-reframe', 'Competitor Flip', 'skill', 'Reframed a competitor claim well.', 'Count it when you answer a competitor pitch with calm, relevant value.', 'Example: you answer an AT&T or Verizon claim with savings plus better fit.'),
  makeCell('cc-contract-fear', 'No Contract', 'skill', 'Handled fear about lock-in or commitment.', 'Count it when you remove risk in a believable way.', 'Example: you use the test drive or flexibility story to calm the customer.'),
  makeCell('cc-savings-story', 'Savings Story', 'sales', 'Made the savings story feel real.', 'Count it when the caller can repeat the monthly or yearly value back to you.', 'Example: you stack plan, rebate, and internet savings into one clean story.'),
  makeCell('cc-next-question', 'Next Q', 'skill', 'Used one more question to reopen the close.', 'Count it when a single extra question uncovers the real blocker.', 'Example: "What still feels off about this option?" reopens the call.'),
  makeCell('cc-finish-strong', 'Strong Finish', 'vibe', 'Finished the call sounding confident and helpful.', 'Count it when the customer leaves with momentum and clarity.', 'Example: even after a long conversation, the end still feels sharp and professional.'),
];

export const BINGO_BOARDS: BingoBoardDefinition[] = [
  {
    id: 'sales-fundamentals',
    name: 'Sales Fundamentals',
    subtitle: 'Win the clean, repeatable habits that make live calls feel easy.',
    cells: SALES_FUNDAMENTALS_CELLS,
  },
  {
    id: 'product-pro',
    name: 'Product Pro',
    subtitle: 'Sharpen the stories that make devices, perks, and Home Internet feel obvious.',
    cells: PRODUCT_PRO_CELLS,
  },
  {
    id: 'closers-club',
    name: "Closer's Club",
    subtitle: 'Practice the pivots, pressure-handling, and closes that move the room.',
    cells: CLOSERS_CLUB_CELLS,
  },
];

export function getBoardById(boardId: string): BingoBoardDefinition {
  return BINGO_BOARDS.find((board) => board.id === boardId) ?? BINGO_BOARDS[0];
}

export function getBoardLayout(boardId: string): BingoCell[] {
  const board = getBoardById(boardId);
  return [...board.cells.slice(0, 12), FREE_SPACE, ...board.cells.slice(12)];
}

export function getFeaturedBoardId(date = new Date()): string {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const elapsedDays = Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86_400_000);
  const weekIndex = Math.floor(elapsedDays / 7) % BINGO_BOARDS.length;
  return BINGO_BOARDS[weekIndex].id;
}
