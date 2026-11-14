import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Risk #20 Audit: Missing Alt Attributes on Public and Admin Images", () => {
  // Helper to recursively find all .tsx / .jsx files in src
  function getAllTsxFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getAllTsxFiles(fullPath, fileList);
      } else if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  it("Test 1: Global audit across entire src/ directory confirms ZERO <img> tags missing alt attributes", () => {
    const srcDir = path.join(process.cwd(), "src");
    const tsxFiles = getAllTsxFiles(srcDir);

    const violations: { file: string; line: number; snippet: string }[] = [];

    for (const file of tsxFiles) {
      const relativePath = path.relative(process.cwd(), file);
      const content = fs.readFileSync(file, "utf-8");

      // Match all <img ... > tags (including multiline)
      const imgRegex = /<img\b([^>]*?)(\/?>)/g;
      let match: RegExpExecArray | null;

      while ((match = imgRegex.exec(content)) !== null) {
        const fullImgTag = match[0];
        const attributes = match[1];

        // Line number calculation
        const linesBefore = content.substring(0, match.index).split("\n").length;

        // Check if alt attribute exists
        if (!/\balt\s*=/i.test(attributes)) {
          violations.push({
            file: relativePath,
            line: linesBefore,
            snippet: fullImgTag.replace(/\s+/g, " "),
          });
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("Test 2: Global audit confirms ZERO <img> tags have empty alt=\"\" in src/", () => {
    const srcDir = path.join(process.cwd(), "src");
    const tsxFiles = getAllTsxFiles(srcDir);

    const emptyAltViolations: { file: string; snippet: string }[] = [];

    for (const file of tsxFiles) {
      const relativePath = path.relative(process.cwd(), file);
      const content = fs.readFileSync(file, "utf-8");

      // Check for empty alt="" or alt='' or alt={""}
      const emptyRegex = /<img\b[^>]*?\balt=(?:""|''|\{""\}|\{''\})/g;
      let match: RegExpExecArray | null;

      while ((match = emptyRegex.exec(content)) !== null) {
        emptyAltViolations.push({
          file: relativePath,
          snippet: match[0].replace(/\s+/g, " "),
        });
      }
    }

    expect(emptyAltViolations).toEqual([]);
  });

  it("Test 3: Public components have descriptive alt text", () => {
    // 1. ChooseLocation.tsx
    const locContent = fs.readFileSync(path.join(process.cwd(), "src/components/ChooseLocation.tsx"), "utf-8");
    expect(locContent).toContain('alt={`${loc.city} PrimeRides Luxury Car Rental Hub`}');

    // 2. CarSearchCard.tsx & CarCard.tsx
    const carCardContent = fs.readFileSync(path.join(process.cwd(), "src/components/fleet/CarSearchCard.tsx"), "utf-8");
    const canonicalCard = fs.readFileSync(path.join(process.cwd(), "src/components/fleet/CarCard.tsx"), "utf-8");
    expect(carCardContent + canonicalCard).toContain("alt={car.name ? `${car.name} Rental Car in ${car.location?.city || \"Delhi NCR\"}` : \"PrimeRides Luxury Rental Car\"}");

    // 3. HeroSection.tsx
    const heroContent = fs.readFileSync(path.join(process.cwd(), "src/components/HeroSection.tsx"), "utf-8");
    expect(heroContent).toContain('alt="PrimeRides Luxury Car"');

    // 4. CarsCategory.tsx delegates to unified CarCard
    const catContent = fs.readFileSync(path.join(process.cwd(), "src/components/CarsCategory.tsx"), "utf-8");
    expect(catContent.includes('alt={`${car.name} Rental Car`}') || catContent.includes('CarCard')).toBe(true);

    // 5. Navbar.tsx & Footer.tsx
    const navContent = fs.readFileSync(path.join(process.cwd(), "src/components/Navbar.tsx"), "utf-8");
    expect(navContent).toContain('alt="PrimeRides Luxury Car Rental Logo"');

    const footContent = fs.readFileSync(path.join(process.cwd(), "src/components/Footer.tsx"), "utf-8");
    expect(footContent).toContain('alt="PrimeRides Luxury Self-Drive Rentals Logo"');

    // 6. Testimonials.tsx
    const testContent = fs.readFileSync(path.join(process.cwd(), "src/components/Testimonials.tsx"), "utf-8");
    expect(testContent).toContain('alt={`${t.name} Verified Reviewer Avatar`}');
  });

  it("Test 4: Admin operational interfaces have descriptive alt text", () => {
    // 1. FleetManager.tsx
    const fleetContent = fs.readFileSync(path.join(process.cwd(), "src/components/admin/FleetManager.tsx"), "utf-8");
    expect(fleetContent).toContain('alt={formName ? `${formName} Preview` : "Vehicle Image Preview"}');
    expect(fleetContent).not.toContain('alt="Preview"');

    // 2. AdminImageUpload.tsx
    const uploadContent = fs.readFileSync(path.join(process.cwd(), "src/components/admin/ui/AdminImageUpload.tsx"), "utf-8");
    expect(uploadContent).toContain('alt={label ? `${label} Uploaded Preview` : "Uploaded image preview"}');
    expect(uploadContent).not.toContain('alt="Uploaded preview"');

    // 3. Admin Documents page (thumbnail & inspection canvas)
    const docContent = fs.readFileSync(path.join(process.cwd(), "src/app/admin/documents/page.tsx"), "utf-8");
    expect(docContent).toContain('alt={`${getDocTypeLabel(doc.type)} Thumbnail`}');
    expect(docContent).toContain('alt={`${getDocTypeLabel(activeDoc.type)} Inspection Preview`}');
    expect(docContent).not.toContain('alt=""');
    expect(docContent).not.toContain('alt={activeDoc.type}');

    // 4. Admin Testimonials Manager
    const adminTestContent = fs.readFileSync(path.join(process.cwd(), "src/components/admin/TestimonialsManager.tsx"), "utf-8");
    expect(adminTestContent).toContain('alt={`${item.client_name} Avatar`}');

    // 5. Admin Header / Footer CMS
    const adminHeaderCms = fs.readFileSync(path.join(process.cwd(), "src/app/admin/cms/header/page.tsx"), "utf-8");
    expect(adminHeaderCms).toContain('alt="PrimeRides Brand Logo Live Preview"');
    expect(adminHeaderCms).toContain('alt="PrimeRides Brand Logo Render on Dark Navbar"');
    expect(adminHeaderCms).toContain('alt="PrimeRides Brand Logo Render on Light Background"');

    const adminFooterCms = fs.readFileSync(path.join(process.cwd(), "src/app/admin/cms/footer/page.tsx"), "utf-8");
    expect(adminFooterCms).toContain('alt="PrimeRides Brand Logo Footer Preview"');
  });
});
