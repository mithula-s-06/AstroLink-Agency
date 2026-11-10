# Image URL API Examples - cURL Commands

Use these commands to test adding images via the API directly.

---

## CREATE MISSION WITH IMAGE

```bash
curl -X POST http://localhost:5000/api/missions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mission_name": "Solar Flare Detection Mission",
    "mission_type": "Earth Orbit",
    "mission_status": "Planning",
    "start_date": "2024-03-01",
    "end_date": "2025-12-31",
    "mission_description": "Monitor solar activity for space weather prediction",
    "budget": 50000000,
    "org_id": 1,
    "image_url": "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800"
  }'
```

---

## UPDATE MISSION IMAGE

```bash
curl -X PUT http://localhost:5000/api/missions/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800"
  }'
```

---

## CREATE SATELLITE WITH IMAGE

```bash
curl -X POST http://localhost:5000/api/satellites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "satellite_name": "SolarWatch-1",
    "norad_id": "50123",
    "mission_id": 1,
    "satellite_type": "LEO",
    "launch_date": "2024-03-15",
    "weight_kg": 2500,
    "status": "Pre-Launch",
    "current_battery_percentage": 100,
    "operational_life_years": 5,
    "image_url": "https://images.unsplash.com/photo-1553531088-d8b1005c85f3?w=800"
  }'
```

---

## UPDATE SATELLITE IMAGE

```bash
curl -X PUT http://localhost:5000/api/satellites/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800"
  }'
```

---

## CREATE GROUND STATION WITH IMAGE

```bash
curl -X POST http://localhost:5000/api/groundstations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "station_name": "Bangalore Ground Station",
    "station_code": "BNG-01",
    "mission_id": 1,
    "latitude": 13.1939,
    "longitude": 77.7068,
    "country": "India",
    "antenna_type": "Parabolic",
    "status": "Active",
    "uptime_percentage": 99.8,
    "image_url": "https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=800"
  }'
```

---

## UPDATE GROUND STATION IMAGE

```bash
curl -X PUT http://localhost:5000/api/groundstations/3 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800"
  }'
```

---

## GET MISSION WITH IMAGE

```bash
curl -X GET http://localhost:5000/api/missions/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response will include:
```json
{
  "success": true,
  "data": {
    "mission": {
      "mission_id": 1,
      "mission_name": "Solar Flare Detection Mission",
      "image_url": "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800",
      ...
    },
    "satellites": [...],
    "ground_stations": [...]
  }
}
```

---

## GET SATELLITE WITH IMAGE

```bash
curl -X GET http://localhost:5000/api/satellites/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response will include image_url in satellite object.

---

## GET GROUND STATION WITH IMAGE

```bash
curl -X GET http://localhost:5000/api/groundstations/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response will include image_url in station object.

---

## HOW TO GET YOUR TOKEN

1. Login on the website
2. Open Browser DevTools (F12)
3. Go to Application/Storage tab
4. Find localStorage
5. Copy the `token` value
6. Replace `YOUR_TOKEN` in the curl commands above

---

## VALID IMAGE URLS (for testing)

```
https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800
https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800
https://images.unsplash.com/photo-1553531088-d8b1005c85f3?w=800
https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=800
https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800
https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800
https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800
https://picsum.photos/800/600?random=1
https://picsum.photos/800/600?random=2
https://picsum.photos/800/600?random=3
https://picsum.photos/800/600?random=4
https://picsum.photos/800/600?random=5
```

---

## IMPORTANT NOTES

1. All image URLs must be:
   - Publicly accessible (not on localhost)
   - Direct image links (not web pages)
   - Start with http:// or https://

2. Supported formats:
   - JPG/JPEG
   - PNG
   - GIF
   - WebP

3. Image fields are optional - you can create items without images

4. To remove an image, set `image_url` to `null`

---

## TEST IN POSTMAN

Import this collection:

```json
{
  "info": {
    "name": "Image Features",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN_HERE"
    }
  ],
  "item": [
    {
      "name": "Create Mission with Image",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/missions",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"mission_name\": \"Test\", \"mission_type\": \"Earth Orbit\", \"start_date\": \"2024-01-01\", \"end_date\": \"2025-12-31\", \"org_id\": 1, \"image_url\": \"https://picsum.photos/800/600?random=1\"}"
        }
      }
    }
  ]
}
```

---

## COMMON ERRORS

### 401 Unauthorized
- Token is invalid or expired
- Get a new token by logging in

### 400 Bad Request
- URL format is invalid
- Check that image_url starts with http:// or https://

### 404 Not Found
- Mission/Satellite/Station ID doesn't exist
- Verify the ID is correct

### 500 Internal Server Error
- Check server logs
- Verify database connection

---

## BATCH ADD IMAGES

Create a script (batch-add-images.sh):

```bash
#!/bin/bash

TOKEN="your_token_here"
BASE_URL="http://localhost:5000/api"

# Array of missions with images
MISSIONS=(
  "1,https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800"
  "2,https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800"
  "3,https://picsum.photos/800/600?random=3"
)

for mission in "${MISSIONS[@]}"; do
  ID=$(echo $mission | cut -d',' -f1)
  IMAGE_URL=$(echo $mission | cut -d',' -f2)
  
  curl -X PUT "$BASE_URL/missions/$ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"image_url\": \"$IMAGE_URL\"}"
  
  echo "Updated mission $ID"
done
```

Run with: `bash batch-add-images.sh`
