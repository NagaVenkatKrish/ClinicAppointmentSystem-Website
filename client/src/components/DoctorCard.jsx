import React from "react";
import { Link } from "react-router-dom";

const DoctorCard = ({ doctor, onBook, showBookBtn = true }) => {
  return (
    <div className="card card-hover h-100 shadow-sm border-0">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0"
            style={{ width: "52px", height: "52px", fontSize: "1.5rem" }}
          >
            <i className="bi bi-person-badge"></i>
          </div>
          <div>
            <h5 className="card-title fw-bold mb-0 text-dark">{doctor.name}</h5>
            <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle mt-1">
              {doctor.specialization}
            </span>
          </div>
        </div>

        <div className="text-secondary small my-2 flex-grow-1">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-envelope me-2 text-muted"></i>
            <span className="text-truncate">{doctor.email}</span>
          </div>
          <div className="d-flex align-items-center">
            <i className="bi bi-telephone me-2 text-muted"></i>
            <span>{doctor.phone}</span>
          </div>
          <div className="d-flex align-items-center mt-2">
            <i className="bi bi-currency-rupee me-2 text-success"></i>
            <span className="fw-semibold text-success">
              Consultation Fee: ₹
              {Number(doctor.consultationFee ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        {showBookBtn && (
          <div className="mt-3 pt-3 border-top">
            {onBook ? (
              <button
                type="button"
                className="btn btn-outline-primary w-100 btn-sm fw-medium d-flex align-items-center justify-content-center"
                onClick={() => onBook(doctor)}
              >
                <i className="bi bi-calendar-plus me-2"></i> Book Appointment
              </button>
            ) : (
              <Link
                to={`/patient/book?doctorId=${doctor.id}`}
                className="btn btn-outline-primary w-100 btn-sm fw-medium d-flex align-items-center justify-content-center"
              >
                <i className="bi bi-calendar-plus me-2"></i> Book Appointment
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;
