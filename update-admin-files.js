const fs = require('fs');
const path = require('path');

// Read both files
const satFile = fs.readFileSync('frontend/admin-satellites.html', 'utf8');
const gsFile = fs.readFileSync('frontend/admin-groundstations.html', 'utf8');

// Replace file inputs with URL inputs
const updateFileContent = (content, resourceType) => {
  // Replace the image-upload-group section
  let updated = content.replace(
    /<!-- Image Upload Section -->[\s\S]*?<div id="uploadStatus"[\s\S]*?<\/div>\s*<\/div>/,
    `<!-- Image URL Section -->
                <div class="image-upload-group">
                    <label for="image_url">Image URL</label>
                    <p style="margin: 10px 0; color: #666; font-size: 14px;">Paste an image URL (JPG, PNG, GIF, WebP)</p>
                    <input type="url" id="image_url" name="image_url" placeholder="https://example.com/image.jpg">
                    
                    <div id="imagePreview" class="image-preview"></div>
                </div>`
  );

  // Remove file input and image-upload.js
  updated = updated.replace(
    /<!-- Hidden file input[\s\S]*?<script src="js\/image-upload.js"><\/script>\n\s*<script>/,
    `<script>`
  );

  // Replace the old JavaScript handler with new one
  updated = updated.replace(
    /function triggerImageUpload\(type\)[\s\S]*?e\.target\.value = '';\s*\}\);/,
    `// Preview image URL as user types
        document.getElementById('image_url').addEventListener('change', (e) => {
            const url = e.target.value;
            const preview = document.getElementById('imagePreview');
            if (url) {
                preview.innerHTML = \`<img src="\${url}" alt="Preview" onerror="this.style.display='none'">\`;
            } else {
                preview.innerHTML = '';
            }
        });`
  );

  return updated;
};

// Update both files
const updatedSat = updateFileContent(satFile, 'satellites');
const updatedGs = updateFileContent(gsFile, 'groundstations');

fs.writeFileSync('frontend/admin-satellites.html', updatedSat);
fs.writeFileSync('frontend/admin-groundstations.html', updatedGs);

console.log('✓ Updated admin-satellites.html');
console.log('✓ Updated admin-groundstations.html');
