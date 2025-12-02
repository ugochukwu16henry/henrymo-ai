/**
 * Database Migration Runner
 * Runs SQL migrations in order
 * 
 * @author Henry Maobughichi Ugochukwu
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../apps/api/.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Simple logger for migration script
const logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
  debug: (msg, meta) => console.log(`[DEBUG] ${msg}`, meta || ''),
};

// Get database connection string with fallback
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Fallback to default connection for local Docker setup
  return 'postgresql://postgres:postgres@localhost:5433/henmo_ai_dev';
};

const pool = new Pool({
  connectionString: getDatabaseUrl(),
});

// Ensure migrations table exists
const ensureMigrationsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await pool.query(createTableQuery);
  logger.info('Migrations table ensured');
};

// Get applied migrations
const getAppliedMigrations = async () => {
  const result = await pool.query(
    'SELECT version FROM schema_migrations ORDER BY version'
  );
  return result.rows.map(row => row.version);
};

// Check if migration is applied
const isMigrationApplied = async (version) => {
  const applied = await getAppliedMigrations();
  return applied.includes(version);
};

// Mark migration as applied
const markMigrationApplied = async (version, name) => {
  await pool.query(
    'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
    [version, name]
  );
};

// Run a migration file
const runMigration = async (filePath, version) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);
    
    const fileName = path.basename(filePath);
    await client.query(
      'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
      [version, fileName]
    );
    
    await client.query('COMMIT');
    logger.info(`Migration ${version} applied: ${fileName}`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`Migration ${version} failed: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
};

// Run all migrations
const runMigrations = async () => {
  try {
    await ensureMigrationsTable();
    
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    const appliedMigrations = await getAppliedMigrations();
    
    logger.info(`Found ${files.length} migration files`);
    logger.info(`Applied migrations: ${appliedMigrations.length}`);
    
    for (const file of files) {
      const version = file.split('_')[0];
      
      if (appliedMigrations.includes(version)) {
        logger.info(`Migration ${version} already applied, skipping`);
        continue;
      }
      
      const filePath = path.join(migrationsDir, file);
      await runMigration(filePath, version);
    }
    
    logger.info('All migrations completed');
  } catch (error) {
    logger.error('Migration process failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run schema.sql directly (for initial setup)
const runSchema = async () => {
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      logger.error('Schema file not found:', schemaPath);
      process.exit(1);
    }
    
    logger.info('Running schema.sql...');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      logger.info('Schema applied successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Schema application failed', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Main execution
const main = async () => {
  const command = process.argv[2];
  
  if (command === 'schema') {
    await runSchema();
  } else if (command === 'migrate') {
    await runMigrations();
  } else {
    // Default: run schema for initial setup
    await runSchema();
  }
};

if (require.main === module) {
  main().catch(error => {
    logger.error('Migration script failed', error);
    process.exit(1);
  });
}

module.exports = {
  runMigrations,
  runSchema,
};

