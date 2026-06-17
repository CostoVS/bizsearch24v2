// BizSearch24 Local Persisted Data Layer & State Helpers

export interface Province {
  slug: string;
  name: string;
}

export const SA_PROVINCES: Province[] = [
  { slug: "national", name: "National / All Areas" },
  { slug: "gauteng", name: "Gauteng (GP)" },
  { slug: "western-cape", name: "Western Cape (WC)" },
  { slug: "kwazulu-natal", name: "KwaZulu-Natal (KZN)" },
  { slug: "eastern-cape", name: "Eastern Cape (EC)" },
  { slug: "free-state", name: "Free State (FS)" },
  { slug: "limpopo", name: "Limpopo (LP)" },
  { slug: "mpumalanga", name: "Mpumalanga (MP)" },
  { slug: "north-west", name: "North West (NW)" },
  { slug: "northern-cape", name: "Northern Cape (NC)" }
];

export const CATEGORIES = [
  "Solar & Backup Power",
  "Electricians",
  "Plumbers",
  "Accountants & Auditors",
  "IT Services",
  "Building & Construction",
  "Cleaning Services",
  "Legal & Consulting",
  "Auto Repair & Towing",
  "Web Development",
  "General Contractors"
];

export interface Ad {
  id: string; // Unique Identifier
  title: string;
  description: string;
  category: string;
  location: string; // Province Slug
  address: string;
  phone: string;
  servicesOffered: string;
  isPremium?: boolean;
  isSponsor?: boolean;
  isSpotlight?: boolean;
  isBannerPlacement?: boolean;
  isVideoPromo?: boolean;
  isActive?: boolean;
  fixedPosition?: "standard" | "top" | "middle" | "bottom";
  sectionTarget?: "directory" | "news" | "tools" | "all";
  image?: string;
  
  // Claiming attributes
  isClaimed?: boolean;
  claimIntention?: "premium" | "free" | "remove" | "";
  claimedByEmail?: string;
  claimDocuments?: {
    uploadedAt: string;
    idDoc: string; // Data URL or filename placeholder
    cipcDoc: string;
    sarsDoc: string;
    proofOfAddress: string;
    bankStatement: string;
    virusScanState: "clean" | "scanned" | "none";
    originalSize: string;
    resizedSize: string;
    clarityScore: number; // Percentage clarity after processing
  };
}

// Initial default database containing both CSV uploaded (unclaimed) and manually configured preference ads
export const MOCK_ADS: Ad[] = [
  // CSV Uploaded Ads (Pre-loaded, Unclaimed, Unique CSV ID format)
  {
    id: "csv-901-gp",
    title: "GC Solar Johannesburg",
    description: "Enterprise solar power setups, top-tier lithium grid tier invertors, and local commercial backup backup solutions in Sandton.",
    category: "Solar & Backup Power",
    location: "gauteng",
    address: "Lozi Park, Sandton, Johannesburg, 2196",
    phone: "+27 11 405 9210",
    servicesOffered: "Commercial Solar Panels, 10kW Sine-Wave Inverters, Battery Power Packs, Compliance Auditing",
    isPremium: false,
    isClaimed: false,
    isActive: true,
    fixedPosition: "standard",
    sectionTarget: "directory",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=450&auto=format&fit=crop"
  },
  {
    id: "csv-902-kzn",
    title: "Cheric Energy KZN",
    description: "Reliable diesel generator engineering, solar conversions, hybrid off-grid power grids for agricultural estates in KZN.",
    category: "Solar & Backup Power",
    location: "kwazulu-natal",
    address: "24 Ferryden Place, Durban North, 4051",
    phone: "+27 72 304 8181",
    servicesOffered: "Generator maintenance, hybrid installations, industrial energy audits, backup changeovers",
    isPremium: false,
    isClaimed: false,
    isActive: true,
    fixedPosition: "standard",
    sectionTarget: "directory",
    image: "https://images.unsplash.com/photo-1548613053-2206762122e2?w=450&auto=format&fit=crop"
  },
  {
    id: "csv-903-wc",
    title: "EcoSmart Plumbing & Heat Cape Town",
    description: "Leak detection, solar geyser maintenance, grey-water systems, and emergency plumbing diagnostics in Bellville & City Bowl.",
    category: "Plumbers",
    location: "western-cape",
    address: "88 Voortrekker Road, Bellville, Cape Town, 7530",
    phone: "+27 21 945 3290",
    servicesOffered: "Leak Detection, Smart Solar Geyser Installation, High-Pressure Jetting, Certificate of Compliance",
    isPremium: false,
    isClaimed: false,
    isActive: true,
    fixedPosition: "standard",
    sectionTarget: "directory"
  },
  {
    id: "csv-904-gp",
    title: "Meyers & Partner Chartered Accountants",
    description: "Comprehensive SA tax advisory, monthly corporate payroll, POPIA compliance reporting, and CIPC entity registrations.",
    category: "Accountants & Auditors",
    location: "gauteng",
    address: "15 West Street, Houghton, Johannesburg, 2198",
    phone: "+27 11 728 5590",
    servicesOffered: "Corporate SARS Audits, VAT Back-logs, Monthly Payroll Ledger Maintenance, Business Financial Auditing",
    isPremium: false,
    isClaimed: false,
    isActive: true,
    fixedPosition: "standard",
    sectionTarget: "directory",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=450&auto=format&fit=crop"
  },
  // Preference Manual Ads (Fully Owned / verified or configured)
  {
    id: "pref-501-gp",
    title: "Direct Sparks Electrical",
    description: "Residential emergency callouts, complex phase distributions, smart home wiring, and compliance cert audits in Pretoria East.",
    category: "Electricians",
    location: "gauteng",
    address: "59 Garsfontein Road, Pretoria East, 0181",
    phone: "+27 12 348 1022",
    servicesOffered: "24/7 Power Failure Repairs, Distribution Board Rewires, Inverter Changeback Switches",
    isPremium: true,
    isClaimed: true,
    isActive: true,
    fixedPosition: "top",
    sectionTarget: "directory",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=450&auto=format&fit=crop"
  },
  {
    id: "pref-502-wc",
    title: "DevCoast Digital Solutions",
    description: "Premium React & Next.js custom software, South African local retail e-commerce engines, and high-performance SEO management.",
    category: "Web Development",
    location: "western-cape",
    address: "42 Loop Street, Cape Town CBD, 8001",
    phone: "+27 82 559 1042",
    servicesOffered: "Web Applications, Custom CRM Engines, Local Search Engine Optimization, Mobile Designs",
    isPremium: true,
    isSponsor: true,
    isClaimed: true,
    isActive: true,
    fixedPosition: "standard",
    sectionTarget: "all"
  }
];

// Direct chat claim message structure
export interface Message {
  id: string;
  senderEmail: string;
  senderName: string;
  adId: string;
  adTitle: string;
  timestamp: string;
  content: string;
  claimDocuments?: {
    uploadedAt: string;
    idDoc: string;
    cipcDoc: string;
    sarsDoc: string;
    proofOfAddress: string;
    bankStatement: string;
    virusScanState: "clean" | "scanned" | "none";
    originalSize: string;
    resizedSize: string;
    clarityScore: number;
  };
  claimIntention: "premium" | "free" | "remove";
  isChecked: boolean; // reviewed status
  approvalStatus: "pending" | "approved" | "rejected";
}

// Initial mock chat logs
export const MOCK_MESSAGES: Message[] = [
  {
    id: "msg_1710001",
    senderEmail: "info@gcsolarjohannesburg.co.za",
    senderName: "Thabo Langa (GC Solar)",
    adId: "csv-901-gp",
    adTitle: "GC Solar Johannesburg",
    timestamp: "2026-06-16T14:20:00Z",
    content: "Hi Admin! We noticed our listing was seeded onto BizSearch24 from a bulk directory upload. We officially claim ownership to verify contacts, connect directly to clients, and request upgrade to **Premium Membership (R199)**. See our verified tax clearance & CIPC registration documents attached. All scanned perfectly safe.",
    claimIntention: "premium",
    isChecked: false,
    approvalStatus: "pending",
    claimDocuments: {
      uploadedAt: "2026-06-16T14:18:00Z",
      idDoc: "data:image/png;base64,123_verified_id_scandoc",
      cipcDoc: "data:image/png;base64,123_verified_cipc_registration",
      sarsDoc: "data:image/png;base64,123_verified_sars_clearance",
      proofOfAddress: "data:image/png;base64,123_utility_bill",
      bankStatement: "data:image/png;base64,123_fnb_bank_statement",
      virusScanState: "clean",
      originalSize: "5.4 MB total",
      resizedSize: "1.2 MB total (Fits 800x600 px)",
      clarityScore: 98
    }
  }
];

export interface Banner {
  id: string;
  text: string;
  isActive: boolean;
}

export const MOCK_BANNERS: Banner[] = [
  { id: "banner-1", text: "🚀 BizSearch24 Premium is live! Elevate your trade visibility for only R199/month.", isActive: true }
];

// Global local storage access layers

export function getStoredAds(): Ad[] {
  if (typeof window === "undefined") return MOCK_ADS;
  try {
    const raw = localStorage.getItem("bizsearch_stored_ads");
    if (!raw) {
      localStorage.setItem("bizsearch_stored_ads", JSON.stringify(MOCK_ADS));
      return MOCK_ADS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load stored ads", e);
    return MOCK_ADS;
  }
}

export function saveStoredAds(ads: Ad[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("bizsearch_stored_ads", JSON.stringify(ads));
  } catch (e) {
    console.error("Failed to persist ads", e);
  }
}

export function getStoredMessages(): Message[] {
  if (typeof window === "undefined") return MOCK_MESSAGES;
  try {
    const raw = localStorage.getItem("bizsearch_stored_messages");
    if (!raw) {
      localStorage.setItem("bizsearch_stored_messages", JSON.stringify(MOCK_MESSAGES));
      return MOCK_MESSAGES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load stored claims messages", e);
    return MOCK_MESSAGES;
  }
}

export function saveStoredMessages(messages: Message[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("bizsearch_stored_messages", JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to persist messages", e);
  }
}

export function getStoredBanners(): Banner[] {
  if (typeof window === "undefined") return MOCK_BANNERS;
  try {
    const raw = localStorage.getItem("bizsearch_banners");
    if (!raw) {
      localStorage.setItem("bizsearch_banners", JSON.stringify(MOCK_BANNERS));
      return MOCK_BANNERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return MOCK_BANNERS;
  }
}

export function saveStoredBanners(banners: Banner[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("bizsearch_banners", JSON.stringify(banners));
  } catch (e) {
    console.error("Failed to persist banners", e);
  }
}

// Custom Unique ID Generator for Ads (CSV or manual)
export function generateUniqueAdId(source: "csv" | "pref", provinceSlug: string = "national"): string {
  const prefix = source === "csv" ? "csv" : "pref";
  const randomSerial = Math.floor(100000 + Math.random() * 900000); // 6 digit sequence
  const provSuffix = provinceSlug.substring(0, 3).toLowerCase();
  return `${prefix}-${randomSerial}-${provSuffix}`;
}
