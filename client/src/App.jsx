import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoleRoute from "./components/ProtectedRoleRoute";

// Pages
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import RoleSelection from "./pages/RoleSelection";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientAppointments from "./pages/patient/PatientAppointments";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePatients from "./pages/admin/ManagePatients";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManageAppointments from "./pages/admin/ManageAppointments";

function App() {
  return (
    <RoleProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />

        <main className="flex-grow-1">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/roles" element={<RoleSelection />} />
            <Route path="/demo" element={<Navigate to="/roles" replace />} />
            <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoleRoute allowedRoles={["Patient"]}>
                  <PatientDashboard />
                </ProtectedRoleRoute>
              }
            />
            <Route
              path="/patient/book"
              element={
                <ProtectedRoleRoute allowedRoles={["Patient"]}>
                  <BookAppointment />
                </ProtectedRoleRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoleRoute allowedRoles={["Patient"]}>
                  <PatientAppointments />
                </ProtectedRoleRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoleRoute allowedRoles={["Doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoleRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <ProtectedRoleRoute allowedRoles={["Doctor"]}>
                  <DoctorAppointments />
                </ProtectedRoleRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoleRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoleRoute>
              }
            />
            <Route
              path="/admin/patients"
              element={
                <ProtectedRoleRoute allowedRoles={["Admin"]}>
                  <ManagePatients />
                </ProtectedRoleRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoleRoute allowedRoles={["Admin"]}>
                  <ManageDoctors />
                </ProtectedRoleRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoleRoute allowedRoles={["Admin"]}>
                  <ManageAppointments />
                </ProtectedRoleRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </RoleProvider>
  );
}

export default App;
