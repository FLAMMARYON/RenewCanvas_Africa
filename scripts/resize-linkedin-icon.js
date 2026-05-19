/**
 * Resize LinkedIn Icon Script
 * Creates a properly sized LinkedIn profile icon from the source logo
 * with cream background matching the brand colors
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const BRAND_DIR = path.join(PUBLIC_DIR, "brand");

// LinkedIn icon sizes
const LINKEDIN_SIZE = 400; // 400x400 for LinkedIn profile

// Cream background color matching the brand (from user's image - warmer cream tone)
const CREAM_BACKGROUND = { r: 247, g: 238, b: 220, alpha: 1 };

async function resizeLinkedInIcon() {
  const sourcePath = path.join(BRAND_DIR, "renewcanvas-icon-full-color.png");
  const outputPath = path.join(BRAND_DIR, "linkedin-profile-icon.png");
  const outputPathPublic = path.join(PUBLIC_DIR, "linkedin-icon.png");

  console.log("Creating LinkedIn icon...");

  try {
    // Get source image metadata
    const metadata = await sharp(sourcePath).metadata();
    console.log(`Source image: ${metadata.width}x${metadata.height}`);

    // Create cream background canvas
    const background = await sharp({
      create: {
        width: LINKEDIN_SIZE,
        height: LINKEDIN_SIZE,
        channels: 4,
        background: CREAM_BACKGROUND,
      },
    })
      .png()
      .toBuffer();

    // Resize the logo to fill ~96% of the square (almost touching edges)
    const logoSize = Math.round(LINKEDIN_SIZE * 0.96);
    const resizedLogo = await sharp(sourcePath)
      .resize(logoSize, logoSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    // Calculate position to center the logo
    const offset = Math.round((LINKEDIN_SIZE - logoSize) / 2);

    // Composite logo on cream background
    const finalImage = await sharp(background)
      .composite([
        {
          input: resizedLogo,
          top: offset,
          left: offset,
        },
      ])
      .png({ quality: 100 })
      .toBuffer();

    // Save to brand folder
    await sharp(finalImage).toFile(outputPath);
    console.log(`Saved: ${outputPath}`);

    // Also save to public root
    await sharp(finalImage).toFile(outputPathPublic);
    console.log(`Saved: ${outputPathPublic}`);

    // Get file sizes
    const stats = fs.statSync(outputPath);
    console.log(`File size: ${Math.round(stats.size / 1024)} KB`);

    console.log("\nLinkedIn icon created successfully!");
    console.log("- Size: 400x400 pixels");
    console.log("- Background: Cream (#F5EBD7)");
    console.log("- Logo fills 94% of the square");
  } catch (error) {
    console.error("Error creating LinkedIn icon:", error);
    process.exit(1);
  }
}

resizeLinkedInIcon();
