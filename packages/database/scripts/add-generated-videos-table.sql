-- Add generated_videos table for Stage 5 Day 19
-- Run this if the main schema migration fails due to existing objects

-- Generated Videos Table
CREATE TABLE IF NOT EXISTS generated_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    s3_key VARCHAR(1000) NOT NULL,
    s3_url TEXT NOT NULL,
    format VARCHAR(20) DEFAULT 'mp4',
    width INTEGER,
    height INTEGER,
    fps DECIMAL(5, 2),
    duration DECIMAL(10, 2),
    frame_count INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated Videos Indexes
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_id ON generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_created_at ON generated_videos(created_at);

