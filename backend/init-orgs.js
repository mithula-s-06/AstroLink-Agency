const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeOrganizations() {
    let connection;
    try {
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        
        const organizations = [
            ['ISRO', 'ISRO', 'India', 'contact@isro.gov.in'],
            ['NASA', 'NASA', 'United States', 'contact@nasa.gov'],
            ['ESA', 'ESA', 'Europe', 'contact@esa.int']
        ];

        for (const org of organizations) {
            try {
                await connection.query(
                    'INSERT INTO organizations (org_name, org_code, country, contact_email) VALUES (?, ?, ?, ?)',
                    org
                );
                console.log(`✅ Inserted organization: ${org[0]}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⏭️  ${org[0]} already exists`);
                } else {
                    console.error(`❌ Error inserting ${org[0]}:`, err.message);
                }
            }
        }

        await connection.end();
        console.log('✅ Organizations initialized successfully');
    } catch (error) {
        console.error('⚠️  Could not initialize organizations:', error.message);
        if (connection) {
            try {
                await connection.end();
            } catch (e) {
                // ignore
            }
        }
    }
}

module.exports = initializeOrganizations;
