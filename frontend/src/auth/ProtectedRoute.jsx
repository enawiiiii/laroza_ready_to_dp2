import { Navigate } from "react-router-dom";
import { roles } from "./roles";

export default function ProtectedRoute({ children, requiredRole, requiredPermission }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 1) التحقق من تسجيل الدخول
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2) التحقق من الدور (Role-Based)
  if (requiredRole && requiredRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3) التحقق من الصلاحيات الدقيقة (Permission-Based)
  const userPermissions = roles[role];
  if (requiredPermission && !userPermissions[requiredPermission]) {
    return <Navigate to="/dashboard" replace />;
  }

  // 4) (جاهز) التحقق من Session Timeout
  // سيتم تفعيله لاحقاً بعد إضافة session.js
  // if (sessionExpired) return <Navigate to="/lock" replace />;

  return children;
}