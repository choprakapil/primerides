export interface BlogPost {
  slug: string;
  img: string;
  tag: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  author: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "delhi-to-leh-ladakh-road-trip-guide",
    img: "/assets/img/blog/1.jpg",
    tag: "Mountain Expedition",
    date: "12 Aug 2026",
    readTime: "5 min read",
    title: "Delhi to Leh Ladakh Road Trip in a 4x4 Self-Drive SUV",
    excerpt:
      "Essential high-altitude preparation, permits, route options via Manali vs Srinagar, and why the Mahindra Thar 4x4 is king of the mountain passes.",
    author: "Primerides Expedition Desk",
  },
  {
    slug: "top-7-weekend-road-trips-from-delhi-ncr",
    img: "/assets/img/blog/2.jpg",
    tag: "Weekend Escapes",
    date: "28 Jul 2026",
    readTime: "4 min read",
    title: "Top 7 Weekend Road Trips from Delhi NCR You Can Do in 3 Days",
    excerpt:
      "From Jaipur's royal forts to the pine peaks of Lansdowne and Kasauli, here are scenic routes with smooth expressways and great stays.",
    author: "Vikram Malhotra",
  },
  {
    slug: "why-renting-innova-crysta-beats-flights",
    img: "/assets/img/blog/3.jpg",
    tag: "Family Touring",
    date: "15 Jul 2026",
    readTime: "6 min read",
    title: "Why Renting an Innova Crysta Beats Taking Flights for Family Vacations",
    excerpt:
      "Compare costs, flexibility, luggage freedom, and doorstep terminal convenience when travelling with elderly parents and kids.",
    author: "Ananya Sen",
  },
  {
    slug: "delhi-to-spiti-valley-ultimate-4x4-itinerary",
    img: "/assets/img/slider/2.jpg",
    tag: "Off-Road Guide",
    date: "02 Jul 2026",
    readTime: "7 min read",
    title: "Delhi to Spiti Valley Circuit: The Complete 10-Day 4x4 Road Itinerary",
    excerpt:
      "Navigate Kunzum Pass, Kaza, and Chandratal Lake with practical fuel planning, altitude tips, and essential 4x4 driving protocols.",
    author: "Rohit Verma",
  },
  {
    slug: "delhi-mumbai-expressway-driving-guide",
    img: "/assets/img/slider/1.jpg",
    tag: "Expressway Drives",
    date: "18 Jun 2026",
    readTime: "4 min read",
    title: "Delhi-Mumbai Expressway: Speed Limits, Rest Stops & Toll Insights",
    excerpt:
      "Experience India's premier 8-lane expressway with advice on FASTag balance, speed camera zones, and ideal luxury cruiser cars.",
    author: "Primerides Travel Desk",
  },
  {
    slug: "monsoon-drives-to-uttarakhand-and-himachal",
    img: "/assets/img/slider/3.jpg",
    tag: "Scenic Touring",
    date: "05 Jun 2026",
    readTime: "5 min read",
    title: "Top 5 Monsoon Road Trips from Delhi: Mist, Waterfalls & Pine Forests",
    excerpt:
      "Discover lush weekend hideaways including Mussoorie, Mukteshwar, and Shoja with safe wet-weather driving techniques.",
    author: "Pooja Hegde",
  },
  {
    slug: "delhi-to-kasol-tirthan-valley-drive",
    img: "/assets/img/blog/1.jpg",
    tag: "Mountain Expedition",
    date: "22 May 2026",
    readTime: "6 min read",
    title: "Delhi to Kasol & Tirthan Valley: Scenic Rivers & Serolsar Lake Road Trip",
    excerpt:
      "Explore the tranquil Kullu valley route via the Kiratpur-Nerchowk 4-lane expressway with ideal 4x4 SUV tips for Jalori Pass.",
    author: "Karan Johar",
  },
  {
    slug: "best-luxury-sedans-for-yamuna-expressway",
    img: "/assets/img/blog/2.jpg",
    tag: "Expressway Drives",
    date: "10 May 2026",
    readTime: "4 min read",
    title: "Best Luxury Cruisers for Yamuna Expressway to Taj Mahal & Agra Fort",
    excerpt:
      "How BMW 5-Series and Mercedes executive sedans provide effortless high-speed poise, cruise control, and cabin silence.",
    author: "Primerides Fleet Desk",
  },
  {
    slug: "rishikesh-to-chopta-tungnath-winter-snow-drive",
    img: "/assets/img/blog/3.jpg",
    tag: "Mountain Expedition",
    date: "28 Apr 2026",
    readTime: "7 min read",
    title: "Rishikesh to Chopta & Tungnath: The Switzerland of Uttarakhand Drive",
    excerpt:
      "A complete guide to navigating high Himalayan curves, Devprayag sangam stops, and snow-chain precautions in winter.",
    author: "Aman Sharma",
  },
  {
    slug: "jim-corbett-safari-drive-from-delhi-ncr-suv-guide",
    img: "/assets/img/slider/1.jpg",
    tag: "Weekend Escapes",
    date: "14 Apr 2026",
    readTime: "5 min read",
    title: "Delhi to Jim Corbett National Park: Forest Lodges & Safari SUV Recommendations",
    excerpt:
      "Cross Moradabad and Kashipur bypasses comfortably in a 7-seater Innova Crysta with ample luggage space for camera gear.",
    author: "Sneha Rawat",
  },
  {
    slug: "delhi-to-udaipur-mewar-grand-tourer-road-trip",
    img: "/assets/img/slider/2.jpg",
    tag: "Scenic Touring",
    date: "02 Apr 2026",
    readTime: "8 min read",
    title: "Delhi to Udaipur Mewar Expedition: 700 km of Royal Forts & Lake Palaces",
    excerpt:
      "Take the smooth Delhi-Jaipur-Ajmer-Bhilwara highway with heritage royal stays and sunset drives along Lake Pichola.",
    author: "Devendra Rathore",
  },
  {
    slug: "delhi-to-ranthambore-wildlife-circuit-in-4x4-thar",
    img: "/assets/img/slider/3.jpg",
    tag: "Off-Road Guide",
    date: "19 Mar 2026",
    readTime: "5 min read",
    title: "Delhi to Ranthambore Safari in a 4x4 Thar: Tiger Trails & Chambal Ravines",
    excerpt:
      "Discover the fastest expressway access via the Sohna-Dausa corridor, ideal safari zones, and off-road capability essentials.",
    author: "Kabir Singh",
  },
  {
    slug: "monsoon-drive-to-mcleodganj-dharamshala-kangra",
    img: "/assets/img/blog/1.jpg",
    tag: "Mountain Expedition",
    date: "08 Mar 2026",
    readTime: "6 min read",
    title: "Delhi to Dharamshala & McLeodganj: Monasteries & Dhauladhar Mountain Vistas",
    excerpt:
      "Drive through Kangra valley tea estates, Tibetan culture hubs, and scenic pine-covered hill roads in comfort.",
    author: "Tenzin Norbu",
  },
  {
    slug: "delhi-lucknow-purvanchal-expressway-complete-itinerary",
    img: "/assets/img/blog/2.jpg",
    tag: "Expressway Drives",
    date: "21 Feb 2026",
    readTime: "5 min read",
    title: "Delhi to Lucknow via Agra-Lucknow Expressway: Royal Awadh Self-Drive",
    excerpt:
      "How to cover 500+ km in under 6 hours across India's finest high-speed corridors with food recommendations in Kannauj.",
    author: "Rohan Kapoor",
  },
  {
    slug: "complete-self-drive-checklist-for-long-highway-road-trips",
    img: "/assets/img/blog/3.jpg",
    tag: "Travel Desk & Tips",
    date: "10 Feb 2026",
    readTime: "4 min read",
    title: "The Ultimate 10-Point Self-Drive Checklist for Long Highway Expeditions",
    excerpt:
      "Tyre PSI ratings, night driving etiquette, FASTag auto-recharge, and essential toolkits before commencing your journey.",
    author: "Primerides Concierge",
  },
  {
    slug: "fastag-speed-cameras-expressway-rules-in-delhi-ncr-2026",
    img: "/assets/img/slider/1.jpg",
    tag: "Travel Desk & Tips",
    date: "25 Jan 2026",
    readTime: "5 min read",
    title: "Expressway Regulations 2026: Speed Limits, FASTag & Delhi NCR Handover Rules",
    excerpt:
      "Stay compliant and safe with our updated speed limit guide for Eastern Peripheral, Delhi-Meerut, and Yamuna expressways.",
    author: "Legal & Safety Team",
  },
];
