const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertOrganizations() {
    let connection;
    try {
        console.log('🛰️  Inserting Organizations...\n');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('✅ Connected to database\n');

        const organizations = [
            ['ISRO', 'ISRO', 'India', 'contact@isro.gov.in'],
            ['NASA', 'NASA', 'United States', 'contact@nasa.gov'],
            ['ESA', 'ESA', 'Europe', 'contact@esa.int'],
            ['JAXA', 'JAXA', 'Japan', 'contact@jaxa.jp'],
            ['CNSA', 'CNSA', 'China', 'contact@cnsa.cn']
        ];

        for (const org of organizations) {
            try {
                const [result] = await connection.query(
                    'INSERT INTO organizations (org_name, org_code, country, contact_email) VALUES (?, ?, ?, ?)',
                    org
                );
                console.log(`✅ Inserted: ${org[0]}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`⏭️  ${org[0]} already exists`);
                } else {
                    console.error(`❌ Error inserting ${org[0]}:`, err.message);
                }
            }
        }

        console.log('\n🎉 Organizations ready!');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

insertOrganizations();
