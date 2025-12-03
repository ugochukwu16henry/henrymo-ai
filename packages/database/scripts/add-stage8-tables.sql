-- ============================================================================
-- Stage 8: Advanced AI Features - Database Schema
-- Self-Improving Architecture Tables
-- ============================================================================
-- Created by: Henry Maobughichi Ugochukwu (Super Admin)
-- Date: December 3, 2024
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Module Registry Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  version VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'deprecated', 'testing')),
  dependencies JSONB DEFAULT '[]'::jsonb,
  health_status VARCHAR(50) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_module_registry_status ON module_registry(status);
CREATE INDEX idx_module_registry_health ON module_registry(health_status);

-- ----------------------------------------------------------------------------
-- Update Proposals Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS update_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(255) NOT NULL REFERENCES module_registry(name) ON DELETE CASCADE,
  proposal_type VARCHAR(50) NOT NULL CHECK (proposal_type IN ('improvement', 'bug_fix', 'feature', 'optimization', 'security')),
  description TEXT NOT NULL,
  proposed_changes JSONB NOT NULL,
  impact_analysis JSONB,
  safety_score DECIMAL(3,2) CHECK (safety_score >= 0 AND safety_score <= 1),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'testing', 'deployed', 'rolled_back')),
  proposed_by VARCHAR(50) DEFAULT 'ai_system',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  sandbox_test_results JSONB,
  deployment_log JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_update_proposals_status ON update_proposals(status);
CREATE INDEX idx_update_proposals_module ON update_proposals(module_name);
CREATE INDEX idx_update_proposals_created_at ON update_proposals(created_at);

-- ----------------------------------------------------------------------------
-- Training Sessions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  objective TEXT NOT NULL,
  dataset_id UUID,
  dataset_path TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'failed', 'cancelled')),
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  training_config JSONB DEFAULT '{}'::jsonb,
  model_version VARCHAR(50),
  created_by UUID REFERENCES users(id) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_training_sessions_status ON training_sessions(status);
CREATE INDEX idx_training_sessions_created_by ON training_sessions(created_by);
CREATE INDEX idx_training_sessions_created_at ON training_sessions(created_at);

-- ----------------------------------------------------------------------------
-- Advanced Audit Logs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs_advanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  user_id UUID REFERENCES users(id),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  severity VARCHAR(50) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_advanced_action_type ON audit_logs_advanced(action_type);
CREATE INDEX idx_audit_logs_advanced_created_at ON audit_logs_advanced(created_at);
CREATE INDEX idx_audit_logs_advanced_user_id ON audit_logs_advanced(user_id);
CREATE INDEX idx_audit_logs_advanced_severity ON audit_logs_advanced(severity);

-- ----------------------------------------------------------------------------
-- Module Freeze Settings Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_freeze_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(255) NOT NULL UNIQUE REFERENCES module_registry(name) ON DELETE CASCADE,
  frozen BOOLEAN DEFAULT false,
  frozen_by UUID REFERENCES users(id),
  frozen_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_module_freeze_settings_frozen ON module_freeze_settings(frozen);
CREATE INDEX idx_module_freeze_settings_expires_at ON module_freeze_settings(expires_at);

-- ----------------------------------------------------------------------------
-- System Monitoring Metrics Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_monitoring_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100) NOT NULL,
  module_name VARCHAR(255) REFERENCES module_registry(name) ON DELETE SET NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50),
  tags JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_monitoring_metrics_type ON system_monitoring_metrics(metric_type);
CREATE INDEX idx_system_monitoring_metrics_timestamp ON system_monitoring_metrics(timestamp);
CREATE INDEX idx_system_monitoring_metrics_module ON system_monitoring_metrics(module_name);

-- ----------------------------------------------------------------------------
-- Sandbox Test Results Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sandbox_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_proposal_id UUID REFERENCES update_proposals(id) ON DELETE CASCADE,
  test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('unit', 'integration', 'performance', 'security', 'regression')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('passed', 'failed', 'warning', 'skipped')),
  results JSONB NOT NULL,
  execution_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sandbox_test_results_proposal ON sandbox_test_results(update_proposal_id);
CREATE INDEX idx_sandbox_test_results_status ON sandbox_test_results(status);

-- ----------------------------------------------------------------------------
-- System Diagnostics Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_type VARCHAR(100) NOT NULL CHECK (diagnostic_type IN ('health_check', 'performance', 'security', 'error_analysis')),
  module_name VARCHAR(255) REFERENCES module_registry(name) ON DELETE SET NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  issue_description TEXT NOT NULL,
  root_cause_analysis TEXT,
  recommended_fix TEXT,
  fix_applied BOOLEAN DEFAULT false,
  fixed_by UUID REFERENCES users(id),
  fixed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_system_diagnostics_type ON system_diagnostics(diagnostic_type);
CREATE INDEX idx_system_diagnostics_severity ON system_diagnostics(severity);
CREATE INDEX idx_system_diagnostics_module ON system_diagnostics(module_name);
CREATE INDEX idx_system_diagnostics_fix_applied ON system_diagnostics(fix_applied);

-- ----------------------------------------------------------------------------
-- Console Commands History Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS console_commands_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  command TEXT NOT NULL,
  command_type VARCHAR(50) CHECK (command_type IN ('terminal', 'database', 'system', 'module')),
  output TEXT,
  exit_code INTEGER,
  execution_time_ms INTEGER,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_console_commands_user_id ON console_commands_history(user_id);
CREATE INDEX idx_console_commands_executed_at ON console_commands_history(executed_at);

-- ----------------------------------------------------------------------------
-- Mission Alignment Checks Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_alignment_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_proposal_id UUID REFERENCES update_proposals(id) ON DELETE CASCADE,
  check_type VARCHAR(100) NOT NULL CHECK (check_type IN ('architecture', 'policy', 'goal', 'security', 'performance')),
  passed BOOLEAN NOT NULL,
  details TEXT,
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mission_alignment_proposal ON mission_alignment_checks(update_proposal_id);
CREATE INDEX idx_mission_alignment_passed ON mission_alignment_checks(passed);

