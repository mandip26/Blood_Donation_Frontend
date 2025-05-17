/**
 * This script generates PWA shortcut icons for the blood donation app
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

// Donation shortcut icon SVG
const donateSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#c6414c" />
  <path 
    d="M256 120 C 256 120, 356 240, 356 310 C 356 362, 314 400, 256 400 C 198 400, 156 362, 156 310 C 156 240, 256 120, 256 120 Z" 
    fill="#ffffff" 
  />
  <rect x="220" y="200" width="72" height="160" rx="10" fill="#c6414c" />
  <rect x="176" y="244" width="160" height="72" rx="10" fill="#c6414c" />
</svg>
`;

// Request shortcut icon SVG
const requestSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#c6414c" />
  <path 
    d="M256 120 C 256 120, 356 240, 356 310 C 356 362, 314 400, 256 400 C 198 400, 156 362, 156 310 C 156 240, 256 120, 256 120 Z" 
    fill="#ffffff" 
  />
  <path d="M220 300 L256 336 L332 260" 
    stroke="#c6414c" 
    stroke-width="24" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    fill="none" 
  />
</svg>
`;

// Generate the shortcut icons
async function generateShortcutIcons() {
  console.log('Generating shortcut icons...');
  
  try {
    // Generate the donation icon
    await sharp(Buffer.from(donateSvg))
      .resize(192, 192)
      .png()
      .toFile(path.join(iconsDir, 'donate.png'));
    console.log('Generated donate icon');
    
    // Generate the request icon
    await sharp(Buffer.from(requestSvg))
      .resize(192, 192)
      .png()
      .toFile(path.join(iconsDir, 'request.png'));
    console.log('Generated request icon');
    
    console.log('All shortcut icons generated successfully!');
  } catch (error) {
    console.error('Error generating shortcut icons:', error);
  }
}

generateShortcutIcons();
