export interface ReviewItem {
  id?: string;
  name: string;
  trip: string;
  car: string;
  img: string;
  text: string;
  rating: number;
  date?: string;
  isVerified?: boolean;
}

export const REVIEWS_DATA: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Rohit Malhotra",
    trip: "Trip to Spiti Valley (Gurgaon)",
    car: "Toyota Fortuner 4x4",
    img: "/assets/img/team/1.jpg",
    rating: 5,
    date: "2 days ago",
    isVerified: true,
    text: "Rented the Fortuner 4x4 for a 9-day Spiti expedition. The vehicle was in immaculate mechanical health, pristine interior, and the unlimited km package gave us complete peace of mind across rugged mountain terrains.",
  },
  {
    id: "rev-2",
    name: "Dr. Ananya Sen",
    trip: "Family Vacation (Delhi)",
    car: "Toyota Innova Crysta",
    img: "/assets/img/team/2.jpg",
    rating: 5,
    date: "1 week ago",
    isVerified: true,
    text: "Doorstep delivery at 5:30 AM at Aerocity Delhi was right on the dot. Clean cabin, FASTag loaded, smooth automatic drive for our elderly parents all the way to Udaipur and back. Unmatched professionalism!",
  },
  {
    id: "rev-3",
    name: "Karan Singhal",
    trip: "Corporate Rental (Noida)",
    car: "Hyundai Creta SX(O)",
    img: "/assets/img/team/3.jpg",
    rating: 5,
    date: "2 weeks ago",
    isVerified: true,
    text: "Fastest digital KYC process I've seen in India. Within 10 minutes of submitting documents on WhatsApp, my booking was confirmed. The security deposit was returned within 24 hours of car drop. 10/10 recommendation.",
  },
  {
    id: "rev-4",
    name: "Siddharth Oberoi",
    trip: "Jaipur Highway Cruise (Delhi)",
    car: "Mahindra Thar 4x4",
    img: "/assets/img/team/1.jpg",
    rating: 5,
    date: "3 weeks ago",
    isVerified: true,
    text: "Took the Thar convertible for a long weekend trip to Neemrana and Jaipur. The open-top feel on the Delhi-Mumbai expressway was exhilarating. The car was spotless and fuel economy was surprisingly great.",
  },
  {
    id: "rev-5",
    name: "Megha Kapoor",
    trip: "IGI Airport Pickup (Faridabad)",
    car: "Maruti Suzuki Brezza",
    img: "/assets/img/team/2.jpg",
    rating: 5,
    date: "1 month ago",
    isVerified: true,
    text: "Booked a self-drive car right as I landed at Terminal 3. Handover took under 5 minutes right at the passenger pickup lane. Returning it was just as hassle-free. Will definitely book again for my next trip.",
  },
  {
    id: "rev-6",
    name: "Vikramjit Singh",
    trip: "Manali & Atal Tunnel Trip (Chandigarh)",
    car: "Toyota Fortuner 4x4",
    img: "/assets/img/team/3.jpg",
    rating: 5,
    date: "1 month ago",
    isVerified: true,
    text: "The 4x4 power was a lifesaver in the snowy patches near Sissu. Primerides team even provided snow chains and safety gear in the boot. Highly dependable vehicles and courteous support team!",
  },
];

// Alias for backward compatibility
export const TESTIMONIALS_DATA = REVIEWS_DATA;
