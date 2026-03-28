export interface Device {
  name: string;
  category: 'iphone' | 'samsung' | 'pixel' | 'other' | 'tablet' | 'watch' | 'hotspot';
  startingPrice: number | string;
  released: string;
  keySpecs: string;
  // Note: promos are NOT stored here — they come exclusively from weekly-update.json
  // to prevent stale promo data. Only specs, price, and release info stay here.
}

export const PHONES: Device[] = [
  // iPhone lineup
  { name: 'iPhone 17 Pro Max', category: 'iphone', startingPrice: 1199, released: 'Sept 2025', keySpecs: '6.9" OLED 120Hz, A19 Pro, triple 48MP, 8x zoom, 2TB max' },
  { name: 'iPhone 17 Pro', category: 'iphone', startingPrice: 1099, released: 'Sept 2025', keySpecs: '6.3" OLED 120Hz, A19 Pro, triple 48MP, vapor-cooled' },
  { name: 'iPhone Air', category: 'iphone', startingPrice: 999, released: 'Sept 2025', keySpecs: '6.5", A19 Pro, thinnest iPhone ever, Apple C1X modem' },
  { name: 'iPhone 17', category: 'iphone', startingPrice: 829, released: 'Sept 2025', keySpecs: '6.3" OLED 120Hz, A19, dual 48MP' },
  { name: 'iPhone 17e', category: 'iphone', startingPrice: 599, released: 'March 2026', keySpecs: '6.1" OLED 60Hz, A19, 48MP, 256GB base, MagSafe/Qi2' },
  { name: 'iPhone 16', category: 'iphone', startingPrice: 799, released: 'Sept 2024', keySpecs: 'Still sold; 128GB base' },
  // Samsung Galaxy lineup
  { name: 'Galaxy S26 Ultra', category: 'samsung', startingPrice: 1299, released: 'March 2026', keySpecs: '6.9" QHD+, Snapdragon 8 Elite Gen 5, 200MP f/1.4, Privacy Display, S Pen, up to 1TB' },
  { name: 'Galaxy S26+', category: 'samsung', startingPrice: 1099, released: 'March 2026', keySpecs: '6.7" QHD+, 256/512GB' },
  { name: 'Galaxy S26', category: 'samsung', startingPrice: 899, released: 'March 2026', keySpecs: '6.3" FHD+, 256/512GB (no 128GB option)' },
  { name: 'Galaxy Z Fold7', category: 'samsung', startingPrice: 'Premium', released: '2025', keySpecs: 'Slimmer, virtually invisible crease, no S Pen' },
  { name: 'Galaxy Z Flip7', category: 'samsung', startingPrice: 'Mid-range foldable', released: '2025', keySpecs: 'Slimmest Flip ever (6.35mm), edge-to-edge external display' },
  { name: 'Galaxy A17 5G', category: 'samsung', startingPrice: 229.99, released: '2026', keySpecs: 'Budget 5G phone' },
  // Google Pixel lineup
  { name: 'Pixel 10 Pro XL', category: 'pixel', startingPrice: 1099, released: 'Aug 2025', keySpecs: 'Largest Pixel battery (5,200mAh)' },
  { name: 'Pixel 10 Pro', category: 'pixel', startingPrice: 999, released: 'Aug 2025', keySpecs: 'Tensor G5, 100x zoom' },
  { name: 'Pixel 10', category: 'pixel', startingPrice: 799, released: 'Aug 2025', keySpecs: 'Tensor G5, 4,970mAh' },
  { name: 'Pixel 10 Pro Fold', category: 'pixel', startingPrice: 'Premium', released: 'Oct 2025', keySpecs: 'Foldable, dual-cell 5,015mAh' },
  { name: 'Pixel 10a', category: 'pixel', startingPrice: 499, released: 'March 2026', keySpecs: 'Tensor G5, Gorilla Glass 7i, 30+ hr battery' },
  // Other
  { name: 'Motorola moto g 2026', category: 'other', startingPrice: 189.99, released: '2026', keySpecs: 'Budget device' },
  { name: 'T-Mobile REVVL 8 Pro', category: 'other', startingPrice: 'Budget', released: '2025', keySpecs: 'T-Mobile own-brand budget phone' },
];

export const TABLETS: Device[] = [
  { name: 'iPad (A16)', category: 'tablet', startingPrice: 449, released: '2024', keySpecs: '10.9"' },
  { name: 'iPad Air (M4)', category: 'tablet', startingPrice: 599, released: 'March 2026', keySpecs: '11" from $599, 13" from $799' },
  { name: 'iPad Pro (M4)', category: 'tablet', startingPrice: 'Premium', released: '2024', keySpecs: '11" and 13" OLED' },
  { name: 'Samsung Galaxy Tab S10 FE 5G', category: 'tablet', startingPrice: 599.99, released: '2025', keySpecs: '5G tablet' },
  { name: 'Samsung Galaxy Tab A11+ 5G', category: 'tablet', startingPrice: 289.99, released: '2026', keySpecs: 'Budget 5G tablet' },
];

export const WATCHES: Device[] = [
  { name: 'Apple Watch Series 11', category: 'watch', startingPrice: 'New', released: '2025', keySpecs: 'Latest Apple Watch flagship' },
  { name: 'Apple Watch SE 3', category: 'watch', startingPrice: 'New', released: '2025', keySpecs: 'Always-On display, great for fitness' },
  { name: 'Apple Watch Ultra 3', category: 'watch', startingPrice: 'New', released: '2025', keySpecs: 'Advanced sports metrics, rugged build' },
  { name: 'Samsung Galaxy Watch8 (40mm)', category: 'watch', startingPrice: 399.99, released: '2025', keySpecs: 'Samsung flagship watch' },
  { name: 'Pixel Watch 4', category: 'watch', startingPrice: 'Available', released: '2025', keySpecs: '41mm and 44mm options' },
];

export const HOTSPOTS: Device[] = [
  { name: 'TCL LINKPORT IK511', category: 'hotspot', startingPrice: 96, released: 'Oct 2025', keySpecs: 'First commercial 5G RedCap device. USB-C. Works with Windows/macOS/iPadOS/Android/Linux.' },
];

export const CONNECTED_DEVICE_INFO = {
  pricePerMonth: 5,
  plan: 'Experience Beyond',
  tabletLaptopData: '30GB high-speed data, then 600 Kbps',
  watchData: 'Unlimited talk, text, data at 512+ Kbps',
  installmentTerms: 'Watches and tablets on 36-month EIP; phones remain 24-month',
  deviceConnectionCharge: 35,
};

export const SAMSUNG_NOTE = 'Galaxy S26 series does NOT support Qi2/MagSafe. All S26 models run One UI 8.5 on Android 16 with 7 years of updates.';
