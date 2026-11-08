import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { getDoctors, getPatients } from "../services/api";

const RoleSelection = () => {
  const { currentUser, users, switchUser } = useRole();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getPatients(), getDoctors()])
      .then(([patientRecords, doctorRecords]) => {
        if (!active) return;
        setPatients(patientRecords);
        setDoctors(doctorRecords);
        setSelectedPatientId(String(currentUser?.patientId || patientRecords[0]?.id || ""));
        setSelectedDoctorId(String(currentUser?.doctorId || doctorRecords[0]?.id || ""));
      })
      .catch(() => {
        if (active) {
          setPatients([]);
          setDoctors([]);
        }
      })
      .finally(() => active && setProfilesLoading(false));
    return () => { active = false; };
  }, []);

  const handleSelectUser = (user, redirectPath) => {
    switchUser(user);
    navigate(redirectPath);
  };

  const patientRecord = patients.find((record) => String(record.id) === selectedPatientId) || patients[0];
  const doctorRecord = doctors.find((record) => String(record.id) === selectedDoctorId) || doctors[0];
  const patient = patientRecord ? {
    id: `patient-${patientRecord.id}`,
    role: "Patient",
    name: `${patientRecord.firstName} ${patientRecord.lastName}`,
    email: patientRecord.email,
    patientId: patientRecord.id,
    label: `Patient: ${patientRecord.firstName} ${patientRecord.lastName}`
  } : users.find((u) => u.role === "Patient") || {
    id: "default-patient",
    role: "Patient",
    name: "Patient",
    email: "patient@example.com",
    patientId: 1
  };

  const doctor = doctorRecord ? {
    id: `doctor-${doctorRecord.id}`,
    role: "Doctor",
    name: doctorRecord.name,
    email: doctorRecord.email,
    doctorId: doctorRecord.id,
    specialization: doctorRecord.specialization,
    label: `${doctorRecord.name} (${doctorRecord.specialization})`
  } : users.find((u) => u.role === "Doctor") || {
    id: "default-doctor",
    role: "Doctor",
    name: "Clinic Physician",
    email: "physician@example.com",
    doctorId: 1,
    specialization: "General Medicine"
  };

  const administrator = users.find((u) => u.role === "Admin") || {
    id: "default-admin",
    role: "Admin",
    name: "System Administrator",
    email: "admin@example.com"
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-5 mx-auto" style={{ maxWidth: "650px" }}>
        <h2 className="fw-bold" style={{ color: 'var(--clinic-text)' }}>Select Your Role</h2>
        <p className="text-muted">
          Choose a demo profile to explore each workspace. This selector is a preview tool, not a sign-in or access-control system.
        </p>
        {currentUser && (
          <div className="alert alert-light border py-2 d-inline-block small mb-0">
            <i className="bi bi-person-circle me-1" style={{ color: 'var(--clinic-primary)' }} aria-hidden="true"></i>
            Currently signed in as: <strong>{currentUser.name}</strong> ({currentUser.role})
          </div>
        )}
      </div>

      <div className="row g-4 justify-content-center">
        {/* Patient Card */}
        <div className="col-md-4">
          <div
            className={`card h-100 shadow-sm ${
              currentUser?.role === "Patient" ? "border-2" : "border-0"
            }`}
            style={currentUser?.role === "Patient" ? { borderColor: 'var(--clinic-primary)' } : {}}
          >
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="portal-badge" style={{ backgroundColor: 'var(--clinic-primary-light)', color: 'var(--clinic-primary)' }}>
                  Patient
                </span>
                {currentUser?.role === "Patient" && (
                  <span className="badge text-white" style={{ backgroundColor: 'var(--clinic-primary)' }}>Active</span>
                )}
              </div>

              <div className="text-center my-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: '60px', height: '60px', fontSize: '1.8rem',
                    backgroundColor: 'var(--clinic-primary-light)',
                    color: 'var(--clinic-primary)'
                  }}
                  aria-hidden="true"
                >
                  <i className="bi bi-person-heart"></i>
                </div>
                <h5 className="fw-bold mb-0">{patient.name}</h5>
                <span className="text-muted small">{patient.email}</span>
              </div>

              <label className="form-label" htmlFor="patient-profile">Demo patient profile</label>
              <select
                id="patient-profile"
                className="form-select mb-3"
                value={selectedPatientId}
                onChange={(event) => setSelectedPatientId(event.target.value)}
                disabled={profilesLoading || patients.length === 0}
              >
                {patients.map((record) => (
                  <option key={record.id} value={record.id}>{record.firstName} {record.lastName} · #{record.id}</option>
                ))}
                {patients.length === 0 && <option value="">Use default demo profile</option>}
              </select>

              <div className="small text-muted mb-4 flex-grow-1">
                <div className="fw-bold mb-2" style={{ color: 'var(--clinic-text)' }}>Available features:</div>
                <ul className="ps-3 mb-0">
                  <li>Browse available doctors</li>
                  <li>Check time slot availability</li>
                  <li>Book appointments</li>
                  <li>View upcoming consultations</li>
                  <li>Reschedule or cancel appointments</li>
                </ul>
              </div>

              <div className="d-grid">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSelectUser(patient, "/patient/dashboard")}
                >
                  <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i> Continue as Patient
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Card */}
        <div className="col-md-4">
          <div
            className={`card h-100 shadow-sm ${
              currentUser?.role === "Doctor" ? "border-2 border-success" : "border-0"
            }`}
          >
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="portal-badge bg-success-subtle text-success">
                  Doctor
                </span>
                {currentUser?.role === "Doctor" && (
                  <span className="badge bg-success text-white">Active</span>
                )}
              </div>

              <div className="text-center my-3">
                <div
                  className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}
                  aria-hidden="true"
                >
                  <i className="bi bi-person-badge"></i>
                </div>
                <h5 className="fw-bold mb-0">{doctor.name}</h5>
                <span className="text-muted small">{doctor.specialization || "Physician"}</span>
              </div>

              <label className="form-label" htmlFor="doctor-profile">Demo doctor profile</label>
              <select
                id="doctor-profile"
                className="form-select mb-3"
                value={selectedDoctorId}
                onChange={(event) => setSelectedDoctorId(event.target.value)}
                disabled={profilesLoading || doctors.length === 0}
              >
                {doctors.map((record) => (
                  <option key={record.id} value={record.id}>{record.name} · {record.specialization}</option>
                ))}
                {doctors.length === 0 && <option value="">Use default demo profile</option>}
              </select>

              <div className="small text-muted mb-4 flex-grow-1">
                <div className="fw-bold mb-2" style={{ color: 'var(--clinic-text)' }}>Available features:</div>
                <ul className="ps-3 mb-0">
                  <li>View today's appointments</li>
                  <li>Review upcoming schedule</li>
                  <li>See patient details</li>
                  <li>Mark appointments as completed</li>
                </ul>
              </div>

              <div className="d-grid">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleSelectUser(doctor, "/doctor/dashboard")}
                >
                  <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i> Continue as Doctor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Administrator Card */}
        <div className="col-md-4">
          <div
            className={`card h-100 shadow-sm ${
              currentUser?.role === "Admin" ? "border-2 border-dark" : "border-0"
            }`}
          >
            <div className="card-body p-4 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="portal-badge bg-dark-subtle text-dark">
                  Administrator
                </span>
                {currentUser?.role === "Admin" && (
                  <span className="badge bg-dark text-white">Active</span>
                )}
              </div>

              <div className="text-center my-3">
                <div
                  className="rounded-circle bg-dark-subtle text-dark d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: '60px', height: '60px', fontSize: '1.8rem' }}
                  aria-hidden="true"
                >
                  <i className="bi bi-gear-fill"></i>
                </div>
                <h5 className="fw-bold mb-0">{administrator.name}</h5>
                <span className="text-muted small">Clinic Administration</span>
              </div>

              <div className="small text-muted mb-4 flex-grow-1">
                <div className="fw-bold mb-2" style={{ color: 'var(--clinic-text)' }}>Available features:</div>
                <ul className="ps-3 mb-0">
                  <li>Clinic-wide statistics</li>
                  <li>Manage registered patients</li>
                  <li>Add, update, or remove doctors</li>
                  <li>Oversee all appointments</li>
                  <li>Update appointment statuses</li>
                </ul>
              </div>

              <div className="d-grid">
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => handleSelectUser(administrator, "/admin/dashboard")}
                >
                  <i className="bi bi-box-arrow-in-right me-1" aria-hidden="true"></i> Continue as Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
