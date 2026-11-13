// Script to measure DB call counts for a 20-car fleet availability lookup
// Compares:
// 1. Unbatched N+1 per-car count() queries
// 2. Batched groupBy query
import { prisma } from "../src/server/db/client.ts";

async function runBenchmark() {
  console.log("=== DB Query Counter Benchmark ===");

  // Retrieve 20 cars (or all active cars if fewer exist)
  const cars = await prisma.car.findMany({
    where: { deleted_at: null },
    take: 20,
    select: { id: true, fleet_count: true },
  });

  const carCount = cars.length;
  console.log(`Auditing fleet size: ${carCount} cars`);

  const startDate = new Date();
  const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days rental

  // 1. Measure Old N+1 Pattern
  let nPlusOneQueries = 1; // initial findMany
  const startN1 = performance.now();
  await Promise.all(
    cars.map(async (car) => {
      nPlusOneQueries++;
      return await prisma.booking.count({
        where: {
          car_id: car.id,
          deleted_at: null,
          status: { in: ["pending", "confirmed", "active"] },
          AND: [{ start_date: { lt: endDate } }, { end_date: { gt: startDate } }],
        },
      });
    })
  );
  const timeN1 = (performance.now() - startN1).toFixed(2);

  // 2. Measure Batched groupBy Pattern
  let batchedQueries = 1; // initial findMany
  const startBatched = performance.now();
  batchedQueries++; // exactly 1 groupBy query
  const groups = await prisma.booking.groupBy({
    by: ["car_id"],
    where: {
      car_id: { in: cars.map((c) => c.id) },
      deleted_at: null,
      status: { in: ["pending", "confirmed", "active"] },
      AND: [{ start_date: { lt: endDate } }, { end_date: { gt: startDate } }],
    },
    _count: { _all: true },
  });
  const timeBatched = (performance.now() - startBatched).toFixed(2);

  console.log("\n--- BENCHMARK RESULTS ---");
  console.log(`BEFORE (N+1 Loop):     ${nPlusOneQueries} DB queries executed in ${timeN1} ms`);
  console.log(`AFTER  (Batched GroupBy): ${batchedQueries} DB queries executed in ${timeBatched} ms`);
  console.log(`REDUCTION: ${Math.round(((nPlusOneQueries - batchedQueries) / nPlusOneQueries) * 100)}% fewer database queries!`);

  await prisma.$disconnect();
}

runBenchmark();
