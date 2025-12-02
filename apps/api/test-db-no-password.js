/**
 * Test Database Connection without Password (trust authentication)
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection without password (trust auth)...\n');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'henmo_ai_dev',
  user: process.env.DB_USER || 'postgres',
  // No password - using trust authentication
  connectionTimeoutMillis: 5000,
};

console.log('Connection config (no password):');
console.log('  Host:', config.host);
console.log('  Port:', config.port);
console.log('  Database:', config.database);
console.log('  User:', config.user);
console.log('');

const pool = new Pool(config);

pool.query('SELECT NOW() as current_time, version() as pg_version, current_database() as db_name')
  .then((result) => {
    console.log('✅ Database connection successful!');
    console.log('\nDatabase Info:');
    console.log('  Current time:', result.rows[0].current_time);
    console.log('  Database:', result.rows[0].db_name);
    console.log('  PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    console.log('\n✅ Connection works! The issue was password authentication.');
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection still failed!');
    console.error('\nError:', error.message);
    pool.end();
    process.exit(1);
  });

