-- ============================================================================
-- Social Media Management - Database Schema
-- ============================================================================
-- Created by: Henry Maobughichi Ugochukwu (Super Admin)
-- Date: December 3, 2024
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Social Media Accounts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'tiktok', 'youtube')),
  account_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  profile_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform, account_id)
);

CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_is_active ON social_accounts(is_active);

-- ----------------------------------------------------------------------------
-- Social Media Posts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]'::jsonb,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')),
  platform_post_id VARCHAR(255),
  category VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,
  hashtags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_account_id ON social_posts(account_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled_at ON social_posts(scheduled_at);
CREATE INDEX idx_social_posts_category ON social_posts(category);

-- ----------------------------------------------------------------------------
-- Social Media Analytics Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, metric_type, date)
);

CREATE INDEX idx_social_analytics_post_id ON social_analytics(post_id);
CREATE INDEX idx_social_analytics_account_id ON social_analytics(account_id);
CREATE INDEX idx_social_analytics_date ON social_analytics(date);
CREATE INDEX idx_social_analytics_metric_type ON social_analytics(metric_type);

-- ----------------------------------------------------------------------------
-- Social Media Mentions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
  platform VARCHAR(50) NOT NULL,
  mention_type VARCHAR(50) NOT NULL CHECK (mention_type IN ('mention', 'comment', 'reply', 'message')),
  content TEXT NOT NULL,
  author_name VARCHAR(255),
  author_username VARCHAR(255),
  author_id VARCHAR(255),
  post_url TEXT,
  sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_mentions_user_id ON social_mentions(user_id);
CREATE INDEX idx_social_mentions_account_id ON social_mentions(account_id);
CREATE INDEX idx_social_mentions_is_read ON social_mentions(is_read);
CREATE INDEX idx_social_mentions_created_at ON social_mentions(created_at);
CREATE INDEX idx_social_mentions_sentiment ON social_mentions(sentiment);

-- ----------------------------------------------------------------------------
-- Social Media Content Calendar Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_content_calendar_user_id ON social_content_calendar(user_id);
CREATE INDEX idx_social_content_calendar_dates ON social_content_calendar(start_date, end_date);

-- ----------------------------------------------------------------------------
-- Social Media Teams Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_teams_user_id ON social_teams(user_id);

-- ----------------------------------------------------------------------------
-- Social Media Team Members Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES social_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'member')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_social_team_members_team_id ON social_team_members(team_id);
CREATE INDEX idx_social_team_members_user_id ON social_team_members(user_id);

-- ----------------------------------------------------------------------------
-- Social Media Approval Workflows Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES social_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_by UUID NOT NULL REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  review_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_approval_workflows_post_id ON social_approval_workflows(post_id);
CREATE INDEX idx_social_approval_workflows_status ON social_approval_workflows(status);
CREATE INDEX idx_social_approval_workflows_team_id ON social_approval_workflows(team_id);

-- ----------------------------------------------------------------------------
-- Social Media Hashtag Tracking Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_hashtag_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hashtag VARCHAR(255) NOT NULL,
  platform VARCHAR(50),
  mentions_count INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  tracked_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, hashtag, platform)
);

CREATE INDEX idx_social_hashtag_tracking_user_id ON social_hashtag_tracking(user_id);
CREATE INDEX idx_social_hashtag_tracking_hashtag ON social_hashtag_tracking(hashtag);

-- ----------------------------------------------------------------------------
-- Social Media Competitor Analysis Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_competitor_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competitor_name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  account_url TEXT,
  followers_count INTEGER,
  posts_count INTEGER,
  engagement_rate DECIMAL(5,2),
  analysis_data JSONB DEFAULT '{}'::jsonb,
  last_analyzed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_competitor_analysis_user_id ON social_competitor_analysis(user_id);
CREATE INDEX idx_social_competitor_analysis_competitor_name ON social_competitor_analysis(competitor_name);

-- ----------------------------------------------------------------------------
-- Social Media Content Categories Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  is_evergreen BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

CREATE INDEX idx_social_content_categories_user_id ON social_content_categories(user_id);

-- ----------------------------------------------------------------------------
-- Social Media Bulk Scheduling Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_bulk_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  account_ids JSONB NOT NULL,
  posts JSONB NOT NULL,
  schedule_strategy VARCHAR(50) DEFAULT 'spread' CHECK (schedule_strategy IN ('spread', 'batch', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_bulk_schedules_user_id ON social_bulk_schedules(user_id);
CREATE INDEX idx_social_bulk_schedules_status ON social_bulk_schedules(status);

