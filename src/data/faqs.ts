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
