-- Add image_url columns to missions, satellites, and ground_stations tables

ALTER TABLE missions ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER mission_description;

ALTER TABLE satellites ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER operational_life_years;

ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER antenna_type;
