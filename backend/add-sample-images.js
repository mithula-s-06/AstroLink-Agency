require('dotenv').config();
const pool = require('./config/database');

async function addSampleImages() {
    try {
        const connection = await pool.getConnection();

        console.log('Adding sample image URLs...');

        // Add mission images
        await connection.execute(
            `UPDATE missions SET image_url = '/uploads/missions/chandrayaan2.jpg' WHERE mission_id = 1`
        );
        console.log('✓ Added mission image');

        // Add satellite images
        await connection.execute(
            `UPDATE satellites SET image_url = '/uploads/satellites/chandrayaan2-orbiter.jpg' WHERE mission_id = 1 LIMIT 1`
        );
        console.log('✓ Added satellite image');

        // Add ground station images
        await connection.execute(
            `UPDATE ground_stations SET image_url = '/uploads/groundstations/station1.jpg' WHERE mission_id = 1 LIMIT 1`
        );
        console.log('✓ Added ground station image');

        await connection.end();
        console.log('\n✓ Sample images added successfully!');
    } catch (error) {
        console.error('Error adding images:', error.message);
        process.exit(1);
    }
}

addSampleImages();
