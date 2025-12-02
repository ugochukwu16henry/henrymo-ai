/**
 * Test Database Connection with Individual Parameters
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection with individual parameters...\n');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'henmo_ai_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 5000,
};

console.log('Connection config:');
console.log('  Host:', config.host);
console.log('  Port:', config.port);
console.log('  Database:', config.database);
console.log('  User:', config.user);
console.log('  Password:', config.password ? '***' : 'Not set');
console.log('');

const pool = new Pool(config);

pool.query('SELECT NOW() as current_time, version() as pg_version, current_database() as db_name')
  .then((result) => {
    console.log('✅ Database connection successful!');
    console.log('\nDatabase Info:');
    console.log('  Current time:', result.rows[0].current_time);
    console.log('  Database:', result.rows[0].db_name);
    console.log('  PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    console.log('\n✅ Connection test passed!');
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed!');
    console.error('\nError details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    
    if (error.message.includes('password authentication')) {
      console.error('\n🔧 Trying alternative: testing with 127.0.0.1 instead of localhost...\n');
      const altConfig = { ...config, host: '127.0.0.1' };
      const altPool = new Pool(altConfig);
      altPool.query('SELECT 1')
        .then(() => {
          console.log('✅ Connection works with 127.0.0.1!');
          console.log('Update your .env to use DB_HOST=127.0.0.1');
          altPool.end();
          process.exit(0);
        })
        .catch((altError) => {
          console.error('❌ Still failed with 127.0.0.1:', altError.message);
          altPool.end();
          process.exit(1);
        });
    } else {
      pool.end();
      process.exit(1);
    }
  });

