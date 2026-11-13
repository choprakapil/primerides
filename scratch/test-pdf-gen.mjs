// Pure zero-dependency PDF 1.4 generator test
import fs from "fs";

function createPdfBuffer(lines) {
  let streamContent = "";
  // Header bar (Gold #c59b27 -> 0.772 0.607 0.153)
  streamContent += "0.772 0.607 0.153 rg\n";
  streamContent += "40 760 515 40 re f\n";

  // White text on gold header
  streamContent += "1 1 1 rg\n";
  streamContent += "BT /F2 16 Tf 50 775 Td (PRIMERIDES TAX INVOICE) Tj ET\n";

  // Dark text
  streamContent += "0.1 0.1 0.1 rg\n";
  let y = 730;
  for (const line of lines) {
    const escaped = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    streamContent += `BT /F1 10 Tf 50 ${y} Td (${escaped}) Tj ET\n`;
    y -= 16;
  }

  const streamLength = Buffer.byteLength(streamContent, "utf8");

  const objects = [
    // 1: Catalog
    `<< /Type /Catalog /Pages 2 0 R >>`,
    // 2: Pages
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    // 3: Page (A4: 595.28 x 841.89)
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`,
    // 4: Content Stream
    `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`,
    // 5: Font Helvetica
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
    // 6: Font Helvetica-Bold
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`,
  ];

  let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const xrefOffsets = [0];

  for (let i = 0; i < objects.length; i++) {
    xrefOffsets.push(Buffer.byteLength(output, "utf8"));
    output += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const startxref = Buffer.byteLength(output, "utf8");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    output += `${String(xrefOffsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return Buffer.from(output, "binary");
}

const testLines = [
  "Legal Entity: PrimeRides Mobility Solutions Private Limited",
  "GSTIN: 07AABCP1234F1Z5 | SAC Code: 996601",
  "Invoice Number: PR/2627/000345",
  "Date: 02 Oct 2026",
  "Customer: Rahul Sharma (+91 99999 11111)",
  "Vehicle: BMW 5 Series (Luxury Sedan)",
  "Rental Plan: Unlimited KM Weekend Explorer",
  "Taxable Base Amount: INR 7,500.00",
  "CGST (9%): INR 675.00",
  "SGST (9%): INR 675.00",
  "Total GST (18%): INR 1,350.00",
  "Security Deposit (Tax Exempt): INR 5,000.00",
  "Total Invoice Amount: INR 13,850.00",
];

const buf = createPdfBuffer(testLines);
fs.writeFileSync("scratch/sample-invoice.pdf", buf);
console.log("PDF created successfully, size:", buf.length);
