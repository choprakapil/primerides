import { SITE_CONFIG, SiteConfig } from "@/data/siteConfig";

export interface ExtendedSiteSettings extends SiteConfig {
  emergencyPhone: string;
  roadsideAssistancePhone: string;
  businessHours: string;
  gstNumber: string;
  securityDepositDefault: number;
  googleMapsEmbedUrl: string;
  whatsappInquiryTemplate: string;
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  isVisible: boolean;
  order: number;
}

export interface HeaderConfig {
  logoUrl: string;
  logoHeight: number;
  menuItems: HeaderMenuItem[];
  buttons: {
    authButton: {
      enabled: boolean;
      label: string;
      icon: string;
    };
    phoneButton: {
      enabled: boolean;
      label: string;
      phoneNumber: string;
      icon: string;
    };
    whatsappButton: {
      enabled: boolean;
      label: string;
      number: string;
    };
  };
}

export interface FooterConfig {
  aboutText: string;
  copyrightText: string;
  quickLinks: { label: string; href: string }[];
  cityHubs: { name: string; tag: string }[];
  supportPhone: string;
  supportEmail: string;
  hours: string;
}

export interface NotificationSettings {
  announcementBar: {
    enabled: boolean;
    text: string;
    linkText: string;
    linkUrl: string;
    badgeText: string;
  };
  templates: {
    bookingConfirmed: {
      whatsapp: string;
      sms: string;
    };
    kycApproved: {
      whatsapp: string;
      sms: string;
    };
    kycRejected: {
      whatsapp: string;
      sms: string;
    };
    tripReminder: {
      whatsapp: string;
      sms: string;
    };
  };
  adminAlerts: {
    newBookingSms: boolean;
    newBookingEmail: boolean;
    newKycAlert: boolean;
    alertEmail: string;
    alertPhone: string;
  };
}

export const DEFAULT_SITE_SETTINGS: ExtendedSiteSettings = {
  ...SITE_CONFIG,
  emergencyPhone: "+91 90453 01702",
  roadsideAssistancePhone: "+91 90453 01702",
  businessHours: "24 Hours / 7 Days (Doorstep & Curbside Airport Delivery)",
  gstNumber: "07AABCP1234F1Z5",
  securityDepositDefault: 3000,
  googleMapsEmbedUrl: "https://maps.google.com/?q=Indira+Gandhi+International+Airport+Delhi",
  whatsappInquiryTemplate: "Hi PrimeRides, I am interested in reserving a self-drive luxury car in Delhi NCR / Lucknow.",
};

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  logoUrl: "/assets/img/PRLogo.png",
  logoHeight: 44,
  menuItems: [
    { id: "home", label: "HOME", href: "/", isVisible: true, order: 1 },
    { id: "about", label: "ABOUT US", href: "/about", isVisible: true, order: 2 },
    { id: "fleet", label: "OUR FLEET", href: "/cars", isVisible: true, order: 3 },
    { id: "blogs", label: "BLOGS", href: "/blogs", isVisible: true, order: 4 },
    { id: "contact", label: "CONTACT", href: "/contact", isVisible: true, order: 5 },
  ],
  buttons: {
    authButton: {
      enabled: true,
      label: "Register / Login",
      icon: "User",
    },
    phoneButton: {
      enabled: true,
      label: "+91 90453 01702",
      phoneNumber: "+919045301702",
      icon: "PhoneCall",
    },
    whatsappButton: {
      enabled: false,
      label: "WhatsApp Concierge",
      number: "+919045301702",
    },
  },
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  aboutText: "PrimeRides is Delhi NCR & Lucknow's premier luxury self-drive mobility service offering 50+ flagship SUVs, 4x4s, and executive sedans with unlimited KMs and 24/7 doorstep airport delivery.",
  copyrightText: "© 2026 PrimeRides Mobility Private Limited. All rights reserved.",
  quickLinks: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Our Fleet", href: "/cars" },
    { label: "Travel Blogs", href: "/blogs" },
    { label: "FAQs & Rental Policies", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  cityHubs: [
    { name: "Delhi - IGI Airport Terminal 3", tag: "Primary Hub" },
    { name: "Delhi - Aerocity Hospitality District", tag: "Express Desk" },
    { name: "Gurugram - DLF Cyber City", tag: "Corporate Desk" },
    { name: "Lucknow - CCS Airport & Gomti Nagar", tag: "Regional Hub" },
  ],
  supportPhone: "+91 90453 01702",
  supportEmail: "support@primerides.in",
  hours: "24 Hours / 7 Days (Doorstep Airport Delivery)",
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  announcementBar: {
    enabled: true,
    badgeText: "SPECIAL FESTIVE OFFER",
    text: "Flat 20% OFF on all Outstation & Mountain 4x4 Trips across Delhi NCR & Lucknow!",
    linkText: "Explore Fleet",
    linkUrl: "/cars",
  },
  templates: {
    bookingConfirmed: {
      whatsapp: "Dear {customer_name}, your PrimeRides self-drive reservation #{booking_id} for {car_name} is CONFIRMED! Pickup: {pickup_location} on {pickup_date}.",
      sms: "PrimeRides: Booking #{booking_id} confirmed for {car_name}. Pickup {pickup_date} at {pickup_location}. Support: 9045301702",
    },
    kycApproved: {
      whatsapp: "Hello {customer_name}, your Driving License & ID have been VERIFIED successfully. You are ready for vehicle handover!",
      sms: "PrimeRides: Your KYC documents are verified! Handover ready for booking #{booking_id}.",
    },
    kycRejected: {
      whatsapp: "Hello {customer_name}, your KYC document verification requires attention: {reason}. Please re-upload via your account portal.",
      sms: "PrimeRides: Action required on your KYC documents. Please visit your account to re-upload. Info: 9045301702",
    },
    tripReminder: {
      whatsapp: "Reminder: Your PrimeRides trip starts tomorrow at {pickup_time}. Our concierge will meet you at {pickup_location}.",
      sms: "PrimeRides: Trip reminder for tomorrow at {pickup_time} ({pickup_location}). Have a great drive!",
    },
  },
  adminAlerts: {
    newBookingSms: true,
    newBookingEmail: true,
    newKycAlert: true,
    alertEmail: "operations@primerides.in",
    alertPhone: "+919045301702",
  },
};

export interface HomepageConfig {
  heroData: {
    badgeText: string;
    titleLine1: string;
    titleLine2: string;
    subtext: string;
    bgImage: string;
    usp1: string;
    usp2: string;
    usp3: string;
  };
  hubs: {
    id: string;
    city: string;
    fleetCount: string;
    desc: string;
    tag: string;
  }[];
  trustHighlights: {
    title: string;
    desc: string;
    icon?: string;
    iconName?: string;
    animation?: string;
  }[];
  offers: any[];
  reviews: any[];
}

export interface AboutConfig {
  eyebrow: string;
  pageTitle: string;
  subtitle: string;
  mission: string;
  vision: string;
  statHappy: string;
  statFleet: string;
  statRating: string;
  statReviews: string;
  values: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface PolicyClause {
  id: string;
  title: string;
  revision: string;
  category: string;
  content: string;
  points: string[];
  lastUpdated: string;
  isActive: boolean;
}

export interface PoliciesConfig {
  eyebrow: string;
  title: string;
  description: string;
  clauses: PolicyClause[];
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroData: {
    badgeText: "LUXURY & SELF-DRIVE FLEET DELHI NCR",
    titleLine1: "Make Your Ride Easy &",
    titleLine2: "Fast with PrimeRides",
    subtext: "More than 50+ luxury sedans, 4x4 SUVs, and premium self-drive cars near your location across Delhi NCR for the ultimate driving experience.",
    bgImage: "/assets/img/banner_1.png",
    usp1: "Zero Security Deposit",
    usp2: "Instant Airport Delivery",
    usp3: "Unlimited KMs Fleet",
  },
  hubs: [
    {
      id: "delhi",
      city: "Delhi NCR",
      fleetCount: "50+ Cars Available",
      desc: "IGI Airport T1/T2/T3, Aerocity, Gurugram Cyber Hub, Noida & 24/7 doorstep delivery across Delhi NCR.",
      tag: "Airport Hub",
    },
    {
      id: "lucknow",
      city: "Lucknow",
      fleetCount: "30+ Cars Available",
      desc: "Chaudhary Charan Singh Airport, Gomti Nagar, Hazratganj, and premium outstation self-drive rentals.",
      tag: "Doorstep Drop",
    },
  ],
  trustHighlights: [
    {
      title: "Unlimited Kilometers",
      desc: "No per-km limits or hidden penalties",
      icon: "Gauge",
    },
    {
      title: "Doorstep Delivery",
      desc: "To any home, office, or airport terminal in NCR",
      icon: "MapPin",
    },
    {
      title: "Zero Hidden Fees",
      desc: "100% transparent pricing & minimal security deposit",
      icon: "ShieldCheck",
    },
    {
      title: "24/7 Roadside Assistance",
      desc: "Round-the-clock emergency support across India",
      icon: "Headphones",
    },
  ],
  offers: [
    {
      id: "weekend",
      tag: "Weekend Special",
      title: "Weekend Getaway",
      discount: "Flat 20% OFF",
      subtext: "On all Outstation & Mountain 4x4 Trips",
      code: "WEEKEND20",
      validUntil: "2026-12-31",
    },
    {
      id: "first-ride",
      tag: "Welcome Deal",
      title: "First Booking Offer",
      discount: "Get 15% OFF",
      subtext: "Instant discount on your first PrimeRides trip",
      code: "FIRST15",
      validUntil: "2026-12-31",
    },
    {
      id: "monthly",
      tag: "Corporate & Long Term",
      title: "Monthly Commute",
      discount: "Save up to 35%",
      subtext: "Hassle-free 30-day rentals with free maintenance & doorstep swaps",
      code: "MONTHLY35",
      validUntil: "Ongoing",
    },
  ],
  reviews: [
    {
      id: "rev-1",
      name: "Rohit Malhotra",
      trip: "Trip to Spiti Valley (Gurgaon)",
      car: "Toyota Fortuner 4x4",
      rating: 5,
      text: "Rented the Fortuner 4x4 for a 9-day Spiti expedition. The vehicle was in immaculate mechanical health, pristine interior, and the unlimited km package gave us complete peace of mind.",
    },
    {
      id: "rev-2",
      name: "Dr. Ananya Sen",
      trip: "Family Vacation (Delhi)",
      car: "Toyota Innova Crysta",
      rating: 5,
      text: "Doorstep delivery at 5:30 AM at Aerocity Delhi was right on the dot. Clean cabin, FASTag loaded, smooth automatic drive for our elderly parents.",
    },
  ],
};

export const DEFAULT_ABOUT_CONFIG: AboutConfig = {
  eyebrow: "ABOUT PRIMERIDES",
  pageTitle: "Redefining Luxury & Self-Drive Mobility",
  subtitle: "Born in Delhi NCR, PrimeRides empowers discerning travelers, corporate executives, and road-trippers with immaculate, top-tier self-drive vehicles.",
  mission: "To deliver effortless self-drive mobility with absolute transparent pricing, zero hidden penalties, and instant curbside handover across Delhi NCR and Lucknow.",
  vision: "To become India's most trusted luxury self-drive platform, renowned for impeccable vehicle hygiene, transparent policies, and unforgettable journeys.",
  statHappy: "12,000+",
  statFleet: "50+",
  statRating: "4.9/5",
  statReviews: "2,800+",
  values: [
    {
      title: "Immaculate Vehicle Hygiene",
      description: "Every car undergoes a 45-point mechanical inspection and hospital-grade interior sanitization before every key handover.",
      icon: "Sparkles",
    },
    {
      title: "Absolute Pricing Transparency",
      description: "No surge pricing, no opaque tax surcharges, and instant security deposit release within 48 hours.",
      icon: "ShieldCheck",
    },
    {
      title: "Curbside Terminal Delivery",
      description: "Direct key handover at IGI Airport T1/T2/T3, CCS Airport Lucknow, or right to your residence.",
      icon: "MapPin",
    },
    {
      title: "24/7 Pan-India Roadside Shield",
      description: "Dedicated dispatchers and towing assistance active nationwide 365 days a year.",
      icon: "Clock",
    },
  ],
};

export const DEFAULT_POLICIES_CONFIG: PoliciesConfig = {
  eyebrow: "PrimeRides Compliance & Legal",
  title: "Rental Policies, Security & Terms of Service",
  description: "Mandatory customer self-drive terms, security deposit refund schedules, insurance liability, and traffic compliance obligations.",
  clauses: [
    {
      id: "rental-terms",
      title: "Rental Terms & Driving Eligibility",
      revision: "Rev 3.2",
      category: "Eligibility",
      content: "Governs self-drive age criteria (min 21 years), valid commercial or LMV driving license requirement (min 1 year driving experience), and prohibited uses.",
      points: [
        "Driver must be at least 21 years of age with a valid Indian driving license or International Driving Permit.",
        "Original physical driving license must be presented at the time of vehicle curbside delivery.",
        "Vehicles are strictly for personal transportation; sub-leasing, racing, commercial taxi usage, and towing are strictly prohibited.",
        "Zero tolerance policy for driving under the influence of alcohol, narcotics, or intoxicating substances."
      ],
      lastUpdated: "2026-03-01",
      isActive: true,
    },
    {
      id: "cancellation-refund",
      title: "Cancellation & Refund Policy",
      revision: "Rev 2.4",
      category: "Billing",
      content: "Defines customer cancellation windows, advance payment refund timelines, and early return terms.",
      points: [
        "100% full refund if cancelled more than 24 hours prior to scheduled trip start time.",
        "50% partial refund if cancelled within 12 to 24 hours before trip start time.",
        "Non-refundable if cancelled less than 12 hours before scheduled delivery or in case of a customer no-show.",
        "Refunds are credited back to the original payment source (Bank/UPI/Card) within 5-7 business days."
      ],
      lastUpdated: "2026-03-01",
      isActive: true,
    },
    {
      id: "security-deposit",
      title: "Security Deposit & Refund Timeline",
      revision: "Rev 1.9",
      category: "Deposits",
      content: "Outlines refundable security deposit requirements, FASTag toll reconciliation, and release SLA.",
      points: [
        "A refundable security deposit of ₹5,000 (standard fleet) or ₹10,000 (luxury segment) is collected prior to handover.",
        "Automated release initiated within 48 to 72 hours of successful vehicle check-in.",
        "FASTag highway toll transactions and pending challans incurred during the rental window will be deducted from the deposit.",
        "Zero hidden deductions; itemized toll statement sent via WhatsApp/Email upon trip closure."
      ],
      lastUpdated: "2026-03-01",
      isActive: true,
    },
    {
      id: "damage-insurance",
      title: "Damage Liability & PrimeShield Cover",
      revision: "Rev 2.1",
      category: "Insurance",
      content: "Defines comprehensive insurance coverage, customer damage cap, and accident notification protocols.",
      points: [
        "All vehicles are covered under comprehensive commercial self-drive insurance.",
        "Maximum customer liability in accidental damage is capped at the security deposit amount (with PrimeShield protection).",
        "Immediate reporting required within 2 hours of any collision, breakdown, or FIR incident.",
        "Negligent driving, water submersion, clutch burnout, or tire sidewall puncture due to reckless off-roading are not covered."
      ],
      lastUpdated: "2026-03-01",
      isActive: true,
    },
    {
      id: "interstate-travel",
      title: "Interstate Travel & FASTag Guidelines",
      revision: "Rev 2.0",
      category: "Travel",
      content: "Commercial permit borders, state tax permits, and geo-fenced travel limits.",
      points: [
        "Vehicles are legally permitted to travel across all Indian states and Union Territories.",
        "FASTag is pre-fitted on all vehicles; customer is responsible for maintaining toll balance or settling upon return.",
        "State border entry taxes (e.g. entering UP/Haryana/Himachal/Uttarakhand) are the customer's responsibility via online Parivahan portal.",
        "Travel to Leh/Ladakh or remote high-altitude routes requires prior concierge authorization."
      ],
      lastUpdated: "2026-03-01",
      isActive: true,
    }
  ]
};

