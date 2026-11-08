import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Patients API
export const getPatients = async (search = "") => {
  const res = await api.get("/patients", { params: { search } });
  return res.data;
};

export const getPatientById = async (id) => {
  const res = await api.get(`/patients/${id}`);
  return res.data;
};

export const createPatient = async (patientData) => {
  const res = await api.post("/patients", patientData);
  return res.data;
};

export const updatePatient = async (id, patientData) => {
  const res = await api.put(`/patients/${id}`, patientData);
  return res.data;
};

export const deletePatient = async (id) => {
  const res = await api.delete(`/patients/${id}`);
  return res.data;
};

// Doctors API
export const getDoctors = async (specialization = "", search = "") => {
  const res = await api.get("/doctors", {
    params: { specialization, search }
  });
  return res.data;
};

export const getDoctorById = async (id) => {
  const res = await api.get(`/doctors/${id}`);
  return res.data;
};

export const createDoctor = async (doctorData) => {
  const res = await api.post("/doctors", doctorData);
  return res.data;
};

export const updateDoctor = async (id, doctorData) => {
  const res = await api.put(`/doctors/${id}`, doctorData);
  return res.data;
};

export const deleteDoctor = async (id) => {
  const res = await api.delete(`/doctors/${id}`);
  return res.data;
};

// Appointments API
export const getAppointments = async (params = {}) => {
  const res = await api.get("/appointments", { params });
  return res.data;
};

export const getAppointmentById = async (id) => {
  const res = await api.get(`/appointments/${id}`);
  return res.data;
};

export const createAppointment = async (appointmentData) => {
  const res = await api.post("/appointments", appointmentData);
  return res.data;
};

export const updateAppointment = async (id, updateData) => {
  const res = await api.put(`/appointments/${id}`, updateData);
  return res.data;
};

export const cancelAppointment = async (id) => {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
};

export const deleteAppointmentPermanently = async (id) => {
  const res = await api.delete(`/appointments/${id}`, { params: { hard: "true" } });
  return res.data;
};

// Availability API
export const getAvailability = async (doctorId, date) => {
  const res = await api.get("/appointments/availability", {
    params: { doctorId, date }
  });
  return res.data;
};

// Dashboard API
export const getDashboardStats = async (role = "Admin", extraParams = {}) => {
  const res = await api.get("/dashboard/stats", {
    params: { role, ...extraParams }
  });
  return res.data;
};

// Clinic users API
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

// System Health API
export const getHealth = async () => {
  const res = await api.get("/health");
  return res.data;
};

export default api;
