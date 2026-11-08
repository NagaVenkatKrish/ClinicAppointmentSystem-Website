import React from "react";
import StatusBadge from "./StatusBadge";
import { FormattedDate } from "../utils/dateUtils";

const AppointmentCard = ({
  appointment,
  onCancel,
  onReschedule,
  onComplete,
  userRole = "Patient"
}) => {
  const isScheduled = appointment.status === "Scheduled";

  return (
    <div className="card shadow-sm mb-3 border-0">
      <div className="card-body p-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border">
              <i className="bi bi-calendar-event me-1 text-primary"></i>
              <FormattedDate date={appointment.date} />
            </span>
            <span className="badge bg-light text-dark border">
              <i className="bi bi-clock me-1 text-primary"></i>
              {appointment.time}
            </span>
          </div>
          <div>
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        <div className="row g-2 align-items-center">
          <div className="col-md-7">
            {userRole === "Doctor" ? (
              <div>
                <h6 className="fw-bold mb-1 text-dark">
                  <i className="bi bi-person me-2 text-primary"></i>
                  {appointment.patientName}
                </h6>
                <div className="small text-muted">
                  <span className="me-3"><i className="bi bi-envelope me-1"></i>{appointment.patientEmail}</span>
                  <span><i className="bi bi-telephone me-1"></i>{appointment.patientPhone}</span>
                </div>
              </div>
            ) : (
              <div>
                <h6 className="fw-bold mb-1 text-dark">
                  <i className="bi bi-hospital me-2 text-primary"></i>
                  {appointment.doctorName}
                </h6>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                  {appointment.doctorSpecialization}
                </span>
              </div>
            )}
            <div className="mt-2 text-secondary small">
              <strong>Reason:</strong> {appointment.reason || "General Consultation"}
            </div>
          </div>

          <div className="col-md-5 d-flex justify-content-md-end align-items-center gap-2 mt-2 mt-md-0">
            {isScheduled && userRole === "Doctor" && onComplete && (
              <button
                type="button"
                className="btn btn-sm btn-success d-flex align-items-center"
                onClick={() => onComplete(appointment)}
              >
                <i className="bi bi-check2-circle me-1"></i> Mark Completed
              </button>
            )}

            {isScheduled && onReschedule && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center"
                onClick={() => onReschedule(appointment)}
              >
                <i className="bi bi-calendar-range me-1"></i> Reschedule
              </button>
            )}

            {isScheduled && onCancel && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger d-flex align-items-center"
                onClick={() => onCancel(appointment)}
              >
                <i className="bi bi-x-circle me-1"></i> Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
