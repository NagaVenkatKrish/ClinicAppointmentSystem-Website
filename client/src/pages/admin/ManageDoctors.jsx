import React, { useState, useEffect } from "react";
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "General Medicine",
  "ENT",
  "Gynecology"
];

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "General Medicine",
    email: "",
    phone: "",
    consultationFee: '500'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to fetch doctors directory." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (doc.name && doc.name.toLowerCase().includes(q)) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
      (doc.email && doc.email.toLowerCase().includes(q)) ||
      (doc.phone && doc.phone.includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      name: "",
      specialization: "General Medicine",
      email: "",
      phone: "",
      consultationFee: '500'
    });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name || "",
      specialization: doc.specialization || "General Medicine",
      email: doc.email || "",
      phone: doc.phone || "",
      consultationFee: String(doc.consultationFee ?? 500)
    });
    setFormError("");
    setShowModal(true);
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to remove doctor "${doc.name}"?`)) {
      return;
    }

    try {
      await deleteDoctor(doc.id);
      setAlert({ type: "success", message: `Doctor ${doc.name} removed successfully.` });
      loadDoctors();
    } catch (err) {
      setAlert({
        type: "danger",
        message: err.response?.data?.message || "Failed to remove doctor."
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.specialization.trim() || formData.consultationFee === "") {
      setFormError("All doctor fields are required.");
      return;
    }
    const fee = Number(formData.consultationFee);
    if (!Number.isFinite(fee) || fee < 0) {
      setFormError("Consultation Fee must be a valid non-negative number.");
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, formData);
        setAlert({ type: "success", message: "Doctor record updated successfully." });
      } else {
        await createDoctor(formData);
        setAlert({ type: "success", message: "Doctor added successfully." });
      }
      setShowModal(false);
      loadDoctors();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save doctor.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-heart-pulse-fill text-danger me-2"></i>
            Manage Doctors
          </h2>
          <p className="text-muted small mb-0">
            Maintain the roster of clinic medical practitioners and their clinical specialties.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center mt-2 mt-md-0"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-circle me-2"></i> Add Doctor
        </button>
      </div>

      <AlertMessage
        type={alert?.type}
        message={alert?.message}
        onClose={() => setAlert(null)}
      />

      {/* Search Bar */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search doctors by name, specialty, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading doctors directory..." />
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-person-x text-muted" style={{ fontSize: "3rem" }}></i>
              <h5 className="mt-3">No Doctors Found</h5>
              <p className="small">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Consultation Fee</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id}>
                      <td className="ps-4 fw-medium text-muted">#{doc.id}</td>
                      <td>
                        <span className="fw-semibold text-dark">{doc.name}</span>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {doc.specialization}
                        </span>
                      </td>
                      <td>
                        <i className="bi bi-envelope me-1 text-muted"></i>
                        {doc.email}
                      </td>
                      <td>
                        <i className="bi bi-telephone me-1 text-muted"></i>
                        {doc.phone}
                      </td>
                      <td className="fw-semibold text-success">
                        ₹{Number(doc.consultationFee ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="text-end pe-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleOpenEdit(doc)}>
                          <i className="bi bi-pencil me-1"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(doc)}
                        >
                          <i className="bi bi-trash me-1"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Doctor Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-badge me-2 text-primary"></i>
                  {editingDoctor ? "Edit Doctor Profile" : "Add New Medical Specialist"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body p-4">
                  <AlertMessage
                    type="danger"
                    message={formError}
                    onClose={() => setFormError("")}
                  />

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">FULL NAME</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Dr. John Carter"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">SPECIALIZATION</label>
                      <select
                        className="form-select"
                        value={formData.specialization}
                        onChange={(e) =>
                          setFormData({ ...formData, specialization: e.target.value })
                        }
                        required
                      >
                        {SPECIALIZATIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. dr.carter@cliniccare.example"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">PHONE NUMBER</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. 555-0182"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">
                        CONSULTATION FEE (₹)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter consultation fee"
                        min="0"
                        step="0.01"
                        value={formData.consultationFee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            consultationFee: e.target.value
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fw-medium"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Doctor"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
