/**
 * Auto-Monitoring Service
 * Continuous system monitoring and self-diagnosis
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const os = require('os');

class AutoMonitoringService {
  /**
   * Perform system health check
   */
  async performHealthCheck() {
    try {
      const checks = {
        timestamp: new Date().toISOString(),
        system: {
          cpuUsage: process.cpuUsage(),
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        },
        modules: [],
        issues: [],
      };

      // Check all modules
      const modules = await db.query(
        `SELECT name, health_status, performance_metrics 
         FROM module_registry`
      );

      for (const module of modules.rows) {
        const moduleHealth = {
          name: module.name,
          status: module.health_status,
          metrics: module.performance_metrics,
        };

        checks.modules.push(moduleHealth);

        // Detect issues
        if (module.health_status === 'unhealthy') {
          checks.issues.push({
            type: 'module_unhealthy',
            module: module.name,
            severity: 'error',
            message: `Module ${module.name} is unhealthy`,
          });
        }
      }

      // Check database connection
      try {
        await db.query('SELECT 1');
        checks.database = { status: 'healthy' };
      } catch (error) {
        checks.database = { status: 'unhealthy', error: error.message };
        checks.issues.push({
          type: 'database_error',
          severity: 'critical',
          message: 'Database connection failed',
        });
      }

      return { success: true, data: checks };
    } catch (error) {
      logger.error('Failed to perform health check', { error: error.message });
      throw error;
    }
  }

  /**
   * Diagnose an issue
   */
  async diagnoseIssue(issueData) {
    const { moduleName, issueType, description } = issueData;

    try {
      // Perform root cause analysis
      const diagnosis = {
        issueType,
        module: moduleName,
        description,
        rootCause: this.analyzeRootCause(issueType, moduleName),
        recommendedFix: this.generateFixRecommendation(issueType),
        severity: this.assessSeverity(issueType),
        timestamp: new Date().toISOString(),
      };

      // Store diagnosis
      await db.query(
        `INSERT INTO system_diagnostics 
         (diagnostic_type, module_name, severity, issue_description, root_cause_analysis, recommended_fix)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          issueType,
          moduleName,
          diagnosis.severity,
          description,
          diagnosis.rootCause,
          diagnosis.recommendedFix,
        ]
      );

      logger.info('Issue diagnosed', { module: moduleName, issueType });
      return { success: true, data: diagnosis };
    } catch (error) {
      logger.error('Failed to diagnose issue', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze root cause
   */
  analyzeRootCause(issueType, moduleName) {
    // Simplified root cause analysis
    // In production, this would use AI to analyze logs, metrics, etc.
    const rootCauses = {
      performance: `Performance degradation in ${moduleName} likely due to increased load or inefficient queries`,
      error: `Errors in ${moduleName} may be caused by recent changes or external dependencies`,
      security: `Security issue in ${moduleName} requires immediate attention`,
      health: `Health check failure in ${moduleName} indicates service unavailability`,
    };

    return rootCauses[issueType] || `Unknown root cause for ${issueType} in ${moduleName}`;
  }

  /**
   * Generate fix recommendation
   */
  generateFixRecommendation(issueType) {
    const recommendations = {
      performance: 'Review query performance, add indexes, or scale resources',
      error: 'Check recent changes, review error logs, and verify dependencies',
      security: 'Review security configuration and apply patches immediately',
      health: 'Check service status, restart if necessary, and verify dependencies',
    };

    return recommendations[issueType] || 'Review system logs and metrics for details';
  }

  /**
   * Assess severity
   */
  assessSeverity(issueType) {
    const severityMap = {
      performance: 'warning',
      error: 'error',
      security: 'critical',
      health: 'error',
    };

    return severityMap[issueType] || 'info';
  }

  /**
   * Get recent diagnostics
   */
  async getRecentDiagnostics(limit = 20) {
    try {
      const result = await db.query(
        `SELECT * FROM system_diagnostics 
         WHERE fix_applied = false
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      );

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get diagnostics', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark diagnostic as fixed
   */
  async markFixed(diagnosticId, adminId) {
    try {
      await db.query(
        `UPDATE system_diagnostics 
         SET fix_applied = true, fixed_by = $1, fixed_at = CURRENT_TIMESTAMP, resolved_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [adminId, diagnosticId]
      );

      logger.info('Diagnostic marked as fixed', { diagnosticId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to mark diagnostic as fixed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get optimization suggestions
   */
  async getOptimizationSuggestions() {
    try {
      const suggestions = [];

      // Check for slow queries
      const slowModules = await db.query(
        `SELECT name, performance_metrics 
         FROM module_registry 
         WHERE performance_metrics->>'avgResponseTime'::text > '500'`
      );

      for (const module of slowModules.rows) {
        suggestions.push({
          type: 'performance',
          module: module.name,
          suggestion: 'Consider optimizing database queries or adding caching',
          priority: 'medium',
        });
      }

      // Check for high error rates
      const errorMetrics = await db.query(
        `SELECT metric_type, module_name, AVG(value) as avg_value
         FROM system_monitoring_metrics
         WHERE metric_type = 'error_rate' 
           AND timestamp > CURRENT_TIMESTAMP - INTERVAL '1 hour'
         GROUP BY metric_type, module_name
         HAVING AVG(value) > 0.05`
      );

      for (const metric of errorMetrics.rows) {
        suggestions.push({
          type: 'reliability',
          module: metric.module_name,
          suggestion: 'High error rate detected, review error logs',
          priority: 'high',
        });
      }

      return { success: true, data: suggestions };
    } catch (error) {
      logger.error('Failed to get optimization suggestions', { error: error.message });
      throw error;
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs = 60000) {
    // Monitor every minute
    setInterval(async () => {
      try {
        const healthCheck = await this.performHealthCheck();
        
        // Log critical issues
        const criticalIssues = healthCheck.data.issues.filter(i => i.severity === 'critical');
        if (criticalIssues.length > 0) {
          logger.error('Critical issues detected', { issues: criticalIssues });
        }

        // Record metrics
        const centralMotherboardService = require('./centralMotherboardService');
        await centralMotherboardService.recordMetric({
          metricType: 'system_health',
          moduleName: 'system',
          value: healthCheck.data.issues.length,
          unit: 'count',
          tags: { severity: 'all' },
        });
      } catch (error) {
        logger.error('Monitoring error', { error: error.message });
      }
    }, intervalMs);

    logger.info('Continuous monitoring started', { interval: intervalMs });
  }
}

module.exports = new AutoMonitoringService();

