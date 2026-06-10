/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Worker, Job, Kiosk, CommunityPost, AsanteDrop } from "./types";

// Generates beautiful styling-friendly custom SVG string for a worker's cyberpunk avatar
export function getCyberAvatar(seed: string, color1 = "#FFB400", color2 = "#E63946"): string {
  // Simple deterministic colorizer or avatar generator returned as a data URI SVG
  const escapedId = encodeURIComponent(seed);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="g_${escapedId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encodeURIComponent(color1)}"/><stop offset="100%" stop-color="${encodeURIComponent(color2)}"/></linearGradient><pattern id="p_${escapedId}" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 0 10 L 10 0 M 0 0 L 10 10" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="%2311163A"/><rect width="100" height="100" fill="url(%23p_${escapedId})"/><circle cx="50" cy="40" r="22" fill="url(%23g_${escapedId})" opacity="0.85"/><path d="M 15 88 C 15 70, 30 65, 50 65 C 70 65, 85 70, 85 88 Z" fill="url(%23g_${escapedId})" opacity="0.9"/><circle cx="50" cy="40" r="14" fill="none" stroke="%23F4F1E8" stroke-width="2"/><rect x="42" y="38" width="16" height="4" rx="2" fill="%23F4F1E8"/><path d="M 30 75 L 70 75" stroke="%23F4F1E8" stroke-width="2" stroke-dasharray="3,3"/></svg>`;
}

export const initialWorkers: Worker[] = [
  {
    id: "fundi-01",
    name: "Juma Kamau",
    phone: "+254 712 345 678",
    avatar: getCyberAvatar("juma", "#FFB400", "#E63946"),
    category: "Electrical",
    subSkills: ["Solar Panel Setups", "Battery Charging", "Power Backup Systems", "Stima Diagnostics"],
    rating: 4.9,
    completedJobsCount: 142,
    hourlyRateKsh: 850,
    locationName: "Kibera Sector 3, Nairobi",
    coordinates: { lat: -1.3130, lng: 36.7880 },
    isOnline: true,
    isVerified: true,
    verificationLevel: "Tier-3",
    hasUssdFallback: true,
    bio: "Fundi wa stima wa kuaminika mtaani Kibera tangu 2018. Expert in solar setup, home backups, and residential wiring. Honest, fast, and verified by Wazee wa Baraza. Sisi ni watu wa kazi!",
    featured: true,
    reviews: [
      {
        id: "r-1",
        reviewerName: "Amina Omondi",
        rating: 5,
        comment: "Excellent setup of our hybrid backup battery system. Safi sana! Mteja ameridhika.",
        date: "2026-05-24"
      },
      {
        id: "r-2",
        reviewerName: "David Kiprotich",
        rating: 4.8,
        comment: "Solved a complex circuit issue in under 2 hours. Highly active and responsive.",
        date: "2026-06-02"
      }
    ]
  },
  {
    id: "fundi-02",
    name: "Aisha Mwangi",
    phone: "+254 722 987 654",
    avatar: getCyberAvatar("aisha", "#06D6A0", "#7B2CBF"),
    category: "Plumbing",
    subSkills: ["Fixing Leaks & Pipes", "Water Tank Spares", "Unblocking Toilets & Sinks"],
    rating: 4.8,
    completedJobsCount: 96,
    hourlyRateKsh: 750,
    locationName: "Kangemi Central, Nairobi",
    coordinates: { lat: -1.2662, lng: 36.7450 },
    isOnline: true,
    isVerified: true,
    verificationLevel: "Tier-2",
    hasUssdFallback: true,
    bio: "Fundi wa bomba na ujenzi wa vyoo vya kisasa. I fix water leaks, run drainage setups, and install water tanks. Safe and tidy finish mtaani Kangemi!",
    featured: true,
    reviews: [
      {
        id: "r-3",
        reviewerName: "Hassan Ali",
        rating: 5,
        comment: "Superb work unblocking our drainage. Zero issues since she finished. Mambo ni safi!",
        date: "2026-06-04"
      }
    ]
  },
  {
    id: "fundi-03",
    name: "Boutros Okoth",
    phone: "+254 733 445 566",
    avatar: getCyberAvatar("boutros", "#7B2CBF", "#E63946"),
    category: "Smart Tech",
    subSkills: ["Motherboards & Electronics", "Smartphone Repair", "POS & Water Kiosk Board Toolkits"],
    rating: 4.7,
    completedJobsCount: 210,
    hourlyRateKsh: 900,
    locationName: "Githurai 45, Kiambu",
    coordinates: { lat: -1.2083, lng: 36.9128 },
    isOnline: false,
    isVerified: true,
    verificationLevel: "Tier-3",
    hasUssdFallback: false,
    bio: "Mtaalamu wa kutengeneza mifumo ya kielektroniki. I fix POS solar charging controllers, smartphone motherboards, radio systems, and digital components. Kazi inakubalika mtaani Githurai.",
    featured: false,
    reviews: [
      {
        id: "r-4",
        reviewerName: "Nekesa Wanjala",
        rating: 4.5,
        comment: "Revived my water kiosk micro-controller panel board instantly. Kept us online!",
        date: "2026-03-12"
      }
    ]
  },
  {
    id: "fundi-04",
    name: "Mensa Darko",
    phone: "+254 744 556 677",
    avatar: getCyberAvatar("mensa", "#FFB400", "#06D6A0"),
    category: "Carpentry",
    subSkills: ["Furniture & Chair Spares", "Kitchen Cabinets", "Folding Benches & Desks"],
    rating: 4.9,
    completedJobsCount: 78,
    hourlyRateKsh: 800,
    locationName: "Kayole Estate, Nairobi",
    coordinates: { lat: -1.2818, lng: 36.9042 },
    isOnline: true,
    isVerified: true,
    verificationLevel: "Tier-1",
    hasUssdFallback: true,
    bio: "Pioneering local carpentry. Expert in durable space-saving folding furniture, shelving, and sliding partitions. Bei ya haki kabisa we settle mtaani.",
    featured: false,
    reviews: [
      {
        id: "r-5",
        reviewerName: "Otieno Okeyo",
        rating: 5,
        comment: "Stunning fold-away ergonomic workstation made of locally sourced solid timber and bamboo. Noma sana!",
        date: "2026-05-18"
      }
    ]
  },
  {
    id: "fundi-05",
    name: "Grace Kendi",
    phone: "+254 755 667 788",
    avatar: getCyberAvatar("grace", "#06D6A0", "#FFB400"),
    category: "Solar Energy",
    subSkills: ["Photovoltaics Wiring", "DC Power Inverters", "Battery Chargers"],
    rating: 4.6,
    completedJobsCount: 54,
    hourlyRateKsh: 950,
    locationName: "Ongata Rongai, Kajiado",
    coordinates: { lat: -1.3963, lng: 36.7594 },
    isOnline: true,
    isVerified: false,
    verificationLevel: null,
    hasUssdFallback: true,
    bio: "Solar systems and grid backups expert covering the Rongai and Kajiado area. I install solar pumps, home chargers, and troubleshoot solar failures. Welcome wote!",
    featured: false,
    reviews: []
  },
  {
    id: "fundi-06",
    name: "Kofi Boateng",
    phone: "+254 701 123 456",
    avatar: getCyberAvatar("kofi", "#E63946", "#7B2CBF"),
    category: "Masonry",
    subSkills: ["Brickwork & Plaster", "Wall Crack Repair", "Floor Tiling (Fittings)"],
    rating: 4.8,
    completedJobsCount: 115,
    hourlyRateKsh: 850,
    locationName: "Kawangware Sector 2, Nairobi",
    coordinates: { lat: -1.2829, lng: 36.7538 },
    isOnline: true,
    isVerified: true,
    verificationLevel: "Tier-2",
    hasUssdFallback: true,
    bio: "High-quality tiling and plastering. Specializing in dry, double-sealed brickwork, and masonry repair. I promise long-term durability — jasho la kazi halipotei!",
    reviews: []
  }
];

export const initialJobs: Job[] = [
  {
    id: "job-101",
    title: "Off-Grid Solar Commissioning",
    description: "Need to install 3 solar arrays on a corrugated mabati roof. Must configure standard smart inverter and route lines into a 12V LiFePO4 battery pack using dynamic charge regulators. Local sound system setup is a big plus!",
    category: "Electrical",
    budgetKsh: 12000,
    locationName: "Kibera Sector 3, Nairobi",
    coordinates: { lat: -1.3140, lng: 36.7890 },
    postedDate: "2026-06-08T09:00:00Z",
    status: "open",
    urgency: "immediate",
    clientId: "cl-09",
    clientName: "Saitoti Ledama",
    clientPhone: "+254 790 123 456",
    paymentStatus: "escrowed",
    bids: [
      {
        id: "bid-1",
        workerId: "fundi-01",
        workerName: "Juma Kamau",
        workerRating: 4.9,
        amountKsh: 11500,
        durationHours: 6,
        proposal: "Niaje mteja! Mimi ni Juma Kamau, Jua Kali solar technician verified right here in Sector 3. I have set up 40+ lithium battery backups. Niko ready kabisa kuanza sasa hivi. Safi sana!",
        postedDate: "2026-06-08T10:15:00Z"
      }
    ],
    hasVoiceNote: true
  },
  {
    id: "job-102",
    title: "Eco Bio-digester Pipe Routing",
    description: "Retrofit dual bathroom drains to bypass central sewers. Directing sink runoff to bio-filter and blackwater to concrete digester unit. Custom heat-joints required to guarantee zero smells.",
    category: "Plumbing",
    budgetKsh: 8500,
    locationName: "Kangemi Central, Nairobi",
    coordinates: { lat: -1.2670, lng: 36.7460 },
    postedDate: "2026-06-07T14:30:00Z",
    status: "open",
    urgency: "standard",
    clientId: "cl-15",
    clientName: "Mercy Wambui",
    clientPhone: "+254 788 111 222",
    paymentStatus: "unpaid",
    bids: [],
    hasVoiceNote: false
  },
  {
    id: "job-103",
    title: "Water Kiosk Controller Diagnosis",
    description: "The main solar charging controller interface on our community water kiosk is throwing error CODE-88. Screen is dead, backup battery discharges instantly. Need board diagnostics and micro-solder recovery.",
    category: "Smart Tech",
    budgetKsh: 5000,
    locationName: "Githurai 45, Kiambu",
    coordinates: { lat: -1.2090, lng: 36.9130 },
    postedDate: "2026-06-09T08:15:00Z",
    status: "open",
    urgency: "immediate",
    clientId: "cl-01",
    clientName: "Local Water Council Hub",
    clientPhone: "+254 700 888 888",
    paymentStatus: "escrowed",
    bids: [
      {
        id: "bid-2",
        workerId: "fundi-03",
        workerName: "Boutros Okoth",
        workerRating: 4.7,
        amountKsh: 4800,
        durationHours: 3,
        proposal: "Mambo vipi! I have a portable solder station and battery analyzer. Based right here in Githurai, so I can step over in 15 minutes to sort your board. Uko na rada!",
        postedDate: "2026-06-09T09:45:00Z"
      }
    ],
    hasVoiceNote: true
  },
  {
    id: "job-104",
    title: "Double-decker Convertible Wooden Bench",
    description: "Build 3 modular composite wooden bench systems which integrate hidden storage dividers and phone charge slots. Custom wood polishing requested.",
    category: "Carpentry",
    budgetKsh: 15000,
    locationName: "Rongai Galleria Area",
    coordinates: { lat: -1.3970, lng: 36.7600 },
    postedDate: "2026-06-05T11:00:00Z",
    status: "completed",
    urgency: "scheduled",
    clientId: "cl-88",
    clientName: "Esther Chemutai",
    clientPhone: "+254 711 222 333",
    assignedWorkerId: "fundi-04",
    paymentStatus: "released"
  }
];

export const initialKiosks: Kiosk[] = [
  {
    id: "kiosk-01",
    name: "Boma Cyber-Hub Kiosk",
    agentName: "Mama Becky",
    phone: "+254 701 444 555",
    locationName: "Kibera Sector 3 Main Cross",
    coordinates: { lat: -1.3125, lng: 36.7875 },
    servicesCount: 384,
    isVerifiedHub: true
  },
  {
    id: "kiosk-02",
    name: "Githurai Node-7 Aggregator",
    agentName: "Mwalimu James",
    phone: "+254 722 555 666",
    locationName: "Githurai Railway Station Crossing",
    coordinates: { lat: -1.2085, lng: 36.9125 },
    servicesCount: 612,
    isVerifiedHub: true
  },
  {
    id: "kiosk-03",
    name: "Kangemi Transit Portal",
    agentName: "Njoroge G.",
    phone: "+254 733 666 777",
    locationName: "Kangemi Flyover East Sliproad",
    coordinates: { lat: -1.2660, lng: 36.7445 },
    servicesCount: 195,
    isVerifiedHub: false
  }
];

export const initialCommunityPosts: CommunityPost[] = [
  {
    id: "post-1",
    authorName: "Juma Kamau",
    authorRole: "worker",
    title: "WARNING: Counterfeit Solar Charge Regulator Batches on River Road ⚠️",
    content: "Niaje wakuu! Kuna solar controllers feki zenye lebo ya 'Kente-Tech' zinasambazwa Nairobi River Road na zina-fail within 48 hours. Haziwezi handle heavy loads kisha hazina safety fuse yoyote kuprotect batteries za lithium. Tafadhali kila mmoja afungue cover aangalie wiring kabla ya kununua. Kulinda chapaa ya mteja ni kulinda kura yetu!",
    tags: ["StimaSafety", "FakeAlert", "SokoYaRiverRoad"],
    likes: 42,
    repliesCount: 14,
    postedDate: "2026-06-08T16:00:00Z",
    isSticky: true
  },
  {
    id: "post-2",
    authorName: "Mama Becky",
    authorRole: "kiosk",
    title: "Amekubaliwa na Wazee wa Baraza: How local Fundis get their Trust Badge",
    content: "If you want to clear your background verification to unlock better paying local jobs on the network, step into our Boma Kiosk near Sector 3. Just bring your national ID, references from three local community elders, and any diplomas. We run a digital scan and instantly register your voucher so residents know you are highly trustworthy. Kazi nzuri hujitangaza yenyewe!",
    tags: ["Verification", "BarazaTrust", "MzeeVouch"],
    likes: 31,
    repliesCount: 8,
    postedDate: "2026-06-07T10:00:00Z",
    isSticky: false
  },
  {
    id: "post-3",
    authorName: "Amina Omondi",
    authorRole: "client",
    title: "Cost guidelines for pipe replaced mtaani Kangemi in 2026 (Prevent Undercutting)",
    content: "Greetings baraza! Standard rates for toilet unblocking or water-tank pipe setups range from 750 Ksh to 900 Ksh per hour depending on equipment. Let's support our local fundis and pay them fairly. Jasho la kazi halipotei na kidole kimoja hakivunji chawa!",
    tags: ["Plumbing", "FairWages", "BarazaWisdom"],
    likes: 27,
    repliesCount: 5,
    postedDate: "2026-06-05T08:30:00Z",
    isSticky: false
  }
];

export const mockAsanteDrops: AsanteDrop[] = [
  {
    id: "d-1",
    workerId: "fundi-01",
    workerName: "Juma Kamau",
    amountCelo: 5.5,
    transactionHash: "0xbf30...df44",
    reason: "Completed Kibera solar micro-grid on schedule.",
    timestamp: "2026-06-08T18:30:00Z"
  },
  {
    id: "d-2",
    workerId: "fundi-02",
    workerName: "Aisha Mwangi",
    amountCelo: 3.0,
    transactionHash: "0xc8d7...41ab",
    reason: "Prompt emergency pipe repair tipping from hub.",
    timestamp: "2026-06-09T11:45:00Z"
  }
];
