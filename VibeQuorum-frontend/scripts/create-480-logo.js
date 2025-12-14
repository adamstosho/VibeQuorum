const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Static SVG for logo at 480x480 (using the icon version with dark background for better visibility)
const logoSVG = `
<svg width="480" height="480" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="logoIconGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd166" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="iconGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Dark background -->
  <rect width="48" height="48" rx="10" fill="#0a0e27" />

  <!-- Hexagon -->
  <path
    d="M24 4L42.5 14V34L24 44L5.5 34V14L24 4Z"
    fill="none"
    stroke="url(#logoIconGradient)"
    stroke-width="2"
    stroke-linejoin="round"
  />
  <path
    d="M24 8L38 16V32L24 40L10 32V16L24 8Z"
    fill="url(#logoIconGradient)"
    opacity="0.15"
  />

  <!-- V -->
  <path
    d="M16 16L24 34L32 16"
    fill="none"
    stroke="url(#logoIconGradient)"
    stroke-width="3.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    filter="url(#iconGlow)"
  />

  <!-- Accents -->
  <circle cx="24" cy="12" r="2" fill="url(#logoIconGold)" />
</svg>
`;

async function createLogo() {
  const outputDir = path.join(__dirname, '../public');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Creating 480x480 logo for hackathon submission...');

  const buffer = await sharp(Buffer.from(logoSVG))
    .resize(480, 480)
    .png()
    .toBuffer();
  
  const outputPath = path.join(outputDir, 'vibequorum-logo-480x480.png');
  fs.writeFileSync(outputPath, buffer);
  
  const stats = fs.statSync(outputPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ Created: ${outputPath}`);
  console.log(`📏 Size: 480x480 pixels`);
  console.log(`💾 File size: ${fileSizeInMB} MB`);
  
  if (stats.size > 2 * 1024 * 1024) {
    console.log('⚠️  Warning: File size exceeds 2 MB limit!');
  } else {
    console.log('✅ File size is under 2 MB limit');
  }
}

createLogo().catch(console.error);
