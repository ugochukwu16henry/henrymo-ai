/**
 * Fix Super Admin Account
 * Creates or updates the super admin account with correct credentials
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../apps/api/.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/henmo_ai_dev',
});

const fixSuperAdmin = async () => {
  try {
    const email = 'ugochukwuhenry16@gmail.com';
    const password = '1995Mobuchi@.';
    
    console.log('🔧 Fixing super admin account...');
    console.log(`📧 Email: ${email}`);
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email, role, is_active, is_email_verified FROM users WHERE email = $1',
      [email]
    );
    
    // Generate password hash
    const passwordHash = await bcrypt.hash(password, 10);
    
    if (existingUser.rows.length > 0) {
      // Update existing user
      console.log('✅ User exists. Updating password and role...');
      
      await pool.query(
        `UPDATE users 
         SET password_hash = $1, 
             role = $2,
             subscription_tier = $3,
             is_active = true,
             is_email_verified = true,
             updated_at = CURRENT_TIMESTAMP
         WHERE email = $4`,
        [
          passwordHash,
          'super_admin',
          'enterprise',
          email
        ]
      );
      
      console.log('✅ Super admin account updated successfully!');
    } else {
      // Create new user
      console.log('📝 Creating new super admin account...');
      
      const result = await pool.query(
        `INSERT INTO users (
          id, email, password_hash, name, role, subscription_tier,
          is_email_verified, is_active, country_code
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING id, email, role`,
        [
          uuidv4(),
          email,
          passwordHash,
          'Henry Maobughichi Ugochukwu',
          'super_admin',
          'enterprise',
          true,
          true,
          'NG'
        ]
      );
      
      console.log('✅ Super admin account created successfully!');
    }
    
    // Verify the account
    const verifyResult = await pool.query(
      'SELECT email, role, is_active, is_email_verified FROM users WHERE email = $1',
      [email]
    );
    
    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      console.log('\n📋 Account Details:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active}`);
      console.log(`   Email Verified: ${user.is_email_verified}`);
    }
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n✅ You can now login to the super admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error fixing super admin account:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the fix
fixSuperAdmin();

