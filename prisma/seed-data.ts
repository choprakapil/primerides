import { prisma } from "../src/server/db/client";

async function main() {
  console.log("Seeding PrimeRides Fleet & CMS data...");

  // 1. Ensure Locations exist
  const delhi = await prisma.location.upsert({
    where: { slug: "delhi-ncr" },
    update: {},
    create: {
      city: "Delhi NCR",
      name: "Delhi NCR Hub",
      slug: "delhi-ncr",
      address: "Aerocity & Sector 29, Gurgaon",
      is_active: true,
      sort_order: 1,
    },
  });

  const lucknow = await prisma.location.upsert({
    where: { slug: "lucknow" },
    update: {},
    create: {
      city: "Lucknow",
      name: "Lucknow Hub",
      slug: "lucknow",
      address: "Gomti Nagar, Lucknow",
      is_active: true,
      sort_order: 2,
    },
  });

  // 2. Ensure Categories exist
  const catSuv = await prisma.carCategory.upsert({
    where: { slug: "suv" },
    update: {},
    create: {
      name: "7-Seater SUVs",
      slug: "suv",
      description: "Premium fleet category for 7-Seater SUVs",
      image_url: "/assets/img/cars/1.jpg",
      sort_order: 1,
      is_active: true,
    },
  });

  const catAdv = await prisma.carCategory.upsert({
    where: { slug: "adventure" },
    update: {},
    create: {
      name: "4x4 & Adventure",
      slug: "adventure",
      description: "Premium fleet category for 4x4 & Adventure",
      image_url: "/assets/img/cars/2.jpg",
      sort_order: 2,
      is_active: true,
    },
  });

  const catCompact = await prisma.carCategory.upsert({
    where: { slug: "compact-suv" },
    update: {},
    create: {
      name: "Compact SUVs",
      slug: "compact-suv",
      description: "Premium fleet category for Compact SUVs",
      image_url: "/assets/img/cars/4.jpg",
      sort_order: 3,
      is_active: true,
    },
  });

  const catHatch = await prisma.carCategory.upsert({
    where: { slug: "hatchback" },
    update: {},
    create: {
      name: "Premium Hatchbacks",
      slug: "hatchback",
      description: "Premium fleet category for Premium Hatchbacks",
      image_url: "/assets/img/cars/5.jpg",
      sort_order: 4,
      is_active: true,
    },
  });

  const catLux = await prisma.carCategory.upsert({
    where: { slug: "luxury" },
    update: {},
    create: {
      name: "Luxury Sedans & Chauffeur",
      slug: "luxury",
      description: "Premium fleet category for Luxury Sedans & Chauffeur",
      image_url: "/assets/img/cars/6.jpg",
      sort_order: 5,
      is_active: true,
    },
  });

  // 3. Seed Fleet Cars
  const fleetData = [
    // 7-Seater SUVs
    {
      slug: "innova-crysta",
      name: "Toyota Innova Crysta",
      brand: "Toyota",
      categoryId: catSuv.id,
      locationId: delhi.id,
      pricePerDay: 3999,
      primaryImage: "/assets/img/cars/3.jpg",
      seats: 7,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "Family Favorite",
      features: ["7 Seats Captain Chairs", "Rear AC Vents", "Cruise Control", "Apple CarPlay / Android Auto", "FASTag Equipped"],
    },
    {
      slug: "fortuner-suv",
      name: "Toyota Fortuner 4x4",
      brand: "Toyota",
      categoryId: catSuv.id,
      locationId: delhi.id,
      pricePerDay: 5999,
      primaryImage: "/assets/img/cars/1.jpg",
      seats: 7,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "Flagship SUV",
      features: ["4x4 Low/High Drive", "Leather Upholstery", "Hill Descent Control", "JBL 11-Speaker Audio", "FASTag Equipped"],
    },
    {
      slug: "scorpio-n",
      name: "Mahindra Scorpio-N",
      brand: "Mahindra",
      categoryId: catSuv.id,
      locationId: delhi.id,
      pricePerDay: 3499,
      primaryImage: "/assets/img/cars/7.jpg",
      seats: 7,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "Popular",
      features: ["4XPLOR Intelligent Terrain", "Sunroof", "Sony 3D Sound", "Wireless Charging", "FASTag Equipped"],
    },
    {
      slug: "xuv700",
      name: "Mahindra XUV700 AX7L",
      brand: "Mahindra",
      categoryId: catSuv.id,
      locationId: lucknow.id,
      pricePerDay: 3799,
      primaryImage: "/assets/img/cars/8.jpg",
      seats: 7,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "ADAS Tech",
      features: ["Level 2 ADAS", "Panoramic Skyroof", "Twin Digital Screens", "360 Camera", "FASTag Equipped"],
    },
    {
      slug: "safari",
      name: "Tata Safari Dark Edition",
      brand: "Tata",
      categoryId: catSuv.id,
      locationId: delhi.id,
      pricePerDay: 3699,
      primaryImage: "/assets/img/cars/9.jpg",
      seats: 7,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "Dark Edition",
      features: ["Ventilated Front Seats", "JBL Audio", "Terrain Response Modes", "Panoramic Sunroof", "FASTag Equipped"],
    },
    {
      slug: "innova-hycross",
      name: "Toyota Innova Hycross Hybrid",
      brand: "Toyota",
      categoryId: catSuv.id,
      locationId: lucknow.id,
      pricePerDay: 4499,
      primaryImage: "/assets/img/cars/10.jpg",
      seats: 7,
      transmission: "e-CVT Hybrid",
      fuelType: "Strong Hybrid",
      badge: "21.1 km/l Hybrid",
      features: ["Strong Hybrid Electric", "Ottoman Captain Seats", "Toyota Safety Sense ADAS", "Panoramic Roof", "FASTag Equipped"],
    },
    // 4x4 & Adventure
    {
      slug: "thar-4x4",
      name: "Mahindra Thar 4x4 Hard Top",
      brand: "Mahindra",
      categoryId: catAdv.id,
      locationId: delhi.id,
      pricePerDay: 3499,
      primaryImage: "/assets/img/cars/2.jpg",
      seats: 4,
      transmission: "Manual",
      fuelType: "Diesel",
      badge: "Off-Road Legend",
      features: ["4x4 Low/High Transfer Case", "650mm Wading Depth", "All-Terrain Tyres", "Roll Cage Certified", "FASTag Equipped"],
    },
    {
      slug: "thar-roxx",
      name: "Mahindra Thar ROXX 4x4",
      brand: "Mahindra",
      categoryId: catAdv.id,
      locationId: lucknow.id,
      pricePerDay: 4199,
      primaryImage: "/assets/img/cars/11.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "5-Door 4x4",
      features: ["5-Door Comfort", "Electronic Locking Diff", "Harman Kardon Audio", "Panoramic Sunroof", "FASTag Equipped"],
    },
    {
      slug: "jimny-4x4",
      name: "Maruti Suzuki Jimny Alpha 4x4",
      brand: "Maruti Suzuki",
      categoryId: catAdv.id,
      locationId: delhi.id,
      pricePerDay: 2799,
      primaryImage: "/assets/img/cars/12.jpg",
      seats: 4,
      transmission: "Automatic",
      fuelType: "Petrol",
      badge: "Mountain Trekker",
      features: ["AllGrip Pro 4WD", "Compact Mountain Footprint", "Rigid Ladder Frame", "Gunmetal Alloys", "FASTag Equipped"],
    },
    {
      slug: "hilux-4x4",
      name: "Toyota Hilux 4x4 AT",
      brand: "Toyota",
      categoryId: catAdv.id,
      locationId: delhi.id,
      pricePerDay: 6499,
      primaryImage: "/assets/img/cars/13.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "Expedition Ready",
      features: ["Heavy Cargo Deck", "Active Traction Control", "700mm Water Wading", "Differential Lock", "FASTag Equipped"],
    },
    // Compact SUVs
    {
      slug: "creta-sx",
      name: "Hyundai Creta SX(O)",
      brand: "Hyundai",
      categoryId: catCompact.id,
      locationId: delhi.id,
      pricePerDay: 2999,
      primaryImage: "/assets/img/cars/4.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "Panoramic Sunroof",
      features: ["Panoramic Sunroof", "Bose 8-Speaker Sound", "Ventilated Seats", "ADAS Level 2", "FASTag Equipped"],
    },
    {
      slug: "seltos-gtx",
      name: "Kia Seltos GTX+ Turbo",
      brand: "Kia",
      categoryId: catCompact.id,
      locationId: lucknow.id,
      pricePerDay: 3199,
      primaryImage: "/assets/img/cars/14.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Petrol",
      badge: "Sport Tech",
      features: ["160 PS Turbo Petrol", "Dual 10.25-inch Screens", "360 View Monitor", "Bose Sound", "FASTag Equipped"],
    },
    {
      slug: "brezza-zxi",
      name: "Maruti Brezza ZXi+",
      brand: "Maruti Suzuki",
      categoryId: catCompact.id,
      locationId: delhi.id,
      pricePerDay: 2399,
      primaryImage: "/assets/img/cars/15.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Petrol",
      badge: "City Smart",
      features: ["Heads Up Display", "Electric Sunroof", "SmartPlay Pro+ 9-inch", "360 Camera", "FASTag Equipped"],
    },
    // Hatchbacks
    {
      slug: "swift-zxi",
      name: "Maruti Swift ZXi",
      brand: "Maruti Suzuki",
      categoryId: catHatch.id,
      locationId: delhi.id,
      pricePerDay: 1799,
      primaryImage: "/assets/img/cars/5.jpg",
      seats: 5,
      transmission: "Manual",
      fuelType: "Petrol",
      badge: "Budget Friendly",
      features: ["24.8 km/l Mileage", "Push Button Start", "Rear Parking Camera", "Wireless CarPlay", "FASTag Equipped"],
    },
    {
      slug: "baleno-alpha",
      name: "Maruti Baleno Alpha",
      brand: "Maruti Suzuki",
      categoryId: catHatch.id,
      locationId: delhi.id,
      pricePerDay: 1999,
      primaryImage: "/assets/img/cars/16.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Petrol",
      badge: "Spacious Cabin",
      features: ["HUD Display", "Surround Sense Audio", "Auto Climate Control", "LED Projector Lamps", "FASTag Equipped"],
    },
    {
      slug: "i20-nline",
      name: "Hyundai i20 N-Line Turbo",
      brand: "Hyundai",
      categoryId: catHatch.id,
      locationId: lucknow.id,
      pricePerDay: 2299,
      primaryImage: "/assets/img/cars/17.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Petrol",
      badge: "Sport Tuned",
      features: ["Exhaust Tuned Note", "Paddle Shifters", "N-Line Sport Seats", "Bose Audio", "FASTag Equipped"],
    },
    // Luxury Sedans
    {
      slug: "bmw-5-series",
      name: "BMW 5 Series LWB",
      brand: "BMW",
      categoryId: catLux.id,
      locationId: delhi.id,
      pricePerDay: 9999,
      primaryImage: "/assets/img/cars/6.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Petrol",
      badge: "Executive Class",
      features: ["Executive Lounge Seating", "Bowers & Wilkins Sound", "Curved Display OS 8.5", "Ambient Light Bar", "FASTag Equipped"],
    },
    {
      slug: "mercedes-e-class",
      name: "Mercedes-Benz E-Class LWB",
      brand: "Mercedes-Benz",
      categoryId: catLux.id,
      locationId: delhi.id,
      pricePerDay: 11499,
      primaryImage: "/assets/img/cars/18.jpg",
      seats: 5,
      transmission: "Automatic",
      fuelType: "Diesel",
      badge: "Chauffeur Choice",
      features: ["Reclining Rear Seats", "Burmester 4D Audio", "MBUX Superscreen", "Air Suspension", "FASTag Equipped"],
    },
  ];

  for (const carItem of fleetData) {
    const existing = await prisma.car.findUnique({
      where: { slug: carItem.slug },
    });

    const car = await prisma.car.upsert({
      where: { slug: carItem.slug },
      update: {
        name: carItem.name,
        brand: carItem.brand,
        category_id: carItem.categoryId,
        location_id: carItem.locationId,
        price_per_day: carItem.pricePerDay,
        primary_image: carItem.primaryImage,
        seats: carItem.seats,
        transmission: carItem.transmission,
        fuel_type: carItem.fuelType,
        badge: carItem.badge,
        features: carItem.features,
        security_deposit: carItem.pricePerDay > 5000 ? 10000 : 5000,
        is_available: true,
        deleted_at: null,
      },
      create: {
        slug: carItem.slug,
        name: carItem.name,
        brand: carItem.brand,
        category_id: carItem.categoryId,
        location_id: carItem.locationId,
        price_per_day: carItem.pricePerDay,
        primary_image: carItem.primaryImage,
        seats: carItem.seats,
        transmission: carItem.transmission,
        fuel_type: carItem.fuelType,
        badge: carItem.badge,
        features: carItem.features,
        security_deposit: carItem.pricePerDay > 5000 ? 10000 : 5000,
        is_available: true,
      },
    });

    // Create / Update 4 standard KM rental plans for this car
    const deposit = carItem.pricePerDay > 5000 ? 10000 : 5000;
    const baseP = carItem.pricePerDay;

    const plans = [
      {
        plan_type: "km_package",
        name: "300 km Package",
        free_km: 300,
        price: baseP,
        duration_days: 1,
      },
      {
        plan_type: "km_package",
        name: "450 km Package",
        free_km: 450,
        price: Math.round(baseP * 1.35),
        duration_days: 1,
      },
      {
        plan_type: "km_package",
        name: "600 km Package",
        free_km: 600,
        price: Math.round(baseP * 1.7),
        duration_days: 1,
      },
      {
        plan_type: "monthly",
        name: "Monthly (5,000 km)",
        free_km: 5000,
        price: Math.round(baseP * 22),
        duration_days: 30,
      },
    ];

    for (const plan of plans) {
      const existingPlan = await prisma.rentalPlan.findFirst({
        where: { car_id: car.id, name: plan.name },
      });

      if (existingPlan) {
        await prisma.rentalPlan.update({
          where: { id: existingPlan.id },
          data: {
            price: plan.price,
            security_deposit: deposit,
            free_km: plan.free_km,
            extra_km_rate: baseP > 5000 ? 15 : 7,
            duration_days: plan.duration_days,
            is_active: true,
          },
        });
      } else {
        await prisma.rentalPlan.create({
          data: {
            car_id: car.id,
            plan_type: plan.plan_type,
            name: plan.name,
            free_km: plan.free_km,
            price: plan.price,
            security_deposit: deposit,
            extra_km_rate: baseP > 5000 ? 15 : 7,
            duration_days: plan.duration_days,
            is_active: true,
          },
        });
      }
    }
  }
  console.log(`Seeded ${fleetData.length} fleet cars with KM pricing plans.`);

  // 4. Seed FAQs
  const faqs = [
    {
      category: "Booking & Eligibility",
      question: "What documents are required to book a self-drive car with Primerides?",
      answer: "To rent a self-drive car, you must be at least 21 years old and hold a valid original Indian Driving License (minimum 1 year old) along with an Aadhaar Card or Passport for digital KYC verification. International travelers can present a valid Passport, Visa, and an International Driving Permit (IDP).",
      sort_order: 1,
    },
    {
      category: "Kilometer Limit & Fuel",
      question: "Are kilometers really unlimited on all self-drive car bookings?",
      answer: "Yes! Primerides proudly offers truly unlimited kilometers across all our fleet categories. You can drive freely across Delhi NCR, Himachal Pradesh, Uttarakhand, Rajasthan, or pan-India without paying per-km penalties. Vehicles are delivered with fuel and must be returned at the same level.",
      sort_order: 2,
    },
    {
      category: "Delivery & Pickup",
      question: "Can I get doorstep delivery at Delhi IGI Airport or my home/hotel?",
      answer: "Absolutely. We provide prompt 24/7 doorstep vehicle delivery and pickup across Delhi NCR, including IGI Airport Terminal 1, 2 & 3, Gurgaon Cyber City, Noida, Greater Noida, Ghaziabad, and Faridabad. Our fleet executive meets you directly at your specified terminal or address.",
      sort_order: 3,
    },
    {
      category: "Security Deposit & Refunds",
      question: "How does the security deposit and refund work?",
      answer: "We maintain a minimal and 100% transparent security deposit. When you return the vehicle, our team conducts a swift physical inspection, checks pending FASTag tolls, and initiates your full deposit refund within 24 to 48 hours directly into your bank account or UPI ID.",
      sort_order: 4,
    },
    {
      category: "Emergency & Roadside Assistance",
      question: "What happens in case of an unforeseen breakdown or flat tyre?",
      answer: "All Primerides rentals are supported by 24/7 Pan-India Roadside Assistance (RSA). In the rare event of a mechanical problem, puncture, or towing requirement, our round-the-clock emergency team arranges prompt on-site support or dispatches a replacement car so your journey continues smoothly.",
      sort_order: 5,
    },
    {
      category: "Interstate Permits & Fastag",
      question: "Can I take the car outside Delhi NCR to Himachal, Uttarakhand or Rajasthan?",
      answer: "Yes! All Primerides vehicles carry valid All-India Tourist Permits with active commercial registration and commercial insurance. You can drive freely across state borders. Commercial passenger state tax permits (such as green taxes) can be paid online seamlessly, and vehicles come with pre-fitted FASTags.",
      sort_order: 6,
    },
  ];

  for (const faq of faqs) {
    const existingFaq = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });
    if (!existingFaq) {
      await prisma.fAQ.create({
        data: {
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          sort_order: faq.sort_order,
          is_active: true,
        },
      });
    }
  }
  console.log(`Seeded ${faqs.length} FAQs into tbl_faqs.`);

  // 5. Seed Blog Categories & Blogs
  const blogCats = [
    { name: "Mountain Expeditions", slug: "mountain-expeditions", description: "Himalayan highways, high mountain passes and 4x4 trails." },
    { name: "Weekend Getaways", slug: "weekend-getaways", description: "Quick 2 to 3 day road trips and escapes from Delhi NCR." },
    { name: "Fleet Comparisons", slug: "fleet-comparisons", description: "Expert vehicle guides, 7-seater reviews, and family car comparisons." },
    { name: "Travel Desk & Tips", slug: "travel-desk", description: "Expressway guides, seasonal weather advice, and packing checklists." },
  ];

  const catMap = new Map<string, number>();
  for (const cat of blogCats) {
    const record = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        is_active: true,
      },
    });
    catMap.set(cat.slug, record.id);
  }

  const blogs = [
    {
      slug: "delhi-to-leh-ladakh-road-trip-guide",
      title: "Delhi to Leh Ladakh Road Trip in a 4x4 Self-Drive SUV",
      catSlug: "mountain-expeditions",
      featuredImage: "/assets/img/blog/1.jpg",
      summary: "Essential high-altitude preparation, permits, route options via Manali vs Srinagar, and why the Mahindra Thar 4x4 is king of the mountain passes.",
      content: `### 1. Choosing the Right Self-Drive Vehicle\nWhen setting out on high-altitude expeditions or multi-day road trips across North India, vehicle choice determines comfort, fuel economy, and safety. 4x4 SUVs like the Mahindra Thar and Toyota Fortuner offer ground clearance and low-range gearboxes needed for water crossings and rocky terrain, while the Innova Crysta provides plush captain seating and generous luggage room.\n\n### 2. Unlimited Kilometers & FASTag Advantage\nWith Primerides unlimited kilometer policy, you can explore scenic detours and mountain hamlets without looking at the odometer or calculating surcharge penalties. Plus, active FASTags on all cars allow seamless toll transactions on Yamuna Expressway, Delhi-Mumbai Expressway, and Eastern Peripheral Roadways.\n\n### 3. Preparation & High-Altitude Acclimatization\nPlan at least 2 nights in Leh before pushing over Khardung La or Chang La. Keep portable tyre inflators and offline maps ready.`,
      authorName: "Primerides Expedition Desk",
      readTime: "5 min read",
    },
    {
      slug: "top-7-weekend-road-trips-from-delhi-ncr",
      title: "Top 7 Weekend Road Trips from Delhi NCR You Can Do in 3 Days",
      catSlug: "weekend-getaways",
      featuredImage: "/assets/img/blog/2.jpg",
      summary: "From Jaipur's royal forts to the pine peaks of Lansdowne and Kasauli, here are scenic routes with smooth expressways and great stays.",
      content: `Delhi NCR sits at the crossroads of some of India's finest expressways. Within a 4 to 6 hour drive, you can find yourself enjoying hot tea in the mist of Himachal or dining in a heritage Haveli in Rajasthan.\n\n### Top Picks:\n1. **Jaipur via Delhi-Mumbai Expressway**: Just 3.5 hours of glass-smooth tarmac.\n2. **Kasauli via Himalayan Expressway**: Enjoy cool mountain air without the heavy Shimla traffic.\n3. **Lansdowne via Kotdwar**: Quiet oak and pine woodlands with minimal commercialization.`,
      authorName: "Vikram Malhotra",
      readTime: "4 min read",
    },
    {
      slug: "why-renting-innova-crysta-beats-flights",
      title: "Why Renting an Innova Crysta Beats Taking Flights for Family Vacations",
      catSlug: "fleet-comparisons",
      featuredImage: "/assets/img/blog/3.jpg",
      summary: "Compare costs, flexibility, luggage freedom, and doorstep terminal convenience when travelling with elderly parents and kids.",
      content: `For a family of 5 or 6, booking multiple flight tickets often means dealing with hefty cancellation charges, strict baggage limits, and the stress of airport transfers.\n\nWith a self-drive Toyota Innova Crysta from Primerides, your vacation starts right at your doorstep. Pack as many bags as you wish, stop whenever you want for roadside dhabas, and keep elderly passengers in unmatched captain-chair comfort.`,
      authorName: "Ananya Sen",
      readTime: "6 min read",
    },
    {
      slug: "delhi-to-spiti-valley-ultimate-4x4-itinerary",
      title: "Delhi to Spiti Valley Circuit: The Complete 10-Day 4x4 Road Itinerary",
      catSlug: "mountain-expeditions",
      featuredImage: "/assets/img/slider/2.jpg",
      summary: "Navigate Kunzum Pass, Kaza, and Chandratal Lake with practical fuel planning, altitude tips, and essential 4x4 driving protocols.",
      content: `The Spiti Valley circuit is widely recognized as one of the world's most dramatic motorable trails. From barren moonscapes to thousand-year-old monasteries perched on cliff edges, Spiti demands respect, preparation, and a capable high-clearance SUV.\n\nWe recommend tackling the circuit in the anti-clockwise direction (Shimla -> Kinnaur -> Kaza -> Kunzum Pass -> Manali) to allow gradual acclimatization.`,
      authorName: "Rohit Verma",
      readTime: "7 min read",
    },
    {
      slug: "delhi-mumbai-expressway-driving-guide",
      title: "Delhi-Mumbai Expressway: Speed Limits, Rest Stops & Toll Insights",
      catSlug: "travel-desk",
      featuredImage: "/assets/img/slider/1.jpg",
      summary: "Experience India's premier 8-lane expressway with advice on FASTag balance, speed camera zones, and ideal luxury cruiser cars.",
      content: `The newly opened sections of the Delhi-Mumbai Expressway have revolutionized road travel between the capital and Rajasthan/Gujarat.\n\nWith a strict 120 km/h speed limit monitored by overhead laser radars, well-appointed wayside food plazas, and automated FASTag deduction, cruising in a BMW 5 Series or Fortuner is a world-class driving experience.`,
      authorName: "Primerides Travel Desk",
      readTime: "4 min read",
    },
    {
      slug: "monsoon-drives-to-uttarakhand-and-himachal",
      title: "Top 5 Monsoon Road Trips from Delhi: Mist, Waterfalls & Pine Forests",
      catSlug: "weekend-getaways",
      featuredImage: "/assets/img/slider/3.jpg",
      summary: "Discover lush weekend hideaways including Mussoorie, Mukteshwar, and Shoja with safe wet-weather driving techniques.",
      content: `Monsoon transforms the lower Shivaliks and Kumaon hills into verdant green paradises. Waterfalls cascade along winding roads, and the smell of fresh rain on pine needles clears the city fatigue.\n\nAlways ensure your rental car has verified tyre tread depths and wiper blades before embarking on rain journeys.`,
      authorName: "Pooja Hegde",
      readTime: "5 min read",
    },
  ];

  for (const blog of blogs) {
    const catId = catMap.get(blog.catSlug) || catMap.values().next().value;
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {
        title: blog.title,
        category_id: catId,
        featured_image: blog.featuredImage,
        summary: blog.summary,
        content: blog.content,
        author_name: blog.authorName,
        read_time: blog.readTime,
        is_published: true,
      },
      create: {
        slug: blog.slug,
        title: blog.title,
        category_id: catId,
        featured_image: blog.featuredImage,
        summary: blog.summary,
        content: blog.content,
        author_name: blog.authorName,
        read_time: blog.readTime,
        is_published: true,
      },
    });
  }
  console.log(`Seeded ${blogs.length} Blogs into tbl_blogs.`);

  // 6. Seed an initial lead to verify contact leads
  const existingLead = await prisma.contactLead.findFirst({
    where: { phone: "+919876543210" },
  });
  if (!existingLead) {
    await prisma.contactLead.create({
      data: {
        name: "Rahul Sharma",
        phone: "+919876543210",
        email: "rahul.sharma@example.com",
        subject: "Airport Delivery Inquiry",
        message: "Need Innova Crysta for 4 days delivery at Delhi T3 airport.",
        source: "contact_page",
        status: "new",
      },
    });
    console.log("Seeded sample contact lead into tbl_contact_leads.");
  }

  console.log("✅ PrimeRides database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
