# AstroLink Agency - Space Operations Management System

A comprehensive full-stack application for managing satellites, missions, telemetry data, ground stations, commands, crew logs, and anomalies with strong audit trails and time-series data support.

## Features

- **Mission Management**: Create and manage space missions with detailed planning
- **Satellite Operations**: Monitor satellite health, status, and telemetry data
- **Ground Stations**: Coordinate communication with ground stations worldwide
- **Anomaly Tracking**: Report, track, and resolve satellite anomalies
- **Real-Time Telemetry**: Monitor position, battery, temperature, signal quality
- **Command Execution**: Send commands to satellites from ground stations
- **Crew Logs**: Log crew activities for manned missions
- **Payload Tracking**: Monitor payload status and utilization
- **Audit Trails**: Complete audit logs of all system changes
- **User Authentication**: Secure login with role-based access (User/Admin)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: MySQL 8.0 CE
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
astrolink-agency/
├── database/
│   └── astrolink_schema.sql     # MySQL database schema
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── missions.js          # Missions API routes
│   │   ├── satellites.js        # Satellites API routes
│   │   └── anomalies.js         # Anomalies API routes
│   ├── package.json             # Node.js dependencies
│   ├── .env                     # Environment variables
│   └── server.js                # Express server
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── css/
│   │   ├── style.css            # Main styles
│   │   └── responsive.css       # Responsive design
│   └── js/
│       ├── app.js               # Main app logic
│       ├── auth.js              # Authentication logic
│       └── dashboard.js         # Dashboard functionality
└── README.md                    # This file
```

## Database Schema

### Tables
- **users**: User accounts with authentication credentials
- **organizations**: Space agencies and organizations
- **missions**: Space missions with objectives and timelines
- **satellites**: Spacecraft in orbit
- **payloads**: Scientific instruments on satellites
- **ground_stations**: Communication stations worldwide
- **telemetry**: Time-series data from satellites
- **commands**: Commands sent to satellites
- **anomalies**: Issues and problems reported
- **crew_logs**: Activities logged by crew members
- **mission_milestones**: Mission objectives and milestones
- **audit_logs**: Complete audit trail of all changes

### Views
- **mission_overview**: Summary of missions with satellite count, payloads, and anomalies
- **satellite_health_status**: Satellite health metrics and anomaly counts
- **ground_station_performance**: Ground station efficiency and command statistics

## Installation

### Prerequisites
- Node.js (v14+)
- MySQL 8.0 CE
- npm (comes with Node.js)

### Step 1: Database Setup

1. Open MySQL Command Line Client or MySQL Workbench
2. Create the database and tables:
```sql
SOURCE path/to/astrolink_schema.sql;
```

Or copy the contents of `database/astrolink_schema.sql` and run it in MySQL.

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
HOST=localhost
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=astrolink_agency
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. Open `frontend/index.html` in a web browser
2. Or serve the frontend using a simple HTTP server:
```bash
cd frontend
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Usage

### Home Page
- Learn about AstroLink Agency features
- View key capabilities and contact information

### Authentication
- **Sign Up**: Create a new account (User or Admin)
  - Username: Valid email address
  - Password: Min 8 chars with uppercase, lowercase, number, special character
  - Role: Select User or Admin
- **Login**: Access your dashboard with credentials

### Dashboard (Authenticated Users)
- **Overview**: View mission count, satellite status, anomalies
- **Missions**: Browse all space missions
- **Satellites**: Monitor satellite health and status
- **Anomalies**: Track reported issues

### Admin Functions
- **Add Mission**: Create new missions with:
  - Mission details (name, type, dates, organization)
  - Satellites (names, type, weight)
  - Ground stations (names, codes, locations)
  - Mission milestones (objectives and dates)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Missions
- `GET /api/missions` - Get all missions
- `GET /api/missions/:missionId` - Get mission details
- `POST /api/missions` - Create mission (Admin only)
- `PUT /api/missions/:missionId` - Update mission (Admin only)

### Satellites
- `GET /api/satellites` - Get all satellites
- `GET /api/satellites/:satelliteId` - Get satellite details
- `GET /api/satellites/mission/:missionId/low-battery` - Get low battery satellites
- `POST /api/satellites` - Add satellite (Admin only)
- `PUT /api/satellites/:satelliteId` - Update satellite (Admin only)

### Anomalies
- `GET /api/anomalies` - Get all anomalies
- `GET /api/anomalies/unresolved/critical` - Get unresolved anomalies >7 days
- `GET /api/anomalies/satellite/:satelliteId` - Get satellite anomalies
- `GET /api/anomalies/analysis/frequent` - Get satellites with frequent anomalies
- `POST /api/anomalies` - Report anomaly (Admin only)
- `PUT /api/anomalies/:anomalyId/resolve` - Resolve anomaly (Admin only)

## Password Requirements

Passwords must contain:
- At least 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

Example: `SecurePass@123`

## Key Business Insights

The system provides:
- **Satellite Anomaly Analysis**: Identify satellites with frequent issues
- **Mission Performance**: Track milestone completion rates
- **Ground Station Metrics**: Monitor uptime and command execution
- **Payload Utilization**: Track mission hours per payload
- **Battery Health**: Monitor satellite battery status
- **Anomaly Severity**: Categorize issues by severity level

## Role-Based Access

### User Role
- View missions and satellites
- View anomalies
- Access dashboards and analytics

### Admin Role
- All User capabilities
- Create and update missions
- Add satellites and ground stations
- Report and resolve anomalies
- Manage crew logs

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- Audit logging of all changes
- Secure API endpoints with middleware

## Responsive Design

The application is fully responsive:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Troubleshooting

### Connection Issues
- Verify MySQL server is running
- Check database credentials in `.env`
- Ensure port 3306 is not in use

### API Errors
- Check browser console for detailed errors
- Verify JWT token is valid
- Check API endpoint URLs match your server port

### Frontend Issues
- Clear browser cache
- Check JavaScript console for errors
- Verify all files are in correct directories

## Future Enhancements

- Real-time telemetry visualization
- Interactive mission timeline
- Satellite orbit visualization on map
- Advanced analytics and reporting
- Mobile app
- Notification system
- Command scheduling
- Payload performance analytics

## License

This project is created for educational purposes.

## Support

For issues or questions, contact: info@astrolink-agency.com

---

**AstroLink Agency - Managing Space Operations with Precision**
