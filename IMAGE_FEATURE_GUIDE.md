# Image Viewing and Image URL Form Options - Complete Guide

## Overview

This document describes the image features implemented for both Satellites and Ground Stations in the AstroLink Agency system.

## Features Implemented

### 1. Image Viewing
- Full-size image modal viewer for detail pages
- Image viewer accessible from cards in the list view
- Click on images to view in fullscreen modal
- Modal displays image with title and close button

### 2. Image URL in Forms
- **Satellites**: Support for both file upload and image URL input
- **Ground Stations**: Support for image URL input
- Image preview in the form
- Images displayed in the list view with thumbnails

---

## Satellites - Image Features

### Admin Panel (admin-satellites.html)

#### Form Fields for Image
1. **Image Upload** - Upload an image file (JPG, PNG, GIF, WebP)
   - Accepts file inputs
   - Shows preview of selected file
   - Uploads to `/api/uploads/satellites`
   
2. **Image URL** - Provide a direct image URL
   - Input field with URL validation
   - Takes precedence over file upload if both are provided
   - Direct link to external images

#### Display Features
- **List View**: 
  - Shows image thumbnail (max 150px height)
  - Clickable image to view fullscreen
  - "View Image" button to open image modal
  
- **Detail Page** (satellite-details.html):
  - Large image display (max 300px height)
  - Clickable to view fullscreen
  - Image modal viewer with title and close button

#### Backend Support
- Database: `satellites.image_url` column (VARCHAR(500))
- API POST: `/api/satellites` - includes `image_url` parameter
- API PUT: `/api/satellites/{satelliteId}` - supports `image_url` update

---

## Ground Stations - Image Features

### Admin Panel (admin-groundstations.html)

#### Form Fields for Image
1. **Image URL** - Provide a direct image URL
   - Input field with URL validation
   - Live preview as URL is entered
   - Onerror handling for invalid URLs

#### Display Features
- **List View**:
  - Shows image thumbnail (max 150px height)
  - Clickable image to view fullscreen
  - "View Image" button to open image modal
  
- **Detail Page** (groundstation-details.html):
  - Large image display (max 300px height)
  - Clickable to view fullscreen
  - Image modal viewer with title and close button

#### Backend Support
- Database: `ground_stations.image_url` column (VARCHAR(500))
- API POST: `/api/groundstations` - includes `image_url` parameter
- API PUT: `/api/groundstations/{stationId}` - supports `image_url` update

---

## Implementation Details

### Database Schema

#### Satellites Table
```sql
ALTER TABLE satellites ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER operational_life_years;
```

#### Ground Stations Table
```sql
ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER antenna_type;
```

#### Missions Table (Already Implemented)
```sql
ALTER TABLE missions ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER mission_description;
```

### API Endpoints

#### Satellites
- **GET** `/api/satellites` - Returns all satellites with image_url
- **GET** `/api/satellites/{satelliteId}` - Returns satellite details with image_url
- **POST** `/api/satellites` - Create satellite with image_url
  ```json
  {
    "satellite_name": "String",
    "mission_id": Number,
    "satellite_type": "LEO|MEO|GEO|Polar|Sun-Synchronous",
    "image_url": "String (optional)"
  }
  ```
- **PUT** `/api/satellites/{satelliteId}` - Update satellite with image_url
  ```json
  {
    "image_url": "String"
  }
  ```

#### Ground Stations
- **GET** `/api/groundstations` - Returns all ground stations with image_url
- **GET** `/api/groundstations/{stationId}` - Returns station details with image_url
- **POST** `/api/groundstations` - Create ground station with image_url
  ```json
  {
    "station_name": "String",
    "station_code": "String",
    "mission_id": Number,
    "image_url": "String (optional)"
  }
  ```
- **PUT** `/api/groundstations/{stationId}` - Update ground station with image_url
  ```json
  {
    "image_url": "String"
  }
  ```

### Frontend JavaScript Functions

#### Satellite Image Viewer (admin-satellites.html)
```javascript
function viewSatelliteImage(imageUrl, satelliteName)
```
- Creates a modal dialog showing the full-size image
- Displays satellite name in header
- Clickable outside modal to close
- Close button (✕) in top-right corner

#### Ground Station Image Viewer (admin-groundstations.html)
```javascript
function viewStationImage(imageUrl, stationName)
```
- Creates a modal dialog showing the full-size image
- Displays station name in header
- Clickable outside modal to close
- Close button (✕) in top-right corner

#### Image Preview Functions
- **Satellites**: `previewSatelliteImage(event)` - Shows preview of selected file
- **Ground Stations**: URL input change event - Shows preview of URL

---

## Image Modal Styling

### Modal Appearance
- **Background**: Semi-transparent dark overlay (rgba(0, 0, 0, 0.9))
- **Container**: White background with padding and border radius
- **Title**: Bold header with image title
- **Close Button**: Top-right corner, interactive on hover

### Responsive Design
- Max-width: 90% of viewport
- Max-height: 90vh (90% of viewport height)
- Auto-scrolls if content exceeds max-height
- Adapts to mobile and desktop screens

---

## Usage Guide

### Adding an Image to a Satellite

#### Method 1: Upload File
1. Go to Admin Panel → Satellites
2. Click "+ Create Satellite" or "Edit" on existing satellite
3. Fill in satellite details
4. In "Satellite Image" section, click file input
5. Select image file from computer (JPG, PNG, GIF, WebP)
6. Image preview appears
7. Click "Save Satellite"
8. Image is uploaded and linked

#### Method 2: Image URL
1. Go to Admin Panel → Satellites
2. Click "+ Create Satellite" or "Edit" on existing satellite
3. Fill in satellite details
4. In "Or provide Image URL" field, paste image URL
5. Leave file input empty
6. Click "Save Satellite"
7. Image URL is saved and displayed

### Adding an Image to a Ground Station

1. Go to Admin Panel → Ground Stations
2. Click "+ Create Ground Station" or "Edit" on existing station
3. Fill in station details
4. In "Image URL" field, paste image URL
5. Click "Save Ground Station"
6. Image URL is saved and displayed

### Viewing Images

#### In Admin List View
- **Satellites**: Click on satellite card image or "View Image" button
- **Ground Stations**: Click on station card image or "View Image" button
- Modal opens showing full-size image

#### In Detail Pages
- **Satellites**: Click on the large image at top of page
- **Ground Stations**: Click on the large image at top of page
- Modal opens showing full-size image

---

## Supported Image Formats

- JPG/JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## Image URL Considerations

- **HTTPS Recommended**: Use HTTPS URLs for security
- **CORS**: Image must be accessible from browser (no CORS restrictions)
- **Performance**: Large images may load slowly
- **External Hosting**: Use reliable image hosting services
- **Availability**: URL must remain valid (no broken links)

---

## Files Modified

### Backend
- `/backend/routes/satellites.js`
  - Added `image_url` parameter to POST route
  - Already has `image_url` support in PUT route

- `/backend/routes/groundstations.js`
  - Added `image_url` parameter to POST route
  - Already has `image_url` support in PUT route

### Frontend
- `/frontend/admin-satellites.html`
  - Added image URL input field
  - Updated saveSatellite() to handle both file upload and URL
  - Updated editSatellite() to populate image_url_input field
  - Updated openCreateModal() to clear image_url_input

- `/frontend/admin-groundstations.html`
  - Already has complete image URL support
  - Image preview on URL change
  - View image modal functionality

- `/frontend/satellite-details.html`
  - Already has image display and viewer modal
  - Clickable image with viewImage() function

- `/frontend/groundstation-details.html`
  - Already has image display and viewer modal
  - Clickable image with viewImage() function

### Database
- `/database/add_image_url_columns.sql`
  - Already contains migration for image_url columns
  - Executed separately during setup

---

## Troubleshooting

### Image Not Showing
- Check URL is correct and accessible
- Verify no CORS restrictions on image hosting
- Try a different image URL
- Clear browser cache and reload

### Modal Not Opening
- Check browser console for JavaScript errors
- Verify image URL is valid
- Try refreshing the page

### File Upload Not Working
- Check file size (should be reasonable)
- Verify file format (JPG, PNG, GIF, WebP)
- Check network requests in browser DevTools
- Verify upload endpoint is configured

### Image Quality
- Use high-quality images
- Compress large images before uploading
- Consider using image optimization services

---

## Future Enhancements

Possible improvements for future versions:
1. Image cropping before upload
2. Image filters/editing in admin panel
3. Multiple images per satellite/station
4. Image gallery view
5. Automatic image optimization
6. Image CDN integration
7. Drag-and-drop file upload
8. Image search/gallery features

---

## Testing Checklist

- [ ] Upload satellite image via file
- [ ] Add satellite via image URL
- [ ] View satellite image in list (click image)
- [ ] View satellite image in list (click button)
- [ ] View satellite in detail page (click image)
- [ ] Edit satellite and update image
- [ ] Add ground station with image URL
- [ ] View ground station image in list
- [ ] View ground station in detail page
- [ ] Edit ground station and update image
- [ ] Test with various image formats
- [ ] Test with external URLs
- [ ] Test modal close functionality
- [ ] Test on mobile devices
