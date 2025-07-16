// Role definitions
export const ROLES = {
  ADMIN: "admin",
  SYSTEM_MAINTAINER: "system_maintainer",
  OPERATOR: "operator",
};

// Permissions mapping
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canManageAll: true,
    canManageOwn: true,
    canReadGranted: true,
  },
  [ROLES.SYSTEM_MAINTAINER]: {
    canManageAll: false,
    canManageOwn: true,
    canReadGranted: true,
  },
  [ROLES.OPERATOR]: {
    canManageAll: false,
    canManageOwn: false,
    canReadGranted: true,
  },
};

// Helper to get permissions for a role
export function getPermissionsForRole(role: string) {
  return PERMISSIONS[role] || {};
}
