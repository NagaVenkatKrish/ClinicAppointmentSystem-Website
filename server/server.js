import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { getAll } from "./services/dataService.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// API Info endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Clinic Appointment System API",
    version: "1.0.0",
    status: "Active",
    storage: "Local JSON Persistent Storage"
  });
});

// Health check with data diagnostics
app.get("/api/health", async (req, res) => {
  try {
    const [patients, doctors, appointments] = await Promise.all([
      getAll("patients"),
      getAll("doctors"),
      getAll("appointments")
    ]);
    res.json({
      server: "OK",
      storage: "JSON_FILES_PERSISTED",
      counts: {
        patients: patients.length,
        doctors: doctors.length,
        appointments: appointments.length
      }
    });
  } catch (error) {
    res.status(500).json({ server: "ERROR", message: error.message });
  }
});

// Routes
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Only listen if not already listening
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🏥 Clinic Appointment Server running at http://localhost:${PORT} (127.0.0.1:${PORT})`);
});

export default app;
