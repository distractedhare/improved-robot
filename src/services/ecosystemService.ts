import { EcosystemMatrix, DemographicKey, DemographicSection, SupportAccessoryItem } from '../types/ecosystem';
import { selectVariation } from './rotationService';

let cached: EcosystemMatrix | null = null;

export async function loadEcosystemMatrix(): Promise<EcosystemMatrix | null> {
  if (cached) return cached;
  try {
    const res = await fetch('/device-ecosystem-matrix.json');
    if (!res.ok) return null;
    const data: EcosystemMatrix = await res.json();
    cached = data;
    return data;
  } catch {
    console.warn('Failed to load device-ecosystem-matrix.json');
    return null;
  }
}

/**
 * Map age string from SalesContext to demographic key, or null if not specified.
 */
export function ageToDemoKey(age: string): DemographicKey | null {
  if (age === '18-24' || age === '25-34' || age === '35-54' || age === '55+') return age;
  return null;
}

/**
 * Get the demographic section for a given age, or null.
 */
export function getDemoSection(matrix: EcosystemMatrix, age: string): DemographicSection | null {
  const key = ageToDemoKey(age);
  if (!key) return null;
  return matrix.demographics[key] ?? null;
}

/**
 * Get a single support-intent accessory for the instant plays panel.
 * Filters by demographic if age is specified; otherwise falls back to universal items.
 */
export function getSupportAccessory(
  matrix: EcosystemMatrix,
  age: string
): { item: SupportAccessoryItem; pitch: string } | null {
  const { supportIntentAccessories } = matrix;
  if (!supportIntentAccessories?.items?.length) return null;

  const demoKey = ageToDemoKey(age);
  let candidates: SupportAccessoryItem[];

  if (demoKey) {
    // Filter by bestFor matching the selected age
    candidates = supportIntentAccessories.items.filter(item =>
      item.bestFor.includes(demoKey)
    );
  } else {
    // No age selected — only universal-appeal items (3+ demographics)
    candidates = supportIntentAccessories.items.filter(item =>
      item.bestFor.length >= 3
    );
  }

  if (candidates.length === 0) return null;

  // Use rotation to pick one item
  const rotationKey = `support-accessory-${demoKey ?? 'universal'}`;

  // Build a combined key from all candidate product names for rotation
  const candidateNames = candidates.map(c => c.product).join('|');
  const itemIndex = selectVariationIndex(rotationKey + '-item-' + candidateNames, candidates.length);
  const item = candidates[itemIndex];

  // Then rotate the pitch variation for that item
  const pitchKey = `support-pitch-${item.product}`;
  const pitch = selectVariation(pitchKey, [...item.pitchVariations]);

  return { item, pitch };
}

/**
 * Select an index from 0..count-1 using rotation logic.
 */
function selectVariationIndex(key: string, count: number): number {
  const dummyVariations = Array.from({ length: count }, (_, i) => String(i));
  const selected = selectVariation(key, dummyVariations);
  return parseInt(selected, 10);
}

export type ProductCategory = 'smartphones' | 'tablets' | 'wearables' | 'iotProducts' | 'accessories';

/**
 * Map product selections to ecosystem matrix categories.
 */
export function productToCategories(products: string[]): ProductCategory[] {
  const categories = new Set<ProductCategory>();
  for (const p of products) {
    switch (p) {
      case 'Phone':
        categories.add('smartphones');
        categories.add('accessories');
        break;
      case 'Home Internet':
        categories.add('iotProducts');
        categories.add('accessories');
        break;
      case 'BTS':
        categories.add('tablets');
        categories.add('wearables');
        categories.add('accessories');
        break;
      case 'IOT':
        categories.add('iotProducts');
        categories.add('accessories');
        break;
      case 'No Specific Product':
        categories.add('smartphones');
        categories.add('tablets');
        categories.add('wearables');
        categories.add('iotProducts');
        categories.add('accessories');
        break;
    }
  }
  return [...categories];
}

export interface DemoProductRec {
  name: string;
  pitch: string;
  category: ProductCategory;
}

/**
 * Get demographic-filtered product recommendations with rotated pitches.
 */
export function getDemoProductRecs(
  matrix: EcosystemMatrix,
  age: string,
  products: string[]
): DemoProductRec[] {
  const section = getDemoSection(matrix, age);
  if (!section) return [];

  const categories = productToCategories(products);
  const recs: DemoProductRec[] = [];

  for (const cat of categories) {
    const items = section[cat];
    if (!items) continue;

    for (const item of items) {
      const name = 'device' in item ? (item as any).device : ('product' in item ? (item as any).product : (item as any).category);
      const pitchKey = `${age}-${name}`;
      const pitch = selectVariation(pitchKey, [...item.pitchVariations]);
      recs.push({ name, pitch, category: cat });
    }
  }

  return recs;
}

/**
 * Get cross-demographic product pitches (P360 + T-Life) for the given age.
 */
export function getCrossDemoPitches(
  matrix: EcosystemMatrix,
  age: string
): { p360: string | null; tLife: string | null } {
  const demoKey = ageToDemoKey(age);
  if (!demoKey) return { p360: null, tLife: null };

  const p360 = matrix.crossDemographicProducts.protection360.pitchByDemo[demoKey] ?? null;
  const tLife = matrix.crossDemographicProducts.tLife.pitchByDemo[demoKey] ?? null;

  return { p360, tLife };
}
