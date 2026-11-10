# Image Upload Feature Guide

## Overview

The AstroLink Agency admin panel now includes comprehensive image upload functionality for missions, satellites, and ground stations. Images are stored locally on disk with full CRUD operations support.

## Features

- **Local Disk Storage**: Images are saved to the server's disk under `/frontend/uploads/`
- **Image Upload**: Upload images for missions, satellites, and ground stations
- **Image Preview**: View uploaded images in real-time
- **Image Management**: Delete images when no longer needed
- **Validation**: File type and size validation (Max 5MB)
- **Security**: 
  - Authentication required (admin only)
  - Directory traversal protection
  - Secure filename generation

## File Structure

```
frontend/
├── uploads/
│   ├── missions/        # Mission images stored here
│   ├── satellites/      # Satellite images stored here
│   └── groundstations/  # Ground station images stored here
├── admin-missions.html         # Mission management page
├── admin-satellites.html       # Satellite management page
├── admin-groundstations.html   # Ground station management page
└── js/
    └── image-upload.js        # Image upload utility

backend/
├── routes/
│   └── uploads.js       # Upload API endpoints
├── middleware/
│   └── upload.js        # Multer configuration
└── server.js            # Updated with upload routes
```

## Backend Setup

### 1. Multer Middleware (`backend/middleware/upload.js`)

Configures multer for handling image uploads with:
- Automatic directory creation
- Separate storage for each entity type
- File validation (images only)
- File size limit (5MB)
- Unique filename generation with timestamps

### 2. Upload Routes (`backend/routes/uploads.js`)

**Endpoints:**

#### Upload Mission Image
```
POST /api/uploads/missions
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  image: <file>

Response:
{
  "success": true,
  "message": "Mission image uploaded successfully",
  "imageUrl": "/uploads/missions/mission-1234567890.jpg",
  "filename": "mission-1234567890.jpg"
}
```

#### Upload Satellite Image
```
POST /api/uploads/satellites
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  image: <file>

Response:
{
  "success": true,
  "message": "Satellite image uploaded successfully",
  "imageUrl": "/uploads/satellites/satellite-1234567890.jpg",
  "filename": "satellite-1234567890.jpg"
}
```

#### Upload Ground Station Image
```
POST /api/uploads/groundstations
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
  image: <file>

Response:
{
  "success": true,
  "message": "Ground station image uploaded successfully",
  "imageUrl": "/uploads/groundstations/station-1234567890.jpg",
  "filename": "station-1234567890.jpg"
}
```

#### Delete Image
```
DELETE /api/uploads/<type>/<filename>
Authorization: Bearer <token>

Example: DELETE /api/uploads/missions/mission-1234567890.jpg

Response:
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### 3. Database Updates

The following tables now support images:

**missions table:**
- Added: `image_url` VARCHAR(255) - URL to the mission image

**satellites table:**
- Added: `image_url` VARCHAR(255) - URL to the satellite image

**ground_stations table:**
- Added: `image_url` VARCHAR(255) - URL to the ground station image

### 4. API Endpoint Updates

#### Create/Update Mission with Image
```javascript
POST /api/missions or PUT /api/missions/:id
{
  "mission_name": "...",
  "mission_type": "...",
  "start_date": "...",
  "end_date": "...",
  "image_url": "/uploads/missions/mission-123.jpg"
}
```

#### Create/Update Satellite with Image
```javascript
POST /api/satellites or PUT /api/satellites/:id
{
  "satellite_name": "...",
  "satellite_type": "...",
  "mission_id": 1,
  "image_url": "/uploads/satellites/sat-123.jpg"
}
```

#### Create/Update Ground Station with Image
```javascript
POST /api/groundstations or PUT /api/groundstations/:id
{
  "station_name": "...",
  "station_code": "...",
  "mission_id": 1,
  "image_url": "/uploads/groundstations/station-123.jpg"
}
```

## Frontend Usage

### 1. Admin Pages

Three new admin pages have been created:

- **admin-missions.html** - Manage missions with images
- **admin-satellites.html** - Manage satellites with images
- **admin-groundstations.html** - Manage ground stations with images

#### Features on each page:

1. **List View**
   - Shows all entities with their details
   - Displays uploaded images in thumbnail format
   - Edit/Delete buttons for each entity

2. **Create/Edit Modal**
   - Form with all entity fields
   - Image upload section with preview
   - Upload status feedback
   - Save and cancel buttons

3. **Image Upload**
   - Drag-and-drop compatible input
   - File validation feedback
   - Real-time image preview
   - Upload progress indication

### 2. Image Upload JavaScript (`frontend/js/image-upload.js`)

The `ImageUploadManager` class provides:

```javascript
// Create an instance
const manager = new ImageUploadManager();

// Upload image
const result = await manager.uploadImage(file, 'missions');
if (result.success) {
  console.log('Image URL:', result.imageUrl);
} else {
  console.error('Error:', result.message);
}

// Delete image
const deleteResult = await manager.deleteImage('missions', 'mission-123.jpg');

// Validate file
const validation = manager.validateFile(file);
if (!validation.valid) {
  console.error('Validation error:', validation.message);
}
```

### 3. Usage Example

```html
<!-- In your HTML -->
<input type="hidden" id="image_url" name="image_url">
<div id="imagePreview"></div>
<button onclick="triggerImageUpload('mission')">Upload Image</button>

<!-- In your JavaScript -->
<script src="js/image-upload.js"></script>
<script>
async function handleImageUpload(file) {
  const result = await imageUploadManager.uploadImage(file, 'missions');
  if (result.success) {
    document.getElementById('image_url').value = result.imageUrl;
    document.getElementById('imagePreview').innerHTML = 
      `<img src="${result.imageUrl}" alt="Preview">`;
  }
}
</script>
```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

## File Size Limits

- Maximum: 5MB per image
- Recommended: 1-3MB for optimal performance

## Security Features

1. **Authentication**: Only authenticated admin users can upload/delete
2. **File Validation**: Only image MIME types accepted
3. **Path Protection**: Directory traversal attacks prevented
4. **Unique Filenames**: Timestamps prevent overwrites
5. **Admin Only Routes**: All upload/delete routes protected with `adminMiddleware`

## Usage Workflow

### Adding an Image to a Mission

1. Navigate to **Admin → Missions**
2. Click **+ Create Mission** or **Edit** on existing mission
3. Fill in mission details
4. In the image upload section:
   - Click **Choose Image**
   - Select an image file from your computer
   - Wait for upload confirmation
5. Click **Save Mission**

### Updating Satellite Image

1. Navigate to **Admin → Satellites**
2. Click **Edit** on existing satellite
3. In the image upload section:
   - Click **Choose Image** to replace current image
   - Select new image
   - Wait for upload confirmation
4. Click **Save Satellite**

### Managing Ground Station Images

1. Navigate to **Admin → Ground Stations**
2. Create new or edit existing ground station
3. Upload image using the image upload button
4. Image will be displayed in preview
5. Save the ground station

## Troubleshooting

### Upload Directory Not Created
- The system automatically creates the upload directories on first use
- Ensure the backend process has write permissions

### Upload Fails with Authentication Error
- Check that the JWT token is valid
- Ensure you're logged in as an admin user

### Image Not Displaying After Upload
- Check browser console for errors
- Verify the image URL path is correct
- Ensure the file exists in the upload directory

### File Size Error
- Maximum file size is 5MB
- Compress the image before uploading
- Use image compression tools like TinyPNG

### Wrong File Type Error
- Only image files are accepted
- Check that the file extension is correct
- Ensure the file is actually an image

## Performance Tips

1. **Compress Images**: Keep images under 2MB for best performance
2. **Use WebP Format**: WebP offers better compression than JPEG
3. **Regular Cleanup**: Delete unused images to save disk space
4. **Backup**: Regularly backup the `/frontend/uploads/` directory

## Database Migration

If updating an existing database, run these SQL queries:

```sql
ALTER TABLE missions ADD COLUMN image_url VARCHAR(255);

ALTER TABLE satellites ADD COLUMN image_url VARCHAR(255);

ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(255);
```

## API Examples

### cURL Examples

Upload a mission image:
```bash
curl -X POST http://localhost:5000/api/uploads/missions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

Delete an image:
```bash
curl -X DELETE http://localhost:5000/api/uploads/missions/mission-123.jpg \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript Fetch Examples

Upload using fetch:
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/uploads/missions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log(data.imageUrl);
```

## Accessing Images

Images are accessible via HTTP:

```
http://localhost:5000/uploads/missions/mission-123.jpg
http://localhost:5000/uploads/satellites/sat-123.jpg
http://localhost:5000/uploads/groundstations/station-123.jpg
```

## File Storage Location

All images are stored in the local file system:

```
Windows: C:\Users\[user]\OneDrive\Documents\PROJECT\astrolink-agency\frontend\uploads\
Linux/Mac: /path/to/astrolink-agency/frontend/uploads/
```

## Next Steps

1. Install multer: `npm install multer`
2. Update database schema with ALTER TABLE commands
3. Deploy the new admin pages
4. Test image upload functionality
5. Verify images display correctly in dashboards

## Support

For issues or questions, check:
- Browser console for JavaScript errors
- Server logs for backend errors
- Upload directory permissions
- Database schema alignment
