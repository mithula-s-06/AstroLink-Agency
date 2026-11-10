const fs = require('fs');
const path = require('path');

// Create a simple 1x1 PNG placeholder
const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
  0x54, 0x08, 0x99, 0x63, 0xf8, 0x0f, 0x00, 0x00,
  0x01, 0x01, 0x00, 0x01, 0x18, 0xdd, 0x8d, 0xb4,
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
  0xae, 0x42, 0x60, 0x82
]);

const dirs = [
  '../frontend/uploads/missions',
  '../frontend/uploads/satellites',
  '../frontend/uploads/groundstations'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Create sample image files
const images = [
  { path: '../frontend/uploads/missions/chandrayaan2.jpg', name: 'Chandrayaan-2' },
  { path: '../frontend/uploads/satellites/chandrayaan2-orbiter.jpg', name: 'Orbiter' },
  { path: '../frontend/uploads/groundstations/station1.jpg', name: 'Ground Station' }
];

images.forEach(img => {
  const fullPath = path.join(__dirname, img.path);
  fs.writeFileSync(fullPath, pngBuffer);
  console.log(`✓ Created: ${img.name}`);
});

console.log('\n✓ Sample images created successfully!');
