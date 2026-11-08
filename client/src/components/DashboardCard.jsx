import React from "react";

const DashboardCard = ({ title, value, icon, variant = "primary", subtitle }) => {
  const variantClass = `stat-${variant}`;

  return (
    <div className={`card stat-card ${variantClass} h-100 shadow-sm`}>
      <div className="card-body d-flex align-items-center justify-content-between p-3">
        <div>
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
            {title}
          </span>
          <h2 className="fw-bold mb-0 mt-1 text-dark">{value}</h2>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className={`stat-icon stat-icon-${variant}`} aria-hidden="true">
          <i className={`bi bi-${icon}`}></i>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
