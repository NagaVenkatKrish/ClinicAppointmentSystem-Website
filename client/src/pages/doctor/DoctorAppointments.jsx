import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { getAppointments, updateAppointment } from "../../services/api";
import AppointmentCard from "../../components/AppointmentCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const DoctorAppointments = () => {
  const { currentUser } = useRole();
  const doctorId = currentUser?.doctorId || 1;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments({
        doctorId,
        status: statusFilter === "All" ? "" : statusFilter
      });
      setAppointments(data);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to load doctor appointments." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId, statusFilter]);

  const handleMarkCompleted = async (appt) => {
    try {
      await updateAppointment(appt.id, { status: "Completed" });
      setAlert({
        type: "success",
        message: `Appointment for ${appt.patientName || "Patient"} marked as Completed.`
      });
      fetchAppointments();
    } catch (err) {
      setAlert({
        type: "danger",
        message: err.response?.data?.message || "Failed to update appointment status."
      });
    }
  };

  const filtered = appointments.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.patientName && a.patientName.toLowerCase().includes(q)) ||
      (a.reason && a.reason.toLowerCase().includes(q)) ||
      (a.date && a.date.includes(q))
    );
  });

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-calendar2-check text-success me-2"></i>
            Doctor Appointments Schedule
          </h2>
          <p className="text-muted small mb-0">
            View patient consultations assigned to you and update treatment statuses.
          </p>
        </div>
        <Link to="/doctor/dashboard" className="btn btn-outline-secondary d-flex align-items-center mt-2 mt-md-0">
          <i className="bi bi-speedometer2 me-2"></i> Dashboard
        </Link>
      </div>

      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center justify-content-between">
            <div className="col-md-7">
              <ul className="nav nav-pills gap-1">
                {["All", "Scheduled", "Completed", "Cancelled"].map((tab) => (
                  <li className="nav-item" key={tab}>
                    <button
                      type="button"
                      className={`nav-link px-3 py-1 small ${statusFilter === tab ? "active bg-success" : ""}`}
                      onClick={() => setStatusFilter(tab)}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Filter by patient name or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Cards */}
      {loading ? (
        <LoadingSpinner message="Loading your appointments..." />
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border">
          <i className="bi bi-calendar-x text-muted" style={{ fontSize: "3rem" }}></i>
          <h5 className="mt-3 text-secondary">No Appointments Found</h5>
          <p className="text-muted small">
            No consultations match your selected filter criteria.
          </p>
        </div>
      ) : (
        <div>
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              userRole="Doctor"
              onComplete={handleMarkCompleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
