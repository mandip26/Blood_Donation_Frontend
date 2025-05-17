/**
 * This script generates PWA icons of different sizes from a base SVG image
 * It requires sharp package to be installed: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Base SVG content - a simple blood drop icon
const baseSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#ffffff" />
  <path 
    d="M256 64 C 256 64, 400 250, 400 350 C 400 432, 338 480, 256 480 C 174 480, 112 432, 112 350 C 112 250, 256 64, 256 64 Z" 
    fill="#c6414c" 
  />
  <path 
    d="M256 128 C 256 128, 350 250, 350 330 C 350 382, 308 416, 256 416 C 204 416, 162 382, 162 330 C 162 250, 256 128, 256 128 Z" 
    fill="#e6818c" 
    opacity="0.7"
  />
</svg>
`;

// Sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Function to generate an icon of a specific size
async function generateIcon(size) {
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  try {
    await sharp(Buffer.from(baseSvg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`Generated icon: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating ${size}x${size} icon:`, error);
  }
}

// Generate all icon sizes
async function generateAllIcons() {
  console.log('Generating PWA icons...');
  
  try {
    await Promise.all(sizes.map(size => generateIcon(size)));
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateAllIcons();
