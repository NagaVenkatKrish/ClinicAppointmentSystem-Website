import { getAll, getById, create, update, remove } from "../services/dataService.js";

const COLLECTION = "appointments";

const CLINIC_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30"
];

// Helper to validate date format (YYYY-MM-DD)
const isValidDateFormat = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

// Helper to validate time format (HH:mm)
const isValidTimeFormat = (timeStr) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr)) return false;
  return true;
};

// Helper to enrich appointment with patient and doctor details
const enrichAppointment = async (appt, patientsList = null, doctorsList = null) => {
  const patients = patientsList || (await getAll("patients"));
  const doctors = doctorsList || (await getAll("doctors"));

  const patient = patients.find((p) => String(p.id) === String(appt.patientId));
  const doctor = doctors.find((d) => String(d.id) === String(appt.doctorId));

  return {
    ...appt,
    patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
    patientEmail: patient?.email || "N/A",
    patientPhone: patient?.phone || "N/A",
    doctorName: doctor?.name || "Unknown Doctor",
    doctorSpecialization: doctor?.specialization || "General",
    doctorEmail: doctor?.email || "N/A",
    doctorPhone: doctor?.phone || "N/A"
  };
};

// GET /api/appointments
export const getAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId, status, date } = req.query;

    const [allAppts, patients, doctors] = await Promise.all([
      getAll(COLLECTION),
      getAll("patients"),
      getAll("doctors")
    ]);

    let filtered = allAppts;

    if (doctorId) {
      filtered = filtered.filter((a) => String(a.doctorId) === String(doctorId));
    }

    if (patientId) {
      filtered = filtered.filter((a) => String(a.patientId) === String(patientId));
    }

    if (status && status !== "All") {
      filtered = filtered.filter((a) => (a.status || "").toLowerCase() === status.toLowerCase());
    }

    if (date) {
      filtered = filtered.filter((a) => a.date === date);
    }

    // Sort by date and time ascending
    filtered.sort((a, b) => {
      const cmpDate = (a.date || "").localeCompare(b.date || "");
      if (cmpDate !== 0) return cmpDate;
      return (a.time || "").localeCompare(b.time || "");
    });

    const enriched = filtered.map((appt) => {
      const patient = patients.find((p) => String(p.id) === String(appt.patientId));
      const doctor = doctors.find((d) => String(d.id) === String(appt.doctorId));
      return {
        ...appt,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
        patientEmail: patient?.email || "N/A",
        patientPhone: patient?.phone || "N/A",
        doctorName: doctor?.name || "Unknown Doctor",
        doctorSpecialization: doctor?.specialization || "General",
        doctorEmail: doctor?.email || "N/A",
        doctorPhone: doctor?.phone || "N/A"
      };
    });

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/:id
export const getAppointmentById = async (req, res, next) => {
  try {
    const appt = await getById(COLLECTION, req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }
    const enriched = await enrichAppointment(appt);
    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

// POST /api/appointments
// 1. verify patient exists
// 2. verify doctor exists
// 3. validate date/time
// 4. check whether same doctor already has active appointment at same date/time
// 5. reject duplicate booking
// 6. create a Scheduled appointment when available
export const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, time, reason } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Patient ID, Doctor ID, date, and time are required."
      });
    }

    // 1. Verify referenced patient exists
    const patient = await getById("patients", patientId);
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Referenced patient does not exist."
      });
    }

    // 2. Verify referenced doctor exists
    const doctor = await getById("doctors", doctorId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Referenced doctor does not exist."
      });
    }

    // 3. Validate date/time format
    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date format. Please use YYYY-MM-DD."
      });
    }

    if (!isValidTimeFormat(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment time format. Please use HH:mm."
      });
    }

    // 4 & 5. Double-Booking Prevention:
    // Check whether another non-cancelled appointment already exists for:
    // same doctor, same date, same time
    const existingAppointments = await getAll(COLLECTION);
    const conflict = existingAppointments.find(
      (a) =>
        String(a.doctorId) === String(doctorId) &&
        a.date === date &&
        a.time === time &&
        a.status !== "Cancelled"
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Appointment slot is already booked. Please select another time."
      });
    }

    // 6. Create a Scheduled appointment when available
    const newAppointment = await create(COLLECTION, {
      patientId: Number(patientId) || patientId,
      doctorId: Number(doctorId) || doctorId,
      date,
      time,
      status: "Scheduled",
      reason: reason?.trim() || "General Consultation"
    });

    const enriched = await enrichAppointment(newAppointment);

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      appointment: enriched
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/appointments/:id
// Handles status changes and rescheduling
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, date, time, reason, doctorId, patientId } = req.body;

    const existing = await getById(COLLECTION, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    const targetDoctorId = doctorId !== undefined ? doctorId : existing.doctorId;
    const targetDate = date !== undefined ? date : existing.date;
    const targetTime = time !== undefined ? time : existing.time;
    const targetStatus = status !== undefined ? status : existing.status;

    // Validate status values
    if (status && !["Scheduled", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values are Scheduled, Completed, or Cancelled."
      });
    }

    // Validate date & time if provided
    if (date && !isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date format. Please use YYYY-MM-DD."
      });
    }

    if (time && !isValidTimeFormat(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment time format. Please use HH:mm."
      });
    }

    // Verify patient or doctor if modified
    if (patientId) {
      const patient = await getById("patients", patientId);
      if (!patient) {
        return res.status(400).json({ success: false, message: "Referenced patient does not exist." });
      }
    }

    if (doctorId) {
      const doctor = await getById("doctors", doctorId);
      if (!doctor) {
        return res.status(400).json({ success: false, message: "Referenced doctor does not exist." });
      }
    }

    // If rescheduling (date, time, or doctor changed) or reactivating, check for conflict
    const isScheduleChange =
      String(targetDoctorId) !== String(existing.doctorId) ||
      targetDate !== existing.date ||
      targetTime !== existing.time;
    const isReactivating =
      existing.status !== "Scheduled" && targetStatus === "Scheduled";

    if ((isScheduleChange || isReactivating) && targetStatus === "Scheduled") {
      const allAppts = await getAll(COLLECTION);
      const conflict = allAppts.find(
        (a) =>
          String(a.id) !== String(id) &&
          String(a.doctorId) === String(targetDoctorId) &&
          a.date === targetDate &&
          a.time === targetTime &&
          a.status !== "Cancelled"
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "Appointment slot is already booked. Please select another time."
        });
      }
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (date !== undefined) updates.date = date;
    if (time !== undefined) updates.time = time;
    if (reason !== undefined) updates.reason = reason ? reason.trim() : "General Consultation";
    if (doctorId !== undefined) updates.doctorId = Number(doctorId) || doctorId;
    if (patientId !== undefined) updates.patientId = Number(patientId) || patientId;

    const updated = await update(COLLECTION, id, updates);
    const enriched = await enrichAppointment(updated);

    res.json({
      success: true,
      message: "Appointment updated successfully.",
      appointment: enriched
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/appointments/:id
// Cancel or remove appointment
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getById(COLLECTION, id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    // By requirement: cancellation sets status = 'Cancelled' rather than hard deleting to preserve history,
    // but if delete is explicitly requested with query ?hard=true we can delete, otherwise soft-cancel.
    if (req.query.hard === "true") {
      await remove(COLLECTION, id);
      return res.json({ success: true, message: "Appointment deleted permanently." });
    }

    const updated = await update(COLLECTION, id, { status: "Cancelled" });
    const enriched = await enrichAppointment(updated);

    res.json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment: enriched
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/appointments/availability
// Query: ?doctorId=1&date=2026-10-07
export const getAvailability = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "Both doctorId and date query parameters are required."
      });
    }

    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD."
      });
    }

    const doctor = await getById("doctors", doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found."
      });
    }

    const allAppts = await getAll(COLLECTION);
    const doctorAppts = allAppts.filter(
      (a) =>
        String(a.doctorId) === String(doctorId) &&
        a.date === date &&
        a.status !== "Cancelled"
    );

    const bookedTimes = new Set(doctorAppts.map((a) => a.time));

    const slotAvailability = CLINIC_SLOTS.map((time) => ({
      time,
      isAvailable: !bookedTimes.has(time),
      status: bookedTimes.has(time) ? "Booked" : "Available"
    }));

    res.json({
      doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date,
      slots: slotAvailability
    });
  } catch (error) {
    next(error);
  }
};
