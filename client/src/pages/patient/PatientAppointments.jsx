import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { getAppointments, cancelAppointment, updateAppointment } from "../../services/api";
import AppointmentCard from "../../components/AppointmentCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";
import AppointmentForm from "../../components/AppointmentForm";

const PatientAppointments = () => {
  const { currentUser } = useRole();
  const patientId = currentUser?.patientId || 1;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [alert, setAlert] = useState(null);
  const [reschedulingAppt, setReschedulingAppt] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments({
        patientId,
        status: statusFilter === "All" ? "" : statusFilter
      });
      setAppointments(data);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to load appointments history." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId, statusFilter]);

  const handleCancel = async (appt) => {
    if (!window.confirm(`Are you sure you want to cancel the appointment with ${appt.doctorName} on ${appt.date}?`)) {
      return;
    }

    try {
      await cancelAppointment(appt.id);
      setAlert({ type: "success", message: "Appointment cancelled successfully." });
      fetchAppointments();
    } catch (err) {
      setAlert({
        type: "danger",
        message: err.response?.data?.message || "Failed to cancel appointment."
      });
    }
  };

  const handleRescheduleSubmit = async (formData) => {
    try {
      await updateAppointment(reschedulingAppt.id, {
        doctorId: formData.doctorId,
        date: formData.date,
        time: formData.time,
        reason: formData.reason
      });
      setAlert({ type: "success", message: "Appointment rescheduled successfully!" });
      setReschedulingAppt(null);
      fetchAppointments();
    } catch (err) {
      throw err; // AppointmentForm displays error message
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-calendar-check text-primary me-2"></i>
            My Appointments
          </h2>
          <p className="text-muted small mb-0">
            View all consultation bookings, reschedule active slots, or inspect past history.
          </p>
        </div>
        <Link to="/patient/book" className="btn btn-primary d-flex align-items-center mt-2 mt-md-0">
          <i className="bi bi-calendar-plus me-2"></i> Book Appointment
        </Link>
      </div>

      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-2">
          <ul className="nav nav-pills gap-1">
            {["All", "Scheduled", "Completed", "Cancelled"].map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  type="button"
                  className={`nav-link px-3 py-2 ${statusFilter === tab ? "active" : ""}`}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner message="Fetching your appointments..." />
      ) : appointments.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border">
          <i className="bi bi-calendar-x text-muted" style={{ fontSize: "3rem" }}></i>
          <h5 className="mt-3 text-secondary">No Appointments Found</h5>
          <p className="text-muted small mb-3">
            {statusFilter !== "All"
              ? `There are no appointments with status "${statusFilter}".`
              : "You haven't scheduled any appointments yet."}
          </p>
          <Link to="/patient/book" className="btn btn-primary btn-sm">
            Book an Appointment
          </Link>
        </div>
      ) : (
        <div>
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              userRole="Patient"
              onCancel={handleCancel}
              onReschedule={(a) => setReschedulingAppt(a)}
            />
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-calendar-range me-2 text-primary"></i>
                  Reschedule Appointment
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReschedulingAppt(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <AppointmentForm
                  initialValues={reschedulingAppt}
                  isRescheduling={true}
                  patientId={patientId}
                  patientName={currentUser?.name}
                  onSubmit={handleRescheduleSubmit}
                  onCancel={() => setReschedulingAppt(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
