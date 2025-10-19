/**
 * Role-Based Access Control Utilities
 * Handles user role checks and permissions
 */

// Admin roles that have access to Admin Dashboard
export const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'staff', 'coach', 'treasurer'];

// Regular user roles
export const USER_ROLES = ['user'];

/**
 * Check if user has admin access
 * @param {Object} user - User object from localStorage
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  if (!user || !user.role) return false;
  return ADMIN_ROLES.includes(user.role);
};

/**
 * Check if user is super admin
 * @param {Object} user - User object from localStorage
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
  if (!user || !user.role) return false;
  return user.role === 'super_admin';
};

/**
 * Check if user is authenticated
 * @param {string} token - JWT token from localStorage
 * @returns {boolean}
 */
export const isAuthenticated = (token) => {
  return !!token;
};

/**
 * Check if user is a regular member
 * @param {Object} user - User object from localStorage
 * @returns {boolean}
 */
export const isRegularUser = (user) => {
  if (!user || !user.role) return false;
  return USER_ROLES.includes(user.role);
};

/**
 * Get user role display name
 * @param {string} role - User role
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'super_admin': 'Super Administrator',
    'admin': 'Administrator',
    'manager': 'Manager',
    'staff': 'Staff',
    'coach': 'Coach',
    'treasurer': 'Treasurer',
    'user': 'Member'
  };
  return roleNames[role] || 'Guest';
};

/**
 * Get dashboard route based on user role
 * @param {Object} user - User object from localStorage
 * @returns {string}
 */
export const getDashboardRoute = (user) => {
  if (isAdmin(user)) {
    return '/admin-dashboard';
  }
  return '/dashboard';
};

/**
 * Check if user can access admin dashboard
 * @param {Object} user - User object from localStorage
 * @returns {boolean}
 */
export const canAccessAdminDashboard = (user) => {
  return isAdmin(user);
};

/**
 * Check if user can access member dashboard
 * @param {Object} user - User object from localStorage
 * @returns {boolean}
 */
export const canAccessMemberDashboard = (user) => {
  return !!user; // All authenticated users can access member dashboard
};
