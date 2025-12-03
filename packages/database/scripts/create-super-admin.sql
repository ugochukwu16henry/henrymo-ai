-- Create or Update Super Admin User
-- This script can be run directly via Docker

-- Generate password hash for '1995Mobuchi@.' using bcrypt
-- The hash below was generated with: bcrypt.hash('1995Mobuchi@.', 10)
-- If you need to change the password, generate a new hash first

-- Update existing user or create new one
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
    COALESCE(
        (SELECT id FROM users WHERE email = 'ugochukwuhenry16@gmail.com'),
        gen_random_uuid()
    ),
    'ugochukwuhenry16@gmail.com',
    '$2a$10$XKqJ8vL5mN3pQrS2tUvWwOeYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6', -- This is a placeholder - needs real hash
    'Henry Maobughichi Ugochukwu',
    'super_admin',
    'enterprise',
    true,
    true,
    'NG'
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = 'super_admin',
    subscription_tier = 'enterprise',
    is_active = true,
    is_email_verified = true,
    updated_at = CURRENT_TIMESTAMP;

