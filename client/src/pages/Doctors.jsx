import React, { useState, useEffect } from "react";
import { getDoctors } from "../services/api";
import DoctorCard from "../components/DoctorCard";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertMessage from "../components/AlertMessage";

const SPECIALIZATIONS = [
  "All",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "General Medicine",
  "ENT",
  "Gynecology"
];

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const loadDoctors = async (spec = selectedSpec, search = searchQuery) => {
    try {
      setLoading(true);
      setError("");
      const data = await getDoctors(spec === "All" ? "" : spec, search);
      setDoctors(data);
    } catch (err) {
      setError("We couldn't load the doctors directory. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [selectedSpec]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDoctors(selectedSpec, searchQuery);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--clinic-text)' }}>
            <i className="bi bi-people-fill me-2" style={{ color: 'var(--clinic-primary)' }} aria-hidden="true"></i>
            Doctor Directory
          </h2>
          <p className="text-muted mb-0">
            Browse our doctors by name or specialization and book an appointment.
          </p>
        </div>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 mt-2 mt-md-0">
          {doctors.length} Doctors Available
        </span>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError("")} />

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-3">
          <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
            <div className="col-md-5">
              <label className="form-label" htmlFor="doctorSearch">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  id="doctorSearch"
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label" htmlFor="specFilter">Specialization</label>
              <select
                id="specFilter"
                className="form-select"
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec === "All" ? "All Specializations" : spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end gap-2 mt-md-4">
              <button type="submit" className="btn btn-primary flex-grow-1">
                Filter
              </button>
              {(searchQuery || selectedSpec !== "All") && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSpec("All");
                    loadDoctors("All", "");
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <LoadingSpinner message="Loading doctors directory..." />
      ) : doctors.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border">
          <i className="bi bi-person-x text-muted" style={{ fontSize: "3rem" }}></i>
          <h5 className="mt-3 text-secondary">No doctors match your query</h5>
          <p className="text-muted small">Try adjusting your specialization filter or search keyword.</p>
        </div>
      ) : (
        <div className="row g-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="col-md-6 col-lg-4">
              <DoctorCard doctor={doctor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
