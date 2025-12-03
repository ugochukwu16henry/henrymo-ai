/**
 * Permission Utilities
 * Shared permission checking functions
 * 
 * @author Henry Maobughichi Ugochukwu
 */

/**
 * Check if user can verify contributions
 */
const canVerify = (user) => {
  const allowedRoles = ['admin', 'moderator', 'verifier', 'super_admin'];
  return allowedRoles.includes(user.role);
};

/**
 * Check if user is admin
 */
const isAdmin = (user) => {
  const adminRoles = ['admin', 'country_admin', 'super_admin'];
  return adminRoles.includes(user.role);
};

/**
 * Check if user is super admin
 */
const isSuperAdmin = (user) => {
  return user.role === 'super_admin';
};

module.exports = {
  canVerify,
  isAdmin,
  isSuperAdmin,
};

