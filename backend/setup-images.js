require('dotenv').config();
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setup() {
    try {
        // Create directories
        ['missions', 'satellites', 'groundstations'].forEach(dir => {
            const p = path.join(__dirname, `../frontend/uploads/${dir}`);
            if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
        });

        const conn = await pool.getConnection();

        // Add image URLs
        await conn.execute(`UPDATE missions SET image_url = '/uploads/missions/chandrayaan2.jpg' WHERE mission_id = 1`);
        await conn.execute(`UPDATE satellites SET image_url = '/uploads/satellites/sat.jpg' WHERE mission_id = 1 LIMIT 1`);
        await conn.execute(`UPDATE ground_stations SET image_url = '/uploads/groundstations/station.jpg' WHERE mission_id = 1 LIMIT 1`);

        conn.release();
        console.log('✓ Setup complete - images added');
    } catch (error) {
        console.error('Error:', error.message);
    }
    process.exit(0);
}

setup();
