import { detectImageBinarySignature } from "../src/server/storage/index.ts";

// 1. Valid JPEG Header (FF D8 FF E0 ...)
const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

// 2. Valid PNG Header (89 50 4E 47 0D 0A 1A 0A)
const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

// 3. Spoofed PHP shell disguised as an image
const spoofedFile = Buffer.from("<?php echo 'malicious backdoor!'; ?>");

// 4. Executable shell script named car.jpg
const spoofedScript = Buffer.from("#!/bin/bash\nrm -rf /");

console.log("=== Testing Magic Bytes Detection ===");
console.log("1. Valid JPEG detection:", detectImageBinarySignature(validJpeg));
console.log("2. Valid PNG detection:", detectImageBinarySignature(validPng));
console.log("3. Spoofed PHP script detection:", detectImageBinarySignature(spoofedFile));
console.log("4. Spoofed Bash script detection:", detectImageBinarySignature(spoofedScript));

if (
  detectImageBinarySignature(validJpeg)?.formatName === "JPEG" &&
  detectImageBinarySignature(validPng)?.formatName === "PNG" &&
  detectImageBinarySignature(spoofedFile) === null &&
  detectImageBinarySignature(spoofedScript) === null
) {
  console.log("\nRESULT: ALL MAGIC-BYTE VALIDATION CHECKS PASSED!");
} else {
  console.error("\nRESULT: FAILED MAGIC-BYTE TESTS!");
  process.exit(1);
}
