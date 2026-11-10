# Image URL Configuration - Missions & Ground Stations

## Overview
The system has been configured to use **image URLs only** (no local file uploads) for both Missions and Ground Stations.

## Changes Made

### 1. Admin Panel - Missions (admin-missions.html)
- ✅ Image input field accepts URLs only
- ✅ Label updated to "Mission Image URL *" (required field)
- ✅ Placeholder shows example URL format
- ✅ Live preview of images as URLs are entered
- ✅ View Image button in mission list

### 2. Admin Panel - Ground Stations (admin-groundstations.html)
- ✅ Image input field accepts URLs only
- ✅ Label updated to "Image URL *" (required field)
- ✅ Placeholder shows example URL format
- ✅ Live preview of images as URLs are entered
- ✅ View Image button in ground station list

### 3. Mission Details Page (mission-details.html)
- ✅ Large mission image display at top of page
- ✅ Click image to view in full modal
- ✅ Satellite images with view buttons
- ✅ Ground Station images with view buttons

### 4. Ground Station Details Page (groundstation-details.html)
- ✅ Large ground station image display at top
- ✅ Click image to view in full modal
- ✅ Connected satellites displayed below

### 5. Backend API (routes/groundstations.js)
- ✅ Accepts `image_url` field in POST/PUT requests
- ✅ Stores URLs in database
- ✅ Returns URLs in GET responses

## How to Use

### For Admins Adding Missions:
1. Navigate to Admin Panel → Missions
2. Click "+ Create Mission"
3. Fill in mission details
4. In "Mission Image URL" field, paste a direct image URL (e.g., from ISRO, NASA, or any CDN)
5. Preview appears below input
6. Click "Save Mission"

### For Admins Adding Ground Stations:
1. Navigate to Admin Panel → Ground Stations
2. Click "+ Create Ground Station"
3. Fill in ground station details
4. In "Image URL" field, paste a direct image URL
5. Preview appears below input
6. Click "Save Ground Station"

### For Users Viewing Details:
1. Click on any Mission to see full details + large image
2. Click on any Ground Station to see full details + large image
3. Click images to view them full-screen in a modal

## Image Format Supported
- JPG/JPEG
- PNG
- GIF
- WebP

## Example URLs
```
https://example.com/mission.jpg
https://cdn.example.com/images/groundstation.png
https://api.example.com/image.webp
```

## Database Schema
The `image_url` field is stored as:
- **Missions**: `missions.image_url` (VARCHAR)
- **Ground Stations**: `ground_stations.image_url` (VARCHAR)

## API Endpoints

### Create Mission
```
POST /api/missions
{
  "mission_name": "...",
  "image_url": "https://example.com/image.jpg",
  ...
}
```

### Update Mission
```
PUT /api/missions/:id
{
  "image_url": "https://example.com/image.jpg",
  ...
}
```

### Create Ground Station
```
POST /api/groundstations
{
  "station_name": "...",
  "image_url": "https://example.com/image.jpg",
  ...
}
```

### Update Ground Station
```
PUT /api/groundstations/:id
{
  "image_url": "https://example.com/image.jpg",
  ...
}
```

## Notes
- Image URLs must be publicly accessible
- The system does NOT store files locally
- Images are displayed directly from the provided URL
- Ensure URLs point to image files, not web pages
- Test image URLs before saving to verify they load properly
