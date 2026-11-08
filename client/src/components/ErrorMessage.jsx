import React from "react";

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4 shadow-sm" role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
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

export default ErrorMessage;
