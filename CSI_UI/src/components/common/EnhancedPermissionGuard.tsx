import React from "react";
import { RuxCard, RuxIcon } from "@astrouxds/react";
import { usePermissions } from "../../hooks/usePermissions";
import { RESOURCES, ACTIONS, ROLES } from "../../services/RoleService";
import "./EnhancedPermissionGuard.css";

interface BasePermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

interface LegacyPermissionGuardProps extends BasePermissionGuardProps {
  check: (perms: ReturnType<typeof usePermissions>) => boolean;
}

interface ResourcePermissionGuardProps extends BasePermissionGuardProps {
  resource: string;
  action: string;
  context?: {
    isOwner?: boolean;
    isGranted?: boolean;
  };
}

interface RolePermissionGuardProps extends BasePermissionGuardProps {
  roles: string[];
  requireAll?: boolean;
}

interface MultiPermissionGuardProps extends BasePermissionGuardProps {
  permissions: Array<{
    resource: string;
    action: string;
    context?: { isOwner?: boolean; isGranted?: boolean };
  }>;
  requireAll?: boolean;
}

type PermissionGuardProps = 
  | LegacyPermissionGuardProps
  | ResourcePermissionGuardProps
  | RolePermissionGuardProps
  | MultiPermissionGuardProps;

const DefaultFallback: React.FC<{ type: "unauthorized" | "insufficient_role" | "missing_permission" }> = ({ type }) => {
  const getMessage = () => {
    switch (type) {
      case "unauthorized":
        return "You need to be logged in to access this feature.";
      case "insufficient_role":
        return "Your role does not have sufficient privileges for this action.";
      case "missing_permission":
        return "You don't have permission to perform this action.";
      default:
        return "Access denied.";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "unauthorized":
        return "account-circle";
      case "insufficient_role":
        return "shield";
      case "missing_permission":
        return "block";
      default:
        return "error";
    }
  };

  return (
    <div className="permission-fallback">
      <RuxIcon icon={getIcon()} size="large" />
      <p>{getMessage()}</p>
    </div>
  );
};

export const PermissionGuard: React.FC<PermissionGuardProps> = (props) => {
  const perms = usePermissions();
  const { children, fallback, showFallback = true } = props;

  let hasAccess = false;
  let fallbackType: "unauthorized" | "insufficient_role" | "missing_permission" = "missing_permission";

  // Legacy check function
  if ("check" in props) {
    hasAccess = props.check(perms);
  }
  // Resource-based permission check
  else if ("resource" in props && "action" in props) {
    hasAccess = perms.hasPermission(props.resource, props.action, props.context);
  }
  // Role-based check
  else if ("roles" in props) {
    if (props.requireAll) {
      hasAccess = props.roles.every(role => perms.isRoleHigherThan(role));
    } else {
      hasAccess = props.roles.some(role => perms.isRoleHigherThan(role));
    }
    fallbackType = "insufficient_role";
  }
  // Multiple permissions check
  else if ("permissions" in props) {
    if (props.requireAll) {
      hasAccess = props.permissions.every(perm => 
        perms.hasPermission(perm.resource, perm.action, perm.context)
      );
    } else {
      hasAccess = props.permissions.some(perm => 
        perms.hasPermission(perm.resource, perm.action, perm.context)
      );
    }
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showFallback) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <DefaultFallback type={fallbackType} />;
};

// Convenience components for common permission patterns
export const AdminOnly: React.FC<BasePermissionGuardProps> = (props) => (
  <PermissionGuard roles={[ROLES.ADMIN]} {...props} />
);

export const SystemMaintainerOrAbove: React.FC<BasePermissionGuardProps> = (props) => (
  <PermissionGuard roles={[ROLES.ADMIN, ROLES.SYSTEM_MAINTAINER]} {...props} />
);

export const AuthenticatedOnly: React.FC<BasePermissionGuardProps> = (props) => {
  const perms = usePermissions();
  const hasAccess = perms.roleId !== undefined;

  if (hasAccess) {
    return <>{props.children}</>;
  }

  if (!props.showFallback) {
    return null;
  }

  return props.fallback ? <>{props.fallback}</> : <DefaultFallback type="unauthorized" />;
};

// Resource-specific guards
export const UserManagementGuard: React.FC<{ action: string } & BasePermissionGuardProps> = ({ action, ...props }) => (
  <PermissionGuard resource={RESOURCES.USERS} action={action} {...props} />
);

export const DeviceManagementGuard: React.FC<{ action: string } & BasePermissionGuardProps> = ({ action, ...props }) => (
  <PermissionGuard resource={RESOURCES.DEVICES} action={action} {...props} />
);

export const AlertManagementGuard: React.FC<{ action: string } & BasePermissionGuardProps> = ({ action, ...props }) => (
  <PermissionGuard resource={RESOURCES.ALERTS} action={action} {...props} />
);

export const SettingsGuard: React.FC<{ action: string } & BasePermissionGuardProps> = ({ action, ...props }) => (
  <PermissionGuard resource={RESOURCES.SETTINGS} action={action} {...props} />
);

// HOC for protecting components
export function withPermissions<T extends object>(
  Component: React.ComponentType<T>,
  permissionCheck: Omit<PermissionGuardProps, "children">
) {
  return function PermissionProtectedComponent(props: T) {
    return (
      <PermissionGuard {...permissionCheck}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

// Hook for conditional rendering in components
export function usePermissionGuard() {
  const perms = usePermissions();

  return {
    canAccess: (check: Omit<PermissionGuardProps, "children">) => {
      if ("check" in check) {
        return check.check(perms);
      } else if ("resource" in check && "action" in check) {
        return perms.hasPermission(check.resource, check.action, check.context);
      } else if ("roles" in check) {
        if (check.requireAll) {
          return check.roles.every(role => perms.isRoleHigherThan(role));
        } else {
          return check.roles.some(role => perms.isRoleHigherThan(role));
        }
      } else if ("permissions" in check) {
        if (check.requireAll) {
          return check.permissions.every(perm => 
            perms.hasPermission(perm.resource, perm.action, perm.context)
          );
        } else {
          return check.permissions.some(perm => 
            perms.hasPermission(perm.resource, perm.action, perm.context)
          );
        }
      }
      return false;
    },
    perms,
  };
}

export default PermissionGuard;