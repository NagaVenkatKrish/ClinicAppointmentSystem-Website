import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-4 mt-auto">
      <div className="container">
        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <h6 className="fw-bold mb-1" style={{ color: 'var(--clinic-primary)' }}>
              <i className="bi bi-hospital me-1" aria-hidden="true"></i> Clinic Appointment System
            </h6>
            <p className="small text-muted mb-0">
              Coordinated care, made simple.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 small text-muted">
              <Link to="/" className="text-decoration-none text-secondary">Home</Link>
              <Link to="/doctors" className="text-decoration-none text-secondary">Doctors</Link>
              <Link to="/roles" className="text-decoration-none text-secondary">Switch Role</Link>
            </div>
            <p className="small text-muted mt-2 mb-0">
              &copy; {new Date().getFullYear()} Clinic Appointment System
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
