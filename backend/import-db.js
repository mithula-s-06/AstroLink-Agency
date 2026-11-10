const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importDatabase() {
    let connection;
    try {
        // Read SQL file
        const sqlFile = path.join(__dirname, '../database/astrolink_schema.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log('📂 Connecting to MySQL...');

        // Connect to MySQL (without selecting database)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT
        });

        console.log('✅ Connected to MySQL');

        // Split SQL by semicolons and execute
        console.log('📊 Importing database schema...');
        
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (let i = 0; i < statements.length; i++) {
            try {
                await connection.query(statements[i]);
                process.stdout.write(`\r✓ Executing statement ${i + 1}/${statements.length}`);
            } catch (err) {
                // Some statements might fail (like DROP IF EXISTS), that's ok
                if (!err.message.includes('already exists') && !err.message.includes('unknown database')) {
                    console.error(`\n❌ Error in statement ${i + 1}:`, err.message);
                }
            }
        }

        console.log('\n\n✅ Database imported successfully!');

        // Verify tables
        console.log('\n📋 Verifying tables...');
        const [tables] = await connection.query(`USE ${process.env.DB_NAME}; SHOW TABLES;`);
        console.log(`✅ Created ${tables.length} tables\n`);
        
        tables.forEach((row, index) => {
            const tableName = Object.values(row)[0];
            console.log(`  ${index + 1}. ${tableName}`);
        });

        console.log('\n🎉 Database setup complete!');
        console.log(`\n📝 Database Name: ${process.env.DB_NAME}`);
        console.log(`🗄️  Tables Created: ${tables.length}`);
        console.log('\n✅ Ready to start backend with: npm start\n');

        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error importing database:', error.message);
        console.error('\n💡 Tips:');
        console.error('  1. Make sure MySQL is running');
        console.error('  2. Check .env file has correct DB_USER and DB_PASSWORD');
        console.error('  3. If no password, leave DB_PASSWORD empty');
        console.error('\n');
        process.exit(1);
    }
}

console.log('🛰️  AstroLink Agency - Database Import\n');
importDatabase();
