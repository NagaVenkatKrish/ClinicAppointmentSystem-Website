import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { getDashboardStats, getAppointments, cancelAppointment, updateAppointment } from "../../services/api";
import DashboardCard from "../../components/DashboardCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";
import StatusBadge from "../../components/StatusBadge";
import AppointmentForm from "../../components/AppointmentForm";
import { FormattedDate, parseDateParts } from "../../utils/dateUtils";

const PatientDashboard = () => {
  const { currentUser } = useRole();
  const navigate = useNavigate();
  const patientId = currentUser?.patientId || 1;

  const [stats, setStats] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [reschedulingAppt, setReschedulingAppt] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [data, appointments] = await Promise.all([
        getDashboardStats("Patient", { patientId }),
        getAppointments({ patientId })
      ]);
      setStats(data);
      setRecentAppointments([...appointments].sort((a, b) =>
        (b.date || "").localeCompare(a.date || "") || (b.time || "").localeCompare(a.time || "")
      ).slice(0, 5));
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to load dashboard statistics." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [patientId]);

  const handleCancelUpcoming = async () => {
    if (!stats?.upcomingAppointment) return;
    if (!window.confirm("Are you sure you want to cancel your upcoming appointment?")) return;

    try {
      await cancelAppointment(stats.upcomingAppointment.id);
      setAlert({ type: "success", message: "Appointment cancelled successfully." });
      fetchStats();
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
      fetchStats();
    } catch (err) {
      throw err; // AppointmentForm handles error message
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading patient portal..." />;
  }

  return (
    <div className="container py-4">
      {/* Welcome Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 mb-1">
            PATIENT PORTAL
          </span>
          <h2 className="fw-bold text-dark mb-0">Welcome, {currentUser?.name}</h2>
          <p className="text-muted small mb-0">Manage your clinic consultations and schedule appointments.</p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link to="/patient/book" className="btn btn-primary d-flex align-items-center">
            <i className="bi bi-calendar-plus me-2"></i> Book Appointment
          </Link>
          <Link to="/patient/appointments" className="btn btn-outline-secondary d-flex align-items-center">
            <i className="bi bi-clock-history me-2"></i> View History
          </Link>
        </div>
      </div>

      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <DashboardCard
            title="Total Booked"
            value={stats?.totalAppointments ?? 0}
            icon="calendar-check"
            variant="primary"
            subtitle="All-time consultations"
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Upcoming"
            value={stats?.upcomingCount ?? 0}
            icon="clock-history"
            variant="warning"
            subtitle="Scheduled visits"
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Completed"
            value={stats?.completed ?? 0}
            icon="check2-circle"
            variant="success"
            subtitle="Past completed visits"
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Cancelled"
            value={stats?.cancelled ?? 0}
            icon="x-circle"
            variant="danger"
            subtitle="Cancelled records"
          />
        </div>
      </div>

      {/* Next Appointment Spotlight */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">
                <i className="bi bi-pin-angle-fill me-2 text-primary"></i>
                Next Scheduled Consultation
              </h5>
              {stats?.upcomingAppointment && (
                <StatusBadge status={stats.upcomingAppointment.status} />
              )}
            </div>
            <div className="card-body p-4">
              {stats?.upcomingAppointment ? (
                <div>
                  <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 pb-3 border-bottom">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">
                        {stats.upcomingAppointment.doctorName}
                      </h4>
                      <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                        {stats.upcomingAppointment.doctorSpecialization}
                      </span>
                    </div>

                    <div className="text-md-end mt-2 mt-md-0">
                      <div className="fw-bold fs-5 text-primary">
                        <i className="bi bi-calendar3 me-1"></i> <FormattedDate date={stats.upcomingAppointment.date} />
                      </div>
                      <div className="text-muted fw-semibold">
                        <i className="bi bi-clock me-1"></i> {stats.upcomingAppointment.time}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-muted small fw-bold d-block mb-1">CONSULTATION REASON:</span>
                    <p className="bg-light p-3 rounded-3 text-secondary mb-0">
                      {stats.upcomingAppointment.reason || "General Consultation"}
                    </p>
                  </div>

                  <div className="d-flex flex-wrap gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setReschedulingAppt(stats.upcomingAppointment)}
                    >
                      <i className="bi bi-calendar-range me-1"></i> Reschedule Appointment
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleCancelUpcoming}
                    >
                      <i className="bi bi-x-circle me-1"></i> Cancel Appointment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-check text-muted" style={{ fontSize: "3rem" }}></i>
                  <h5 className="fw-bold mt-3 text-secondary">No Upcoming Appointments</h5>
                  <p className="text-muted small mb-4">
                    You have no active consultations scheduled. Choose a doctor and reserve a time slot.
                  </p>
                  <Link to="/patient/book" className="btn btn-primary">
                    <i className="bi bi-calendar-plus me-1"></i> Book Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Patient Actions Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">Quick Actions</h5>
            </div>
            <div className="card-body p-3">
              <div className="d-grid gap-2">
                <Link to="/patient/book" className="btn btn-primary text-start p-3">
                  <div className="fw-bold">
                    <i className="bi bi-calendar-plus me-2"></i> Book New Visit
                  </div>
                  <div className="small opacity-75">Pick a doctor and available slot</div>
                </Link>

                <Link to="/patient/appointments" className="btn btn-light border text-start p-3">
                  <div className="fw-bold text-dark">
                    <i className="bi bi-card-checklist me-2 text-primary"></i> Appointment History
                  </div>
                  <div className="small text-muted">View past and cancelled records</div>
                </Link>

                <Link to="/doctors" className="btn btn-light border text-start p-3">
                  <div className="fw-bold text-dark">
                    <i className="bi bi-people me-2 text-primary"></i> Find Specialists
                  </div>
                  <div className="small text-muted">Browse directory by specialty</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <span className="insight-kicker">YOUR CARE</span>
            <h5 className="fw-bold mb-0">Recent appointment activity</h5>
          </div>
          <Link to="/patient/appointments" className="btn btn-sm btn-outline-primary">Full history</Link>
        </div>
        <div className="list-group list-group-flush">
          {recentAppointments.length ? recentAppointments.map((appointment) => (
            <div className="list-group-item px-4 py-3" key={appointment.id}>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="activity-date-tile">
                    <span>{parseDateParts(appointment.date)?.monthShort || ""}</span>
                    <strong>{parseDateParts(appointment.date)?.day || ""}</strong>
                  </div>
                  <div>
                    <div className="fw-semibold">{appointment.doctorName}</div>
                    <div className="text-muted small">{appointment.doctorSpecialization} · {appointment.time}</div>
                    <div className="text-muted small">{appointment.reason}</div>
                  </div>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          )) : <div className="text-muted text-center py-4">Your appointment activity will appear here.</div>}
        </div>
      </section>

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

export default PatientDashboard;
