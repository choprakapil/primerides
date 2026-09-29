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
];
