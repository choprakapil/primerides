import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), "src", "data");

const CONFIG_MAPPINGS: { file: string; key: string }[] = [
  { file: "persistedSiteSettings.json", key: "site_settings" },
  { file: "persistedHomepage.json", key: "homepage" },
  { file: "persistedAbout.json", key: "about" },
  { file: "persistedPolicies.json", key: "policies" },
  { file: "persistedNotifications.json", key: "notifications" },
  { file: "persistedHeader.json", key: "header" },
  { file: "persistedFooter.json", key: "footer" },
];

async function main() {
  console.log("🚀 Starting JSON to Database Migration...");

  for (const mapping of CONFIG_MAPPINGS) {
    const filePath = path.join(DATA_DIR, mapping.file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Skipping ${mapping.file} (file does not exist)`);
      continue;
    }

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);

      await (prisma as any).siteSetting.upsert({
        where: { key: mapping.key },
        update: { value: parsed },
        create: {
          key: mapping.key,
          value: parsed,
        },
      });

      console.log(`✅ Successfully migrated ${mapping.file} -> key "${mapping.key}"`);
    } catch (err) {
      console.error(`❌ Failed to migrate ${mapping.file}:`, err);
    }
  }

  console.log("✨ Migration process finished.");
}

main()
  .catch((e) => {
    console.error("Migration fatal error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
