import { SalesContext, CustomerNeed } from '../types';

/**
 * Auto-infer likely customer needs from existing SalesContext.
 * No extra UI inputs required — this runs behind the scenes
 * so the Live tab stays clean and fast for reps mid-call.
 */
export function inferCustomerNeeds(context: SalesContext): CustomerNeed[] {
  const needs = new Set<CustomerNeed>();

  // --- Age-based signals ---
  switch (context.age) {
    case '18-24':
      needs.add('camera');
      needs.add('performance');
      needs.add('streaming');
      break;
    case '25-34':
      needs.add('travel');
      needs.add('streaming');
      needs.add('camera');
      break;
    case '35-54':
      needs.add('family');
      needs.add('battery');
      needs.add('productivity');
      break;
    case '55+':
      needs.add('simplicity');
      needs.add('battery');
      needs.add('durability');
      break;
  }

  // --- Product-based signals ---
  for (const product of context.product) {
    switch (product) {
      case 'Home Internet':
        needs.add('streaming');
        break;
      case 'IOT':
        needs.add('family');
        needs.add('durability');
        break;
      case 'BTS':
        needs.add('family');
        break;
    }
  }

  // --- Carrier-based signals ---
  if (context.currentCarrier === 'Prepaid (Mint, Boost, etc.)') {
    needs.add('budget');
  }

  // --- Intent-based signals ---
  if (context.purchaseIntent === 'exploring') {
    // Explorers are often price-comparing
    needs.add('budget');
  }

  return [...needs];
}
