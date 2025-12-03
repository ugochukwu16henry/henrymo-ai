-- ============================================================================
-- API Keys Management - Database Schema
-- ============================================================================
-- Created by: Henry Maobughichi Ugochukwu (Super Admin)
-- Date: December 3, 2024
-- ============================================================================

-- ----------------------------------------------------------------------------
-- API Keys Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL, -- First few characters for identification (e.g., "henmo_")
  hashed_key TEXT NOT NULL UNIQUE, -- Hashed version for verification (unique constraint)
  scopes JSONB DEFAULT '[]'::jsonb, -- Array of permissions/scopes
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hashed_key ON api_keys(hashed_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_last_used_at ON api_keys(last_used_at);

-- ----------------------------------------------------------------------------
-- API Usage Logs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);

-- ----------------------------------------------------------------------------
-- API Plans Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  rate_limit_per_minute INTEGER NOT NULL,
  rate_limit_per_day INTEGER NOT NULL,
  rate_limit_per_month INTEGER NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_plans_is_active ON api_plans(is_active);

-- ----------------------------------------------------------------------------
-- API Subscriptions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES api_plans(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, plan_id, status)
);

CREATE INDEX idx_api_subscriptions_user_id ON api_subscriptions(user_id);
CREATE INDEX idx_api_subscriptions_plan_id ON api_subscriptions(plan_id);
CREATE INDEX idx_api_subscriptions_status ON api_subscriptions(status);

-- Insert default API plans
INSERT INTO api_plans (name, description, price_monthly, price_yearly, rate_limit_per_minute, rate_limit_per_day, rate_limit_per_month, features) VALUES
('Free', 'Perfect for testing and development', 0, 0, 10, 1000, 10000, '["Basic API access", "Standard endpoints", "Community support"]'),
('Starter', 'For small projects and startups', 29, 290, 60, 10000, 300000, '["All Free features", "Priority support", "Advanced endpoints", "Webhooks"]'),
('Pro', 'For growing businesses', 99, 990, 300, 100000, 3000000, '["All Starter features", "Dedicated support", "Custom rate limits", "Analytics dashboard"]'),
('Enterprise', 'For large-scale applications', 499, 4990, 1000, 1000000, 30000000, '["All Pro features", "24/7 support", "Custom integrations", "SLA guarantee", "Account manager"]')
ON CONFLICT (name) DO NOTHING;

