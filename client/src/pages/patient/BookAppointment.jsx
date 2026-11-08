import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { createAppointment } from "../../services/api";
import AppointmentForm from "../../components/AppointmentForm";
import AlertMessage from "../../components/AlertMessage";
import { FormattedDate } from "../../utils/dateUtils";

const BookAppointment = () => {
  const { currentUser } = useRole();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preselectedDoctorId = searchParams.get("doctorId");
  const patientId = currentUser?.patientId || 1;
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const handleBookingSubmit = async (formData) => {
    const payload = {
      ...formData,
      patientId
    };

    const res = await createAppointment(payload);
    setBookingSuccess(res.appointment);
  };

  return (
    <div className="container py-4">
      <div className="max-w-2xl mx-auto" style={{ maxWidth: "780px" }}>
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item">
              <Link to="/patient/dashboard">Patient Dashboard</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Book Appointment
            </li>
          </ol>
        </nav>

        {bookingSuccess ? (
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-5 text-center">
              <div
                className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "72px", height: "72px", fontSize: "2.2rem" }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <h3 className="fw-bold text-dark mb-2">Appointment Confirmed!</h3>
              <p className="text-muted mb-4">
                Your appointment has been successfully booked and scheduled in the clinic system.
              </p>

              <div className="bg-light p-4 rounded-3 text-start mb-4 max-w-md mx-auto" style={{ maxWidth: "480px" }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Doctor:</span>
                  <span className="fw-bold text-dark">{bookingSuccess.doctorName}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Specialization:</span>
                  <span className="badge bg-info-subtle text-info-emphasis">
                    {bookingSuccess.doctorSpecialization}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Date & Time:</span>
                  <span className="fw-bold text-primary">
                    <FormattedDate date={bookingSuccess.date} /> at {bookingSuccess.time}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Status:</span>
                  <span className="badge bg-primary-subtle text-primary">
                    {bookingSuccess.status}
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate("/patient/dashboard")}
                >
                  <i className="bi bi-speedometer2 me-1"></i> Go to Dashboard
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setBookingSuccess(null);
                  }}
                >
                  <i className="bi bi-plus-circle me-1"></i> Book Another
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white p-4 border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="fw-bold text-dark mb-1">
                    <i className="bi bi-calendar-plus text-primary me-2"></i>
                    Schedule a Consultation
                  </h4>
                  <p className="text-muted small mb-0">
                    Select a specialist, appointment date, and available time slot.
                  </p>
                </div>
                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle d-none d-md-inline-block">
                  <i className="bi bi-shield-check me-1"></i> Conflict Prevention Active
                </span>
              </div>
            </div>

            <div className="card-body p-3 p-md-4">
              <AppointmentForm
                initialValues={{ doctorId: preselectedDoctorId }}
                patientId={patientId}
                patientName={currentUser?.name}
                onSubmit={handleBookingSubmit}
                onCancel={() => navigate("/patient/dashboard")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
