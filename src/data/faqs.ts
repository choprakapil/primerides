export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQS_DATA: FAQItem[] = [
  {
    id: "faq1",
    category: "Booking & Eligibility",
    question: "What documents are required to book a self-drive car with Primerides?",
    answer:
      "To rent a self-drive car, you must be at least 21 years old and hold a valid original Indian Driving License (minimum 1 year old) along with an Aadhaar Card or Passport for digital KYC verification. International travelers can present a valid Passport, Visa, and an International Driving Permit (IDP).",
  },
  {
    id: "faq2",
    category: "Kilometer Limit & Fuel",
    question: "Are kilometers really unlimited on all self-drive car bookings?",
    answer:
      "Yes! Primerides proudly offers truly unlimited kilometers across all our fleet categories. You can drive freely across Delhi NCR, Himachal Pradesh, Uttarakhand, Rajasthan, or pan-India without paying per-km penalties. Vehicles are delivered with fuel and must be returned at the same level.",
  },
  {
    id: "faq3",
    category: "Delivery & Pickup",
    question: "Can I get doorstep delivery at Delhi IGI Airport or my home/hotel?",
    answer:
      "Absolutely. We provide prompt 24/7 doorstep vehicle delivery and pickup across Delhi NCR, including IGI Airport Terminal 1, 2 & 3, Gurgaon Cyber City, Noida, Greater Noida, Ghaziabad, and Faridabad. Our fleet executive meets you directly at your specified terminal or address.",
  },
  {
    id: "faq4",
    category: "Security Deposit & Refunds",
    question: "How does the security deposit and refund work?",
    answer:
      "We maintain a minimal and 100% transparent security deposit. When you return the vehicle, our team conducts a swift physical inspection, checks pending FASTag tolls, and initiates your full deposit refund within 24 to 48 hours directly into your bank account or UPI ID.",
  },
  {
    id: "faq5",
    category: "Emergency & Roadside Assistance",
    question: "What happens in case of an unforeseen breakdown or flat tyre?",
    answer:
      "All Primerides rentals are supported by 24/7 Pan-India Roadside Assistance (RSA). In the rare event of a mechanical problem, puncture, or towing requirement, our round-the-clock emergency team arranges prompt on-site support or dispatches a replacement car so your journey continues smoothly.",
  },
];

export interface TestimonialItem {
  name: string;
  trip: string;
  car: string;
  img: string;
  text: string;
  rating: number;
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    name: "Rohit Malhotra",
    trip: "Trip to Spiti Valley (Gurgaon)",
    car: "Toyota Fortuner 4x4",
    img: "/assets/img/team/1.jpg",
    rating: 5,
    text: "Rented the Fortuner 4x4 for a 9-day Spiti expedition. The vehicle was in immaculate mechanical health, pristine interior, and the unlimited km package gave us complete peace of mind across rugged mountain terrains.",
  },
  {
    name: "Dr. Ananya Sen",
    trip: "Family Vacation (Delhi)",
    car: "Toyota Innova Crysta",
    img: "/assets/img/team/2.jpg",
    rating: 5,
    text: "Doorstep delivery at 5:30 AM at Aerocity Delhi was right on the dot. Clean cabin, FASTag loaded, smooth automatic drive for our elderly parents all the way to Udaipur and back. Unmatched professionalism!",
  },
  {
    name: "Karan Singhal",
    trip: "Corporate Rental (Noida)",
    car: "Hyundai Creta SX(O)",
    img: "/assets/img/team/3.jpg",
    rating: 5,
    text: "Fastest digital KYC process I've seen in India. Within 10 minutes of submitting documents on WhatsApp, my booking was confirmed. The security deposit was returned within 24 hours of car drop. 10/10 recommendation.",
  },
  {
    name: "Siddharth Oberoi",
    trip: "Jaipur Highway Cruise (Delhi)",
    car: "Mahindra Thar 4x4",
    img: "/assets/img/team/1.jpg",
    rating: 5,
    text: "Took the Thar convertible for a long weekend trip to Neemrana and Jaipur. The open-top feel on the Delhi-Mumbai expressway was exhilarating. The car was spotless and fuel economy was surprisingly great.",
  },
  {
    name: "Megha Kapoor",
    trip: "IGI Airport Pickup (Faridabad)",
    car: "Maruti Suzuki Brezza",
    img: "/assets/img/team/2.jpg",
    rating: 5,
    text: "Booked a self-drive car right as I landed at Terminal 3. Handover took under 5 minutes right at the passenger pickup lane. Returning it was just as hassle-free. Will definitely book again for my next trip.",
  },
  {
    name: "Vikramjit Singh",
    trip: "Manali & Atal Tunnel Trip (Chandigarh)",
    car: "Toyota Fortuner 4x4",
    img: "/assets/img/team/3.jpg",
    rating: 5,
    text: "The 4x4 power was a lifesaver in the snowy patches near Sissu. Primerides team even provided snow chains and safety gear in the boot. Highly dependable vehicles and courteous support team!",
  },
];
