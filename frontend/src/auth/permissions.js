import { roles } from "./roles";

// فحص الدور
export function hasRole(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  return userRole === requiredRole;
}

// فحص أكثر من دور
export function hasAnyRole(userRole, allowedRoles = []) {
  return allowedRoles.includes(userRole);
}

// فحص الصلاحية الدقيقة
export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false;

  const userPermissions = roles[userRole];
  if (!userPermissions) return false;

  return userPermissions[permission] === true;
}

// فحص مجموعة صلاحيات
export function hasAnyPermission(userRole, permissions = []) {
  const userPermissions = roles[userRole];
  if (!userPermissions) return false;

  return permissions.some((perm) => userPermissions[perm] === true);
}

// فحص الوصول لصفحة معينة
export function canAccessPage(userRole, requiredPermission) {
  if (!userRole || !requiredPermission) return false;

  const userPermissions = roles[userRole];
  if (!userPermissions) return false;

  return userPermissions[requiredPermission] === true;
}
