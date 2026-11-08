import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { getDashboardStats, getAppointments, updateAppointment } from "../../services/api";
import DashboardCard from "../../components/DashboardCard";
import AppointmentCard from "../../components/AppointmentCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";
import StatusBadge from "../../components/StatusBadge";
import { FormattedDate, getTodayString, parseDateParts } from "../../utils/dateUtils";

const DoctorDashboard = () => {
  const { currentUser } = useRole();
  const doctorId = currentUser?.doctorId || 1;

  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const todayStr = getTodayString();

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, apptsData, doctorSchedule] = await Promise.all([
        getDashboardStats("Doctor", { doctorId }),
        getAppointments({ doctorId, date: todayStr }),
        getAppointments({ doctorId })
      ]);
      setStats(statsData);
      setTodayAppointments(apptsData);
      setUpcomingAppointments(
        doctorSchedule
          .filter((appointment) => appointment.status === "Scheduled" && appointment.date > todayStr)
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
          .slice(0, 5)
      );
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to load doctor dashboard data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [doctorId]);

  const handleMarkCompleted = async (appt) => {
    try {
      await updateAppointment(appt.id, { status: "Completed" });
      setAlert({
        type: "success",
        message: `Appointment for ${appt.patientName || "Patient"} marked as Completed.`
      });
      loadData();
    } catch (err) {
      setAlert({
        type: "danger",
        message: err.response?.data?.message || "Failed to update appointment status."
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading doctor dashboard..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 mb-1">
            DOCTOR PORTAL
          </span>
          <h2 className="fw-bold text-dark mb-0">Welcome, {currentUser?.name || "Doctor"}</h2>
          <p className="text-muted small mb-0">
            Specialization: <strong className="text-dark">{currentUser?.specialization || "General Medicine"}</strong> • Today: <strong className="text-dark"><FormattedDate date={todayStr} /></strong>
          </p>
        </div>
        <Link to="/doctor/appointments" className="btn btn-outline-success d-flex align-items-center mt-2 mt-md-0">
          <i className="bi bi-calendar3 me-2"></i> All Appointments
        </Link>
      </div>

      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <DashboardCard
            title="Today's Schedule"
            value={stats?.todayAppointmentsCount ?? 0}
            icon="calendar-day"
            variant="primary"
            subtitle="Scheduled for today"
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Upcoming"
            value={stats?.upcomingCount ?? 0}
            icon="clock-history"
            variant="warning"
            subtitle="Upcoming visits"
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Completed"
            value={stats?.completed ?? 0}
            icon="check2-all"
            variant="success"
            subtitle="Treated consultations"
          />
        </div>
        <div className="col-md-3">
          <DashboardCard
            title="Total Handled"
            value={stats?.totalAppointments ?? 0}
            icon="archive"
            variant="secondary"
            subtitle="Total records"
          />
        </div>
      </div>

      {/* Today's Appointments Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-calendar-event me-2 text-success"></i>
            Today's Consultations (<FormattedDate date={todayStr} />)
          </h5>
          <span className="badge bg-success-subtle text-success border border-success-subtle">
            {todayAppointments.length} Patient(s) Today
          </span>
        </div>
        <div className="card-body p-4">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-check text-muted" style={{ fontSize: "3rem" }}></i>
              <h5 className="mt-3 text-secondary">No Consultations Scheduled for Today</h5>
              <p className="text-muted small mb-3">
                Check upcoming appointments or view your full schedule history.
              </p>
              <Link to="/doctor/appointments" className="btn btn-outline-success btn-sm">
                View Full Schedule
              </Link>
            </div>
          ) : (
            <div>
              {todayAppointments.map((appt) => (
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
      </div>

      <section className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <span className="insight-kicker">COMING UP</span>
            <h5 className="fw-bold mb-0">Next consultations</h5>
          </div>
          <Link to="/doctor/appointments" className="btn btn-sm btn-outline-success">Full schedule</Link>
        </div>
        {upcomingAppointments.length ? (
          <div className="list-group list-group-flush">
            {upcomingAppointments.map((appointment) => {
              const parts = parseDateParts(appointment.date);
              return (
                <div className="list-group-item px-4 py-3" key={appointment.id}>
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div className="d-flex align-items-center gap-3">
                      <div className="activity-date-tile activity-date-doctor">
                        <span>{parts?.monthShort || ""}</span>
                        <strong>{parts?.day || ""}</strong>
                      </div>
                      <div>
                        <div className="fw-semibold">{appointment.patientName || "Patient"}</div>
                        <div className="text-muted small">{appointment.time} · {appointment.reason || "General Consultation"}</div>
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted text-center py-4">No future consultations are currently scheduled.</div>
        )}
      </section>
    </div>
  );
};

export default DoctorDashboard;
