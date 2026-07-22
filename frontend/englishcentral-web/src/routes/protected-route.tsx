import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { hasAdminPortalAccess } from "@/features/public/auth/api/auth-api";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();

  if (!hasAdminPortalAccess()) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to="/admin/login"
      />
    );
  }

  return children;
}
