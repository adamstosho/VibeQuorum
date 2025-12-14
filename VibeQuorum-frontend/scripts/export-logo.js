const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Static SVG for icon-only logo (without animations)
const iconOnlySVG = `
<svg width="512" height="512" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  <!-- Background (transparent) -->
  <rect width="48" height="48" fill="transparent" />

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

// Static SVG for full logo with background
const fullLogoSVG = `
<svg width="512" height="512" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="logoGradientSecondary" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06d6a0" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="logoGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd166" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#2563eb" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background (transparent) -->
  <rect width="48" height="48" fill="transparent" />

  <!-- Outer hexagon frame -->
  <path
    d="M24 4L42.5 14V34L24 44L5.5 34V14L24 4Z"
    fill="none"
    stroke="url(#logoGradient)"
    stroke-width="2"
    stroke-linejoin="round"
    filter="url(#logoShadow)"
  />

  <!-- Inner hexagon fill -->
  <path
    d="M24 8L38 16V32L24 40L10 32V16L24 8Z"
    fill="url(#logoGradient)"
    opacity="0.15"
  />

  <!-- Stylized V mark - main stroke -->
  <path
    d="M16 16L24 34L32 16"
    fill="none"
    stroke="url(#logoGradient)"
    stroke-width="3.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    filter="url(#logoGlow)"
  />

  <!-- Inner V highlight -->
  <path
    d="M18 18L24 30L30 18"
    fill="none"
    stroke="url(#logoGradientSecondary)"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity="0.6"
  />

  <!-- Top accent dot -->
  <circle
    cx="24"
    cy="12"
    r="2"
    fill="url(#logoGoldGradient)"
    filter="url(#logoGlow)"
  />

  <!-- Side node dots -->
  <circle cx="10" cy="24" r="1.5" fill="url(#logoGradient)" opacity="0.7" />
  <circle cx="38" cy="24" r="1.5" fill="url(#logoGradient)" opacity="0.7" />

  <!-- Bottom accent -->
  <circle cx="24" cy="36" r="1.5" fill="url(#logoGoldGradient)" opacity="0.6" />

  <!-- Connecting lines from V tip to bottom -->
  <line
    x1="24"
    y1="34"
    x2="24"
    y2="36"
    stroke="url(#logoGoldGradient)"
    stroke-width="1"
    opacity="0.5"
  />
</svg>
`;

// Version with dark background
const iconWithDarkBgSVG = `
<svg width="512" height="512" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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

async function exportLogo() {
  const outputDir = path.join(__dirname, '../public');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sizes = [
    { name: '32x32', size: 32 },
    { name: '64x64', size: 64 },
    { name: '128x128', size: 128 },
    { name: '256x256', size: 256 },
    { name: '512x512', size: 512 },
    { name: '1024x1024', size: 1024 },
  ];

  console.log('Exporting logo variants...\n');

  // Export icon-only (transparent background)
  console.log('Exporting icon-only (transparent)...');
  for (const { name, size } of sizes) {
    const buffer = await sharp(Buffer.from(iconOnlySVG))
      .resize(size, size)
      .png()
      .toBuffer();
    
    fs.writeFileSync(
      path.join(outputDir, `vibequorum-icon-${name}.png`),
      buffer
    );
    console.log(`  ✓ vibequorum-icon-${name}.png`);
  }

  // Export icon with dark background
  console.log('\nExporting icon with dark background...');
  for (const { name, size } of sizes) {
    const buffer = await sharp(Buffer.from(iconWithDarkBgSVG))
      .resize(size, size)
      .png()
      .toBuffer();
    
    fs.writeFileSync(
      path.join(outputDir, `vibequorum-icon-dark-${name}.png`),
      buffer
    );
    console.log(`  ✓ vibequorum-icon-dark-${name}.png`);
  }

  // Export full logo (transparent background)
  console.log('\nExporting full logo (transparent)...');
  for (const { name, size } of sizes) {
    const buffer = await sharp(Buffer.from(fullLogoSVG))
      .resize(size, size)
      .png()
      .toBuffer();
    
    fs.writeFileSync(
      path.join(outputDir, `vibequorum-logo-${name}.png`),
      buffer
    );
    console.log(`  ✓ vibequorum-logo-${name}.png`);
  }

  console.log('\n✅ Logo export complete!');
  console.log(`📁 Files saved to: ${outputDir}`);
  console.log('\nAvailable files:');
  console.log('  - vibequorum-icon-*.png (icon only, transparent)');
  console.log('  - vibequorum-icon-dark-*.png (icon with dark background)');
  console.log('  - vibequorum-logo-*.png (full logo, transparent)');
}

exportLogo().catch(console.error);
