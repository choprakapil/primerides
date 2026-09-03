export interface CategoryItem {
  id: string;
  filter: "suv" | "adventure" | "compact-suv" | "hatchback" | "luxury";
  img: string;
  badgeIcon: string;
  badgeText: string;
  price: string;
  title: string;
  desc: string;
  popularModels: string;
  specs: { icon: string; text: string }[];
  btnText: string;
  carName: string;
  carPrice: string;
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "suv",
    filter: "suv",
    img: "/assets/img/cars/7.jpg",
    badgeIcon: "fa-solid fa-users",
    badgeText: "Family & Groups",
    price: "From ₹3,999 / day",
    title: "7-Seater SUVs & MUVs",
    desc: "Spacious 7 to 8 seater vehicles engineered for supreme legroom, captain seating, and effortless long-distance family touring across India.",
    popularModels: "Toyota Innova Crysta • Toyota Fortuner • Mahindra Scorpio-N",
    specs: [
      { icon: "fa-solid fa-chair", text: "7-8 Captain Seats" },
      { icon: "fa-solid fa-suitcase-rolling", text: "Huge Boot Space" },
      { icon: "fa-solid fa-gears", text: "Automatic / Diesel" },
      { icon: "fa-solid fa-shield-halved", text: "Active FASTag" },
    ],
    btnText: "Explore 7-Seater SUVs",
    carName: "Toyota Innova Crysta",
    carPrice: "3999",
  },
  {
    id: "adventure",
    filter: "adventure",
    img: "/assets/img/cars/3.jpg",
    badgeIcon: "fa-solid fa-mountain",
    badgeText: "Hills & Off-Road",
    price: "From ₹3,499 / day",
    title: "Adventure 4x4 Off-Roaders",
    desc: "True 4x4 drivetrains built to conquer Spiti Valley, Leh Ladakh, and rocky Himalayan ascents with superior torque and high ground clearance.",
    popularModels: "Mahindra Thar 4x4 (Hard Top) • Maruti Suzuki Jimny 4x4",
    specs: [
      { icon: "fa-solid fa-compass", text: "4x4 Low / High Ratio" },
      { icon: "fa-solid fa-arrows-up-down", text: "High Clearance" },
      { icon: "fa-solid fa-shield", text: "All-Terrain Tyres" },
      { icon: "fa-solid fa-cloud-sun", text: "Factory Hard Top" },
    ],
    btnText: "Explore 4x4 Off-Roaders",
    carName: "Mahindra Thar 4x4",
    carPrice: "3499",
  },
  {
    id: "compact-suv",
    filter: "compact-suv",
    img: "/assets/img/cars/2.jpg",
    badgeIcon: "fa-solid fa-fire",
    badgeText: "Most Popular",
    price: "From ₹2,999 / day",
    title: "Compact Urban SUVs",
    desc: "The modern driver's favorite — elevated seating stance, responsive turbo engines, smooth automatic gearboxes, and impressive fuel efficiency.",
    popularModels: "Hyundai Creta SX(O) • Kia Seltos • Maruti Brezza",
    specs: [
      { icon: "fa-solid fa-users", text: "5 Comfortable Seats" },
      { icon: "fa-solid fa-sun", text: "Panoramic Sunroof" },
      { icon: "fa-solid fa-gauge-high", text: "Auto Cruise Control" },
      { icon: "fa-solid fa-gas-pump", text: "Diesel / Petrol AT" },
    ],
    btnText: "Explore Compact SUVs",
    carName: "Hyundai Creta SX(O)",
    carPrice: "2999",
  },
  {
    id: "hatchback",
    filter: "hatchback",
    img: "/assets/img/cars/11.jpg",
    badgeIcon: "fa-solid fa-gas-pump",
    badgeText: "Best Mileage",
    price: "From ₹1,499 / day",
    title: "Economy Hatchbacks",
    desc: "Affordable, nimble city performers delivering 22+ km/l mileage. Effortless to park in crowded Delhi NCR markets with zero kilometer limits.",
    popularModels: "Maruti Suzuki Swift • Maruti Baleno • Hyundai i20",
    specs: [
      { icon: "fa-solid fa-tachometer-alt", text: "22+ km/l Mileage" },
      { icon: "fa-solid fa-users", text: "5 Seats" },
      { icon: "fa-solid fa-road", text: "Unlimited KMs" },
      { icon: "fa-solid fa-wallet", text: "Lowest Daily Tariff" },
    ],
    btnText: "Explore Hatchbacks",
    carName: "Maruti Suzuki Swift",
    carPrice: "1499",
  },
  {
    id: "sedan",
    filter: "luxury",
    img: "/assets/img/cars/12.jpg",
    badgeIcon: "fa-solid fa-briefcase",
    badgeText: "Corporate Travel",
    price: "From ₹2,499 / day",
    title: "Executive Sedans",
    desc: "Aerodynamic highway stability, plush rear-seat ergonomics, and expansive 500L+ boot volumes crafted for business trips and expressway travel.",
    popularModels: "Honda City • Hyundai Verna • Maruti Suzuki Ciaz",
    specs: [
      { icon: "fa-solid fa-suitcase", text: "510L Giant Boot" },
      { icon: "fa-solid fa-feather", text: "Ultra-Smooth Ride" },
      { icon: "fa-solid fa-gears", text: "CVT / Automatic" },
      { icon: "fa-solid fa-users", text: "5 Executive Seats" },
    ],
    btnText: "Explore Executive Sedans",
    carName: "Honda City",
    carPrice: "2499",
  },
  {
    id: "luxury",
    filter: "luxury",
    img: "/assets/img/cars/1.jpg",
    badgeIcon: "fa-solid fa-crown",
    badgeText: "VIP & Weddings",
    price: "From ₹5,999 / day",
    title: "Luxury & Flagship Fleet",
    desc: "Make a grand entrance at high-profile corporate conferences, destination weddings, and VIP terminal pickups with our top-tier prestige fleet.",
    popularModels: "Toyota Fortuner 4x4 • BMW 3 Series • Audi A4 Luxury",
    specs: [
      { icon: "fa-solid fa-gem", text: "Premium Interiors" },
      { icon: "fa-solid fa-shield-halved", text: "Chauffeur Option" },
      { icon: "fa-solid fa-bolt", text: "High Performance" },
      { icon: "fa-solid fa-handshake", text: "VIP Concierge" },
    ],
    btnText: "Explore Luxury Fleet",
    carName: "Toyota Fortuner 4x4",
    carPrice: "5999",
  },
];

export const SPOTLIGHT_CARS = [
  {
    id: "fortuner",
    name: "Toyota Fortuner 4x4",
    price: "₹5,999/day",
    priceRaw: "5999",
    engine: "2.8L Turbocharged Diesel Engine",
    img: "/assets/img/cars/1.jpg",
    specs: [
      { label: "Peak Power", value: "201 BHP", pct: 86 },
      { label: "Cruising Speed", value: "190 km/h", pct: 75 },
      { label: "0-100 km/h Acceleration", value: "9.8s", pct: 68 },
      { label: "Maximum Torque", value: "500 Nm", pct: 88 },
    ],
  },
  {
    id: "thar",
    name: "Mahindra Thar 4x4",
    price: "₹3,499/day",
    priceRaw: "3499",
    engine: "2.2L mHawk Turbo Diesel Drivetrain",
    img: "/assets/img/cars/2.jpg",
    specs: [
      { label: "Peak Power", value: "130 BHP", pct: 65 },
      { label: "Water Wading Depth", value: "650 mm", pct: 90 },
      { label: "Ground Clearance", value: "226 mm", pct: 95 },
      { label: "Maximum Torque", value: "320 Nm", pct: 72 },
    ],
  },
  {
    id: "crysta",
    name: "Toyota Innova Crysta",
    price: "₹4,200/day",
    priceRaw: "4200",
    engine: "2.4L GD Turbocharged Diesel",
    img: "/assets/img/cars/3.jpg",
    specs: [
      { label: "Seating Capacity", value: "7-8 Pax", pct: 95 },
      { label: "Peak Power", value: "148 BHP", pct: 72 },
      { label: "Luggage Space", value: "400+ Litres", pct: 88 },
      { label: "Cruising Range", value: "850+ km", pct: 90 },
    ],
  },
  {
    id: "creta",
    name: "Hyundai Creta SX(O)",
    price: "₹2,999/day",
    priceRaw: "2999",
    engine: "1.5L U2 CRDi / Turbo Petrol",
    img: "/assets/img/cars/4.jpg",
    specs: [
      { label: "Fuel Efficiency", value: "19.5 km/l", pct: 88 },
      { label: "Peak Power", value: "115 BHP", pct: 60 },
      { label: "Sunroof & Tech", value: "Panoramic + ADAS", pct: 92 },
      { label: "Boot Capacity", value: "433 Litres", pct: 78 },
    ],
  },
];
