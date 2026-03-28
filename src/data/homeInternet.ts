export interface HomeInternetPlan {
  name: string;
  standalonePrice: number;
  withVoiceLine: number;
  typicalDownload: string;
  typicalUpload: string;
  gateway: string;
  features: string[];
  includedPerks: string[];
}

export const HOME_INTERNET_PLANS: HomeInternetPlan[] = [
  {
    name: 'Rely',
    standalonePrice: 50,
    withVoiceLine: 35,
    typicalDownload: '133-415 Mbps',
    typicalUpload: '12-55 Mbps',
    gateway: 'High-performance',
    features: ['Unlimited data', 'No annual contract', '5-Year Price Guarantee'],
    includedPerks: [],
  },
  {
    name: 'Amplified',
    standalonePrice: 60,
    withVoiceLine: 45,
    typicalDownload: '170-498 Mbps',
    typicalUpload: '12-55 Mbps',
    gateway: 'Wi-Fi 7 premium',
    features: ['Unlimited data', 'No annual contract', '5-Year Price Guarantee'],
    includedPerks: [],
  },
  {
    name: 'All-In',
    standalonePrice: 70,
    withVoiceLine: 55,
    typicalDownload: '170-498 Mbps',
    typicalUpload: '12-55 Mbps',
    gateway: 'Wi-Fi 7 premium',
    features: ['Unlimited data', 'No annual contract', '5-Year Price Guarantee', 'Mesh Wi-Fi extender included', '24/7 tech support', 'Gateway upgrade (year 3)'],
    includedPerks: ['Hulu on Us', 'Paramount+ Essential', 'Advanced Cyber Security'],
  },
];

export const HOME_INTERNET_BUNDLE_DISCOUNT = '$15/month bill credit when combined with any T-Mobile postpaid voice line. All-In streaming and security perks deliver over $480/year in added value.';

export const OTHER_HOME_PRODUCTS = {
  away: {
    name: 'T-Mobile Home Internet AWAY',
    price: 160,
    description: 'For RVs, campers, and mobile use — unlimited data, 50+ device connections, stays connected in motion, works on nationwide 5G/4G LTE',
  },
  backup: {
    name: 'Home Internet Backup',
    price: 10,
    description: 'Designed as ISP outage protection. Available for $10/month for Better Value customers. Battery pack (Nimble CHAMP) available for $50 with activation',
  },
  fiber: {
    description: 'T-Mobile Fiber available in select areas — 300 Mbps to 2 Gbps symmetrical, $10/month discount with voice line on 1 GIG+ tiers',
  },
  testDrive: {
    description: 'Cancel within 15 days of activation, submit redemption within 30 days of cancellation, receive full refund via bill credit (allow 2 billing cycles). Must return gateway in good condition. Maximum 1 per account.',
  },
};
