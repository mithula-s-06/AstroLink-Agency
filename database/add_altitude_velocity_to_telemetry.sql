-- Add altitude and velocity columns to telemetry table
ALTER TABLE telemetry 
ADD COLUMN altitude DECIMAL(10,2) AFTER satellite_id,
ADD COLUMN velocity DECIMAL(10,2) AFTER altitude;

-- Create index on altitude for queries
CREATE INDEX idx_altitude ON telemetry(altitude);
