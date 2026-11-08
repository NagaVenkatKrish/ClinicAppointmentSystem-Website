import React from "react";
import { useRole } from "../context/RoleContext";
import { Link } from "react-router-dom";

const ProtectedRoleRoute = ({ allowedRoles = [], children }) => {
  const { currentUser, switchRole } = useRole();

  if (!currentUser) {
    return (
      <div className="container py-5 text-center">
        <h4>Select a role to continue</h4>
        <p className="text-muted">Choose the appropriate clinic role to access this page.</p>
        <Link to="/roles" className="btn btn-primary">
          Select a Role
        </Link>
      </div>
    );
  }

  const hasAccess = allowedRoles.some(
    (role) => role.toLowerCase() === currentUser.role.toLowerCase()
  );

  if (!hasAccess) {
    const targetRole = allowedRoles[0];
    return (
      <div className="container py-5">
        <div className="card shadow-sm border-0 max-w-lg mx-auto" style={{ maxWidth: "600px" }}>
          <div className="card-body p-5 text-center">
            <div
              className="rounded-circle bg-warning-subtle text-warning d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "64px", height: "64px", fontSize: "1.8rem" }}
            >
              <i className="bi bi-shield-lock"></i>
            </div>
            <h4 className="fw-bold mb-2">Role Access</h4>
            <p className="text-muted mb-4">
              This section is designed for the <strong>{targetRole}</strong> role. You are currently viewing as <strong>{currentUser.name} ({currentUser.role})</strong>.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => switchRole(targetRole)}
              >
                <i className="bi bi-arrow-repeat me-1"></i>                 Switch to {targetRole}
              </button>
              <Link to="/roles" className="btn btn-outline-secondary">
                Select a Role
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoleRoute;
