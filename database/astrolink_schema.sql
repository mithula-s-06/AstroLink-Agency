-- AstroLink Agency Database Schema
-- MySQL 8.0 CE

-- Create Database
CREATE DATABASE IF NOT EXISTS astrolink_agency;
USE astrolink_agency;

-- Users Table (Authentication)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(500) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- Organizations Table
CREATE TABLE organizations (
    org_id INT PRIMARY KEY AUTO_INCREMENT,
    org_name VARCHAR(255) NOT NULL UNIQUE,
    org_code VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(100),
    contact_email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org_code (org_code)
);

-- Missions Table
CREATE TABLE missions (
    mission_id INT PRIMARY KEY AUTO_INCREMENT,
    mission_name VARCHAR(255) NOT NULL,
    mission_type ENUM('Earth Orbit', 'Deep Space', 'Lunar', 'Planetary', 'Communications', 'Weather', 'Navigation') NOT NULL,
    mission_status ENUM('Planning', 'Active', 'On Hold', 'Completed', 'Failed', 'Decommissioned') DEFAULT 'Planning',
    org_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    mission_description TEXT,
    budget DECIMAL(15,2),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(org_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT chk_end_after_start CHECK (end_date > start_date),
    INDEX idx_mission_status (mission_status),
    INDEX idx_org_id (org_id),
    INDEX idx_start_date (start_date),
    INDEX idx_created_at (created_at)
);

-- Satellites Table
CREATE TABLE satellites (
    satellite_id INT PRIMARY KEY AUTO_INCREMENT,
    satellite_name VARCHAR(255) NOT NULL UNIQUE,
    norad_id VARCHAR(50) UNIQUE,
    mission_id INT NOT NULL,
    satellite_type ENUM('LEO', 'MEO', 'GEO', 'Polar', 'Sun-Synchronous') NOT NULL,
    launch_date DATE,
    weight_kg DECIMAL(10,2),
    status ENUM('Pre-Launch', 'In Orbit', 'Decommissioned', 'Lost') DEFAULT 'Pre-Launch',
    current_battery_percentage DECIMAL(5,2) CHECK (current_battery_percentage >= 0 AND current_battery_percentage <= 100),
    operational_life_years INT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_status (status),
    INDEX idx_battery (current_battery_percentage),
    INDEX idx_launch_date (launch_date)
);

-- Payloads Table
CREATE TABLE payloads (
    payload_id INT PRIMARY KEY AUTO_INCREMENT,
    payload_name VARCHAR(255) NOT NULL,
    satellite_id INT NOT NULL,
    payload_type VARCHAR(100),
    manufacturer VARCHAR(255),
    weight_kg DECIMAL(10,2),
    power_consumption_w DECIMAL(10,2),
    status ENUM('Functional', 'Degraded', 'Non-Functional', 'Testing') DEFAULT 'Testing',
    mission_hours INT DEFAULT 0,
    last_operational_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (satellite_id) REFERENCES satellites(satellite_id),
    INDEX idx_satellite_id (satellite_id),
    INDEX idx_status (status),
    INDEX idx_mission_hours (mission_hours)
);

-- Ground Stations Table
CREATE TABLE ground_stations (
    station_id INT PRIMARY KEY AUTO_INCREMENT,
    station_name VARCHAR(255) NOT NULL UNIQUE,
    station_code VARCHAR(50) NOT NULL UNIQUE,
    mission_id INT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    country VARCHAR(100),
    antenna_type VARCHAR(100),
    status ENUM('Active', 'Maintenance', 'Inactive', 'Offline') DEFAULT 'Active',
    uptime_percentage DECIMAL(5,2) CHECK (uptime_percentage >= 0 AND uptime_percentage <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_status (status),
    INDEX idx_uptime (uptime_percentage)
);

-- Mission-Ground Station Mapping (Many-to-Many)
CREATE TABLE mission_ground_stations (
    mapping_id INT PRIMARY KEY AUTO_INCREMENT,
    mission_id INT NOT NULL,
    station_id INT NOT NULL,
    satellites_handled INT DEFAULT 0,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id),
    FOREIGN KEY (station_id) REFERENCES ground_stations(station_id),
    UNIQUE KEY unique_mission_station (mission_id, station_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_station_id (station_id),
    INDEX idx_satellites_handled (satellites_handled)
);

-- Telemetry Data Table (Time-Series)
CREATE TABLE telemetry (
    telemetry_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    satellite_id INT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    position_x DECIMAL(15,6),
    position_y DECIMAL(15,6),
    position_z DECIMAL(15,6),
    velocity_x DECIMAL(15,6),
    velocity_y DECIMAL(15,6),
    velocity_z DECIMAL(15,6),
    battery_percentage DECIMAL(5,2) CHECK (battery_percentage >= 0 AND battery_percentage <= 100),
    cpu_temperature_celsius DECIMAL(5,2),
    memory_usage_percentage DECIMAL(5,2) CHECK (memory_usage_percentage >= 0 AND memory_usage_percentage <= 100),
    solar_panel_voltage DECIMAL(7,2),
    link_quality_percentage DECIMAL(5,2) CHECK (link_quality_percentage >= 0 AND link_quality_percentage <= 100),
    signal_strength_dbm DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (satellite_id) REFERENCES satellites(satellite_id),
    INDEX idx_satellite_timestamp (satellite_id, timestamp),
    INDEX idx_timestamp (timestamp),
    INDEX idx_battery (battery_percentage)
);

-- Commands Table
CREATE TABLE commands (
    command_id INT PRIMARY KEY AUTO_INCREMENT,
    satellite_id INT NOT NULL,
    ground_station_id INT NOT NULL,
    command_type VARCHAR(100) NOT NULL,
    command_description TEXT,
    command_payload LONGTEXT,
    status ENUM('Pending', 'Sent', 'Acknowledged', 'Executed', 'Failed') DEFAULT 'Pending',
    sent_at TIMESTAMP NULL,
    acknowledged_at TIMESTAMP NULL,
    executed_at TIMESTAMP NULL,
    failure_reason TEXT,
    execution_time_ms INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (satellite_id) REFERENCES satellites(satellite_id),
    FOREIGN KEY (ground_station_id) REFERENCES ground_stations(station_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_satellite_id (satellite_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_sent_at (sent_at)
);

-- Anomalies Table
CREATE TABLE anomalies (
    anomaly_id INT PRIMARY KEY AUTO_INCREMENT,
    satellite_id INT NOT NULL,
    mission_id INT NOT NULL,
    anomaly_type VARCHAR(100) NOT NULL,
    severity ENUM('Critical', 'High', 'Medium', 'Low') DEFAULT 'Medium',
    description TEXT,
    detected_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_procedure TEXT,
    impact_assessment TEXT,
    reported_by INT NOT NULL,
    resolved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (satellite_id) REFERENCES satellites(satellite_id),
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id),
    FOREIGN KEY (reported_by) REFERENCES users(user_id),
    FOREIGN KEY (resolved_by) REFERENCES users(user_id),
    INDEX idx_satellite_id (satellite_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_severity (severity),
    INDEX idx_is_resolved (is_resolved),
    INDEX idx_detected_at (detected_at),
    INDEX idx_resolved_at (resolved_at)
);

-- Crew Logs Table (for Manned Missions)
CREATE TABLE crew_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    mission_id INT NOT NULL,
    satellite_id INT,
    crew_member_name VARCHAR(255) NOT NULL,
    crew_member_role VARCHAR(100),
    log_date DATE NOT NULL,
    log_time TIME,
    log_description TEXT,
    activity_type VARCHAR(100),
    duration_hours DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id),
    FOREIGN KEY (satellite_id) REFERENCES satellites(satellite_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_log_date (log_date),
    INDEX idx_crew_member (crew_member_name)
);

-- Mission Milestones Table
CREATE TABLE mission_milestones (
    milestone_id INT PRIMARY KEY AUTO_INCREMENT,
    mission_id INT NOT NULL,
    milestone_name VARCHAR(255) NOT NULL,
    milestone_description TEXT,
    planned_date DATE NOT NULL,
    actual_date DATE,
    status ENUM('Planned', 'In Progress', 'Completed', 'Delayed', 'Cancelled') DEFAULT 'Planned',
    is_completed BOOLEAN DEFAULT FALSE,
    completion_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id),
    INDEX idx_mission_id (mission_id),
    INDEX idx_status (status),
    INDEX idx_is_completed (is_completed),
    INDEX idx_planned_date (planned_date)
);

-- Audit Log Table (for tracking all changes)
CREATE TABLE audit_logs (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(100),
    record_id INT,
    action VARCHAR(50),
    old_values JSON,
    new_values JSON,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (changed_by) REFERENCES users(user_id),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_changed_by (changed_by)
);

-- Create Views for Business Insights

-- View: Mission Overview
CREATE OR REPLACE VIEW mission_overview AS
SELECT 
    m.mission_id,
    m.mission_name,
    m.mission_type,
    m.mission_status,
    COUNT(DISTINCT s.satellite_id) AS satellite_count,
    COUNT(DISTINCT p.payload_id) AS active_payloads,
    COUNT(DISTINCT a.anomaly_id) AS anomalies_count,
    m.start_date,
    m.end_date
FROM missions m
LEFT JOIN satellites s ON m.mission_id = s.mission_id
LEFT JOIN payloads p ON s.satellite_id = p.satellite_id AND p.status = 'Functional'
LEFT JOIN anomalies a ON m.mission_id = a.mission_id
GROUP BY m.mission_id, m.mission_name, m.mission_type, m.mission_status, m.start_date, m.end_date;

-- View: Satellite Health Status
CREATE OR REPLACE VIEW satellite_health_status AS
SELECT 
    s.satellite_id,
    s.satellite_name,
    s.mission_id,
    m.mission_name,
    s.status,
    s.current_battery_percentage,
    COUNT(DISTINCT a.anomaly_id) AS total_anomalies,
    SUM(CASE WHEN a.is_resolved = FALSE THEN 1 ELSE 0 END) AS unresolved_anomalies,
    COUNT(DISTINCT p.payload_id) AS payload_count,
    MAX(t.timestamp) AS last_telemetry
FROM satellites s
LEFT JOIN missions m ON s.mission_id = m.mission_id
LEFT JOIN anomalies a ON s.satellite_id = a.satellite_id
LEFT JOIN payloads p ON s.satellite_id = p.satellite_id
LEFT JOIN telemetry t ON s.satellite_id = t.satellite_id
GROUP BY s.satellite_id, s.satellite_name, s.mission_id, m.mission_name, s.status, s.current_battery_percentage;

-- View: Ground Station Performance
CREATE OR REPLACE VIEW ground_station_performance AS
SELECT 
    gs.station_id,
    gs.station_name,
    gs.station_code,
    m.mission_id,
    m.mission_name,
    gs.status,
    gs.uptime_percentage,
    COUNT(DISTINCT mgs.satellites_handled) AS satellites_managed,
    COUNT(DISTINCT c.command_id) AS total_commands,
    SUM(CASE WHEN c.status = 'Failed' THEN 1 ELSE 0 END) AS failed_commands
FROM ground_stations gs
LEFT JOIN missions m ON gs.mission_id = m.mission_id
LEFT JOIN mission_ground_stations mgs ON gs.station_id = mgs.station_id
LEFT JOIN commands c ON gs.station_id = c.ground_station_id
GROUP BY gs.station_id, gs.station_name, gs.station_code, m.mission_id, m.mission_name, gs.status, gs.uptime_percentage;

-- Create Indexes for Performance Optimization
CREATE INDEX idx_telemetry_satellite_battery ON telemetry(satellite_id, battery_percentage, timestamp);
CREATE INDEX idx_commands_status_date ON commands(status, created_at);
CREATE INDEX idx_anomalies_severity_resolved ON anomalies(severity, is_resolved, detected_at);
CREATE INDEX idx_crew_logs_mission_date ON crew_logs(mission_id, log_date);

-- Insert Default Organizations
INSERT INTO organizations (org_name, org_code, country, contact_email) VALUES
('ISRO', 'ISRO', 'India', 'contact@isro.gov.in'),
('NASA', 'NASA', 'United States', 'contact@nasa.gov'),
('ESA', 'ESA', 'Europe', 'contact@esa.int')
ON DUPLICATE KEY UPDATE org_name=org_name;
