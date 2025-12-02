/**
 * Test Database Connection
 * Script to diagnose and test database connection
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection...\n');

// Show what we're trying to connect with
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
if (process.env.DATABASE_URL) {
  // Mask password in output
  const masked = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@');
  console.log('Connection string:', masked);
}

// Try connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/henmo_ai_dev',
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Pool error:', err.message);
});

console.log('\nAttempting to connect...\n');

pool.query('SELECT NOW() as current_time, version() as pg_version')
  .then((result) => {
    console.log('✅ Database connection successful!');
    console.log('\nDatabase Info:');
    console.log('  Current time:', result.rows[0].current_time);
    console.log('  PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    console.log('\n✅ Connection test passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed!');
    console.error('\nError details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    console.error('  Severity:', error.severity);
    
    if (error.message.includes('password authentication')) {
      console.error('\n🔧 Password authentication issue detected!');
      console.error('\nPossible solutions:');
      console.error('  1. Verify DATABASE_URL in .env file');
      console.error('  2. Check PostgreSQL container is running');
      console.error('  3. Verify credentials match docker-compose.yml');
    }
    
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });

