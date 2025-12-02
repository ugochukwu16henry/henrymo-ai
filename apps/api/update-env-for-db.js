/**
 * Update .env file to use individual DB connection parameters
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Check if individual DB params exist
const hasIndividualParams = envContent.includes('DB_HOST=') || envContent.includes('DB_USER=');

if (!hasIndividualParams) {
  console.log('Adding individual database connection parameters...');
  
  // Find DATABASE_URL line and add individual params after it
  const dbUrlMatch = envContent.match(/DATABASE_URL=.*/);
  if (dbUrlMatch) {
    const insertPoint = envContent.indexOf(dbUrlMatch[0]) + dbUrlMatch[0].length;
    const newParams = `

# Individual Database Parameters (for better compatibility)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=henmo_ai_dev
DB_USER=postgres
DB_PASSWORD=postgres
`;
    envContent = envContent.slice(0, insertPoint) + newParams + envContent.slice(insertPoint);
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Added individual database parameters to .env file');
  }
} else {
  console.log('✅ Individual database parameters already exist');
}

console.log('\nPlease restart the API server for changes to take effect.');

