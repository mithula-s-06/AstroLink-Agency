# Verify Image URL Configuration & Test

## Step 1: Verify Database Columns Exist

Run this SQL in your MySQL client to check if columns exist:

```sql
USE astrolink_agency;

-- Check missions table
DESCRIBE missions;
-- Look for 'image_url' column

-- Check ground_stations table
DESCRIBE ground_stations;
-- Look for 'image_url' column

-- Check satellites table
DESCRIBE satellites;
-- Look for 'image_url' column
```

### If columns DON'T exist, run this migration:

```sql
USE astrolink_agency;

-- Add image_url columns to missions, satellites, and ground_stations tables
ALTER TABLE missions ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER mission_description;

ALTER TABLE satellites ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER operational_life_years;

ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER antenna_type;
```

## Step 2: Clear Browser Cache

Since we changed the HTML/JavaScript:

1. **Press Ctrl+Shift+Delete** (or Cmd+Shift+Delete on Mac)
2. Clear all browsing data
3. Or open with **Ctrl+Shift+N** (Incognito mode)

## Step 3: Create Test Mission with Image

1. Go to **Admin Panel**
2. Navigate to **Missions**
3. Click **"+ Create Mission"**
4. Fill in:
   - **Mission Name**: Test Mission
   - **Mission Type**: Earth Orbit
   - **Start Date**: 2024-01-01
   - **End Date**: 2025-01-01
   - **Organization**: Select any
   - **Mission Image URL**: `https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Skylab_and_Earth.jpg/320px-Skylab_and_Earth.jpg`

5. Click **"Save Mission"**

### Expected Result:
- ✅ Form shows image preview below URL field
- ✅ Mission appears in list
- ✅ Click mission name to go to details
- ✅ Image displays at top of details page
- ✅ Can click image to view full-screen

## Step 4: Create Test Ground Station with Image

1. Go to **Admin Panel**
2. Navigate to **Ground Stations**
3. Click **"+ Create Ground Station"**
4. Fill in:
   - **Station Name**: Test Ground Station
   - **Station Code**: TEST-001
   - **Latitude**: 28.5355
   - **Longitude**: 77.3910
   - **Country**: India
   - **Antenna Type**: Parabolic
   - **Mission ID**: 1 (or any existing mission)
   - **Image URL**: `https://upload.wikimedia.org/wikipedia/commons/8/89/Indsat_2.jpg`

5. Click **"Save Ground Station"**

### Expected Result:
- ✅ Form shows image preview below URL field
- ✅ Ground Station appears in list
- ✅ Click station name to go to details
- ✅ Image displays at top of details page
- ✅ Can click image to view full-screen

## Step 5: Test Dashboard Edit

1. Go to **Dashboard**
2. Find **Ground Stations** tab
3. Click **Edit** on any ground station
4. In the modal, you should see:
   - ✅ **"Image URL"** label (NOT "Upload Image (Local File)")
   - ✅ Text input for URL (NOT file picker)

5. Enter URL: `https://example.com/image.jpg`
6. Click in another field to trigger preview
7. Click **"Update Ground Station"**

## Troubleshooting

### Issue: Image preview doesn't show in form

**Solution:**
1. Make sure URL is valid - test it in browser directly
2. Image URL must be publicly accessible
3. Try with this test URL: `https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Skylab_and_Earth.jpg/320px-Skylab_and_Earth.jpg`

### Issue: Image doesn't show in details page

**Check:**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Reload page
4. Look for failed image requests
5. Check **Console** for error messages

**Common causes:**
- Image URL is wrong
- Image URL requires authentication
- CORS blocked the image
- Server returned 404/403

### Issue: Still seeing "Upload Image (Local File)"

**Solution:**
1. Hard refresh page: **Ctrl+F5** (or Cmd+Shift+R on Mac)
2. Clear browser cache completely
3. Check that `dashboard.html` file was actually saved with changes
4. Check that you're viewing the right file (not a cached version)

### Issue: Database columns don't exist

**Solution:**
1. Connect to MySQL database
2. Run the migration SQL commands above
3. Verify with `DESCRIBE` command

## Quick Test URLs (if needed)

These are free, public images you can use:

```
https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Skylab_and_Earth.jpg/320px-Skylab_and_Earth.jpg

https://upload.wikimedia.org/wikipedia/commons/8/89/Indsat_2.jpg

https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Gagarin_1961.jpg/360px-Gagarin_1961.jpg

https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/ISS-43.jpg/400px-ISS-43.jpg
```

## Expected Behavior

### Admin Creates Mission:
```
Form Input → Image Preview Shows → Saves → Mission List Shows Thumbnail → Details Page Shows Large Image
```

### Admin Creates Ground Station:
```
Form Input → Image Preview Shows → Saves → Station List Shows Thumbnail → Details Page Shows Large Image
```

### Admin Edits from Dashboard:
```
Edit → Modal Opens with URL Input (not file) → Preview Shows → Updates → Details Show New Image
```

## Files Modified

✅ `frontend/admin-missions.html` - URL input with required
✅ `frontend/admin-groundstations.html` - URL input with required  
✅ `frontend/dashboard.html` - URL input (not file)
✅ `frontend/js/dashboard.js` - Image preview handler updated

## API Verification

You can also test the API directly. Create mission with curl:

```bash
curl -X POST http://localhost:5000/api/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mission_name": "Test",
    "mission_type": "Earth Orbit",
    "mission_status": "Planning",
    "org_id": 1,
    "start_date": "2024-01-01",
    "end_date": "2025-01-01",
    "image_url": "https://example.com/image.jpg"
  }'
```

Should return success with mission_id.

## Success Criteria

- [ ] Database columns exist (verified with DESCRIBE)
- [ ] Admin panel shows URL input (not file picker)
- [ ] Form shows image preview when URL entered
- [ ] Mission/Station saves with image_url
- [ ] Details page displays image
- [ ] Can click image to view full-screen
- [ ] Dashboard edit modal shows URL input
- [ ] Old local file upload code removed
