export interface FaqItem {
  id: string;
  category?: string;
  question: string;
  answer: string;
}

export const FAQS_DATA: FaqItem[] = [
  {
    id: "faq1",
    category: "Booking & Documentation",
    question: "What documents are required to rent a self-drive car?",
    answer:
      "You only need an original, valid Indian Driving License (minimum 1 year holding experience) and a Government-issued ID proof (Aadhaar Card or Passport). Verification is completed digitally via WhatsApp or email in less than 5 minutes before vehicle handover.",
  },
  {
    id: "faq2",
    category: "Permits & Inter-state Travel",
    question: "Can I take the car outstation to other states (Himachal, Uttarakhand, Rajasthan)?",
    answer:
      "Yes, absolutely! All Primerides vehicles carry valid All-India Tourist Commercial Permits and active FASTag. You can drive freely across Himachal Pradesh, Uttarakhand, Rajasthan, Punjab, Uttar Pradesh, and across the nation. State border taxes can be paid online or at designated border counters.",
  },
  {
    id: "faq3",
    category: "Kilometer Policy",
    question: "Are unlimited kilometers really included?",
    answer:
      "Yes, Primerides offers dedicated unlimited kilometer packages so you can enjoy uninterrupted long-distance road trips without constantly monitoring the odometer or stressing over per-km penalty charges.",
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
    car: "Mahindra Thar 4x4",
    img: "/assets/img/team/1.jpg",
    rating: 5,
    text: "Rented the Thar 4x4 for a 9-day Spiti expedition. The vehicle was in immaculate mechanical health, pristine interior, and the unlimited km package gave us complete peace of mind across rugged mountain terrains.",
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
];
