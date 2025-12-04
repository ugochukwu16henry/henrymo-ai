// scripts/seed-super-admin.js
/**
 * Run with:  node scripts/seed-super-admin.js
 * Creates a Super Admin user:
 *   email: admin@henrymo-ai.com
 *   password: admin123!
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const email = 'admin@henrymo-ai.com';
  const plainPassword = 'admin123!';

  const hash = await bcrypt.hash(plainPassword, 10);

  try {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, subscription_tier, is_email_verified, is_active)
       VALUES ($1, $2, $3, 'super_admin', 'enterprise', true, true)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [email, hash, 'Henry Maobughichi Ugochukwu']
    );

    if (res.rowCount === 0) {
      console.log('⚠️ Admin already exists – nothing changed');
    } else {
      console.log('✅ Super admin created (email: admin@henrymo-ai.com / password: admin123!)');
    }
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
  } finally {
    await pool.end();
  }
})();
