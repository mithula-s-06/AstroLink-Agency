-- AstroLink Agency - Image Upload Feature Database Migration
-- Run these commands to add image support to missions, satellites, and ground stations
-- Date: November 2025

-- ============================================
-- Step 1: Add image_url column to missions table
-- ============================================
ALTER TABLE missions ADD COLUMN image_url VARCHAR(255) AFTER updated_at;

-- Add index for better query performance
CREATE INDEX idx_missions_image_url ON missions(image_url);

-- ============================================
-- Step 2: Add image_url column to satellites table
-- ============================================
ALTER TABLE satellites ADD COLUMN image_url VARCHAR(255) AFTER updated_at;

-- Add index for better query performance
CREATE INDEX idx_satellites_image_url ON satellites(image_url);

-- ============================================
-- Step 3: Add image_url column to ground_stations table
-- ============================================
ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(255) AFTER updated_at;

-- Add index for better query performance
CREATE INDEX idx_ground_stations_image_url ON ground_stations(image_url);

-- ============================================
-- Verification Queries
-- ============================================

-- Verify missions table has image_url column
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME='missions' AND COLUMN_NAME='image_url';

-- Verify satellites table has image_url column
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME='satellites' AND COLUMN_NAME='image_url';

-- Verify ground_stations table has image_url column
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME='ground_stations' AND COLUMN_NAME='image_url';

-- ============================================
-- Sample Data Updates (Optional)
-- ============================================

-- Update existing records with sample image URLs (if needed)
-- UPDATE missions SET image_url = NULL WHERE image_url IS NULL;
-- UPDATE satellites SET image_url = NULL WHERE image_url IS NULL;
-- UPDATE ground_stations SET image_url = NULL WHERE image_url IS NULL;

-- ============================================
-- Rollback Instructions
-- ============================================

-- If you need to rollback these changes, run:
/*
ALTER TABLE missions DROP COLUMN image_url;
ALTER TABLE satellites DROP COLUMN image_url;
ALTER TABLE ground_stations DROP COLUMN image_url;

DROP INDEX idx_missions_image_url ON missions;
DROP INDEX idx_satellites_image_url ON satellites;
DROP INDEX idx_ground_stations_image_url ON ground_stations;
*/

-- ============================================
-- Notes
-- ============================================
-- 
-- Column Details:
-- - Type: VARCHAR(255)
-- - Nullable: YES
-- - Default: NULL
-- - Examples:
--   /uploads/missions/mission-1234567890.jpg
--   /uploads/satellites/satellite-1234567890.jpg
--   /uploads/groundstations/station-1234567890.jpg
--
-- The image_url column stores the relative path to the uploaded image.
-- Images are stored on disk at:
--   frontend/uploads/missions/
--   frontend/uploads/satellites/
--   frontend/uploads/groundstations/
--
-- Images are served via HTTP at:
--   http://localhost:5000/uploads/missions/filename.jpg
--   http://localhost:5000/uploads/satellites/filename.jpg
--   http://localhost:5000/uploads/groundstations/filename.jpg
--
