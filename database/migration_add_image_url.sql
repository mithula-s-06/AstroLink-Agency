-- Migration: Add image_url column to satellites table
-- Date: 2025-11-17
-- Description: Adds image_url column to store satellite image URLs

USE astrolink_agency;

-- Check if column already exists before adding
ALTER TABLE satellites ADD COLUMN image_url VARCHAR(500) NULL DEFAULT NULL AFTER operational_life_years;
