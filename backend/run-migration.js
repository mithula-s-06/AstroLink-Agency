require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Running migration: add_image_url_columns...');
        
        try {
            await connection.execute(`
                ALTER TABLE missions ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER mission_description
            `);
            console.log('✓ Added image_url to missions table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ image_url column already exists in missions table');
            } else {
                throw e;
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE satellites ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER operational_life_years
            `);
            console.log('✓ Added image_url to satellites table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ image_url column already exists in satellites table');
            } else {
                throw e;
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE ground_stations ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER antenna_type
            `);
            console.log('✓ Added image_url to ground_stations table');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ image_url column already exists in ground_stations table');
            } else {
                throw e;
            }
        }

        await connection.end();
        console.log('\n✓ Migration completed successfully!');
    } catch (error) {
        console.error('Error running migration:', error.message);
        process.exit(1);
    }
}

runMigration();
