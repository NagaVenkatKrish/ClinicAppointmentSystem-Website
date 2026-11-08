import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";

const Navbar = () => {
  const { currentUser } = useRole();
  const location = useLocation();

  const roleLabel = currentUser?.role || "Guest";
  const userName = currentUser?.name || "Guest";

  return (
    <nav className="navbar navbar-expand-lg navbar-clinic sticky-top" aria-label="Main navigation">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/" style={{ color: 'var(--clinic-primary)' }}>
          <span className="brand-icon" aria-hidden="true">
            <i className="bi bi-hospital"></i>
          </span>
          <span>Clinic Appointment System</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#clinicNavbar"
          aria-controls="clinicNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="clinicNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/" end>
                <i className="bi bi-house-door me-1" aria-hidden="true"></i> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/doctors">
                <i className="bi bi-person-badge me-1" aria-hidden="true"></i> Doctors
              </NavLink>
            </li>

            {/* Patient Navigation */}
            {currentUser?.role === "Patient" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/patient/dashboard">
                    <i className="bi bi-grid-1x2 me-1" aria-hidden="true"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/patient/book">
                    <i className="bi bi-calendar-plus me-1" aria-hidden="true"></i> Book Appointment
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/patient/appointments">
                    <i className="bi bi-calendar-check me-1" aria-hidden="true"></i> My Appointments
                  </NavLink>
                </li>
              </>
            )}

            {/* Doctor Navigation */}
            {currentUser?.role === "Doctor" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/doctor/dashboard">
                    <i className="bi bi-grid-1x2 me-1" aria-hidden="true"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/doctor/appointments">
                    <i className="bi bi-calendar2-week me-1" aria-hidden="true"></i> Appointments
                  </NavLink>
                </li>
              </>
            )}

            {/* Admin Navigation */}
            {currentUser?.role === "Admin" && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/admin/dashboard">
                    <i className="bi bi-grid-1x2 me-1" aria-hidden="true"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/admin/patients">
                    <i className="bi bi-people me-1" aria-hidden="true"></i> Patients
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/admin/doctors">
                    <i className="bi bi-heart-pulse me-1" aria-hidden="true"></i> Manage Doctors
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/admin/appointments">
                    <i className="bi bi-calendar3 me-1" aria-hidden="true"></i> Appointments
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-light text-dark border px-3 py-2" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-person-circle me-1" style={{ color: 'var(--clinic-primary)' }} aria-hidden="true"></i>
              {userName}
              <span className="text-muted ms-1">({roleLabel})</span>
            </span>
            <Link to="/roles" className="btn btn-outline-primary btn-sm">
              Switch Role
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
