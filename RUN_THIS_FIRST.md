# ⚠️ IMPORTANT: Run Migration First

## Why Images Aren't Showing

The database columns for storing image URLs **may not exist yet**. You need to run the migration to add them.

## Quick Fix (5 minutes)

### Option 1: Run Migration Script (Recommended)

**On Windows (PowerShell):**
```powershell
cd backend
node run-migration.js
```

**On Mac/Linux (Terminal):**
```bash
cd backend
node run-migration.js
```

**Expected Output:**
```
Running migration: add_image_url_columns...
✓ Added image_url to missions table
✓ Added image_url to satellites table
✓ Added image_url to ground_stations table

✓ Migration completed successfully!
```

### Option 2: Manual SQL (If migration fails)

1. Open MySQL Workbench or your MySQL client
2. Connect to `astrolink_agency` database
3. Run this SQL:

```sql
USE astrolink_agency;

-- Add image_url columns
ALTER TABLE missions ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER mission_description;

ALTER TABLE satellites ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER operational_life_years;

ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER antenna_type;
```

4. Verify with:
```sql
DESCRIBE missions;
DESCRIBE satellites;
DESCRIBE ground_stations;
```

All three tables should now have `image_url` column.

## What Changed?

### ✅ Frontend (Already Updated)
- Admin forms now have **Image URL** input fields (not file upload)
- Image preview shows as you type URL
- Details pages display images automatically

### ✅ Backend (Already Supports)
- API accepts `image_url` field
- Database can store URLs
- Details endpoint returns image_url

### ⚠️ Database (Needs Migration)
- Columns must be added to tables
- Run migration script above
- Then everything will work

## After Running Migration

### 1. Create a Test Mission

```
Admin Panel → Missions → "+ Create Mission"

Fill in:
- Mission Name: "Test Mission"
- Mission Type: "Earth Orbit"
- Start Date: "2024-01-01"
- End Date: "2025-01-01"
- Organization: (any)
- Mission Image URL: https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Skylab_and_Earth.jpg/320px-Skylab_and_Earth.jpg

Click "Save Mission"
```

**Expected:**
- ✅ Image preview appears in form
- ✅ Mission saves successfully
- ✅ Click mission to see full image

### 2. Create a Test Ground Station

```
Admin Panel → Ground Stations → "+ Create Ground Station"

Fill in:
- Station Name: "Test Station"
- Station Code: "TEST-001"
- Latitude: "28.5355"
- Longitude: "77.3910"
- Country: "India"
- Mission ID: "1" (or any existing)
- Image URL: https://upload.wikimedia.org/wikipedia/commons/8/89/Indsat_2.jpg

Click "Save Ground Station"
```

**Expected:**
- ✅ Image preview appears in form
- ✅ Station saves successfully
- ✅ Click station to see full image

## Troubleshooting

### Migration Script Fails?

**Error: "Table doesn't exist"**
- Ensure database exists: `USE astrolink_agency;`
- Run full schema first: check `database/astrolink_schema.sql`

**Error: "Connection refused"**
- Check `.env` file - DB_HOST, DB_USER, DB_PASSWORD
- Make sure MySQL is running
- Test connection: `mysql -h HOST -u USER -p PASSWORD -D astrolink_agency`

**Error: "Unknown column"**
- Columns already exist (safe to ignore)
- Run manual verify SQL to check

### Images Still Not Showing?

1. **Hard refresh browser**
   - Windows: `Ctrl+F5`
   - Mac: `Cmd+Shift+R`

2. **Clear cache**
   - Chrome: `Ctrl+Shift+Delete`
   - Firefox: `Ctrl+Shift+Delete`

3. **Check URL is valid**
   - Paste URL in browser address bar
   - Image should load
   - If not, URL is bad

4. **Check browser console**
   - Press `F12`
   - Look for error messages
   - Check Network tab for failed requests

## Files Modified This Session

✅ `frontend/admin-missions.html` - URL input (line 505)
✅ `frontend/admin-groundstations.html` - URL input (line 517)
✅ `frontend/dashboard.html` - URL input (line 479)
✅ `frontend/js/dashboard.js` - Image handler (line 726)
✅ `database/add_image_url_columns.sql` - Migration SQL
✅ `backend/run-migration.js` - Migration script

## Summary

1. **Run migration** → `node backend/run-migration.js`
2. **Create test data** → Add mission/station with image URL
3. **Verify display** → Check images show in details page
4. **Update existing** → Edit old records to add URLs

## Next Steps

- [x] Update frontend forms (DONE)
- [x] Update JavaScript handlers (DONE)
- [x] Create migration script (EXISTS)
- [ ] **RUN MIGRATION SCRIPT** ← YOU ARE HERE
- [ ] Test with sample data
- [ ] Create real missions/stations with images
- [ ] Verify all images display correctly

## Test URLs (Safe to Use)

These are public domain images that work great for testing:

```
https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Skylab_and_Earth.jpg/320px-Skylab_and_Earth.jpg

https://upload.wikimedia.org/wikipedia/commons/8/89/Indsat_2.jpg

https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Gagarin_1961.jpg/360px-Gagarin_1961.jpg

https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/ISS-43.jpg/400px-ISS-43.jpg
```

---

**Status**: Ready to test ✅

Just run the migration script and you're good to go!
