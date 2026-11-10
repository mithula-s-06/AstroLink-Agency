# Image Upload Feature - Quick Setup Checklist

## Backend Setup

### Step 1: Install Dependencies ✓
```bash
cd backend
npm install multer
```
**Status**: Done - Added to package.json and installed

### Step 2: Create Upload Middleware ✓
**File**: `backend/middleware/upload.js`
- Configures multer for three entity types
- Auto-creates upload directories
- Validates file types and sizes
**Status**: Created

### Step 3: Create Upload Routes ✓
**File**: `backend/routes/uploads.js`
- POST /api/uploads/missions
- POST /api/uploads/satellites
- POST /api/uploads/groundstations
- DELETE /api/uploads/:type/:filename
**Status**: Created

### Step 4: Update Server Configuration ✓
**File**: `backend/server.js`
Changes made:
- Import uploadsRoutes
- Add static file serving for `/uploads`
- Register upload routes at `/api/uploads`
**Status**: Done

### Step 5: Update Route Files ✓
**Files Modified**:
- `backend/routes/missions.js` - Already supports image_url in PUT endpoint
- `backend/routes/satellites.js` - Already supports image_url in PUT endpoint
- `backend/routes/groundstations.js` - Updated to support image_url in POST and PUT

**Status**: Done

### Step 6: Database Schema Updates (Manual)
Run these SQL commands:

```sql
-- Add image_url column to missions table
ALTER TABLE missions ADD COLUMN image_url VARCHAR(255);

-- Add image_url column to satellites table
ALTER TABLE satellites ADD COLUMN image_url VARCHAR(255);

-- Add image_url column to ground_stations table
ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(255);
```

**Status**: Manual - Requires database access

## Frontend Setup

### Step 1: Create Image Upload Utility ✓
**File**: `frontend/js/image-upload.js`
- ImageUploadManager class
- File validation
- Upload/delete functionality
**Status**: Created

### Step 2: Create Admin Pages ✓

#### Missions Admin Page ✓
**File**: `frontend/admin-missions.html`
- List all missions with images
- Create/edit missions
- Image upload with preview
- Delete missions
**Status**: Created

#### Satellites Admin Page ✓
**File**: `frontend/admin-satellites.html`
- List all satellites with images
- Create/edit satellites
- Image upload with preview
- Delete satellites
- Battery status indicator
**Status**: Created

#### Ground Stations Admin Page ✓
**File**: `frontend/admin-groundstations.html`
- List all ground stations with images
- Create/edit ground stations
- Image upload with preview
- Delete ground stations
- Uptime indicator
**Status**: Created

### Step 3: Create Documentation ✓
**Files**: 
- `IMAGE_UPLOAD_GUIDE.md` - Comprehensive documentation
- `IMAGE_UPLOAD_SETUP.md` - This file

**Status**: Created

## Deployment Steps

1. **Backend Server**
   ```bash
   cd backend
   npm install  # If not already done
   npm start
   ```
   - Verify at `http://localhost:5000/api/health`

2. **Access Admin Pages**
   - Missions: `http://localhost:5000/admin-missions.html`
   - Satellites: `http://localhost:5000/admin-satellites.html`
   - Ground Stations: `http://localhost:5000/admin-groundstations.html`

3. **Test Image Upload**
   - Login with admin credentials
   - Create or edit an entity
   - Upload an image
   - Verify image displays

## Directory Structure Verification

Ensure these directories exist or will be auto-created:

```
frontend/
├── uploads/
│   ├── missions/        (auto-created)
│   ├── satellites/      (auto-created)
│   └── groundstations/  (auto-created)
```

The backend creates these automatically on first upload.

## Testing Checklist

### Authentication
- [ ] Login required to access admin pages
- [ ] Non-admin users cannot upload images
- [ ] JWT token validation working

### Image Upload
- [ ] Can upload JPEG images
- [ ] Can upload PNG images
- [ ] Can upload WebP images
- [ ] File size validation (max 5MB)
- [ ] Invalid file types rejected
- [ ] Upload progress shown to user

### Image Management
- [ ] Image preview displayed after upload
- [ ] Images saved to correct directory
- [ ] Image URL stored in database
- [ ] Images served correctly via HTTP

### Create/Edit Entities
- [ ] Can create mission with image
- [ ] Can update mission with new image
- [ ] Can create satellite with image
- [ ] Can update satellite with new image
- [ ] Can create ground station with image
- [ ] Can update ground station with new image

### Display
- [ ] Images display in list view
- [ ] Images display in edit modal
- [ ] Images display with correct aspect ratio
- [ ] Fallback message shown when no image

### Delete
- [ ] Can delete entities
- [ ] Can delete images
- [ ] Images removed from disk
- [ ] Database records updated

## Known Limitations

1. **Disk Storage Only**: Images are stored locally, not in the database
2. **Manual Backups**: Upload directory needs manual backup
3. **No CDN**: No content delivery network integration
4. **Single Server**: Not suitable for multi-server deployment without shared storage

## Future Enhancements

Possible improvements:
- [ ] Image cropping/resizing
- [ ] Batch image upload
- [ ] Image gallery view
- [ ] Cloud storage integration (AWS S3, Azure Blob)
- [ ] Image caching/optimization
- [ ] Thumbnail generation
- [ ] Image metadata extraction
- [ ] EXIF data handling

## Configuration Options

To modify defaults, edit `backend/middleware/upload.js`:

```javascript
// Change max file size (currently 5MB)
limits: { fileSize: 10 * 1024 * 1024 } // 10MB

// Add more image types
const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/tiff'
];

// Change storage location
const uploadDirs = {
  missions: '/custom/path/missions',
  satellites: '/custom/path/satellites',
  groundstations: '/custom/path/groundstations'
};
```

## Troubleshooting

### Problem: "Cannot POST /api/uploads/missions"
**Solution**: Verify server restarted after changes

### Problem: "Directory not found"
**Solution**: Ensure backend process has write permissions to frontend folder

### Problem: "Unauthorized"
**Solution**: Verify token in localStorage and admin role in database

### Problem: "Image not displaying"
**Solution**: Check browser console and verify image file exists in uploads directory

### Problem: "CORS errors"
**Solution**: CORS is already enabled in server.js

## Support Resources

- Full API documentation: See `IMAGE_UPLOAD_GUIDE.md`
- Database schema: See `IMAGE_UPLOAD_GUIDE.md` → Database Updates section
- Frontend examples: Check admin-missions.html source code
- Troubleshooting: See `IMAGE_UPLOAD_GUIDE.md` → Troubleshooting section

## Summary of Files Created/Modified

### Created Files
- [x] `backend/middleware/upload.js` - Multer configuration
- [x] `backend/routes/uploads.js` - Upload API endpoints
- [x] `frontend/js/image-upload.js` - Image upload utility
- [x] `frontend/admin-missions.html` - Missions admin page
- [x] `frontend/admin-satellites.html` - Satellites admin page
- [x] `frontend/admin-groundstations.html` - Ground stations admin page
- [x] `IMAGE_UPLOAD_GUIDE.md` - Full documentation
- [x] `IMAGE_UPLOAD_SETUP.md` - This setup file

### Modified Files
- [x] `backend/server.js` - Added upload routes and static serving
- [x] `backend/routes/groundstations.js` - Added image_url support
- [x] `backend/package.json` - Added multer dependency

### Manual Actions Needed
- [ ] Run SQL ALTER TABLE commands for database schema
- [ ] Test image upload functionality
- [ ] Deploy to production
- [ ] Monitor upload directory disk usage

## Quick Start

1. Ensure backend is running:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Run database schema updates:
   ```sql
   ALTER TABLE missions ADD COLUMN image_url VARCHAR(255);
   ALTER TABLE satellites ADD COLUMN image_url VARCHAR(255);
   ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(255);
   ```

3. Access admin pages:
   - http://localhost:5000/admin-missions.html
   - http://localhost:5000/admin-satellites.html
   - http://localhost:5000/admin-groundstations.html

4. Login and test image upload!

---

**Total Implementation Time**: ~2 hours
**Complexity**: Medium
**Risk Level**: Low (no breaking changes to existing code)
**Rollback**: Simple (remove new files, revert server.js and groundstations.js)
