import React from "react";

const AlertMessage = ({ type = "info", message, onClose }) => {
  if (!message) return null;

  const iconMap = {
    danger: "bi-exclamation-triangle-fill",
    success: "bi-check-circle-fill",
    warning: "bi-exclamation-circle-fill",
    info: "bi-info-circle-fill"
  };

  const icon = iconMap[type] || "bi-info-circle-fill";

  return (
    <div className={`alert alert-${type} d-flex align-items-center justify-content-between mb-4 shadow-sm`} role="alert">
      <div className="d-flex align-items-center">
        <i className={`bi ${icon} me-2 fs-5`}></i>
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close ms-3"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default AlertMessage;
