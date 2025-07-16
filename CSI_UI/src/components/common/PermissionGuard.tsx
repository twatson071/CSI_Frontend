import React from "react";
import { usePermissions } from "../../hooks/usePermissions";

interface PermissionGuardProps {
  check: (perms: ReturnType<typeof usePermissions>) => boolean;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  check,
  children,
}) => {
  const perms = usePermissions();
  if (!check(perms)) return null;
  return <>{children}</>;
};

export default PermissionGuard;
