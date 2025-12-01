-- Migration: 001_initial_schema.sql
-- Description: Initial database schema creation
-- Author: Henry Maobughichi Ugochukwu
-- Date: 2025-01-01

-- This migration file references the main schema.sql
-- In production, you would run schema.sql or break it into smaller migrations

-- Note: For the initial setup, we'll use the complete schema.sql file
-- Future migrations will be incremental changes

-- Migration tracking table (created first)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- The actual schema is in schema.sql
-- This file is just for migration tracking

