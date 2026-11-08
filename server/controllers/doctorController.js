import { getAll, getById, create, update, remove } from "../services/dataService.js";

const COLLECTION = "doctors";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidFee = (fee) =>
  fee !== undefined &&
  fee !== null &&
  fee !== "" &&
  Number.isFinite(Number(fee)) &&
  Number(fee) >= 0;

// GET /api/doctors
export const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    let doctors = await getAll(COLLECTION);

    if (specialization && specialization !== "All") {
      doctors = doctors.filter(
        (d) =>
          (d.specialization || "").toLowerCase() ===
          specialization.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();

      doctors = doctors.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(q) ||
          (d.specialization || "").toLowerCase().includes(q) ||
          (d.email || "").toLowerCase().includes(q) ||
          (d.phone || "").includes(q)
      );
    }

    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await getById(COLLECTION, req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found."
      });
    }

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};

// POST /api/doctors
export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      consultationFee
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !specialization?.trim() ||
      !isValidFee(consultationFee)
    ) {
      return res.status(400).json({
        message:
          "Name, email, phone, specialization, and a valid consultation fee are required."
      });
    }

    if (!isValidEmail(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address."
      });
    }

    const newDoctor = await create(COLLECTION, {
      name: name.trim().startsWith("Dr.")
        ? name.trim()
        : `Dr. ${name.trim()}`,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      specialization: specialization.trim(),
      consultationFee: Number(consultationFee)
    });

    res.status(201).json({
      message: "Doctor added successfully.",
      doctor: newDoctor
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/doctors/:id
export const updateDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      consultationFee
    } = req.body;

    const existing = await getById(COLLECTION, req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Doctor not found."
      });
    }

    if (email !== undefined && !isValidEmail(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address."
      });
    }

    if (
      consultationFee !== undefined &&
      !isValidFee(consultationFee)
    ) {
      return res.status(400).json({
        message:
          "Consultation fee must be a valid non-negative number."
      });
    }

    const updated = await update(COLLECTION, req.params.id, {
      ...(name !== undefined
        ? {
          name: name.trim().startsWith("Dr.")
            ? name.trim()
            : `Dr. ${name.trim()}`
        }
        : {}),
      ...(email !== undefined
        ? { email: email.trim().toLowerCase() }
        : {}),
      ...(phone !== undefined
        ? { phone: phone.trim() }
        : {}),
      ...(specialization !== undefined
        ? { specialization: specialization.trim() }
        : {}),
      ...(consultationFee !== undefined
        ? { consultationFee: Number(consultationFee) }
        : {})
    });

    res.json({
      message: "Doctor updated successfully.",
      doctor: updated
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/doctors/:id
export const deleteDoctor = async (req, res, next) => {
  try {
    const existing = await getById(COLLECTION, req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Doctor not found."
      });
    }

    const appointments = await getAll("appointments");

    const activeAppts = appointments.filter(
      (a) =>
        String(a.doctorId) === String(req.params.id) &&
        a.status === "Scheduled"
    );

    if (activeAppts.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete doctor with active scheduled appointments. Please reassign or cancel them first."
      });
    }

    await remove(COLLECTION, req.params.id);

    res.json({
      message: "Doctor removed successfully."
    });
  } catch (error) {
    next(error);
  }
};
