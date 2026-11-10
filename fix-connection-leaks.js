const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'backend', 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern: async (req, res) => { ... } catch (error)
    // Fix: Add let connection; at start and if (connection) connection.release(); in catch
    
    const asyncRoutePattern = /(\s+)(async\s*\(\s*req\s*,\s*res\s*\)\s*=>\s*\{)/g;
    
    content = content.replace(asyncRoutePattern, (match, indent, asyncDef) => {
        // Check if already has let connection;
        const nextPart = content.substring(content.indexOf(match) + match.length, content.indexOf(match) + match.length + 100);
        if (nextPart.includes('let connection;')) {
            return match;
        }
        return `${indent}${asyncDef}\n${indent}    let connection;`;
    });
    
    // Add if (connection) connection.release(); in catch blocks
    const catchPattern = /(\s+)\} catch \(error\) \{([\s\S]*?)console\.error\(([^)]+)\);/g;
    
    content = content.replace(catchPattern, (match, indent, beforeConsole, errorMsg) => {
        if (beforeConsole.includes('if (connection) connection.release();')) {
            return match;
        }
        return `${indent}} catch (error) {${beforeConsole}if (connection) connection.release();\n${indent}    console.error(${errorMsg});`;
    });
    
    // Also update const connection = to connection = 
    content = content.replace(/const connection = await pool\.getConnection\(\);/g, 
                             'connection = await pool.getConnection();');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
});

console.log('All route files fixed for connection leak prevention');
