/**
 * Console Service
 * Developer console functionality
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs').promises;
const path = require('path');

class ConsoleService {
  /**
   * Execute a command (super admin only)
   */
  async executeCommand(command, commandType, adminId) {
    try {
      // Verify admin is super_admin
      const admin = await db.query(
        `SELECT role FROM users WHERE id = $1`,
        [adminId]
      );

      if (admin.rows.length === 0 || admin.rows[0].role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super Admin access required' };
      }

      const startTime = Date.now();
      let output = '';
      let exitCode = 0;
      let error = null;

      try {
        // Execute command based on type
        switch (commandType) {
          case 'terminal':
            const result = await execPromise(command, {
              cwd: process.cwd(),
              timeout: 30000, // 30 second timeout
            });
            output = result.stdout;
            exitCode = 0;
            break;

          case 'database':
            // Execute SQL query
            const dbResult = await db.query(command);
            output = JSON.stringify(dbResult.rows, null, 2);
            exitCode = 0;
            break;

          case 'system':
            // System commands (limited)
            const allowedCommands = ['uptime', 'free', 'df', 'ps'];
            const cmdParts = command.split(' ');
            if (!allowedCommands.includes(cmdParts[0])) {
              throw new Error('Command not allowed');
            }
            const sysResult = await execPromise(command);
            output = sysResult.stdout;
            exitCode = 0;
            break;

          default:
            throw new Error('Invalid command type');
        }
      } catch (execError) {
        output = execError.stderr || execError.message;
        exitCode = execError.code || 1;
        error = execError.message;
      }

      const executionTime = Date.now() - startTime;

      // Log command execution
      await db.query(
        `INSERT INTO console_commands_history 
         (user_id, command, command_type, output, exit_code, execution_time_ms)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [adminId, command, commandType, output, exitCode, executionTime]
      );

      // Log action
      const superAdminControlService = require('./superAdminControlService');
      await superAdminControlService.logAction({
        actionType: 'console_command_executed',
        entityType: 'console',
        entityId: command,
        userId: adminId,
        details: { commandType, exitCode, executionTime },
        severity: exitCode === 0 ? 'info' : 'warning',
      });

      logger.info('Command executed', { command, commandType, exitCode, adminId });

      return {
        success: exitCode === 0,
        data: {
          command,
          commandType,
          output,
          exitCode,
          executionTime,
          error,
        },
      };
    } catch (error) {
      logger.error('Failed to execute command', { error: error.message, command });
      throw error;
    }
  }

  /**
   * Get command history
   */
  async getCommandHistory(filters = {}) {
    const { userId, commandType, limit = 50, offset = 0 } = filters;

    try {
      let query = `SELECT cch.*, u.name as user_name 
                   FROM console_commands_history cch
                   LEFT JOIN users u ON cch.user_id = u.id
                   WHERE 1=1`;
      const params = [];
      let paramCount = 0;

      if (userId) {
        paramCount++;
        query += ` AND cch.user_id = $${paramCount}`;
        params.push(userId);
      }

      if (commandType) {
        paramCount++;
        query += ` AND cch.command_type = $${paramCount}`;
        params.push(commandType);
      }

      query += ` ORDER BY cch.executed_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get command history', { error: error.message });
      throw error;
    }
  }

  /**
   * Get system logs
   */
  async getLogs(filters = {}) {
    const { level, module, startDate, endDate, limit = 100 } = filters;

    try {
      // In production, this would read from log files or log aggregation service
      // For now, return audit logs as proxy
      const superAdminControlService = require('./superAdminControlService');
      const auditLogs = await superAdminControlService.getAuditLogs({
        startDate,
        endDate,
        limit,
      });

      return auditLogs;
    } catch (error) {
      logger.error('Failed to get logs', { error: error.message });
      throw error;
    }
  }

  /**
   * Get system resources
   */
  async getSystemResources() {
    try {
      const resources = {
        cpu: {
          usage: process.cpuUsage(),
          cores: os.cpus().length,
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          process: process.memoryUsage(),
        },
        uptime: {
          system: os.uptime(),
          process: process.uptime(),
        },
        platform: {
          type: os.type(),
          platform: os.platform(),
          arch: os.arch(),
          hostname: os.hostname(),
        },
      };

      return { success: true, data: resources };
    } catch (error) {
      logger.error('Failed to get system resources', { error: error.message });
      throw error;
    }
  }

  /**
   * Read file (super admin only)
   */
  async readFile(filePath, adminId) {
    try {
      const admin = await db.query(
        `SELECT role FROM users WHERE id = $1`,
        [adminId]
      );

      if (admin.rows.length === 0 || admin.rows[0].role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super Admin access required' };
      }

      // Security: Only allow reading files within project directory
      const projectRoot = path.resolve(__dirname, '../../../');
      const resolvedPath = path.resolve(projectRoot, filePath);
      
      if (!resolvedPath.startsWith(projectRoot)) {
        return { success: false, error: 'Access denied: File outside project directory' };
      }

      const content = await fs.readFile(resolvedPath, 'utf-8');
      return { success: true, data: { path: filePath, content } };
    } catch (error) {
      logger.error('Failed to read file', { error: error.message, filePath });
      return { success: false, error: error.message };
    }
  }

  /**
   * Write file (super admin only)
   */
  async writeFile(filePath, content, adminId) {
    try {
      const admin = await db.query(
        `SELECT role FROM users WHERE id = $1`,
        [adminId]
      );

      if (admin.rows.length === 0 || admin.rows[0].role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super Admin access required' };
      }

      // Security: Only allow writing files within project directory
      const projectRoot = path.resolve(__dirname, '../../../');
      const resolvedPath = path.resolve(projectRoot, filePath);
      
      if (!resolvedPath.startsWith(projectRoot)) {
        return { success: false, error: 'Access denied: File outside project directory' };
      }

      await fs.writeFile(resolvedPath, content, 'utf-8');

      // Log action
      const superAdminControlService = require('./superAdminControlService');
      await superAdminControlService.logAction({
        actionType: 'file_written',
        entityType: 'file',
        entityId: filePath,
        userId: adminId,
        details: { path: filePath },
        severity: 'info',
      });

      logger.info('File written', { filePath, adminId });
      return { success: true, data: { path: filePath } };
    } catch (error) {
      logger.error('Failed to write file', { error: error.message, filePath });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ConsoleService();

