/**
 * Central Motherboard Service
 * Core control system that connects and manages all platform modules
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const db = require('../config/database');
const logger = require('../utils/logger');

class CentralMotherboardService {
  /**
   * Register a module in the system
   */
  async registerModule(moduleData) {
    const { name, version, dependencies = [], metadata = {} } = moduleData;

    try {
      const result = await db.query(
        `INSERT INTO module_registry (name, version, dependencies, metadata, status, health_status)
         VALUES ($1, $2, $3, $4, 'active', 'healthy')
         ON CONFLICT (name) DO UPDATE SET
           version = EXCLUDED.version,
           dependencies = EXCLUDED.dependencies,
           metadata = EXCLUDED.metadata,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [name, version, JSON.stringify(dependencies), JSON.stringify(metadata)]
      );

      logger.info('Module registered', { module: name, version });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to register module', { error: error.message, module: name });
      throw error;
    }
  }

  /**
   * Get all registered modules
   */
  async getAllModules() {
    try {
      const result = await db.query(
        `SELECT * FROM module_registry ORDER BY name`
      );
      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get modules', { error: error.message });
      throw error;
    }
  }

  /**
   * Get module by name
   */
  async getModule(name) {
    try {
      const result = await db.query(
        `SELECT * FROM module_registry WHERE name = $1`,
        [name]
      );
      
      if (result.rows.length === 0) {
        return { success: false, error: 'Module not found' };
      }
      
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to get module', { error: error.message, module: name });
      throw error;
    }
  }

  /**
   * Update module health status
   */
  async updateModuleHealth(name, healthStatus, metrics = {}) {
    try {
      const result = await db.query(
        `UPDATE module_registry 
         SET health_status = $1, 
             performance_metrics = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE name = $3
         RETURNING *`,
        [healthStatus, JSON.stringify(metrics), name]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Module not found' };
      }

      logger.info('Module health updated', { module: name, healthStatus });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to update module health', { error: error.message, module: name });
      throw error;
    }
  }

  /**
   * Record performance metrics
   */
  async recordMetric(metricData) {
    const { metricType, moduleName, value, unit = '', tags = {} } = metricData;

    try {
      await db.query(
        `INSERT INTO system_monitoring_metrics (metric_type, module_name, value, unit, tags)
         VALUES ($1, $2, $3, $4, $5)`,
        [metricType, moduleName, value, unit, JSON.stringify(tags)]
      );

      return { success: true };
    } catch (error) {
      logger.error('Failed to record metric', { error: error.message });
      throw error;
    }
  }

  /**
   * Get performance metrics for a module
   */
  async getModuleMetrics(moduleName, timeRange = '1 hour') {
    try {
      const result = await db.query(
        `SELECT metric_type, value, unit, timestamp, tags
         FROM system_monitoring_metrics
         WHERE module_name = $1 
           AND timestamp > CURRENT_TIMESTAMP - INTERVAL $2
         ORDER BY timestamp DESC`,
        [moduleName, timeRange]
      );

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get module metrics', { error: error.message, module: moduleName });
      throw error;
    }
  }

  /**
   * Get system health overview
   */
  async getSystemHealth() {
    try {
      const modules = await db.query(
        `SELECT name, status, health_status, performance_metrics, updated_at
         FROM module_registry
         ORDER BY name`
      );

      const healthCounts = modules.rows.reduce((acc, module) => {
        acc[module.health_status] = (acc[module.health_status] || 0) + 1;
        return acc;
      }, {});

      const recentMetrics = await db.query(
        `SELECT metric_type, AVG(value) as avg_value, MAX(value) as max_value
         FROM system_monitoring_metrics
         WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '1 hour'
         GROUP BY metric_type`
      );

      return {
        success: true,
        data: {
          modules: modules.rows,
          healthSummary: healthCounts,
          totalModules: modules.rows.length,
          recentMetrics: recentMetrics.rows,
        },
      };
    } catch (error) {
      logger.error('Failed to get system health', { error: error.message });
      throw error;
    }
  }

  /**
   * Check module dependencies
   */
  async checkDependencies(moduleName) {
    try {
      const module = await this.getModule(moduleName);
      if (!module.success) {
        return { success: false, error: 'Module not found' };
      }

      const dependencies = module.data.dependencies || [];
      const dependencyStatus = [];

      for (const dep of dependencies) {
        const depModule = await this.getModule(dep);
        dependencyStatus.push({
          name: dep,
          exists: depModule.success,
          health: depModule.success ? depModule.data.health_status : 'unknown',
        });
      }

      return {
        success: true,
        data: {
          module: moduleName,
          dependencies: dependencyStatus,
          allHealthy: dependencyStatus.every(d => d.exists && d.health === 'healthy'),
        },
      };
    } catch (error) {
      logger.error('Failed to check dependencies', { error: error.message, module: moduleName });
      throw error;
    }
  }
}

module.exports = new CentralMotherboardService();

