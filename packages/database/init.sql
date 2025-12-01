-- Database initialization script for Docker
-- This file is run automatically when PostgreSQL container starts
-- for the first time

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- This script runs after the database is created

-- The actual schema will be applied via migrations
-- This file is for any pre-migration setup if needed

SELECT 'Database initialization script loaded' AS status;

