-- Seed Data for HenryMo AI Database
-- Creates super admin user and initial data

-- Note: Password is 'admin123!' hashed with bcrypt
-- This hash corresponds to: admin123!
-- In production, change this password immediately!

-- Insert super admin user
INSERT INTO users (
    id,
    email,
    password_hash,
    name,
    role,
    subscription_tier,
    is_email_verified,
    is_active,
    country_code
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@henrymo-ai.com',
    '$2a$10$rOzJpBm.8N4yJZvXkXqF8eLh3Y4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J', -- This is a placeholder, use bcrypt to generate real hash
    'Henry Maobughichi Ugochukwu',
    'super_admin',
    'enterprise',
    true,
    true,
    'NG'
) ON CONFLICT (email) DO NOTHING;

-- Note: The password hash above is a placeholder.
-- To generate a real bcrypt hash, use Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('admin123!', 10);
-- console.log(hash);

