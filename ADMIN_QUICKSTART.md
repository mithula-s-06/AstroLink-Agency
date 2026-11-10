# Admin Panel Quick Start Guide

## What Was Fixed

### ✅ "Error loading missions" Issue
**Root Cause**: The frontend was using hardcoded HTML and localStorage instead of calling the backend API.

**Solution**: 
- Created new dashboard.html with dynamic content loading
- Created api.js with all backend API calls
- Created dashboard.js with view management and CRUD operations
- All data now loads from `http://localhost:5000/api/`

## Files Updated/Created

```
frontend/
├── dashboard.html          (NEW - complete redesign)
├── js/
│   ├── api.js             (NEW - API layer)
│   └── dashboard.js       (REPLACED - full logic)
```

```
backend/
└── routes/
    └── anomalies.js       (UPDATED - added PUT endpoint)
```

## Getting Started

### 1. Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 2. Open Dashboard
```
Open browser and go to: http://localhost:YOUR_PORT/dashboard.html
(Assuming frontend is served from a web server or http server)
```

### 3. Login
- Use admin credentials for full access
- Use user credentials for view-only access

## What Admins Can Do Now

Click the **+ Add** buttons to:
- ✅ Add new missions with name, type, dates, description, budget, image
- ✅ Add new satellites with specifications
- ✅ Add new ground stations with coordinates
- ✅ Add new anomalies with severity levels
- ✅ Add new crew logs with dates and content
- ✅ Add new telemetry data

Click **Edit** on any card to:
- ✅ Update mission details
- ✅ Update satellite specifications
- ✅ Update station info
- ✅ Update anomaly details
- ✅ Update crew logs
- ✅ Update telemetry

Click **Delete** to:
- ✅ Remove any item

## What Users See

- View-only access to all sections
- NO add/edit/delete buttons
- All data populated from database
- Dashboard statistics showing counts

## Key Features

### Authentication
- JWT token-based
- Role-based access control
- Admin role shows management buttons

### Data Management
- Real-time API calls
- Toast notifications for feedback
- Error handling with user messages
- Dashboard stats auto-update

### Form Validation
- Required fields marked with *
- Date pickers for date fields
- Dropdown selects for status/type fields
- Number inputs for numeric fields

### Admin-Only Controls
Automatically hidden for regular users:
- "+" Add buttons
- "Edit" buttons on each card
- "Delete" buttons on each card

## Troubleshooting

### "Error loading missions"
**Solution**: Check that:
1. Backend server is running on port 5000
2. JWT token is in localStorage under 'user' object
3. Network tab shows successful API responses

### "No data displayed"
**Check**:
1. Are you logged in as admin or user?
2. Does your database have records?
3. Check browser console for error messages

### Forms won't submit
**Check**:
1. All required fields are filled (marked with *)
2. Dates are in valid format
3. Check console for validation errors

## API Integration

All requests go to: `http://localhost:5000/api/`

Example request:
```javascript
fetch('http://localhost:5000/api/missions', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
})
```

Token is automatically included from localStorage in all requests.

## Testing

### Test As Admin
1. Create a mission - should see it appear immediately
2. Edit it - mission updates in list
3. Delete it - mission disappears

### Test As User
1. Login with user credentials
2. Navigate to Missions
3. Verify NO "+" button appears
4. Verify NO "Edit/Delete" buttons on cards
5. Can only view data

## Database Integration

All data is saved to your MySQL database in these tables:
- missions
- satellites
- ground_stations
- anomalies
- crew_logs
- telemetry

## Next Steps

1. Test CRUD operations with sample data
2. Verify role-based access works
3. Check database records are being saved
4. Test image URL fields
5. Verify all toast notifications display correctly

## Support

For issues, check:
1. Browser console (F12) for JavaScript errors
2. Network tab for API response codes
3. Backend console for server errors
4. Database connection in .env file
