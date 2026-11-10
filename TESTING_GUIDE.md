# Testing Guide - AstroLink Agency Dashboard

## Prerequisites

1. Backend server running on port 5000
2. Frontend running on port 8000
3. Database populated with data
4. User logged in with JWT token

## Test Data Setup

Before testing, ensure your database has sample data:

```sql
-- Check if data exists
SELECT COUNT(*) FROM missions;
SELECT COUNT(*) FROM satellites;
SELECT COUNT(*) FROM ground_stations;
SELECT COUNT(*) FROM anomalies;
SELECT COUNT(*) FROM crew_logs;
SELECT COUNT(*) FROM telemetry;
```

## Test Scenarios

### Test 1: View Missions
**Expected Result:** Mission data loads from API, not hardcoded

1. Navigate to Dashboard → Missions tab
2. Should see all missions from database
3. Click "View" button on any mission card
4. Modal opens showing:
   - Mission name, type, status
   - Related satellites count and list
   - Related ground stations count and list
   - Related anomalies count and list
   - Created date and budget
5. Click X or outside modal to close

**API Call Made:** `GET /api/missions` then `GET /api/missions/{id}`

---

### Test 2: View Satellites
**Expected Result:** Satellite data loads from API

1. Navigate to Dashboard → Satellites tab
2. Should see all satellites from database
3. Each card shows: name, type, status, battery %
4. Click "Details" button on any satellite card
5. Modal shows:
   - Satellite details (type, status, battery, weight, operational life)
   - Latest telemetry readings (altitude, velocity, temp, battery, power)
   - Associated anomalies with severity
6. Close modal

**API Call Made:** `GET /api/satellites` then `GET /api/satellites/{id}`

---

### Test 3: View Ground Stations
**Expected Result:** Ground station data loads from API

1. Navigate to Dashboard → Ground Stations tab
2. Should see all ground stations from database
3. Click "Monitor" button on any station card
4. Modal shows:
   - Station details (code, location, coordinates, antenna type, uptime)
   - Connected satellites list
   - Status
5. Close modal

**API Call Made:** `GET /api/groundstations` then `GET /api/groundstations/{id}`

---

### Test 4: View Anomalies
**Expected Result:** Anomaly data loads from API

1. Navigate to Dashboard → Anomalies tab
2. Should see all anomalies from database
3. Anomalies color-coded by severity:
   - **Critical** = Red badge
   - **High** = Orange badge
   - **Medium/Low** = Other colors
4. Each card shows: type, severity, detection time, description

**API Call Made:** `GET /api/anomalies`

---

### Test 5: View Crew Logs
**Expected Result:** Crew log data loads from API

1. Navigate to Dashboard → Crew Logs tab
2. Should see all crew logs from database
3. Each log shows: date, crew member, mission, content
4. Logs sorted by date (newest first)

**API Call Made:** `GET /api/crewlogs`

---

### Test 6: View Telemetry
**Expected Result:** Telemetry data loads from API

1. Navigate to Dashboard → Telemetry tab
2. Should see latest telemetry readings
3. Each entry shows:
   - Satellite name
   - Altitude, velocity, temperature
   - Power generation, battery percentage
   - Signal strength, data transmission rate
4. Sorted by most recent first

**API Call Made:** `GET /api/telemetry`

---

### Test 7: Overview Dashboard
**Expected Result:** Statistics update from API calls

1. Navigate to Dashboard → Overview tab
2. Four stat cards show:
   - Total Missions (should match count in database)
   - Active Satellites (should match count in database)
   - Critical Alerts (count of unresolved anomalies)
   - Ground Stations (should match count in database)
3. Numbers should be live from API

**API Calls Made:** `GET /api/missions`, `GET /api/satellites`, `GET /api/anomalies`, `GET /api/groundstations`

---

## Admin-Only Features Testing

### Prerequisites for Admin Tests
1. User must be logged in with `role: 'admin'`
2. Check that "Add Mission" appears in sidebar
3. Check that Edit/Delete buttons appear on cards

### Test 8: Delete Mission (Admin Only)
**Expected Result:** Mission deleted from database and UI

1. Login as admin user
2. Go to Missions tab
3. Click "Delete" button on any mission card
4. Confirmation dialog appears: "Are you sure you want to delete this mission and all related data?"
5. Click OK to confirm
6. Mission card disappears from list
7. Toast notification shows: "Mission deleted successfully"
8. Verify in database: `SELECT COUNT(*) FROM missions;` - count should decrease

**API Call Made:** `DELETE /api/missions/{id}`
**Cascade Deletes:** crew_logs, anomalies, ground_stations, satellites (and their telemetry), mission_milestones

---

### Test 9: Delete Satellite (Admin Only)
**Expected Result:** Satellite deleted from database

1. Login as admin user
2. Go to Satellites tab
3. Click "Delete" button on any satellite
4. Confirmation dialog appears
5. Click OK
6. Satellite disappears
7. Toast: "Satellite deleted successfully"

**API Call Made:** `DELETE /api/satellites/{id}`
**Cascade Deletes:** telemetry, anomalies, payloads

---

### Test 10: Delete Ground Station (Admin Only)
**Expected Result:** Ground station deleted from database

1. Login as admin user
2. Go to Ground Stations tab
3. Click "Delete" button on any station
4. Confirm deletion
5. Station disappears
6. Toast: "Ground station deleted successfully"

**API Call Made:** `DELETE /api/groundstations/{id}`

---

### Test 11: Delete Anomaly (Admin Only)
**Expected Result:** Anomaly deleted from database

1. Login as admin user
2. Go to Anomalies tab
3. Click "Delete" button on any anomaly
4. Confirm deletion
5. Anomaly disappears
6. Toast: "Anomaly deleted successfully"

**API Call Made:** `DELETE /api/anomalies/{id}`

---

### Test 12: Delete Crew Log (Admin Only)
**Expected Result:** Crew log deleted from database

1. Login as admin user
2. Go to Crew Logs tab
3. Click "Delete" button on any log
4. Confirm deletion
5. Log disappears
6. Toast: "Crew log deleted successfully"

**API Call Made:** `DELETE /api/crewlogs/{id}`

---

### Test 13: Edit Mission (Admin Only)
**Expected Result:** Edit form appears (placeholder for form development)

1. Login as admin user
2. Go to Missions tab
3. Click "Edit" button on any mission
4. Toast appears: "Edit mission form - Implementation pending"

**Note:** This is a placeholder - needs full form development

---

### Test 14: Resolve Anomaly (Admin Only)
**Expected Result:** Anomaly marked as resolved

1. Login as admin user
2. Go to Anomalies tab
3. Find an unresolved anomaly
4. Click "Resolve" button (appears for unresolved anomalies only)
5. Toast appears: "Resolve anomaly form - Implementation pending"

**API Call Made:** `PUT /api/anomalies/{id}/resolve`

**Note:** This is a placeholder - needs form for resolution procedure

---

## Image Support Testing

### Test 15: Display Mission Image
**Expected Result:** Mission images display on cards and in modals

1. Add a mission with image_url in database:
   ```sql
   UPDATE missions SET image_url = 'https://via.placeholder.com/300x200' WHERE mission_id = 1;
   ```
2. Go to Missions tab
3. Mission card should show image at 200px height
4. Click "View" to open modal
5. Image should display at 300px height in modal

### Test 16: Display Satellite Image
**Expected Result:** Satellite images display on cards

1. Add satellite image in database:
   ```sql
   UPDATE satellites SET image_url = 'https://via.placeholder.com/300x200' WHERE satellite_id = 1;
   ```
2. Go to Satellites tab
3. Satellite card shows image at 200px height
4. Click "Details" to open modal
5. Image displays at 300px height

### Test 17: Display Ground Station Image
**Expected Result:** Ground station images display

1. Add station image in database:
   ```sql
   UPDATE ground_stations SET image_url = 'https://via.placeholder.com/300x200' WHERE station_id = 1;
   ```
2. Go to Ground Stations tab
3. Card shows image at 200px height
4. Modal shows image at 300px height

---

## Error Handling Tests

### Test 18: No Data in Database
**Expected Result:** Graceful handling with message

1. Delete all records from missions table
2. Go to Missions tab
3. Should see: "No missions found"
4. No console errors

### Test 19: Network Error
**Expected Result:** Toast error notification

1. Stop backend server
2. Try to navigate to any tab
3. Toast appears: "Error loading [data type]"
4. No crashing

### Test 20: Unauthorized Delete (Regular User)
**Expected Result:** Edit/Delete buttons not visible

1. Login as regular user (role != admin)
2. Go to any tab (Missions, Satellites, etc.)
3. Edit and Delete buttons should NOT appear
4. Only "View" button should be visible

---

## Browser Console Testing

### Check for Errors
1. Open Developer Tools (F12)
2. Go to Console tab
3. Navigate through all views
4. Should see NO red error messages
5. API calls should be logged (optional)

### Check for Warnings
1. Deprecation warnings are acceptable
2. Should be no JavaScript errors

---

## Performance Testing

### Test 21: Load Time with Large Dataset
**Expected Result:** UI responsive even with many records

1. Add 100+ records to missions table
2. Go to Missions tab
3. Cards should load and render within 2 seconds
4. Scrolling should be smooth
5. No freezing or lag

---

## API Response Testing

### Test 22: Verify API Response Format
**Expected Result:** All API responses follow standard format

Using curl or Postman, test each endpoint:

```bash
# Get missions list
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/missions

# Get mission details
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/missions/1

# Get satellites
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/satellites

# All responses should have format:
# {
#   "success": true/false,
#   "data": [...],
#   "message": "..." (if error)
# }
```

---

## Checklist for Full Testing

- [ ] Mission data loads from API (not hardcoded)
- [ ] Satellite data loads from API (not hardcoded)
- [ ] Ground station data loads from API (not hardcoded)
- [ ] Anomaly data loads from API (not hardcoded)
- [ ] Crew log data loads from API (not hardcoded)
- [ ] Telemetry data loads from API (not hardcoded)
- [ ] Overview stats update from API calls
- [ ] "View" buttons open modals with details
- [ ] Modals close properly (X and outside click)
- [ ] Related data displays in modals
- [ ] Admin sees Edit/Delete buttons
- [ ] Admin sees "Add Mission" in sidebar
- [ ] Regular user doesn't see Edit/Delete buttons
- [ ] Delete functionality works (with confirmation)
- [ ] Delete cascades work properly
- [ ] Images display on cards and modals
- [ ] No console errors
- [ ] Toast notifications appear
- [ ] Responsive design on mobile (if needed)
- [ ] All tabs load their data
- [ ] No hardcoded data visible

---

## Debugging Tips

### If data doesn't load:
1. Check browser console (F12)
2. Check backend logs (node server console)
3. Verify user token is valid
4. Verify database has data
5. Test API directly with curl/Postman

### If buttons don't work:
1. Check if admin role is set correctly
2. Check localStorage for user data: `localStorage.getItem('user')`
3. Verify form handler is attached
4. Check for JavaScript errors in console

### If modals don't appear:
1. Check browser console for errors
2. Verify modal HTML is being inserted
3. Check modal CSS is applied
4. Test modal close functionality

---

## Expected API Endpoints Being Called

| Feature | Endpoints Called |
|---------|------------------|
| View Missions | GET /api/missions, GET /api/missions/:id |
| View Satellites | GET /api/satellites, GET /api/satellites/:id |
| View Stations | GET /api/groundstations, GET /api/groundstations/:id |
| View Anomalies | GET /api/anomalies |
| View Crew Logs | GET /api/crewlogs |
| View Telemetry | GET /api/telemetry |
| Overview Stats | GET /api/missions, /satellites, /anomalies, /groundstations |
| Delete Mission | DELETE /api/missions/:id |
| Delete Satellite | DELETE /api/satellites/:id |
| Delete Station | DELETE /api/groundstations/:id |
| Delete Anomaly | DELETE /api/anomalies/:id |
| Delete Crew Log | DELETE /api/crewlogs/:id |
| Resolve Anomaly | PUT /api/anomalies/:id/resolve |

---

## Success Criteria

✅ All data loads from API (not hardcoded)
✅ Users can view details by clicking cards
✅ Admins can delete items with confirmation
✅ Images display when present
✅ No console errors or warnings
✅ Responsive and performant
✅ Toast notifications work
✅ Modal system works correctly
