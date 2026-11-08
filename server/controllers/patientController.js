
import { getAll, getById, create, update, remove } from "../services/dataService.js";

const COLLECTION = "patients";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidAge = (age) =>
  Number.isInteger(Number(age)) &&
  Number(age) >= 0 &&
  Number(age) <= 120;

const isValidGender = (gender) =>
  ["Male", "Female", "Other"].includes(gender);

// GET /api/patients
export const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    let patients = await getAll(COLLECTION);

    if (search) {
      const q = search.toLowerCase();

      patients = patients.filter((p) => {
        const first = (p.firstName || "").toLowerCase();
        const last = (p.lastName || "").toLowerCase();
        const full = `${first} ${last}`.trim();
        const email = (p.email || "").toLowerCase();
        const phone = p.phone || "";

        return (
          first.includes(q) ||
          last.includes(q) ||
          full.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
      });
    }

    res.json(patients);
  } catch (error) {
    next(error);
  }
};

// GET /api/patients/:id
export const getPatientById = async (req, res, next) => {
  try {
    const patient = await getById(COLLECTION, req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found."
      });
    }

    res.json(patient);
  } catch (error) {
    next(error);
  }
};

// POST /api/patients
export const createPatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      age,
      gender,
      address
    } = req.body;

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      age === undefined ||
      age === null ||
      !gender ||
      !address?.trim()
    ) {
      return res.status(400).json({
        message:
          "First name, last name, email, phone, age, gender, and address are required."
      });
    }

    if (!isValidEmail(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address."
      });
    }

    if (!isValidAge(age)) {
      return res.status(400).json({
        message: "Age must be a whole number between 0 and 120."
      });
    }

    if (!isValidGender(gender)) {
      return res.status(400).json({
        message: "Gender must be Male, Female, or Other."
      });
    }

    const newPatient = await create(COLLECTION, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      age: Number(age),
      gender,
      address: address.trim()
    });

    res.status(201).json({
      message: "Patient registered successfully.",
      patient: newPatient
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/patients/:id
export const updatePatient = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      age,
      gender,
      address
    } = req.body;

    const existing = await getById(COLLECTION, req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Patient not found."
      });
    }

    if (email !== undefined && !isValidEmail(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address."
      });
    }

    if (age !== undefined && !isValidAge(age)) {
      return res.status(400).json({
        message: "Age must be a whole number between 0 and 120."
      });
    }

    if (gender !== undefined && !isValidGender(gender)) {
      return res.status(400).json({
        message: "Gender must be Male, Female, or Other."
      });
    }

    const updated = await update(COLLECTION, req.params.id, {
      ...(firstName !== undefined
        ? { firstName: firstName.trim() }
        : {}),
      ...(lastName !== undefined
        ? { lastName: lastName.trim() }
        : {}),
      ...(email !== undefined
        ? { email: email.trim().toLowerCase() }
        : {}),
      ...(phone !== undefined
        ? { phone: phone.trim() }
        : {}),
      ...(age !== undefined
        ? { age: Number(age) }
        : {}),
      ...(gender !== undefined
        ? { gender }
        : {}),
      ...(address !== undefined
        ? { address: address.trim() }
        : {})
    });

    res.json({
      message: "Patient updated successfully.",
      patient: updated
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/patients/:id
export const deletePatient = async (req, res, next) => {
  try {
    const existing = await getById(COLLECTION, req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Patient not found."
      });
    }

    const appointments = await getAll("appointments");

    const activeAppts = appointments.filter(
      (a) =>
        String(a.patientId) === String(req.params.id) &&
        a.status === "Scheduled"
    );

    if (activeAppts.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete patient with active scheduled appointments. Please cancel their appointments first."
      });
    }

    await remove(COLLECTION, req.params.id);

    res.json({
      message: "Patient removed successfully."
    });
  } catch (error) {
    next(error);
  }
};
