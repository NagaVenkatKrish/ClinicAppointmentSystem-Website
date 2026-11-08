import express from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailability
} from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/availability", getAvailability);
router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
