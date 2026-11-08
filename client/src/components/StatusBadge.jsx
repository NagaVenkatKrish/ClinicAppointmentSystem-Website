import React from "react";

const StatusBadge = ({ status }) => {
  const normalized = (status || "").toLowerCase();

  if (normalized === "scheduled") {
    return (
      <span className="badge badge-scheduled px-2 py-1">
        <i className="bi bi-clock me-1"></i>Scheduled
      </span>
    );
  }

  if (normalized === "completed") {
    return (
      <span className="badge badge-completed px-2 py-1">
        <i className="bi bi-check2-circle me-1"></i>Completed
      </span>
    );
  }

  if (normalized === "cancelled") {
    return (
      <span className="badge badge-cancelled px-2 py-1">
        <i className="bi bi-x-circle me-1"></i>Cancelled
      </span>
    );
  }

  return <span className="badge bg-secondary">{status || "Unknown"}</span>;
};

export default StatusBadge;
