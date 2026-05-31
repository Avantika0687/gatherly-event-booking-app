import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();
  const { showToast } = useToast();

  const needsLogin = !isLoggedIn;
  const lacksRole = Boolean(requiredRole) && user?.role !== requiredRole;

  useEffect(() => {
    if (needsLogin) {
      showToast({
        type: "info",
        message: "Please login to continue.",
      });
    } else if (lacksRole) {
      showToast({
        type: "error",
        message: "Admin access required.",
      });
    }
  }, [lacksRole, needsLogin, showToast]);

  if (needsLogin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (lacksRole) {
    return <Navigate to="/access-denied" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
