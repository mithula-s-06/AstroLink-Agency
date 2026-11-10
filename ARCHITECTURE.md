# AstroLink Agency - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSERS                          │
│              (Chrome, Firefox, Safari, Edge)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ HTML5 (index.html)                                   │  │
│  │ - Home Page                                          │  │
│  │ - Authentication Pages (Login/Signup)               │  │
│  │ - Dashboard with Sidebar                            │  │
│  │ - Mission Management Forms                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ CSS3 (2 files)                                       │  │
│  │ - Main Styles (style.css)                           │  │
│  │ - Responsive Design (responsive.css)                │  │
│  │ - Mobile-first approach                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ JavaScript (3 files)                                 │  │
│  │ - app.js (Core logic & utilities)                   │  │
│  │ - auth.js (Authentication logic)                    │  │
│  │ - dashboard.js (Dashboard & forms)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Local Storage                                        │  │
│  │ - JWT Token                                          │  │
│  │ - User Information                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ RESTful API (JSON)
                     │ Port 5000
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Node.js + Express Server (server.js)                │  │
│  │ ┌────────────────────────────────────────────────┐  │  │
│  │ │ Middleware Stack                               │  │  │
│  │ │ - CORS (Cross-Origin Requests)                │  │  │
│  │ │ - Morgan (Request Logging)                    │  │  │
│  │ │ - JSON Parser                                 │  │  │
│  │ │ - Auth Middleware (JWT verification)         │  │  │
│  │ └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Routes (5 route files)                           │  │
│  │ ├── /api/auth                                        │  │
│  │ │   ├── POST /signup       (Register user)          │  │
│  │ │   └── POST /login        (Authenticate user)      │  │
│  │ ├── /api/missions                                    │  │
│  │ │   ├── GET /              (List all)               │  │
│  │ │   ├── GET /:id           (Get details)            │  │
│  │ │   ├── POST /             (Create - Admin)         │  │
│  │ │   └── PUT /:id           (Update - Admin)         │  │
│  │ ├── /api/satellites                                  │  │
│  │ │   ├── GET /              (List all)               │  │
│  │ │   ├── GET /:id           (Get details)            │  │
│  │ │   ├── POST /             (Add - Admin)            │  │
│  │ │   └── PUT /:id           (Update - Admin)         │  │
│  │ ├── /api/anomalies                                   │  │
│  │ │   ├── GET /              (List all)               │  │
│  │ │   ├── GET /unresolved     (Critical issues)       │  │
│  │ │   ├── POST /             (Report - Admin)         │  │
│  │ │   └── PUT /:id/resolve   (Resolve - Admin)        │  │
│  │ └── /api/organizations                               │  │
│  │     ├── GET /              (List all)               │  │
│  │     └── GET /:id           (Get details)            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Authentication Layer                                 │  │
│  │ - JWT Token Generation                              │  │
│  │ - Password Hashing (bcryptjs)                       │  │
│  │ - Role-based Access Control                         │  │
│  │ - Email Validation                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Data Layer (config/database.js)                      │  │
│  │ - MySQL Connection Pool                             │  │
│  │ - Connection Pooling (10 connections)               │  │
│  │ - Keep-Alive Enabled                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL Queries
                     │ Port 3306
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ MySQL 8.0 Community Edition Database                │  │
│  │ Database: astrolink_agency                           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Core Tables (14 total)                               │  │
│  │                                                      │  │
│  │ ┌─ Organizations (Master Data)                      │  │
│  │ │  └─→ Missions                                     │  │
│  │ │      ├─→ Satellites                               │  │
│  │ │      │   ├─→ Payloads                             │  │
│  │ │      │   ├─→ Telemetry (Time-series)             │  │
│  │ │      │   ├─→ Commands                             │  │
│  │ │      │   └─→ Anomalies                            │  │
│  │ │      ├─→ Ground Stations                          │  │
│  │ │      ├─→ Mission Milestones                       │  │
│  │ │      └─→ Crew Logs                                │  │
│  │ │                                                   │  │
│  │ └─ Users (Authentication)                          │  │
│  │     └─→ Audit Logs (All changes tracked)           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Database Views (3 Analytics Views)                   │  │
│  │ - mission_overview                                  │  │
│  │ - satellite_health_status                           │  │
│  │ - ground_station_performance                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Indexes & Constraints                               │  │
│  │ - Primary Keys on all tables                        │  │
│  │ - Foreign Keys (Referential Integrity)              │  │
│  │ - Unique Constraints                                │  │
│  │ - Check Constraints (Data validation)               │  │
│  │ - Performance Indexes                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Registration Flow
```
User Signup Form
    ↓
Frontend Validation (email, password strength)
    ↓
POST /api/auth/signup (JSON)
    ↓
Backend Validation
    ↓
Check User Exists (Query)
    ↓
Hash Password (bcryptjs)
    ↓
Insert into users table
    ↓
Return success response
    ↓
Frontend shows success message
    ↓
User redirected to login
```

### Login & Authentication Flow
```
User Login Form
    ↓
POST /api/auth/login
    ↓
Find User by email/username (Query)
    ↓
Compare passwords (bcryptjs)
    ↓
Generate JWT Token
    ↓
Return token + user data
    ↓
Frontend stores token in localStorage
    ↓
Set Authorization header for future requests
    ↓
Redirect to Dashboard
```

### Mission Creation Flow (Admin)
```
Admin Mission Form
    ↓
Collect mission data + satellites + stations + milestones
    ↓
Frontend Validation
    ↓
POST /api/missions (with Authorization header)
    ↓
adminMiddleware validates JWT
    ↓
Begin Database Transaction
    ↓
Insert mission record
    ├─→ Insert satellites (loop)
    ├─→ Insert ground stations (loop)
    └─→ Insert milestones (loop)
    ↓
Commit transaction
    ↓
Return mission_id
    ↓
Frontend shows success
    ↓
Reload missions list
    ↓
Display new mission
```

### Data Retrieval Flow
```
Frontend requests /api/missions
    ↓
authMiddleware checks JWT token
    ↓
Route handler executes query
    ↓
Query joins with related tables
    ↓
MySQL returns results
    ↓
Backend aggregates data
    ↓
Return JSON response
    ↓
Frontend processes JSON
    ↓
Render in UI
    ↓
User sees updated data
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│        FRONTEND TECHNOLOGIES            │
├─────────────────────────────────────────┤
│ HTML5                                   │
│ CSS3 (with CSS Variables)              │
│ Vanilla JavaScript (ES6+)              │
│ Local Storage API                      │
│ Fetch API                              │
│ No external frameworks needed          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        BACKEND TECHNOLOGIES             │
├─────────────────────────────────────────┤
│ Node.js (JavaScript runtime)           │
│ Express.js (HTTP framework)            │
│ JWT (JSON Web Tokens)                 │
│ bcryptjs (Password hashing)            │
│ mysql2/promise (Database driver)      │
│ CORS (Cross-Origin Requests)          │
│ Morgan (HTTP logging)                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        DATABASE TECHNOLOGIES            │
├─────────────────────────────────────────┤
│ MySQL 8.0 Community Edition             │
│ Relational Database                    │
│ Transaction Support                    │
│ InnoDB Storage Engine                  │
│ 14 Tables + 3 Views                   │
│ Full Audit Logging                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        SECURITY TECHNOLOGIES            │
├─────────────────────────────────────────┤
│ JWT Tokens                              │
│ Password Hashing (bcryptjs)            │
│ SQL Parameterization                   │
│ CORS Headers                            │
│ Input Validation                        │
│ HTTPS Ready                             │
└─────────────────────────────────────────┘
```

## Database Schema Relationships

```
organizations (1) ──────────────────┐
                                    │
                        ┌───────────→ missions (*)
                        │
                        │        satellites (*)
                        │         /      \
                        │        /        \
                        │    payloads     telemetry
                        │                 commands
                        │                 anomalies
                        │
                        ├───────────→ ground_stations (*)
                        │
                        ├───────────→ mission_milestones (*)
                        │
                        └───────────→ crew_logs (*)

users (1) ─────────────────┐
                           │
                    ┌──────→ missions [created_by]
                    │
                    ├──────→ anomalies [reported_by, resolved_by]
                    │
                    ├──────→ commands [created_by]
                    │
                    └──────→ audit_logs [changed_by]
```

## API Authentication Flow

```
1. User sends credentials
   POST /api/auth/login
   {
     "username": "user@email.com",
     "password": "password123"
   }

2. Server validates & generates token
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": { ... }
   }

3. Client stores token in localStorage
   localStorage.setItem('token', token)

4. Client includes token in requests
   GET /api/missions
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
   }

5. Server validates token
   ├── Check header exists
   ├── Verify JWT signature
   ├── Check expiration
   └── Attach user to request

6. Request proceeds or returns 401/403
```

## Scalability Considerations

```
Current Architecture:
├── Single Node.js Server
├── Connection Pooling (10 connections)
├── Efficient Queries with Indexes
└── Stateless API (horizontally scalable)

For High Traffic:
├── Load Balancer (nginx, HAProxy)
├── Multiple Node.js Instances
├── Connection Pool per Instance
├── Database Read Replicas
├── Caching Layer (Redis)
├── CDN for Static Assets
└── Message Queue (RabbitMQ, Kafka)
```

## Deployment Architecture

```
Production Environment
┌──────────────────────────────────┐
│  CDN (Static Assets)             │
└────────────┬─────────────────────┘
             │
┌────────────┴──────────────────────┐
│  Load Balancer (HTTPS)            │
└────────────┬─────────────────────┘
             │
      ┌──────┼──────┐
      │      │      │
┌─────▼┐  ┌──▼─┐  ┌─▼────┐
│ App1 │  │App2│  │App3  │
└─────┬┘  ┌──┬─┘  └─┬────┘
      │   │   │     │
      └───┼───┼─────┘
          │   │
    ┌─────▼───▼─────┐
    │ DB Replication│
    │ (Primary/     │
    │ Replicas)     │
    └───────────────┘
```

## Request/Response Cycle

```
1. Client Browser
   ↓ (Makes HTTP request)

2. Network
   ↓ (Travels over internet)

3. Load Balancer (if applicable)
   ↓ (Routes to available server)

4. Express Server
   ├─ Middleware Processing
   │  ├─ CORS check
   │  ├─ JSON parsing
   │  ├─ Logger
   │  └─ Auth verification
   ├─ Route Handler
   │  ├─ Validate input
   │  ├─ Check authorization
   │  └─ Execute logic
   └─ Database Layer
      ├─ Prepare query
      ├─ Execute query
      └─ Process results
   ↓

5. Response Construction
   └─ Serialize data to JSON
   ↓

6. Network
   ↓

7. Browser Receives Response
   ├─ Parse JSON
   ├─ Update DOM
   └─ Display to user
```

## Error Handling Architecture

```
Frontend
├── Validation errors → Toast notification
├── Network errors → Retry mechanism
└── Auth errors → Redirect to login

Backend
├── Validation errors → 400 Bad Request
├── Auth errors → 401 Unauthorized
├── Permission errors → 403 Forbidden
├── Not found errors → 404 Not Found
├── Server errors → 500 Internal Server Error
└── All errors → Logged to console

Database
├── Connection errors → Handled by pool
├── Query errors → Transaction rollback
└── Constraint violations → 400 response
```

---

**Complete system architecture designed for reliability, scalability, and maintainability.**
