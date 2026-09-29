export interface LocationHub {
  id: string;
  name: string;
  tag: string;
  badge: string;
  popular: boolean;
  image: string;
  landmark: string;
  heading: string;
  subtext: string;
  deliveryTime: string;
  hubs: string[];
  popularCars: string[];
}

export const LOCATIONS_DATA: LocationHub[] = [
  {
    id: "delhi-ncr",
    name: "Delhi NCR",
    tag: "Capital & NCR Hub",
    badge: "Most Active",
    popular: true,
    image: "/assets/img/locations/delhi.jpg",
    landmark: "India Gate, Central Delhi",
    heading: "Self Drive Car Rental in Delhi NCR",
    subtext: "Doorstep delivery across Delhi, Gurgaon Cyber City, Noida, Greater Noida, Ghaziabad & Faridabad. 24/7 IGI Airport T1, T2 & T3 terminal delivery.",
    deliveryTime: "15-30 Mins Express Delivery",
    hubs: [
      "IGI Airport (T1, T2, T3)",
      "Gurgaon Cyber City",
      "Noida Sector 62 & 18",
      "Aerocity Hospitality Hub",
      "Connaught Place (CP)",
      "South Delhi & Saket",
    ],
    popularCars: ["Toyota Fortuner 4x4", "Mahindra Thar", "Innova Crysta", "Hyundai Creta"],
  },
  {
    id: "lucknow",
    name: "Lucknow",
    tag: "City of Nawabs",
    badge: "Express Route",
    popular: false,
    image: "/assets/img/locations/lucknow.jpg",
    landmark: "Rumi Darwaza, Old City",
    heading: "Self Drive Car Rental in Lucknow",
    subtext: "Explore the City of Nawabs & fast connectivity via Agra-Lucknow & Purvanchal Expressways. Doorstep delivery at CCS Airport & Gomti Nagar.",
    deliveryTime: "30 Mins Doorstep Delivery",
    hubs: [
      "Chaudhary Charan Singh Airport (Amausi)",
      "Gomti Nagar & Hazratganj",
      "Charbagh Railway Station",
      "Indira Nagar & Aliganj",
      "Vibhuti Khand IT Park",
    ],
    popularCars: ["Toyota Innova Crysta", "Mahindra Scorpio-N", "Maruti Swift", "Kia Seltos"],
  },
];
