// Role definitions
export const ROLES = {
  ADMIN: "admin",
  SYSTEM_MAINTAINER: "system_maintainer",
  OPERATOR: "operator",
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 1,
  [ROLES.SYSTEM_MAINTAINER]: 2,
  [ROLES.OPERATOR]: 3,
};

// Resource types
export const RESOURCES = {
  USERS: "users",
  DEVICES: "devices",
  SITES: "sites",
  ALERTS: "alerts",
  REPORTS: "reports",
  SETTINGS: "settings",
  METRICS: "metrics",
  CONFIGURATIONS: "configurations",
};

// Action types
export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
  EXPORT: "export",
  IMPORT: "import",
  CONFIGURE: "configure",
  ACKNOWLEDGE: "acknowledge",
  BULK_OPERATIONS: "bulk_operations",
};

// Comprehensive permissions mapping
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    // Users
    [RESOURCES.USERS]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.DELETE]: true,
      [ACTIONS.MANAGE]: true,
      [ACTIONS.BULK_OPERATIONS]: true,
    },
    // Devices
    [RESOURCES.DEVICES]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.DELETE]: true,
      [ACTIONS.MANAGE]: true,
      [ACTIONS.CONFIGURE]: true,
      [ACTIONS.BULK_OPERATIONS]: true,
      [ACTIONS.IMPORT]: true,
      [ACTIONS.EXPORT]: true,
    },
    // Sites
    [RESOURCES.SITES]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.DELETE]: true,
      [ACTIONS.MANAGE]: true,
      [ACTIONS.BULK_OPERATIONS]: true,
    },
    // Alerts
    [RESOURCES.ALERTS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.DELETE]: true,
      [ACTIONS.ACKNOWLEDGE]: true,
      [ACTIONS.MANAGE]: true,
      [ACTIONS.BULK_OPERATIONS]: true,
      [ACTIONS.EXPORT]: true,
    },
    // Reports
    [RESOURCES.REPORTS]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.EXPORT]: true,
      [ACTIONS.MANAGE]: true,
    },
    // Settings
    [RESOURCES.SETTINGS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.MANAGE]: true,
      [ACTIONS.CONFIGURE]: true,
    },
    // Metrics
    [RESOURCES.METRICS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.EXPORT]: true,
      [ACTIONS.CONFIGURE]: true,
    },
    // Configurations
    [RESOURCES.CONFIGURATIONS]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.DELETE]: true,
      [ACTIONS.IMPORT]: true,
      [ACTIONS.EXPORT]: true,
      [ACTIONS.MANAGE]: true,
    },
  },
  [ROLES.SYSTEM_MAINTAINER]: {
    // Users - Limited access
    [RESOURCES.USERS]: {
      [ACTIONS.READ]: true,
    },
    // Devices - Full access except user management
    [RESOURCES.DEVICES]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.DELETE]: true,
      [ACTIONS.MANAGE]: true,
      [ACTIONS.CONFIGURE]: true,
      [ACTIONS.BULK_OPERATIONS]: true,
      [ACTIONS.IMPORT]: true,
      [ACTIONS.EXPORT]: true,
    },
    // Sites - Full access
    [RESOURCES.SITES]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.DELETE]: true,
      [ACTIONS.MANAGE]: true,
      [ACTIONS.BULK_OPERATIONS]: true,
    },
    // Alerts - Read and acknowledge
    [RESOURCES.ALERTS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.ACKNOWLEDGE]: true,
      [ACTIONS.EXPORT]: true,
      [ACTIONS.BULK_OPERATIONS]: true,
    },
    // Reports - Read and create
    [RESOURCES.REPORTS]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.EXPORT]: true,
    },
    // Settings - Limited access
    [RESOURCES.SETTINGS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: false, // Can't modify global settings
    },
    // Metrics
    [RESOURCES.METRICS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.EXPORT]: true,
      [ACTIONS.CONFIGURE]: true,
    },
    // Configurations - Device related only
    [RESOURCES.CONFIGURATIONS]: {
      [ACTIONS.CREATE]: true,
      [ACTIONS.READ]: true,
      [ACTIONS.UPDATE]: true,
      [ACTIONS.DELETE]: true,
      [ACTIONS.IMPORT]: true,
      [ACTIONS.EXPORT]: true,
    },
  },
  [ROLES.OPERATOR]: {
    // Users - No access
    [RESOURCES.USERS]: {},
    // Devices - Read-only
    [RESOURCES.DEVICES]: {
      [ACTIONS.READ]: true,
      [ACTIONS.EXPORT]: true,
    },
    // Sites - Read-only
    [RESOURCES.SITES]: {
      [ACTIONS.READ]: true,
    },
    // Alerts - Read and acknowledge only
    [RESOURCES.ALERTS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.ACKNOWLEDGE]: true,
      [ACTIONS.EXPORT]: true,
    },
    // Reports - Read-only
    [RESOURCES.REPORTS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.EXPORT]: true,
    },
    // Settings - Read user preferences only
    [RESOURCES.SETTINGS]: {
      [ACTIONS.READ]: true,
    },
    // Metrics - Read-only
    [RESOURCES.METRICS]: {
      [ACTIONS.READ]: true,
      [ACTIONS.EXPORT]: true,
    },
    // Configurations - Read-only
    [RESOURCES.CONFIGURATIONS]: {
      [ACTIONS.READ]: true,
    },
  },
};

// Legacy permissions for backward compatibility
const LEGACY_PERMISSIONS = {
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
  return {
    ...LEGACY_PERMISSIONS[role] || {},
    resources: PERMISSIONS[role] || {},
  };
}

// Check if user has permission for a specific resource and action
export function hasPermission(
  role: string,
  resource: string,
  action: string,
  context?: {
    isOwner?: boolean;
    isGranted?: boolean;
  }
): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  const hasDirectPermission = resourcePermissions[action] === true;
  
  // For resource-specific permissions, check context
  if (!hasDirectPermission && context) {
    // Allow if user is owner and role allows managing own resources
    if (context.isOwner && LEGACY_PERMISSIONS[role]?.canManageOwn) {
      return true;
    }
    
    // Allow if user is granted access and role allows granted resources
    if (context.isGranted && LEGACY_PERMISSIONS[role]?.canReadGranted) {
      return action === ACTIONS.READ;
    }
  }

  return hasDirectPermission;
}

// Check if one role is higher than another in hierarchy
export function isRoleHigherOrEqual(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || Infinity;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || Infinity;
  return userLevel <= requiredLevel;
}

// Get all permissions for a role
export function getAllPermissions(role: string) {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return [];

  const permissions: string[] = [];
  
  Object.entries(rolePermissions).forEach(([resource, actions]) => {
    Object.entries(actions).forEach(([action, allowed]) => {
      if (allowed) {
        permissions.push(`${resource}:${action}`);
      }
    });
  });

  return permissions;
}

// Role metadata
export const ROLE_METADATA = {
  [ROLES.ADMIN]: {
    id: 1,
    name: "Administrator",
    description: "Full system access with user management capabilities",
    color: "critical",
    icon: "shield",
  },
  [ROLES.SYSTEM_MAINTAINER]: {
    id: 2,
    name: "System Maintainer",
    description: "Device and site management with limited user access",
    color: "serious",
    icon: "settings",
  },
  [ROLES.OPERATOR]: {
    id: 3,
    name: "Operator",
    description: "View-only access with alert acknowledgment",
    color: "normal",
    icon: "person",
  },
};

export function getRoleMetadata(roleId: number | string) {
  if (typeof roleId === "number") {
    return Object.values(ROLE_METADATA).find(role => role.id === roleId) || ROLE_METADATA[ROLES.OPERATOR];
  }
  return ROLE_METADATA[roleId] || ROLE_METADATA[ROLES.OPERATOR];
}
