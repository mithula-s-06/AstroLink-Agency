# AstroLink Agency - Complete Setup Guide

## Prerequisites

Before starting, ensure you have installed:
- **Node.js** (v14 or higher) - Download from [nodejs.org](https://nodejs.org)
- **MySQL 8.0 Community Edition** - Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
- **Git** (optional, for version control)

## Step-by-Step Setup

### 1. Database Setup

#### Option A: Using MySQL Command Line

1. Open MySQL Command Line Client:
```bash
mysql -u root -p
```

2. Enter your MySQL root password (if you set one during installation)

3. Run the schema file:
```bash
source C:\path\to\astrolink_schema.sql
```

Or copy-paste the entire contents of `database/astrolink_schema.sql` into the MySQL client.

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to File → Run SQL Script
4. Navigate to `database/astrolink_schema.sql`
5. Click Open and Execute

#### Verify Database Creation

After running the schema, verify it was created:
```sql
USE astrolink_agency;
SHOW TABLES;
```

You should see 14 tables created.

### 2. Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install Node.js dependencies**:
```bash
npm install
```

This will install:
- express
- mysql2
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- express-validator
- morgan

3. **Configure environment variables**

Open `.env` file and update with your MySQL credentials:
```
PORT=5000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=astrolink_agency
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Node Environment
NODE_ENV=development
```

**Important**: 
- Replace `your_mysql_password` with your actual MySQL root password
- If you don't have a password, leave `DB_PASSWORD=` empty
- Change `JWT_SECRET` to a secure random string (e.g., use an online generator)

4. **Start the backend server**:

For production:
```bash
npm start
```

For development (with auto-reload):
```bash
npm run dev
```

You should see:
```
AstroLink Agency API Server running on port 5000
Environment: development
```

### 3. Frontend Setup

The frontend is a static website that can be opened directly.

#### Option A: Open directly in browser
Simply double-click `frontend/index.html` to open it in your default browser.

#### Option B: Use a local server (Recommended)

**Using Python (if installed)**:
```bash
cd frontend
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

**Using Node.js**:
```bash
npm install -g http-server
cd frontend
http-server
```

**Using VS Code Live Server**:
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### 4. Verify Installation

1. **Check Backend API**:
   - Open browser and go to: `http://localhost:5000/api/health`
   - Should see: `{"success": true, "message": "AstroLink Agency API is running"}`

2. **Check Frontend**:
   - Open: `http://localhost:8000` (or just open the HTML file)
   - Should see the AstroLink Agency home page

## First Steps

### 1. Create Database Data

Before using the system, you should create some organizations in the database. Open MySQL and run:

```sql
USE astrolink_agency;

INSERT INTO organizations (org_name, org_code, country, contact_email, phone)
VALUES 
('NASA', 'NASA', 'United States', 'info@nasa.gov', '+1-202-358-0001'),
('ESA', 'ESA', 'Europe', 'info@esa.int', '+33-1-42-25-70-00'),
('ISRO', 'ISRO', 'India', 'info@isro.org.in', '+91-80-2217-3500');
```

### 2. Create a Test Account

1. Go to frontend: `http://localhost:8000`
2. Click "Get Started" → "Sign up here"
3. Create account with:
   - Full Name: Test User
   - Username: test@example.com
   - Email: test@example.com
   - Password: TestPass@123
   - Role: User
4. Click "Sign Up"
5. Login with your new credentials

### 3. Create Admin Account

1. Sign up again with:
   - Full Name: Admin User
   - Username: admin@example.com
   - Email: admin@example.com
   - Password: AdminPass@123
   - Role: admin
2. Login with admin account
3. You should see "Add Mission" option in the sidebar

### 4. Add a Test Mission (Admin Only)

1. Login as admin
2. Click "Add Mission" in the sidebar
3. Fill in the form:
   - Mission Name: Test Mission
   - Type: Earth Orbit
   - Start Date: Pick today's date
   - End Date: Pick a date 1 year from now
   - Organization: Select one
   - Add satellites (e.g., Satellite-1)
   - Add ground stations (e.g., Houston Station)
   - Add milestones (e.g., Launch, First Orbit)
4. Click "Create Mission"

You should see the mission listed in the Missions view.

## Troubleshooting

### Issue: "Cannot find module 'mysql2'"
**Solution**: Run `npm install` in the backend directory

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:3306"
**Solution**: 
- Verify MySQL server is running
- Check database host and port in `.env`
- Verify credentials are correct

### Issue: "Unexpected token < in JSON at position 0"
**Solution**:
- Ensure backend server is running (port 5000)
- Check API_URL in `frontend/js/app.js` is correct

### Issue: "CORS error" in browser console
**Solution**:
- Verify backend is running
- Check that CORS is enabled (it is in server.js)
- Ensure API URL is correct

### Issue: "Invalid token" error
**Solution**:
- Clear browser localStorage: `localStorage.clear()`
- Login again to get new token

### Issue: MySQL connection refuses "root" user
**Solution**:
1. Check MySQL user and password
2. Verify MySQL service is running
3. Try connecting directly: `mysql -u root -p`

## Project Files Explained

```
astrolink-agency/
│
├── database/
│   └── astrolink_schema.sql          # Complete database structure
│
├── backend/
│   ├── config/
│   │   └── database.js               # MySQL connection pool
│   │
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   │
│   ├── routes/
│   │   ├── auth.js                   # Login/Signup endpoints
│   │   ├── missions.js               # Mission management endpoints
│   │   ├── satellites.js             # Satellite management endpoints
│   │   ├── anomalies.js              # Anomaly management endpoints
│   │   └── organizations.js          # Organization endpoints
│   │
│   ├── server.js                     # Main Express server
│   ├── package.json                  # Node dependencies
│   └── .env                          # Environment configuration
│
├── frontend/
│   ├── index.html                    # Main HTML structure
│   │
│   ├── css/
│   │   ├── style.css                 # Main styling
│   │   └── responsive.css            # Mobile responsive styles
│   │
│   └── js/
│       ├── app.js                    # Main app logic and utilities
│       ├── auth.js                   # Authentication logic
│       └── dashboard.js              # Dashboard functionality
│
└── README.md                         # Project documentation
```

## Password Requirements

When creating an account, passwords must meet these criteria:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

Valid examples:
- `SecurePass@123`
- `MyMission#2024`
- `Admin$Password1`

## Default Ports

- **Frontend**: 8000 (or any port from your local server)
- **Backend API**: 5000
- **MySQL**: 3306

If ports are already in use, you can change them in:
- Backend: `.env` file (`PORT` variable)
- Frontend: Web server configuration

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Express server port |
| DB_HOST | localhost | MySQL host |
| DB_USER | root | MySQL username |
| DB_PASSWORD | (empty) | MySQL password |
| DB_NAME | astrolink_agency | Database name |
| DB_PORT | 3306 | MySQL port |
| JWT_SECRET | your_secret | JWT signing secret |
| JWT_EXPIRE | 7d | Token expiration time |
| NODE_ENV | development | Environment type |

## Getting Help

### Check Logs

**Backend Errors**:
- Look at terminal where `npm start` is running
- Check console output for detailed error messages

**Frontend Errors**:
- Open browser Developer Tools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for API request failures

### Common Commands

**Start everything fresh**:
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
python -m http.server 8000
```

**Reset database**:
```bash
# In MySQL
DROP DATABASE astrolink_agency;
source C:\path\to\astrolink_schema.sql;
```

## Next Steps

After setup is complete:
1. Create organizations (see MySQL section)
2. Create user accounts
3. Create missions (as admin)
4. Add satellites and ground stations
5. Track anomalies and telemetry
6. Manage crew logs
7. View analytics and reports

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Introduction](https://jwt.io/introduction)

---

**Setup complete! You're ready to manage space operations with AstroLink Agency.**
