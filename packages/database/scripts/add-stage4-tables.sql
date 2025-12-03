-- Add Stage 4 tables (code_analyses and debugging_sessions)
-- Run this if the main schema migration fails due to existing objects

-- Code Analyses Table
CREATE TABLE IF NOT EXISTS code_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN (
        'code', 'security', 'performance'
    )),
    language VARCHAR(50) NOT NULL,
    code_length INTEGER NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Code Analyses Indexes
CREATE INDEX IF NOT EXISTS idx_code_analyses_user_id ON code_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_code_analyses_type ON code_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_code_analyses_language ON code_analyses(language);
CREATE INDEX IF NOT EXISTS idx_code_analyses_created_at ON code_analyses(created_at);

-- Debugging Sessions Table
CREATE TABLE IF NOT EXISTS debugging_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    language VARCHAR(50) NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Debugging Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_debugging_sessions_user_id ON debugging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_debugging_sessions_language ON debugging_sessions(language);
CREATE INDEX IF NOT EXISTS idx_debugging_sessions_created_at ON debugging_sessions(created_at);

