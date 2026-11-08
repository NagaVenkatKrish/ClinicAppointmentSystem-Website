import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { getDashboardStats } from "../services/api";

const Home = () => {
  const { switchRole } = useRole();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  const fetchStats = async () => {
    try {
      setStatsError(false);
      const data = await getDashboardStats("Admin");
      setStats(data);
    } catch (err) {
      console.error("Home stats error:", err);
      setStatsError(true);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickRole = (role, path) => {
    switchRole(role);
    navigate(path);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section p-4 p-md-5 mb-4 mx-3 mx-md-auto mt-4" style={{ maxWidth: '1140px' }}>
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <h1 className="display-5 fw-bold lh-tight mb-3" style={{ color: 'var(--clinic-text)' }}>
              Clinic Appointment System
            </h1>
            <p className="lead mb-4" style={{ color: 'var(--clinic-text-secondary)', fontSize: '1.1rem' }}>
              Manage doctor appointments, check availability, and keep track of your healthcare schedule — all in one place.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary btn-lg px-4 fw-medium"
                onClick={() => handleQuickRole("Patient", "/patient/book")}
              >
                <i className="bi bi-calendar-plus me-2" aria-hidden="true"></i>
                Book an Appointment
              </button>
              <Link to="/doctors" className="btn btn-outline-secondary btn-lg px-4 fw-medium">
                <i className="bi bi-people me-2" aria-hidden="true"></i>
                Browse Doctors
              </Link>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="bg-white p-4 rounded-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="text-center mb-3">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                  style={{
                    width: '56px', height: '56px', fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, var(--clinic-primary), var(--clinic-teal))',
                    color: '#fff'
                  }}
                  aria-hidden="true"
                >
                  <i className="bi bi-hospital"></i>
                </div>
                <h5 className="fw-bold mb-0">Clinic Overview</h5>
              </div>
              {stats ? (
                <div className="row g-2">
                  <div className="col-6">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <div className="text-muted small">Doctors</div>
                      <div className="fw-bold fs-4" style={{ color: 'var(--clinic-primary)' }}>{stats.totalDoctors}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <div className="text-muted small">Patients</div>
                      <div className="fw-bold fs-4 text-success">{stats.totalPatients}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <div className="text-muted small">Appointments</div>
                      <div className="fw-bold fs-4" style={{ color: 'var(--clinic-text)' }}>{stats.totalAppointments}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light p-3 rounded-3 text-center">
                      <div className="text-muted small">Scheduled</div>
                      <div className="fw-bold fs-4" style={{ color: 'var(--clinic-warning)' }}>{stats.scheduled}</div>
                    </div>
                  </div>
                </div>
              ) : statsError ? (
                <div className="text-center py-3">
                  <div className="text-danger small mb-2">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    Backend server is offline on port 5000.
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchStats}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i> Retry Connection
                  </button>
                </div>
              ) : (
                <div className="text-center text-muted small py-3">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading clinic data...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* How It Works */}
        <section className="mb-5">
          <h3 className="fw-bold mb-1" style={{ color: 'var(--clinic-text)' }}>
            How It Works
          </h3>
          <p className="text-muted mb-4">
            Booking an appointment is simple and straightforward.
          </p>

          <div className="row g-4">
            {[
              {
                step: "1",
                title: "Choose a Doctor",
                desc: "Browse our directory of specialists and find the right doctor for your needs.",
                icon: "bi-person-badge"
              },
              {
                step: "2",
                title: "Select a Time",
                desc: "Pick a convenient date and choose from available appointment slots.",
                icon: "bi-calendar-event"
              },
              {
                step: "3",
                title: "Confirm Booking",
                desc: "Review your appointment details and confirm. Conflicts are automatically prevented.",
                icon: "bi-check2-square"
              }
            ].map((item) => (
              <div className="col-md-4" key={item.step}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                      style={{
                        width: '52px', height: '52px', fontSize: '1.4rem',
                        backgroundColor: 'var(--clinic-primary-light)',
                        color: 'var(--clinic-primary)'
                      }}
                      aria-hidden="true"
                    >
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div className="text-muted small fw-bold mb-1">Step {item.step}</div>
                    <h5 className="fw-bold mb-2">{item.title}</h5>
                    <p className="text-muted small mb-0">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Role Portals */}
        <section className="mb-5">
          <h3 className="fw-bold mb-1" style={{ color: 'var(--clinic-text)' }}>
            Access Your Portal
          </h3>
          <p className="text-muted mb-4">
            Choose the workspace that matches your role at the clinic.
          </p>

          <div className="row g-4">
            {/* Patient Card */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 card-hover">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{
                        width: '44px', height: '44px', fontSize: '1.3rem',
                        backgroundColor: 'var(--clinic-primary-light)',
                        color: 'var(--clinic-primary)'
                      }}
                      aria-hidden="true"
                    >
                      <i className="bi bi-person-heart"></i>
                    </div>
                    <h5 className="fw-bold mb-0">Patient Portal</h5>
                  </div>
                  <p className="text-muted small flex-grow-1">
                    Browse doctors, view available time slots, book appointments, reschedule, and manage your consultation history.
                  </p>
                  <div className="d-grid mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary fw-medium"
                      onClick={() => handleQuickRole("Patient", "/patient/dashboard")}
                    >
                      Enter Patient Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Card */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 card-hover">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}
                      aria-hidden="true"
                    >
                      <i className="bi bi-heart-pulse"></i>
                    </div>
                    <h5 className="fw-bold mb-0">Doctor Portal</h5>
                  </div>
                  <p className="text-muted small flex-grow-1">
                    Review scheduled appointments, view patient details, and mark consultations as completed.
                  </p>
                  <div className="d-grid mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-success fw-medium"
                      onClick={() => handleQuickRole("Doctor", "/doctor/dashboard")}
                    >
                      Enter Doctor Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Card */}
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0 card-hover">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-3 bg-dark-subtle text-dark d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}
                      aria-hidden="true"
                    >
                      <i className="bi bi-gear-wide-connected"></i>
                    </div>
                    <h5 className="fw-bold mb-0">Admin Portal</h5>
                  </div>
                  <p className="text-muted small flex-grow-1">
                    Clinic-wide overview: manage doctors, patients, appointments, and view system statistics.
                  </p>
                  <div className="d-grid mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-dark fw-medium"
                      onClick={() => handleQuickRole("Admin", "/admin/dashboard")}
                    >
                      Enter Admin Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="p-4 rounded-4 mb-4" style={{ backgroundColor: 'var(--clinic-surface)', border: '1px solid var(--clinic-border)' }}>
          <h4 className="fw-bold mb-1" style={{ color: 'var(--clinic-text)' }}>
            <i className="bi bi-shield-check me-2" style={{ color: 'var(--clinic-primary)' }} aria-hidden="true"></i>
            Built for Reliable Scheduling
          </h4>
          <p className="text-muted small mb-3">
            Designed to keep appointments organized and prevent scheduling conflicts.
          </p>

          <div className="row g-3 small">
            {[
              { title: "Specialist Directory", desc: "Browse doctors by specialization to find the right care.", color: 'var(--clinic-primary)' },
              { title: "Real-Time Availability", desc: "See available time slots before you book — no guesswork needed.", color: 'var(--clinic-primary)' },
              { title: "Conflict Prevention", desc: "Double-booking is automatically blocked at the system level.", color: 'var(--clinic-success)' },
              { title: "Flexible Rescheduling", desc: "Reschedule or cancel appointments without losing track of your history.", color: 'var(--clinic-teal)' }
            ].map((f, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <div className="p-3 bg-light rounded-3 border h-100">
                  <div className="fw-bold mb-1" style={{ color: f.color }}>{f.title}</div>
                  <div className="text-muted">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
