import React, { useState, useEffect } from "react";
import { getAppointments, updateAppointment, getDoctors, deleteAppointmentPermanently } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";
import { FormattedDate } from "../../utils/dateUtils";

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [apptsData, docsData] = await Promise.all([
        getAppointments({
          doctorId: selectedDoctorId,
          status: selectedStatus === "All" ? "" : selectedStatus,
          date: selectedDate
        }),
        getDoctors()
      ]);
      setAppointments(apptsData);
      setDoctors(docsData);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to load clinic appointments." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDoctorId, selectedStatus, selectedDate]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      setAlert({
        type: "success",
        message: `Appointment #${appointmentId} status changed to ${newStatus}.`
      });
      loadData();
    } catch (err) {
      setAlert({
        type: "danger",
        message: err.response?.data?.message || "Failed to update status."
      });
    }
  };

  const handleDeletePermanent = async (appt) => {
    if (!window.confirm(`Permanently delete appointment #${appt.id}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteAppointmentPermanently(appt.id);
      setAlert({ type: "success", message: `Appointment #${appt.id} removed permanently.` });
      loadData();
    } catch (err) {
      setAlert({
        type: "danger",
        message: err.response?.data?.message || "Failed to delete appointment."
      });
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (a.patientName && a.patientName.toLowerCase().includes(q)) ||
      (a.doctorName && a.doctorName.toLowerCase().includes(q)) ||
      (a.reason && a.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-calendar3-range-fill text-primary me-2"></i>
            Manage Clinic Appointments
          </h2>
          <p className="text-muted small mb-0">
            Comprehensive clinic booking roster with override status controls and schedule tracking.
          </p>
        </div>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 mt-2 mt-md-0">
          {filteredAppointments.length} Appointments Displayed
        </span>
      </div>

      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />

      {/* Filter Toolbar */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label text-muted small fw-bold mb-1">SEARCH</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search patient, doctor, reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label text-muted small fw-bold mb-1">FILTER DOCTOR</label>
              <select
                className="form-select form-select-sm"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold mb-1">STATUS</label>
              <select
                className="form-select form-select-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label text-muted small fw-bold mb-1">DATE</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={() => {
                  setSearch("");
                  setSelectedDoctorId("");
                  setSelectedStatus("All");
                  setSelectedDate("");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Master Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading all clinic appointments..." />
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: "3rem" }}></i>
              <h5 className="mt-3">No Appointments Found</h5>
              <p className="small">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Manage Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td className="ps-4 fw-medium text-muted">#{appt.id}</td>
                      <td>
                        <span className="fw-semibold text-dark">{appt.patientName}</span>
                        <div className="small text-muted">{appt.patientPhone}</div>
                      </td>
                      <td>
                        <div>{appt.doctorName}</div>
                        <span className="badge bg-light text-muted border" style={{ fontSize: "0.7rem" }}>
                          {appt.doctorSpecialization}
                        </span>
                      </td>
                      <td>
                        <div><i className="bi bi-calendar3 me-1 text-primary"></i><FormattedDate date={appt.date} /></div>
                        <div className="text-muted small"><i className="bi bi-clock me-1"></i>{appt.time}</div>
                      </td>
                      <td>
                        <span className="text-secondary small text-truncate d-inline-block" style={{ maxWidth: "180px" }}>
                          {appt.reason}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group btn-group-sm">
                          <select
                            className="form-select form-select-sm py-0 pe-4 d-inline-block"
                            style={{ width: "auto", fontSize: "0.8rem" }}
                            value={appt.status}
                            onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm ms-1"
                            title="Delete Permanently"
                            onClick={() => handleDeletePermanent(appt)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAppointments;
