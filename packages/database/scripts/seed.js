/**
 * Database Seed Script
 * Populates database with initial/seed data
 * 
 * @author Henry Maobughichi Ugochukwu
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../apps/api/.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Simple logger for seed script
const logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/henmo_ai_dev',
});

// Create super admin user
const createSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@henrymo-ai.com']
    );
    
    if (existingAdmin.rows.length > 0) {
      logger.info('Super admin already exists, skipping creation');
      return existingAdmin.rows[0].id;
    }
    
    // Create password hash
    const passwordHash = await bcrypt.hash('admin123!', 10);
    
    // Insert super admin
    const result = await pool.query(
      `INSERT INTO users (
        id, email, password_hash, name, role, subscription_tier,
        is_email_verified, is_active, country_code
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING id`,
      [
        uuidv4(),
        'admin@henrymo-ai.com',
        passwordHash,
        'Henry Maobughichi Ugochukwu',
        'super_admin',
        'enterprise',
        true,
        true,
        'NG'
      ]
    );
    
    logger.info('Super admin created successfully');
    logger.warn('Default password: admin123! - Please change this immediately!');
    
    return result.rows[0].id;
  } catch (error) {
    logger.error('Error creating super admin', {
      error: error.message,
    });
    throw error;
  }
};

// Seed countries with more entries
const seedCountries = async () => {
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'KE', name: 'Kenya' },
    { code: 'GH', name: 'Ghana' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SA', name: 'Saudi Arabia' },
  ];
  
  try {
    for (const country of countries) {
      await pool.query(
        'INSERT INTO countries (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [country.code, country.name]
      );
    }
    
    logger.info(`Seeded ${countries.length} countries`);
  } catch (error) {
    logger.error('Error seeding countries', {
      error: error.message,
    });
    throw error;
  }
};

// Main seed function
const seed = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Test connection
    await pool.query('SELECT 1');
    logger.info('Database connection successful');
    
    // Run seed functions
    await seedCountries();
    await createSuperAdmin();
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed, createSuperAdmin, seedCountries };

