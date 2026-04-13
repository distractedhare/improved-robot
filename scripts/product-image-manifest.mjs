#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const CONSUMER_DEVICES = path.join(SRC_DIR, 'data/devices.ts');
const ACCESSORY_SOURCES = [
  path.join(SRC_DIR, 'data/accessories.ts'),
  path.join(SRC_DIR, 'data/essentialAccessories.ts'),
  path.join(SRC_DIR, 'data/accessoryPitches.ts'),
];

const FALLBACK_ASSET = '/images/ui/company-logo-fallback.png';

const EXPECTED_COUNTS = {
  device: 44,
  accessory: 62,
  learn: 8,
  fallback: 1,
};

/** @typedef {{ width: number; height: number }} ImageDimensions */
/** @typedef {'device' | 'accessory' | 'learn' | 'fallback'} ManifestKind */
/** @typedef {{ kind: ManifestKind; path: string; label: string; sourceUrls: string[]; expected: ImageDimensions; fallbackSource: string; }} */

const DIMENSIONS = {
  device: { width: 1600, height: 1600 },
  watch: { width: 1600, height: 1600 },
  tablet: { width: 1600, height: 1200 },
  accessory: { width: 1200, height: 1200 },
  learn: { width: 1600, height: 900 },
  fallback: { width: 1600, height: 900 },
};

const LEARN_IMAGE_PATHS = [
  '/images/ui/plan-experience-beyond.png',
  '/images/ui/plan-experience-more.png',
  '/images/ui/plan-better-value.png',
  '/images/ui/plan-essentials.png',
  '/images/ui/plan-essentials-saver.png',
  '/images/ui/hint-rely.png',
  '/images/ui/hint-amplified.png',
  '/images/ui/hint-all-in.png',
];

const LEARN_SOURCE_HINTS = [];

/** @type {Record<string, string[]>} */
const MANUAL_ACCESSORY_SOURCE_HINTS = {
  '/images/accessories/airpods-4.png': [
    'https://www.apple.com/shop/search?query=AirPods%204',
  ],
  '/images/accessories/airpods-pro-2.png': [
    'https://www.apple.com/shop/search?query=AirPods%20Pro',
  ],
  '/images/accessories/airpods-pro-3.png': [
    'https://www.apple.com/shop/search?query=AirPods%20Pro',
  ],
  '/images/accessories/apple-pencil-s-pen.png': [
    'https://www.apple.com/shop/search?query=Apple%20Pencil',
  ],
  '/images/accessories/magsafe-charger-apple.png': [
    'https://www.apple.com/shop/search?query=MagSafe%20Charger',
  ],
  '/images/accessories/apple-magsafe-charger-2m.png': [
    'https://www.apple.com/shop/search?query=MagSafe%20Charger',
  ],
};

function uniqueSourceUrls(values) {
  return dedupe(values).filter(Boolean);
}

function hasWord(value, words) {
  return words.some((word) => value.includes(word));
}

function addIfPresent(items, url) {
  if (url) {
    items.push(url);
  }
}

function slugifyAccessoryName(name) {
  return name
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/&/g, ' and ')
    .replace(/["'/]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getBaseSlug(filePath) {
  return path.basename(filePath).replace(/\.png$/, '');
}

function dedupe(values) {
  return [...new Set(values)].sort();
}

async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function normalizeName(raw) {
  return raw.trim().replace(/\s+/g, ' ');
}

function extractNamedAccessoryItems(source) {
  const names = new Set();
  const stringPatterns = [
    /name:\s*'([^']+)'/g,
    /name:\s*"([^"]+)"/g,
    /name:\s*`([^`]+)`/g,
  ];

  for (const pattern of stringPatterns) {
    for (const match of source.matchAll(pattern)) {
      const value = normalizeName(match[1]);
      if (value) {
        names.add(value);
      }
    }
  }

  return dedupe([...names]);
}

function classifyDeviceKind(fileName) {
  const normalized = fileName.toLowerCase();

  if (/(watch|ring|watches)/.test(normalized)) {
    return 'watch';
  }

  if (/(ipad|tablet|tab|tab-s|a16|pro-11|pro-13)/.test(normalized)) {
    return 'tablet';
  }

  return 'device';
}

function classifyDeviceCategory(fileName) {
  return classifyDeviceKind(fileName);
}

function deriveSourceUrls(kind, slug, label) {
  const labelLower = label.toLowerCase();
  const normalizedSlug = slug.toLowerCase().trim();

  const pages = [];

  if (kind === 'accessory') {
    addIfPresent(pages, `https://www.t-mobile.com/devices-accessories/${slug}`);
    addIfPresent(pages, `https://www.t-mobile.com/accessories/${slug}`);

    if (hasWord(labelLower, ['airpods', 'beats', 'pencil', 'magsafe', 'case', 'headset', 'earbuds', 'charger'])) {
      addIfPresent(pages, `https://www.apple.com/shop/search?query=${encodeURIComponent(label)}`);
    }

    if (hasWord(labelLower, ['samsung', 'galaxy', 'buds', 'watch', 'ring'])) {
      addIfPresent(pages, `https://www.samsung.com/us/search/?query=${encodeURIComponent(label)}`);
      addIfPresent(pages, `https://www.samsung.com/us/mobile-accessories/?query=${encodeURIComponent(label)}`);
    }

    return uniqueSourceUrls([...pages, ...(MANUAL_ACCESSORY_SOURCE_HINTS[`/images/accessories/${slug}.png`] || [])]);
  }

  if (kind === 'watch') {
    if (hasWord(labelLower, ['apple', 'watch', 'ultra', 'se', 'series'])) {
      addIfPresent(pages, 'https://www.apple.com/watch/');
      addIfPresent(pages, 'https://www.apple.com/shop/buy-watch');
    }
    if (hasWord(labelLower, ['galaxy', 'samsung', 'ring'])) {
      addIfPresent(pages, 'https://www.samsung.com/us/wearables/');
      addIfPresent(pages, `https://www.samsung.com/us/wearables/${normalizedSlug}/`);
      addIfPresent(pages, `https://www.samsung.com/us/wearables/${normalizedSlug}/buy/`);
    }
  }

  if (kind === 'tablet') {
    addIfPresent(pages, 'https://www.apple.com/ipad/');
    addIfPresent(pages, 'https://www.apple.com/shop/buy-ipad');
    addIfPresent(pages, 'https://www.samsung.com/us/tablets/');
    addIfPresent(pages, `https://www.samsung.com/us/tablets/${normalizedSlug}/`);
  }

  if (labelLower.includes('iphone') || labelLower.includes('ipad') || labelLower.includes('air')) {
    addIfPresent(pages, `https://www.apple.com/${slug}`);
    addIfPresent(pages, `https://www.apple.com/shop/buy-${labelLower.includes('ipad') ? 'ipad' : 'iphone'}/${slug}`);
  }

  if (labelLower.includes('galaxy') || labelLower.includes('samsung') || labelLower.includes('t-mobile revvl')) {
    addIfPresent(pages, `https://www.samsung.com/us/smartphones/${normalizedSlug}/`);
    addIfPresent(pages, `https://www.samsung.com/us/smartphones/${normalizedSlug}/buy/`);
    addIfPresent(pages, `https://www.samsung.com/us/smartphones/${normalizedSlug}/buy/?model=${normalizedSlug}`);
    addIfPresent(pages, `https://www.samsung.com/us/mobile/${slug}`);
    addIfPresent(pages, `https://www.samsung.com/us/${normalizedSlug}/buy/`);
    addIfPresent(pages, `https://www.t-mobile.com/samsung/${normalizedSlug}`);
  }

  if (labelLower.includes('pixel') || labelLower.includes('google')) {
    addIfPresent(pages, `https://store.google.com/us/product/${slug}`);
    addIfPresent(pages, `https://www.t-mobile.com/pixel/${normalizedSlug}`);
  }

  if (labelLower.includes('moto') || labelLower.includes('motorola')) {
    addIfPresent(pages, `https://www.motorola.com/us/products/${normalizedSlug}`);
    addIfPresent(pages, `https://www.t-mobile.com/motorola/${normalizedSlug}`);
  }

  if (labelLower.includes('syncup') || labelLower.includes('franklin') || labelLower.includes('tcl') || labelLower.includes('watch')) {
    addIfPresent(pages, `https://www.t-mobile.com/accessories/${normalizedSlug}`);
    addIfPresent(pages, `https://www.t-mobile.com/${normalizedSlug}`);
  }

  addIfPresent(pages, `https://www.t-mobile.com/cell-phones/${normalizedSlug}`);

  return uniqueSourceUrls(pages);
}

async function buildDeviceManifestEntries() {
  const source = await readFile(CONSUMER_DEVICES);
  const imageEntryPattern = /name:\s*['"]([^'"]+)['"][\s\S]*?imageUrl:\s*['"]([^'"]+\.png)['"]/g;
  const entries = [];

  for (const match of source.matchAll(imageEntryPattern)) {
    const label = normalizeName(match[1]);
    const targetPath = match[2];
    const fileName = getBaseSlug(targetPath);

    const category = classifyDeviceCategory(fileName);
    const dimensions = DIMENSIONS[category] || DIMENSIONS.device;
    const sourceUrls = uniqueSourceUrls(deriveSourceUrls(category, fileName, label));

    entries.push({
      kind: 'device',
      path: targetPath,
      label,
      sourceUrls,
      fallbackSource: FALLBACK_ASSET,
      expected: dimensions,
    });
  }

  return dedupe(entries.map((item) => JSON.stringify(item))).map((item) => JSON.parse(item));
}

async function buildAccessoryManifestEntries() {
  const paths = [];

  for (const sourcePath of ACCESSORY_SOURCES) {
    const source = await readFile(sourcePath);
    const names = extractNamedAccessoryItems(source);

    for (const name of names) {
      const targetPath = `/images/accessories/${slugifyAccessoryName(name)}.png`;
      paths.push(targetPath);
    }
  }

  const dedupedPaths = dedupe(paths);

  return dedupedPaths.map((targetPath) => ({
    kind: 'accessory',
    path: targetPath,
    label: getBaseSlug(targetPath).replace(/-/g, ' '),
    sourceUrls: uniqueSourceUrls([
      ...deriveSourceUrls('accessory', getBaseSlug(targetPath), getBaseSlug(targetPath).replace(/-/g, ' ')),
    ]),
    fallbackSource: FALLBACK_ASSET,
    expected: DIMENSIONS.accessory,
  }));
}

function buildLearnManifestEntries() {
  return LEARN_IMAGE_PATHS.map((targetPath) => ({
    kind: 'learn',
    path: targetPath,
    label: getBaseSlug(targetPath).replace(/-/g, ' '),
    sourceUrls: LEARN_SOURCE_HINTS,
    fallbackSource: FALLBACK_ASSET,
    expected: DIMENSIONS.learn,
  }));
}

function buildFallbackManifestEntries() {
  return [
    {
      kind: 'fallback',
      path: FALLBACK_ASSET,
      label: 'product-fallback',
      sourceUrls: [FALLBACK_ASSET],
      fallbackSource: FALLBACK_ASSET,
      expected: DIMENSIONS.fallback,
    },
  ];
}

function mergeAndSort(entries) {
  const list = entries
    .slice()
    .sort((left, right) => {
      if (left.kind !== right.kind) {
        return left.kind.localeCompare(right.kind);
      }
      return left.path.localeCompare(right.path);
    });

  return list;
}

export async function getProductImageManifest() {
  const entries = [
    ...(await buildDeviceManifestEntries()),
    ...(await buildAccessoryManifestEntries()),
    ...buildLearnManifestEntries(),
    ...buildFallbackManifestEntries(),
  ];

  const merged = mergeAndSort(entries);

  const counts = merged.reduce((acc, item) => {
    const kind = item.kind;
    acc[kind] = (acc[kind] ?? 0) + 1;
    return acc;
  }, {});

  if (counts.device !== EXPECTED_COUNTS.device) {
    throw new Error(`Expected ${EXPECTED_COUNTS.device} device paths, got ${counts.device}`);
  }
  if (counts.accessory !== EXPECTED_COUNTS.accessory) {
    throw new Error(`Expected ${EXPECTED_COUNTS.accessory} accessory paths, got ${counts.accessory}`);
  }
  if (counts.learn !== EXPECTED_COUNTS.learn) {
    throw new Error(`Expected ${EXPECTED_COUNTS.learn} learn image paths, got ${counts.learn}`);
  }
  if (counts.fallback !== EXPECTED_COUNTS.fallback) {
    throw new Error(`Expected ${EXPECTED_COUNTS.fallback} fallback asset, got ${counts.fallback}`);
  }

  return merged;
}

async function printManifest() {
  const manifest = await getProductImageManifest();
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  printManifest().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
