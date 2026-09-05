export interface SiteConfig {
  brandName: string;
  tagline: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  whatsappRaw: string;
  email: string;
  supportEmail: string;
  addresses: {
    delhi: string;
    lucknow: string;
    gurgaon: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    youtube: string;
    twitter: string;
    linkedin: string;
  };
  stats: {
    happyExplorers: string;
    fleetSize: string;
    citiesCovered: string;
    googleRating: string;
    verifiedReviews: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  brandName: "PrimeRides",
  tagline: "Self-Drive Car Rental in Delhi NCR & Lucknow",
  phone: "+91 90453 01702",
  phoneRaw: "+919045301702",
  whatsapp: "+91 90453 01702",
  whatsappRaw: "919045301702",
  email: "support@primerides.in",
  supportEmail: "bookings@primerides.in",
  addresses: {
    delhi: "Terminal 3 Arrivals & Aerocity Hospitality District, New Delhi, Delhi 110037",
    lucknow: "Chaudhary Charan Singh Airport & Gomti Nagar, Lucknow, Uttar Pradesh 226010",
    gurgaon: "DLF Cyber City, Sector 24, Gurugram, Haryana 122002",
  },
  socialLinks: {
    instagram: "https://instagram.com/primerides",
    facebook: "https://facebook.com/primerides",
    youtube: "https://youtube.com/@primerides",
    twitter: "https://twitter.com/primerides",
    linkedin: "https://linkedin.com/company/primerides",
  },
  stats: {
    happyExplorers: "10,000+",
    fleetSize: "50+",
    citiesCovered: "Delhi NCR & Lucknow",
    googleRating: "4.9 / 5.0",
    verifiedReviews: "500+",
  },
};
