import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import {
  hasAdminPortalAccess,
  syncAuthSessionFromOpenTab,
} from "@/features/public/auth/api/auth-api";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();
  const [isCheckingSharedSession, setIsCheckingSharedSession] = useState(
    !hasAdminPortalAccess(),
  );

  useEffect(() => {
    if (!isCheckingSharedSession) {
      return;
    }

    void syncAuthSessionFromOpenTab().finally(() => setIsCheckingSharedSession(false));
  }, [isCheckingSharedSession]);

  if (isCheckingSharedSession) {
    return null;
  }

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
