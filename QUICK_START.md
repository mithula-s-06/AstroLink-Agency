# AstroLink Agency - Quick Start Guide

Get the application running in 10 minutes!

## Prerequisites Checklist

- [ ] Node.js installed (check: `node --version`)
- [ ] MySQL running (check: `mysql -u root -p`)
- [ ] Git (optional, for cloning)

## Installation (5 minutes)

### 1. Setup Database

```bash
# Open MySQL
mysql -u root -p

# Copy and paste entire contents of database/astrolink_schema.sql
# Or use:
source C:\path\to\astrolink_schema.sql

# Verify
USE astrolink_agency;
SHOW TABLES;
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure .env file with your MySQL password
# Update: DB_PASSWORD=your_mysql_password

# Start server
npm start
```

**Expected output**:
```
AstroLink Agency API Server running on port 5000
Environment: development
```

### 3. Setup Frontend

**Option A - Direct (Easiest)**:
- Double-click `frontend/index.html`

**Option B - Local Server**:
```bash
cd frontend
python -m http.server 8000
# Then open http://localhost:8000
```

## Using the Application (5 minutes)

### Step 1: Create Test Organization

```sql
USE astrolink_agency;

INSERT INTO organizations (org_name, org_code, country, contact_email, phone)
VALUES ('NASA', 'NASA', 'United States', 'info@nasa.gov', '+1-202-358-0001');
```

### Step 2: Create Account

1. Open application in browser
2. Click "Get Started"
3. Sign up with:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass@123
   - Role: user

### Step 3: Create Admin Account

1. Click "Sign up here"
2. Sign up with:
   - Name: Admin
   - Email: admin@example.com
   - Password: AdminPass@123
   - Role: admin

### Step 4: Add Mission (as Admin)

1. Login as admin (admin@example.com)
2. Click "Add Mission" in sidebar
3. Fill form:
   - Name: ISS Resupply
   - Type: Earth Orbit
   - Dates: Any valid range
   - Organization: NASA
   - Add 1 satellite: "Falcon-9"
   - Add 1 station: "Houston"
4. Click "Create Mission"

## File Locations

```
astrolink-agency/
├── database/astrolink_schema.sql     ← Run this first
├── backend/                          ← npm install && npm start
│   └── .env                          ← Update DB_PASSWORD
└── frontend/index.html               ← Open this in browser
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| MySQL connection error | Check .env has correct DB_PASSWORD |
| "Cannot find module" | Run `npm install` in backend folder |
| CORS error | Ensure backend running on port 5000 |
| Blank page | Open in different browser or clear cache |
| "Invalid token" | Logout and login again |

## Ports

- Backend: 5000
- Frontend: 8000 (if using server)
- MySQL: 3306

## Default Credentials

After setup, you can use:
- Email: admin@example.com
- Password: AdminPass@123

## Password Rules

- Minimum 8 characters
- Need: uppercase, lowercase, number, special character (@$!%*?&)

Example: `MyMission#2024`

## Next Steps

1. [Read Setup Guide](./SETUP_GUIDE.md) for detailed instructions
2. [Check README](./README.md) for full documentation
3. [View API docs](./README.md#api-endpoints)

## Database Tables (14 tables)

- users - User accounts
- organizations - Space agencies
- missions - Space missions
- satellites - Spacecraft
- payloads - Instruments
- ground_stations - Communication stations
- telemetry - Sensor data
- commands - Spacecraft commands
- anomalies - Issues/problems
- crew_logs - Activities log
- mission_milestones - Objectives
- mission_ground_stations - Mappings
- audit_logs - Change history

## Features Overview

✅ User authentication with roles
✅ Mission management
✅ Satellite monitoring
✅ Anomaly tracking
✅ Real-time telemetry
✅ Ground station coordination
✅ Crew logging
✅ Audit trails
✅ Responsive design
✅ Admin dashboard

## Quick Commands

```bash
# Start everything
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && python -m http.server 8000

# Reset database
mysql -u root -p < database/astrolink_schema.sql

# Check API health
curl http://localhost:5000/api/health
```

## Database Reset

To start fresh:

```sql
DROP DATABASE IF EXISTS astrolink_agency;
source C:\path\to\astrolink_schema.sql;
```

## Support

Check `README.md` for detailed API documentation and `SETUP_GUIDE.md` for troubleshooting.

---

**Ready to manage space? Start with steps above and enjoy!**
