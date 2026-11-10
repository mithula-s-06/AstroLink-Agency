# Image Features - API Request Examples

## Satellites API

### Create Satellite with Image URL

#### Request
```http
POST /api/satellites
Content-Type: application/json
Authorization: Bearer {token}

{
  "satellite_name": "Chandrayaan-2",
  "norad_id": "45341",
  "mission_id": 1,
  "satellite_type": "Lunar",
  "launch_date": "2019-07-22",
  "weight_kg": 3850,
  "status": "In Orbit",
  "current_battery_percentage": 95,
  "operational_life_years": 5,
  "image_url": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800"
}
```

#### Response
```json
{
  "success": true,
  "message": "Satellite added successfully",
  "satellite_id": 5
}
```

---

### Create Satellite with File Upload (Alternative)

#### Request
```http
POST /api/satellites
Content-Type: application/json
Authorization: Bearer {token}

{
  "satellite_name": "Chandrayaan-2",
  "norad_id": "45341",
  "mission_id": 1,
  "satellite_type": "Lunar",
  "launch_date": "2019-07-22",
  "weight_kg": 3850,
  "status": "In Orbit",
  "current_battery_percentage": 95,
  "operational_life_years": 5,
  "image_url": "https://cdn.example.com/uploads/satellite-5-1234567890.jpg"
}
```

Note: File upload is handled separately via `/api/uploads/satellites` endpoint, then the returned URL is sent in POST request.

---

### Update Satellite Image

#### Request
```http
PUT /api/satellites/5
Content-Type: application/json
Authorization: Bearer {token}

{
  "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"
}
```

#### Response
```json
{
  "success": true,
  "message": "Satellite updated successfully"
}
```

---

### Get Satellite with Image

#### Request
```http
GET /api/satellites/5
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "data": {
    "satellite": {
      "satellite_id": 5,
      "satellite_name": "Chandrayaan-2",
      "norad_id": "45341",
      "mission_id": 1,
      "satellite_type": "Lunar",
      "launch_date": "2019-07-22T00:00:00.000Z",
      "weight_kg": 3850,
      "status": "In Orbit",
      "current_battery_percentage": 95,
      "operational_life_years": 5,
      "image_url": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800",
      "mission_name": "Lunar Mission",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "telemetry": [...],
    "anomalies": [...]
  }
}
```

---

### List All Satellites with Images

#### Request
```http
GET /api/satellites
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "satellite_id": 1,
      "satellite_name": "Chandrayaan-2",
      "image_url": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800",
      "status": "In Orbit",
      "satellite_type": "Lunar",
      "mission_name": "Lunar Mission"
    },
    {
      "satellite_id": 2,
      "satellite_name": "Aditya-L1",
      "image_url": "https://picsum.photos/800/600?random=2",
      "status": "Pre-Launch",
      "satellite_type": "Deep Space"
    }
  ]
}
```

---

## Ground Stations API

### Create Ground Station with Image URL

#### Request
```http
POST /api/groundstations
Content-Type: application/json
Authorization: Bearer {token}

{
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
}
```

#### Response
```json
{
  "success": true,
  "message": "Ground station created successfully",
  "station_id": 3
}
```

---

### Update Ground Station Image

#### Request
```http
PUT /api/groundstations/3
Content-Type: application/json
Authorization: Bearer {token}

{
  "image_url": "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800"
}
```

#### Response
```json
{
  "success": true,
  "message": "Ground station updated successfully"
}
```

---

### Get Ground Station with Image

#### Request
```http
GET /api/groundstations/3
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "data": {
    "station": {
      "station_id": 3,
      "station_name": "Bangalore Ground Station",
      "station_code": "BNG-01",
      "mission_id": 1,
      "latitude": 13.1939,
      "longitude": 77.7068,
      "country": "India",
      "antenna_type": "Parabolic",
      "status": "Active",
      "uptime_percentage": 99.8,
      "image_url": "https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=800",
      "mission_name": "Lunar Mission",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "satellites": [...]
  }
}
```

---

### List All Ground Stations with Images

#### Request
```http
GET /api/groundstations
Authorization: Bearer {token}
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "station_id": 1,
      "station_name": "Bangalore Station",
      "station_code": "BNG-01",
      "image_url": "https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=800",
      "status": "Active",
      "country": "India",
      "uptime_percentage": 99.8
    },
    {
      "station_id": 2,
      "station_name": "Delhi Station",
      "station_code": "DEL-01",
      "image_url": "https://picsum.photos/800/600?random=3",
      "status": "Active",
      "country": "India",
      "uptime_percentage": 99.5
    }
  ]
}
```

---

## Image Upload Endpoint (For File Upload)

### Upload Satellite Image File

#### Request
```http
POST /api/uploads/satellites
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
[form-data]
image: <file_binary_content>
```

#### Response
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://cdn.example.com/uploads/satellite-5-1234567890.jpg"
}
```

#### cURL Example
```bash
curl -X POST \
  http://localhost:5000/api/uploads/satellites \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'image=@/path/to/image.jpg'
```

---

## JavaScript Fetch Examples

### Create Satellite with Image URL

```javascript
const createSatelliteWithImage = async (satelliteData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/satellites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      satellite_name: 'Chandrayaan-2',
      norad_id: '45341',
      mission_id: 1,
      satellite_type: 'Lunar',
      launch_date: '2019-07-22',
      weight_kg: 3850,
      status: 'In Orbit',
      current_battery_percentage: 95,
      operational_life_years: 5,
      image_url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800'
    })
  });

  const result = await response.json();
  return result;
};
```

---

### Update Satellite Image

```javascript
const updateSatelliteImage = async (satelliteId, imageUrl) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/satellites/${satelliteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      image_url: imageUrl
    })
  });

  const result = await response.json();
  return result;
};
```

---

### Upload Image File

```javascript
const uploadSatelliteImage = async (imageFile) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('/api/uploads/satellites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result.imageUrl;
};
```

---

### Create Ground Station with Image

```javascript
const createGroundStationWithImage = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/groundstations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      station_name: 'Bangalore Ground Station',
      station_code: 'BNG-01',
      mission_id: 1,
      latitude: 13.1939,
      longitude: 77.7068,
      country: 'India',
      antenna_type: 'Parabolic',
      status: 'Active',
      uptime_percentage: 99.8,
      image_url: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=800'
    })
  });

  const result = await response.json();
  return result;
};
```

---

## Common Image URLs for Testing

### Satellite Images
```
https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800
https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800
https://images.unsplash.com/photo-1553531088-d8b1005c85f3?w=800
https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80
```

### Station/Antenna Images
```
https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800
https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=800
https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800
https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800
```

### Random Test Images
```
https://picsum.photos/800/600?random=1
https://picsum.photos/800/600?random=2
https://picsum.photos/800/600?random=3
```

---

## Error Responses

### Missing Required Fields
```json
{
  "success": false,
  "message": "Missing required fields: satellite_name, satellite_type, mission_id"
}
```

### Invalid Mission ID
```json
{
  "success": false,
  "message": "Invalid mission ID. The mission does not exist."
}
```

### Invalid Image URL Format
```json
{
  "success": false,
  "message": "Invalid image URL format"
}
```

### No Fields to Update
```json
{
  "success": false,
  "message": "No fields to update"
}
```

---

## Testing with cURL

### Create Satellite with Image
```bash
curl -X POST http://localhost:5000/api/satellites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "satellite_name": "Test Satellite",
    "mission_id": 1,
    "satellite_type": "LEO",
    "image_url": "https://picsum.photos/800/600?random=1"
  }'
```

### Update Satellite Image
```bash
curl -X PUT http://localhost:5000/api/satellites/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://picsum.photos/800/600?random=2"
  }'
```

### Get Satellite
```bash
curl -X GET http://localhost:5000/api/satellites/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Postman Collection

You can import these requests into Postman:

```json
{
  "info": {
    "name": "Image Features API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Satellite with Image",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/satellites",
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
          "raw": "{\"satellite_name\": \"Test\", \"mission_id\": 1, \"satellite_type\": \"LEO\", \"image_url\": \"https://picsum.photos/800/600\"}"
        }
      }
    }
  ]
}
```

---

## Rate Limiting

- No specific rate limits documented
- Standard API authentication required
- Admin middleware required for POST/PUT/DELETE

---

## Authentication

All requests require:
```
Authorization: Bearer {JWT_TOKEN}
```

Get token from login endpoint, stored in localStorage under 'token' key.

---

## Content-Type Headers

- **JSON Requests**: `Content-Type: application/json`
- **File Upload**: `Content-Type: multipart/form-data` (no explicit header needed with FormData)

---

## Base URL

Development: `http://localhost:5000`
Production: Update in environment variables
