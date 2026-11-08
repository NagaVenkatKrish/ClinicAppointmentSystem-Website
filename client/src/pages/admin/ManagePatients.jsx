import React, { useState, useEffect } from "react";
import { getPatients, createPatient, updatePatient, deletePatient } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import AlertMessage from "../../components/AlertMessage";

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    address: " "
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setAlert({ type: "danger", message: "Failed to fetch patients directory." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData({ firstName: "", lastName: "", email: "", phone: "", age: "", gender: "Male", address: "" });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPatient(p);
    setFormData({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      email: p.email || "",
      phone: p.phone || "",
      age: p.age ?? "",
      gender: p.gender ?? "Male",
      address: p.address ?? ""
    });
    setFormError("");
    setShowModal(true);
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Are you sure you want to remove patient "${p.firstName} ${p.lastName}"?`)) {
      return;
    }

    try {
      await deletePatient(p.id);
      setAlert({ type: "success", message: `Patient ${p.firstName} ${p.lastName} removed.` });
      loadPatients();
    } catch (err) {
      setAlert({
        type: "danger",
        message: err.response?.data?.message || "Failed to delete patient."
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || formData.age === "" || !formData.gender || !formData.address.trim()) {
      setFormError("All fields are required.");
      return;
    }
    const age = Number(formData.age);
    if (!Number.isInteger(age) || age < 0 || age > 120) {
      setFormError("Age must be a whole number between 0 and 120.");
      return;
    }
    try {
      setFormSubmitting(true);
      if (editingPatient) {
        await updatePatient(editingPatient.id, formData);
        setAlert({ type: "success", message: "Patient updated successfully." });
      } else {
        await createPatient(formData);
        setAlert({ type: "success", message: "Patient registered successfully." });
      }
      setShowModal(false);
      loadPatients();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save patient.");
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
            <i className="bi bi-people-fill text-primary me-2"></i>
            Manage Patients
          </h2>
          <p className="text-muted small mb-0">
            View patient medical registrations, add new patient profiles, or edit contact details.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center mt-2 mt-md-0"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-person-plus me-2"></i> Register New Patient
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
              placeholder="Search patients by name, email, or phone number..."
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

      {/* Patients Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading patients directory..." />
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-person-x text-muted" style={{ fontSize: "3rem" }}></i>
              <h5 className="mt-3">No Patients Found</h5>
              <p className="small">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr key={p.id}>
                      <td className="ps-4 fw-medium text-muted">#{p.id}</td>
                      <td>
                        <span className="fw-semibold text-dark">
                          {p.firstName} {p.lastName}
                        </span>
                      </td>
                      <td>{p.age ?? "__"}</td>
                      <td>{p.gender ?? "__"}</td>
                      <td>
                        <i className="bi bi-envelope me-1 text-muted"></i>
                        {p.email}
                      </td>
                      <td>
                        <i className="bi bi-telephone me-1 text-muted"></i>
                        {p.phone}
                      </td>
                      <td>
                        <span
                          className="text-secondary small text-truncate d-inline-block"
                          style={{ maxWidth: "220px" }}
                          title={p.address}
                        >
                          <i className="bi bi-geo-alt me-1 text-muted"></i>
                          {p.address || "—"}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <i className="bi bi-pencil me-1"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(p)}
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

      {/* Patient Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-gear me-2 text-primary"></i>
                  {editingPatient ? "Edit Patient Record" : "Register New Patient"}
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
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">FIRST NAME</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">LAST NAME</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. john.doe@example.com"
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
                        placeholder="e.g. +1 (212) 839-4412"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">AGE</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Age"
                        min="0"
                        max="120"
                        step="1"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">GENDER</label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">ADDRESS</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Enter street, city, state, country"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
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
                      "Save Patient"
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

export default ManagePatients;
