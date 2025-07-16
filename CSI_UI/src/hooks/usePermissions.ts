import { useAuth } from "../contexts/AuthContext";
import { getPermissionsForRole, ROLES } from "../services/RoleService";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.roleId;
  let roleKey = "";
  // Map roleId to role key (customize as needed)
  if (role === 1) roleKey = ROLES.ADMIN;
  else if (role === 2) roleKey = ROLES.SYSTEM_MAINTAINER;
  else if (role === 3) roleKey = ROLES.OPERATOR;

  const permissions = getPermissionsForRole(roleKey);

  // Example resource checkers
  const canManageAll = () => permissions.canManageAll;
  const canManageOwn = (resourceOwnerId: string) =>
    permissions.canManageOwn && user?.id === resourceOwnerId;
  const canReadGranted = (resource: { grantedUsers?: string[] }) =>
    permissions.canReadGranted && resource?.grantedUsers?.includes(user?.id);

  return {
    role: roleKey,
    permissions,
    canManageAll,
    canManageOwn,
    canReadGranted,
  };
}
