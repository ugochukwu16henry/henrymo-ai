-- Add generated_images table for Stage 5 Day 18
-- Run this if the main schema migration fails due to existing objects

-- Generated Images Table
CREATE TABLE IF NOT EXISTS generated_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    revised_prompt TEXT,
    s3_key VARCHAR(1000) NOT NULL,
    s3_url TEXT NOT NULL,
    original_url TEXT,
    size VARCHAR(20) DEFAULT '1024x1024',
    style VARCHAR(50) DEFAULT 'realistic',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated Images Indexes
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_style ON generated_images(style);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at);

