import { prisma } from "./db/client";
import { hashPassword } from "./auth/passwords";
import { FLEET_CARS } from "../data/fleet";

async function main() {
  console.log("🌱 Starting PrimeRides Database Seed...");

  // 1. Seed Super Admin
  const adminPasswordHash = await hashPassword("PrimeRides@2026!");
  const admin = await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {
      password: adminPasswordHash,
      email: "admin@primerides.in",
      name: "PrimeRides Super Admin",
      role: "superadmin",
      is_active: true,
    },
    create: {
      username: "admin",
      email: "admin@primerides.in",
      name: "PrimeRides Super Admin",
      password: adminPasswordHash,
      role: "superadmin",
      is_active: true,
    },
  });
  console.log("✅ Super Admin verified:", admin.email);

  // 2. Extract and Seed Categories from FLEET_CARS
  const uniqueCategories = [
    { slug: "suv", name: "7-Seater SUVs", image: "/assets/img/cars/1.jpg" },
    { slug: "adventure", name: "4x4 & Adventure", image: "/assets/img/cars/2.jpg" },
    { slug: "compact-suv", name: "Compact SUVs", image: "/assets/img/cars/4.jpg" },
    { slug: "hatchback", name: "Premium Hatchbacks", image: "/assets/img/cars/5.jpg" },
    { slug: "luxury", name: "Luxury Sedans & Chauffeur", image: "/assets/img/cars/6.jpg" },
  ];

  const categoryMap = new Map<string, number>();
  for (const cat of uniqueCategories) {
    const created = await prisma.carCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: `Premium fleet category for ${cat.name}`,
        image_url: cat.image,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: `Premium fleet category for ${cat.name}`,
        image_url: cat.image,
        sort_order: 1,
      },
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ Seeded ${categoryMap.size} car categories.`);

  // 3. Seed Cars
  let carCount = 0;
  for (const car of FLEET_CARS) {
    const categoryId = categoryMap.get(car.category) || categoryMap.values().next().value || 1;
    const priceNum = parseFloat(car.priceRaw) || 3999;
    const seatsNum = parseInt(car.seats) || 5;

    await prisma.car.upsert({
      where: { slug: car.id },
      update: {
        name: car.name,
        brand: car.brand,
        category_id: categoryId,
        price_per_day: priceNum,
        price_per_hour: Math.round(priceNum / 10),
        security_deposit: 5000,
        transmission: car.transmission || "Automatic",
        seats: seatsNum,
        doors: seatsNum >= 7 ? 5 : 4,
        fuel_type: car.fuel || "Diesel",
        primary_image: car.img,
        badge: car.badge || null,
        description: `${car.name} luxury self-drive rental with unlimited kilometers and doorstep delivery.`,
        features: ["GPS Navigation", "Bluetooth", "Airbags", "24/7 Roadside Assistance", "Clean Interior"],
        is_available: true,
        is_featured: car.badge === "Flagship SUV" || car.badge === "Family Favorite",
      },
      create: {
        name: car.name,
        slug: car.id,
        brand: car.brand,
        category_id: categoryId,
        price_per_day: priceNum,
        price_per_hour: Math.round(priceNum / 10),
        security_deposit: 5000,
        transmission: car.transmission || "Automatic",
        seats: seatsNum,
        doors: seatsNum >= 7 ? 5 : 4,
        fuel_type: car.fuel || "Diesel",
        primary_image: car.img,
        badge: car.badge || null,
        description: `${car.name} luxury self-drive rental with unlimited kilometers and doorstep delivery.`,
        features: ["GPS Navigation", "Bluetooth", "Airbags", "24/7 Roadside Assistance", "Clean Interior"],
        is_available: true,
        is_featured: car.badge === "Flagship SUV" || car.badge === "Family Favorite",
      },
    });
    carCount++;
  }
  console.log(`✅ Seeded ${carCount} luxury cars into MySQL database.`);

  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
