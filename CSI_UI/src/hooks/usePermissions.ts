import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  getPermissionsForRole, 
  hasPermission, 
  isRoleHigherOrEqual,
  getAllPermissions,
  getRoleMetadata,
  ROLES,
  RESOURCES,
  ACTIONS
} from "../services/RoleService";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.roleId;
  
  const roleKey = useMemo(() => {
    // Map roleId to role key
    switch (role) {
      case 1: return ROLES.ADMIN;
      case 2: return ROLES.SYSTEM_MAINTAINER;
      case 3: return ROLES.OPERATOR;
      default: return ROLES.OPERATOR;
    }
  }, [role]);

  const permissions = useMemo(() => getPermissionsForRole(roleKey), [roleKey]);
  const allPermissions = useMemo(() => getAllPermissions(roleKey), [roleKey]);
  const roleMetadata = useMemo(() => getRoleMetadata(role || 3), [role]);

  // Permission checker functions
  const can = useMemo(() => ({
    // Generic permission checker
    access: (resource: string, action: string, context?: { isOwner?: boolean; isGranted?: boolean }) => 
      hasPermission(roleKey, resource, action, context),

    // User permissions
    createUsers: () => hasPermission(roleKey, RESOURCES.USERS, ACTIONS.CREATE),
    viewUsers: () => hasPermission(roleKey, RESOURCES.USERS, ACTIONS.READ),
    editUsers: () => hasPermission(roleKey, RESOURCES.USERS, ACTIONS.UPDATE),
    deleteUsers: () => hasPermission(roleKey, RESOURCES.USERS, ACTIONS.DELETE),
    manageUsers: () => hasPermission(roleKey, RESOURCES.USERS, ACTIONS.MANAGE),
    bulkManageUsers: () => hasPermission(roleKey, RESOURCES.USERS, ACTIONS.BULK_OPERATIONS),

    // Device permissions
    createDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.CREATE),
    viewDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.READ),
    editDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.UPDATE),
    deleteDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.DELETE),
    manageDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.MANAGE),
    configureDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.CONFIGURE),
    bulkManageDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.BULK_OPERATIONS),
    importDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.IMPORT),
    exportDevices: () => hasPermission(roleKey, RESOURCES.DEVICES, ACTIONS.EXPORT),

    // Site permissions
    createSites: () => hasPermission(roleKey, RESOURCES.SITES, ACTIONS.CREATE),
    viewSites: () => hasPermission(roleKey, RESOURCES.SITES, ACTIONS.READ),
    editSites: () => hasPermission(roleKey, RESOURCES.SITES, ACTIONS.UPDATE),
    deleteSites: () => hasPermission(roleKey, RESOURCES.SITES, ACTIONS.DELETE),
    manageSites: () => hasPermission(roleKey, RESOURCES.SITES, ACTIONS.MANAGE),
    bulkManageSites: () => hasPermission(roleKey, RESOURCES.SITES, ACTIONS.BULK_OPERATIONS),

    // Alert permissions
    viewAlerts: () => hasPermission(roleKey, RESOURCES.ALERTS, ACTIONS.READ),
    editAlerts: () => hasPermission(roleKey, RESOURCES.ALERTS, ACTIONS.UPDATE),
    deleteAlerts: () => hasPermission(roleKey, RESOURCES.ALERTS, ACTIONS.DELETE),
    acknowledgeAlerts: () => hasPermission(roleKey, RESOURCES.ALERTS, ACTIONS.ACKNOWLEDGE),
    manageAlerts: () => hasPermission(roleKey, RESOURCES.ALERTS, ACTIONS.MANAGE),
    bulkManageAlerts: () => hasPermission(roleKey, RESOURCES.ALERTS, ACTIONS.BULK_OPERATIONS),
    exportAlerts: () => hasPermission(roleKey, RESOURCES.ALERTS, ACTIONS.EXPORT),

    // Report permissions
    createReports: () => hasPermission(roleKey, RESOURCES.REPORTS, ACTIONS.CREATE),
    viewReports: () => hasPermission(roleKey, RESOURCES.REPORTS, ACTIONS.READ),
    exportReports: () => hasPermission(roleKey, RESOURCES.REPORTS, ACTIONS.EXPORT),
    manageReports: () => hasPermission(roleKey, RESOURCES.REPORTS, ACTIONS.MANAGE),

    // Settings permissions
    viewSettings: () => hasPermission(roleKey, RESOURCES.SETTINGS, ACTIONS.READ),
    editSettings: () => hasPermission(roleKey, RESOURCES.SETTINGS, ACTIONS.UPDATE),
    manageSettings: () => hasPermission(roleKey, RESOURCES.SETTINGS, ACTIONS.MANAGE),
    configureSettings: () => hasPermission(roleKey, RESOURCES.SETTINGS, ACTIONS.CONFIGURE),

    // Metrics permissions
    viewMetrics: () => hasPermission(roleKey, RESOURCES.METRICS, ACTIONS.READ),
    exportMetrics: () => hasPermission(roleKey, RESOURCES.METRICS, ACTIONS.EXPORT),
    configureMetrics: () => hasPermission(roleKey, RESOURCES.METRICS, ACTIONS.CONFIGURE),

    // Configuration permissions
    createConfigurations: () => hasPermission(roleKey, RESOURCES.CONFIGURATIONS, ACTIONS.CREATE),
    viewConfigurations: () => hasPermission(roleKey, RESOURCES.CONFIGURATIONS, ACTIONS.READ),
    editConfigurations: () => hasPermission(roleKey, RESOURCES.CONFIGURATIONS, ACTIONS.UPDATE),
    deleteConfigurations: () => hasPermission(roleKey, RESOURCES.CONFIGURATIONS, ACTIONS.DELETE),
    importConfigurations: () => hasPermission(roleKey, RESOURCES.CONFIGURATIONS, ACTIONS.IMPORT),
    exportConfigurations: () => hasPermission(roleKey, RESOURCES.CONFIGURATIONS, ACTIONS.EXPORT),
    manageConfigurations: () => hasPermission(roleKey, RESOURCES.CONFIGURATIONS, ACTIONS.MANAGE),
  }), [roleKey]);

  // Legacy support functions
  const canManageAll = () => permissions.canManageAll;
  const canManageOwn = (resourceOwnerId: string | number) =>
    permissions.canManageOwn && user?.id?.toString() === resourceOwnerId.toString();
  const canReadGranted = (resource: { grantedUsers?: (string | number)[] }) =>
    permissions.canReadGranted && resource?.grantedUsers?.some(id => id.toString() === user?.id?.toString());

  // Role hierarchy checker
  const isRoleHigherThan = (requiredRole: string) => 
    isRoleHigherOrEqual(roleKey, requiredRole);

  // Check if user has any of the required permissions
  const hasAnyPermission = (requiredPermissions: string[]) => 
    requiredPermissions.some(permission => allPermissions.includes(permission));

  // Check if user has all required permissions
  const hasAllPermissions = (requiredPermissions: string[]) => 
    requiredPermissions.every(permission => allPermissions.includes(permission));

  return {
    // Role information
    role: roleKey,
    roleId: role || 3,
    roleMetadata,
    
    // Permissions
    permissions,
    allPermissions,
    can,
    
    // Permission checkers
    hasPermission: (resource: string, action: string, context?: { isOwner?: boolean; isGranted?: boolean }) => 
      hasPermission(roleKey, resource, action, context),
    hasAnyPermission,
    hasAllPermissions,
    isRoleHigherThan,
    
    // Legacy support
    canManageAll,
    canManageOwn,
    canReadGranted,
  };
}
