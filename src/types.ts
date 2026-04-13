export interface SalesContext {
  age: '18-24' | '25-34' | '35-54' | '55+' | 'Not Specified';
  region: 'New England' | 'Mid-Atlantic' | 'South Atlantic' | 'Southeast' | 'Deep South' | 'Mid-South' | 'Great Lakes' | 'Upper Midwest' | 'Great Plains' | 'Texas & Oklahoma' | 'Desert Southwest' | 'Rocky Mountains' | 'Pacific Northwest' | 'California' | 'Alaska' | 'Hawaii' | 'Not Specified';
  state?: string;
  zipCode?: string;
  product: ('Phone' | 'Home Internet' | 'BTS' | 'IOT' | 'No Specific Product')[];
  purchaseIntent: 'exploring' | 'ready to buy' | 'upgrade / add a line' | 'order support' | 'tech support' | 'account support';
  currentCarrier?: 'AT&T' | 'Verizon' | 'Spectrum' | 'Xfinity' | 'US Cellular' | 'Prepaid (Mint, Boost, etc.)' | 'Other' | 'Not Specified';
  totalLines?: number;
  familyCount?: number;
  currentPlatform?: 'iOS' | 'Android' | 'Other' | 'Not Specified';
  desiredPlatform?: 'iOS' | 'Android' | 'Other' | 'Not Specified';
  hintAvailable?: boolean;
}

export interface StoreInfo {
  name: string;
  address: string;
  distance?: string;
  phone?: string;
  rating?: number;
  mapsUrl?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AccessoryRecommendation {
  name: string;
  why: string;
  priceRange: string;
  imageUrl?: string;
  /** Specific verified prices from t-mobile.com for key items */
  verifiedPrices?: { item: string; fullPrice: string; salePrice?: string }[];
  brands: string[];
  /** Whether this item qualifies for the 25% off 3+ Essential Accessories bundle */
  bundleEligible: boolean;
}

export interface SalesScript {
  welcomeMessages: string[];
  smallTalk: {
    category: string;
    text: string;
  }[];
  discoveryQuestions: string[];
  valuePropositions: string[];
  objectionHandling: {
    concern: string;
    reassurance: string;
  }[];
  accessoryRecommendations: AccessoryRecommendation[];
  purchaseSteps: string[];
  oneLiners: string[];
  coachsCorner: string;
  nearbyStores?: StoreInfo[];
  groundingSources?: GroundingSource[];
}

export interface ObjectionAnalysis {
  talkingPoints: string[];
  counterArguments: string[];
  pivotPlays?: {
    strategy: string;
    script: string;
  }[];
  carrierSpecificArguments?: string[];
  coachsCorner: string;
  complianceNotes: string;
  groundingSources?: GroundingSource[];
}
