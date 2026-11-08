import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getAppointments } from "../../services/api";
import DashboardCard from "../../components/DashboardCard";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";
import { FormattedDate } from "../../utils/dateUtils";
import AppointmentInsights from "../../components/AppointmentInsights";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, apptsData] = await Promise.all([
          getDashboardStats("Admin"),
          getAppointments()
        ]);
        setStats(statsData);
        setAppointments(apptsData);
        // Take the 5 most recent
        setRecentAppointments([...apptsData].sort((a, b) =>
          (b.date || "").localeCompare(a.date || "") || (b.time || "").localeCompare(a.time || "")
        ).slice(0, 6));
      } catch (err) {
        setError("Failed to load administrative metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading clinic administration metrics..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <span className="badge bg-dark text-white px-2 py-1 mb-1">
            ADMINISTRATIVE PORTAL
          </span>
          <h2 className="fw-bold text-dark mb-0">Clinic System Dashboard</h2>
          <p className="text-muted small mb-0">
            Current clinic metrics, appointment activity, and care-team overview.
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <Link to="/admin/appointments" className="btn btn-primary btn-sm d-flex align-items-center">
            <i className="bi bi-calendar3 me-1"></i> All Appointments
          </Link>
          <Link to="/admin/doctors" className="btn btn-outline-dark btn-sm d-flex align-items-center">
            <i className="bi bi-person-badge me-1"></i> Manage Doctors
          </Link>
          <Link to="/admin/patients" className="btn btn-outline-secondary btn-sm d-flex align-items-center">
            <i className="bi bi-people me-1"></i> Manage Patients
          </Link>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError("")} />

      {/* Primary Statistics Grid */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <DashboardCard
            title="Total Patients"
            value={stats?.totalPatients ?? 0}
            icon="people-fill"
            variant="primary"
            subtitle="Registered clinic patients"
          />
        </div>
        <div className="col-sm-6 col-lg-4">
          <DashboardCard
            title="Total Doctors"
            value={stats?.totalDoctors ?? 0}
            icon="heart-pulse-fill"
            variant="success"
            subtitle="Practicing specialists"
          />
        </div>
        <div className="col-sm-6 col-lg-4">
          <DashboardCard
            title="Total Appointments"
            value={stats?.totalAppointments ?? 0}
            icon="calendar2-check-fill"
            variant="dark"
            subtitle="All recorded consultations"
          />
        </div>
        <div className="col-sm-6 col-lg-4">
          <DashboardCard
            title="Scheduled"
            value={stats?.scheduled ?? 0}
            icon="clock-fill"
            variant="warning"
            subtitle="Active / upcoming visits"
          />
        </div>
        <div className="col-sm-6 col-lg-4">
          <DashboardCard
            title="Completed"
            value={stats?.completed ?? 0}
            icon="check-circle-fill"
            variant="success"
            subtitle="Completed consultations"
          />
        </div>
        <div className="col-sm-6 col-lg-4">
          <DashboardCard
            title="Cancelled"
            value={stats?.cancelled ?? 0}
            icon="x-circle-fill"
            variant="danger"
            subtitle="Cancelled bookings"
          />
        </div>
      </div>

      <AppointmentInsights appointments={appointments} />

      {/* Recent Appointments Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-clock-history me-2 text-primary"></i>
            Recent Clinic Appointments
          </h5>
          <Link to="/admin/appointments" className="btn btn-sm btn-link text-decoration-none">
            View All ({stats?.totalAppointments}) &raquo;
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No appointments recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td className="ps-4 fw-medium text-muted">#{appt.id}</td>
                      <td>
                        <span className="fw-semibold text-dark">{appt.patientName}</span>
                      </td>
                      <td>
                        <div>{appt.doctorName}</div>
                        <span className="badge bg-light text-muted border" style={{ fontSize: "0.7rem" }}>
                          {appt.doctorSpecialization}
                        </span>
                      </td>
                      <td>
                        <div><i className="bi bi-calendar3 me-1 text-muted"></i><FormattedDate date={appt.date} /></div>
                        <small className="text-muted"><i className="bi bi-clock me-1"></i>{appt.time}</small>
                      </td>
                      <td>
                        <StatusBadge status={appt.status} />
                      </td>
                      <td>
                        <span className="text-secondary small text-truncate d-inline-block" style={{ maxWidth: "200px" }}>
                          {appt.reason}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
