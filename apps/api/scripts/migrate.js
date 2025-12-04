// scripts/migrate.js
const fs = require('fs');
const path = require('path');
const db = require('../src/utils/db');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'packages', 'database', 'schema.sql'), 'utf-8');
  try {
    await db.pool.query(sql);
    console.log('✅ Database migration completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

run();
