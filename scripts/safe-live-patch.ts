import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Safe Live Database Patch...");

  // 1. Resolve Location & Category for luxury vehicles
  const delhiLocation = await prisma.location.findFirst({
    where: { slug: "delhi-ncr" },
  });
  if (!delhiLocation) {
    throw new Error("Delhi NCR location not found.");
  }

  const luxuryCategory = await prisma.carCategory.findFirst({
    where: { slug: "luxury" },
  });
  if (!luxuryCategory) {
    throw new Error("Luxury category not found.");
  }

  // 2. Define Vehicles to ensure in tbl_cars
  const vehicles = [
    {
      name: "Rolls Royce Cullinan",
      slug: "rolls-royce",
      brand: "Rolls Royce",
      category_id: luxuryCategory.id,
      location_id: delhiLocation.id,
      price_per_day: 24999,
      security_deposit: 25000,
      transmission: "Automatic",
      seats: 5,
      fuel_type: "Petrol",
      badge: "VIP & Celebrity",
      primary_image: "/assets/img/cars/rolls-royce-cullinan.jpg",
      description: "Experience absolute automotive perfection. The Rolls-Royce Cullinan redefines luxury SUV motoring with unmatched comfort, whisper-quiet cabin acoustics, and iconic presence.",
      is_available: true,
      is_featured: true,
      plans: [
        { name: "300 km Package", free_km: 300, price: 24999, extra_km_rate: 45, duration_days: 1 },
        { name: "450 km Package", free_km: 450, price: 34999, extra_km_rate: 45, duration_days: 1 },
        { name: "600 km Package", free_km: 600, price: 44999, extra_km_rate: 45, duration_days: 1 },
        { name: "Monthly (5,000 km)", free_km: 5000, price: 549999, extra_km_rate: 45, duration_days: 30, plan_type: "monthly" },
      ],
    },
    {
      name: "Lamborghini Urus",
      slug: "lamborghini-urus",
      brand: "Lamborghini",
      category_id: luxuryCategory.id,
      location_id: delhiLocation.id,
      price_per_day: 21999,
      security_deposit: 20000,
      transmission: "Automatic",
      seats: 5,
      fuel_type: "Petrol",
      badge: "Supercar SUV",
      primary_image: "/assets/img/cars/lamborghini-urus.jpg",
      description: "The world's first Super Sport Utility Vehicle. Twin-turbo V8 powertrain delivering 650 CV, razor-sharp dynamics, and blistering speed paired with all-terrain capability.",
      is_available: true,
      is_featured: true,
      plans: [
        { name: "300 km Package", free_km: 300, price: 21999, extra_km_rate: 40, duration_days: 1 },
        { name: "450 km Package", free_km: 450, price: 30999, extra_km_rate: 40, duration_days: 1 },
        { name: "600 km Package", free_km: 600, price: 39999, extra_km_rate: 40, duration_days: 1 },
        { name: "Monthly (5,000 km)", free_km: 5000, price: 489999, extra_km_rate: 40, duration_days: 30, plan_type: "monthly" },
      ],
    },
    {
      name: "Porsche 911 Carrera",
      slug: "porsche-911",
      brand: "Porsche",
      category_id: luxuryCategory.id,
      location_id: delhiLocation.id,
      price_per_day: 18999,
      security_deposit: 15000,
      transmission: "Automatic",
      seats: 4,
      fuel_type: "Petrol",
      badge: "0-100 in 3.8s",
      primary_image: "/assets/img/cars/porsche-911.jpg",
      description: "The quintessential sports car icon. Rear-engine layout, iconic silhouette, lightning-fast 8-speed PDK transmission, and pure rear-wheel precision engineering.",
      is_available: true,
      is_featured: true,
      plans: [
        { name: "300 km Package", free_km: 300, price: 18999, extra_km_rate: 35, duration_days: 1 },
        { name: "450 km Package", free_km: 450, price: 26999, extra_km_rate: 35, duration_days: 1 },
        { name: "600 km Package", free_km: 600, price: 34999, extra_km_rate: 35, duration_days: 1 },
        { name: "Monthly (5,000 km)", free_km: 5000, price: 419999, extra_km_rate: 35, duration_days: 30, plan_type: "monthly" },
      ],
    },
    {
      name: "Audi RS7 Sportback",
      slug: "audi-rs7",
      brand: "Audi",
      category_id: luxuryCategory.id,
      location_id: delhiLocation.id,
      price_per_day: 14999,
      security_deposit: 15000,
      transmission: "Automatic",
      seats: 5,
      fuel_type: "Petrol",
      badge: "Quattro AWD",
      primary_image: "/assets/img/cars/audi-rs7.jpg",
      description: "Breathtaking performance packaged in an unmistakable five-door coupé. Bi-turbo V8 engine, Quattro permanent all-wheel drive, and sumptuous sport cabin.",
      is_available: true,
      is_featured: true,
      plans: [
        { name: "300 km Package", free_km: 300, price: 14999, extra_km_rate: 30, duration_days: 1 },
        { name: "450 km Package", free_km: 450, price: 20999, extra_km_rate: 30, duration_days: 1 },
        { name: "600 km Package", free_km: 600, price: 26999, extra_km_rate: 30, duration_days: 1 },
        { name: "Monthly (5,000 km)", free_km: 5000, price: 329999, extra_km_rate: 30, duration_days: 30, plan_type: "monthly" },
      ],
    },
    {
      name: "Honda City ZX Executive",
      slug: "honda-city",
      brand: "Honda",
      category_id: luxuryCategory.id,
      location_id: delhiLocation.id,
      price_per_day: 2499,
      security_deposit: 5000,
      transmission: "Automatic",
      seats: 5,
      fuel_type: "Petrol",
      badge: "Executive Sedan",
      primary_image: "/assets/img/cars/12.jpg",
      description: "Refined, comfortable, and fuel-efficient executive sedan with leatherette upholstery, electric sunroof, and effortless CVT automatic transmission.",
      is_available: true,
      is_featured: false,
      plans: [
        { name: "300 km Package", free_km: 300, price: 2499, extra_km_rate: 6, duration_days: 1 },
        { name: "450 km Package", free_km: 450, price: 3499, extra_km_rate: 6, duration_days: 1 },
        { name: "600 km Package", free_km: 600, price: 4499, extra_km_rate: 6, duration_days: 1 },
        { name: "Monthly (5,000 km)", free_km: 5000, price: 54999, extra_km_rate: 6, duration_days: 30, plan_type: "monthly" },
      ],
    },
  ];

  for (const v of vehicles) {
    const existing = await prisma.car.findUnique({ where: { slug: v.slug } });
    let carId: number;
    if (!existing) {
      const created = await prisma.car.create({
        data: {
          name: v.name,
          slug: v.slug,
          brand: v.brand,
          category_id: v.category_id,
          location_id: v.location_id,
          price_per_day: v.price_per_day,
          security_deposit: v.security_deposit,
          transmission: v.transmission,
          seats: v.seats,
          fuel_type: v.fuel_type,
          badge: v.badge,
          primary_image: v.primary_image,
          description: v.description,
          is_available: v.is_available,
          is_featured: v.is_featured,
        },
      });
      carId = created.id;
      console.log(`✅ Created vehicle: ${v.name} (${v.slug})`);
    } else {
      carId = existing.id;
      console.log(`ℹ️ Vehicle already exists: ${v.name} (${v.slug})`);
    }

    // Ensure plans for this vehicle
    for (const plan of v.plans) {
      const existingPlan = await prisma.rentalPlan.findFirst({
        where: { car_id: carId, name: plan.name },
      });
      if (!existingPlan) {
        await prisma.rentalPlan.create({
          data: {
            car_id: carId,
            name: plan.name,
            plan_type: (plan as any).plan_type || "km_package",
            free_km: plan.free_km,
            price: plan.price,
            security_deposit: v.security_deposit,
            extra_km_rate: plan.extra_km_rate,
            duration_days: plan.duration_days,
            is_active: true,
          },
        });
        console.log(`  ➕ Added plan: ${plan.name} for ${v.name}`);
      }
    }
  }

  // 3. Ensure Standard Promo Coupons in tbl_coupons
  const standardCoupons = [
    {
      code: "WELCOME10",
      description: "10% OFF on your first PrimeRides luxury rental (up to ₹2,000)",
      discount_type: "percentage",
      discount_value: 10,
      min_booking_amount: 3000,
      max_discount_amount: 2000,
      per_user_limit: 1,
      new_users_only: false,
      applicable_platforms: "web,android,ios",
      show_in_slider: true,
      is_active: true,
    },
    {
      code: "FLAT500",
      description: "Flat ₹500 instant discount on any booking above ₹2,500",
      discount_type: "fixed",
      discount_value: 500,
      min_booking_amount: 2500,
      max_discount_amount: 500,
      per_user_limit: 1,
      new_users_only: false,
      applicable_platforms: "web,android,ios",
      show_in_slider: true,
      is_active: true,
    },
    {
      code: "PRIME2026",
      description: "15% Exclusive Prime Member Discount (up to ₹3,500)",
      discount_type: "percentage",
      discount_value: 15,
      min_booking_amount: 5000,
      max_discount_amount: 3500,
      per_user_limit: 2,
      new_users_only: false,
      applicable_platforms: "web,android,ios",
      show_in_slider: false,
      is_active: true,
    },
  ];

  for (const c of standardCoupons) {
    const existing = await prisma.coupon.findUnique({ where: { code: c.code } });
    if (!existing) {
      await prisma.coupon.create({
        data: c,
      });
      console.log(`🎟️ Created coupon: ${c.code}`);
    } else {
      console.log(`ℹ️ Coupon already exists: ${c.code}`);
    }
  }

  // 4. Ensure Site Settings in tbl_site_settings
  const settingsPath = path.join(process.cwd(), "src/data/persistedSiteSettings.json");
  if (fs.existsSync(settingsPath)) {
    const rawSettings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    const settingKeys = ["general", "contact", "pricing", "social", "branding"];

    await prisma.siteSetting.upsert({
      where: { key: "site_config" },
      update: { value: rawSettings },
      create: { key: "site_config", value: rawSettings },
    });
    console.log("⚙️ Saved site_config into tbl_site_settings");
  }

  console.log("✨ Safe Live Database Patch Completed Successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

