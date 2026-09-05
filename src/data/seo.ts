export interface RouteItem {
  id: string;
  title: string;
  route: string;
  recommendedCars: string;
  category: "mountain" | "heritage" | "expressway";
}

export interface TariffItem {
  category: string;
  popularModels: string;
  seating: string;
  startingTariff: string;
  bestSuitedFor: string;
}

export const POPULAR_SEARCHES: string[] = [
  "Self Drive Car Rental Delhi",
  "Self Drive Car Rental Lucknow",
  "Car Rental IGI Airport Delhi T3",
  "Mahindra Thar Self Drive Delhi",
  "Innova Crysta Rental Delhi NCR",
  "Toyota Fortuner 4x4 Rental Manali",
  "Unlimited KM Car Rental Gurgaon",
  "Self Drive Cars Noida Sector 18",
  "Delhi to Leh Ladakh 4x4 Rental",
  "Luxury Wedding Car Rental Delhi",
  "Hyundai Creta Automatic Self Drive",
  "Zero Deposit Car Rental Delhi",
];

export const ROAD_TRIP_ROUTES: RouteItem[] = [
  {
    id: "mountain-expeditions",
    title: "⛰️ Mountain & Adventure Expeditions",
    route: "Delhi to Manali, Leh Ladakh, Spiti Valley, Shimla, Rishikesh, Mussoorie, Nainital, and Auli.",
    recommendedCars: "Toyota Fortuner 4x4, Mahindra Thar 4x4, Scorpio-N",
    category: "mountain",
  },
  {
    id: "heritage-circuits",
    title: "🏰 Heritage & Expressway Circuits",
    route: "Delhi to Jaipur (via Delhi-Mumbai Expressway), Agra (via Yamuna Expressway), Udaipur, Jodhpur, and Lucknow (via Agra-Lucknow Expressway).",
    recommendedCars: "Toyota Innova Crysta, Hyundai Creta",
    category: "heritage",
  },
];

export const TARIFF_TABLE_DATA: TariffItem[] = [
  {
    category: "Hatchback",
    popularModels: "Maruti Swift, Baleno, Hyundai i20",
    seating: "5 Seater",
    startingTariff: "₹1,499 / day",
    bestSuitedFor: "Daily City Commute, Fuel Efficiency",
  },
  {
    category: "Compact SUV",
    popularModels: "Hyundai Creta, Kia Seltos, Brezza",
    seating: "5 Seater",
    startingTariff: "₹2,199 / day",
    bestSuitedFor: "Weekend Getaways, Highway Comfort",
  },
  {
    category: "Adventure 4x4",
    popularModels: "Mahindra Thar 4x4, Jimny 4x4, Fortuner 4x4",
    seating: "4-7 Seater",
    startingTariff: "₹2,499 / day",
    bestSuitedFor: "Himachal, Ladakh, Off-Road Expeditions",
  },
  {
    category: "7-Seater Executive",
    popularModels: "Toyota Innova Crysta, Mahindra Scorpio-N",
    seating: "7-8 Seater",
    startingTariff: "₹3,499 / day",
    bestSuitedFor: "Family Road Trips, Group Travel",
  },
  {
    category: "Super Luxury",
    popularModels: "Rolls Royce, Lamborghini Urus, Audi RS7",
    seating: "4-5 Seater",
    startingTariff: "₹14,999 / day",
    bestSuitedFor: "Weddings, VIP Events, Luxury Experience",
  },
];
