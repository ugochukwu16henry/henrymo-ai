/**
 * Super Admin Control Service
 * Manages approval workflow and module control
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const db = require('../config/database');
const logger = require('../utils/logger');

class SuperAdminControlService {
  /**
   * Approve an update proposal
   */
  async approveProposal(proposalId, adminId, comments = '') {
    try {
      // Verify admin is super_admin
      const admin = await db.query(
        `SELECT role FROM users WHERE id = $1`,
        [adminId]
      );

      if (admin.rows.length === 0 || admin.rows[0].role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super Admin access required' };
      }

      const result = await db.query(
        `UPDATE update_proposals 
         SET status = 'approved',
             reviewed_by = $1,
             reviewed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [adminId, proposalId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Proposal not found' };
      }

      // Log action
      await this.logAction({
        actionType: 'proposal_approved',
        entityType: 'update_proposal',
        entityId: proposalId,
        userId: adminId,
        details: { comments },
      });

      logger.info('Proposal approved', { proposalId, adminId });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to approve proposal', { error: error.message, proposalId });
      throw error;
    }
  }

  /**
   * Reject an update proposal
   */
  async rejectProposal(proposalId, adminId, reason = '') {
    try {
      const admin = await db.query(
        `SELECT role FROM users WHERE id = $1`,
        [adminId]
      );

      if (admin.rows.length === 0 || admin.rows[0].role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super Admin access required' };
      }

      const result = await db.query(
        `UPDATE update_proposals 
         SET status = 'rejected',
             reviewed_by = $1,
             reviewed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [adminId, proposalId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'Proposal not found' };
      }

      await this.logAction({
        actionType: 'proposal_rejected',
        entityType: 'update_proposal',
        entityId: proposalId,
        userId: adminId,
        details: { reason },
      });

      logger.info('Proposal rejected', { proposalId, adminId, reason });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to reject proposal', { error: error.message, proposalId });
      throw error;
    }
  }

  /**
   * Freeze a module
   */
  async freezeModule(moduleName, adminId, reason = '', expiresAt = null) {
    try {
      const admin = await db.query(
        `SELECT role FROM users WHERE id = $1`,
        [adminId]
      );

      if (admin.rows.length === 0 || admin.rows[0].role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super Admin access required' };
      }

      const result = await db.query(
        `INSERT INTO module_freeze_settings (module_name, frozen, frozen_by, frozen_at, reason, expires_at)
         VALUES ($1, true, $2, CURRENT_TIMESTAMP, $3, $4)
         ON CONFLICT (module_name) DO UPDATE SET
           frozen = true,
           frozen_by = EXCLUDED.frozen_by,
           frozen_at = CURRENT_TIMESTAMP,
           reason = EXCLUDED.reason,
           expires_at = EXCLUDED.expires_at,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [moduleName, adminId, reason, expiresAt]
      );

      // Update module status
      await db.query(
        `UPDATE module_registry SET status = 'frozen' WHERE name = $1`,
        [moduleName]
      );

      await this.logAction({
        actionType: 'module_frozen',
        entityType: 'module',
        entityId: moduleName,
        userId: adminId,
        details: { reason, expiresAt },
      });

      logger.info('Module frozen', { module: moduleName, adminId });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to freeze module', { error: error.message, module: moduleName });
      throw error;
    }
  }

  /**
   * Unfreeze a module
   */
  async unfreezeModule(moduleName, adminId) {
    try {
      const admin = await db.query(
        `SELECT role FROM users WHERE id = $1`,
        [adminId]
      );

      if (admin.rows.length === 0 || admin.rows[0].role !== 'super_admin') {
        return { success: false, error: 'Unauthorized: Super Admin access required' };
      }

      const result = await db.query(
        `UPDATE module_freeze_settings 
         SET frozen = false, updated_at = CURRENT_TIMESTAMP
         WHERE module_name = $1
         RETURNING *`,
        [moduleName]
      );

      await db.query(
        `UPDATE module_registry SET status = 'active' WHERE name = $1`,
        [moduleName]
      );

      await this.logAction({
        actionType: 'module_unfrozen',
        entityType: 'module',
        entityId: moduleName,
        userId: adminId,
      });

      logger.info('Module unfrozen', { module: moduleName, adminId });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to unfreeze module', { error: error.message, module: moduleName });
      throw error;
    }
  }

  /**
   * Log an action to audit log
   */
  async logAction(actionData) {
    const {
      actionType,
      entityType,
      entityId,
      userId,
      details = {},
      ipAddress = null,
      userAgent = null,
      severity = 'info',
    } = actionData;

    try {
      await db.query(
        `INSERT INTO audit_logs_advanced 
         (action_type, entity_type, entity_id, user_id, details, ip_address, user_agent, severity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          actionType,
          entityType,
          entityId,
          userId,
          JSON.stringify(details),
          ipAddress,
          userAgent,
          severity,
        ]
      );
    } catch (error) {
      logger.error('Failed to log action', { error: error.message });
      // Don't throw - logging failures shouldn't break the system
    }
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters = {}) {
    const {
      actionType,
      userId,
      severity,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filters;

    try {
      let query = `SELECT al.*, u.name as user_name, u.email as user_email
                   FROM audit_logs_advanced al
                   LEFT JOIN users u ON al.user_id = u.id
                   WHERE 1=1`;
      const params = [];
      let paramCount = 0;

      if (actionType) {
        paramCount++;
        query += ` AND al.action_type = $${paramCount}`;
        params.push(actionType);
      }

      if (userId) {
        paramCount++;
        query += ` AND al.user_id = $${paramCount}`;
        params.push(userId);
      }

      if (severity) {
        paramCount++;
        query += ` AND al.severity = $${paramCount}`;
        params.push(severity);
      }

      if (startDate) {
        paramCount++;
        query += ` AND al.created_at >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND al.created_at <= $${paramCount}`;
        params.push(endDate);
      }

      query += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get audit logs', { error: error.message });
      throw error;
    }
  }
}

module.exports = new SuperAdminControlService();

