import { getAll } from "../services/dataService.js";

// Helper for formatted today string
const getTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// GET /api/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const { role = "Admin", patientId, doctorId } = req.query;
    const today = getTodayString();

    const [patients, doctors, appointments] = await Promise.all([
      getAll("patients"),
      getAll("doctors"),
      getAll("appointments")
    ]);

    if (role === "Admin") {
      const scheduled = appointments.filter((a) => a.status === "Scheduled").length;
      const completed = appointments.filter((a) => a.status === "Completed").length;
      const cancelled = appointments.filter((a) => a.status === "Cancelled").length;

      return res.json({
        role: "Admin",
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalAppointments: appointments.length,
        scheduled,
        completed,
        cancelled
      });
    }

    if (role === "Patient") {
      const pId = patientId || 1; // Default to first patient if not specified
      const patientAppts = appointments.filter((a) => String(a.patientId) === String(pId));

      const scheduledAppts = patientAppts
        .filter((a) => a.status === "Scheduled" && a.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

      const nextAppointment = scheduledAppts[0] || null;
      let enrichedNextAppointment = null;
      if (nextAppointment) {
        const doctor = doctors.find((d) => String(d.id) === String(nextAppointment.doctorId));
        enrichedNextAppointment = {
          ...nextAppointment,
          doctorName: doctor?.name || "Doctor",
          doctorSpecialization: doctor?.specialization || "General"
        };
      }

      const completed = patientAppts.filter((a) => a.status === "Completed").length;
      const cancelled = patientAppts.filter((a) => a.status === "Cancelled").length;

      return res.json({
        role: "Patient",
        patientId: pId,
        totalAppointments: patientAppts.length,
        upcomingCount: scheduledAppts.length,
        upcomingAppointment: enrichedNextAppointment,
        completed,
        cancelled
      });
    }

    if (role === "Doctor") {
      const dId = doctorId || 1; // Default to first doctor if not specified
      const doctorAppts = appointments.filter((a) => String(a.doctorId) === String(dId));

      const todayAppointments = doctorAppts.filter(
        (a) => a.date === today && a.status === "Scheduled"
      );

      const upcoming = doctorAppts.filter(
        (a) => (a.date > today || (a.date === today && a.status === "Scheduled")) && a.status === "Scheduled"
      );

      const completed = doctorAppts.filter((a) => a.status === "Completed").length;
      const cancelled = doctorAppts.filter((a) => a.status === "Cancelled").length;

      return res.json({
        role: "Doctor",
        doctorId: dId,
        totalAppointments: doctorAppts.length,
        todayAppointmentsCount: todayAppointments.length,
        upcomingCount: upcoming.length,
        completed,
        cancelled
      });
    }

    res.status(400).json({ message: "Invalid role specified." });
  } catch (error) {
    next(error);
  }
};
