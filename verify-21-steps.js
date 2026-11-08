// Verify role-based clinic appointment flows end to end.
import fs from "fs/promises";
import path from "path";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api";
const DATA_DIR = path.resolve("./server/data");

const readJson = async (filename) => {
  const data = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(data);
};

const assert = (condition, stepNum, description) => {
  if (!condition) {
    console.error(`❌ [STEP ${stepNum} FAILED]: ${description}`);
    process.exit(1);
  }
  console.log(`✅ [STEP ${stepNum} PASSED]: ${description}`);
};

async function verifyClinicFlows() {
  console.log("======================================================================");
  console.log("🏥 VERIFYING CLINIC APPOINTMENT FLOWS");
  console.log("======================================================================\n");

  // Step 1: Select the patient account
  const usersRes = await fetch(`${API_BASE}/users`);
  const users = await usersRes.json();
  const patientUser = users.find((u) => u.role === "Patient");
  assert(patientUser && patientUser.patientId, 1, `Select Patient (${patientUser.name}, PatientID: ${patientUser.patientId})`);

  // Step 2: Confirm patients and doctors are available
  const [patientsRes, doctorsRes] = await Promise.all([
    fetch(`${API_BASE}/patients`),
    fetch(`${API_BASE}/doctors`)
  ]);
  const patients = await patientsRes.json();
  const doctors = await doctorsRes.json();
  assert(
    patients.length >= 20 && doctors.length >= 10,
    2,
    `Display clinic patients (${patients.length}) and doctors (${doctors.length})`
  );

  // Step 3: Select a doctor
  const selectedDoctor = doctors[0];
  assert(selectedDoctor && selectedDoctor.id, 3, `Selected Doctor: ${selectedDoctor.name} (${selectedDoctor.specialization})`);

  // Step 4: Select a date
  const targetDate = "2026-11-25";
  assert(targetDate, 4, `Selected appointment date: ${targetDate}`);

  // Step 5: Select a time slot
  const availRes = await fetch(`${API_BASE}/appointments/availability?doctorId=${selectedDoctor.id}&date=${targetDate}`);
  const availData = await availRes.json();
  const openSlot = availData.slots.find((s) => s.isAvailable);
  assert(openSlot, 5, `Selected available time slot: ${openSlot.time}`);

  // Step 6: Book an appointment
  const bookRes = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: patientUser.patientId,
      doctorId: selectedDoctor.id,
      date: targetDate,
      time: openSlot.time,
      reason: "Workflow evaluation consultation"
    })
  });
  const bookData = await bookRes.json();
  assert(bookRes.status === 201 && bookData.appointment, 6, "Book an appointment via Express API");
  const bookedAppt = bookData.appointment;

  // Step 7: Display success
  assert(
    bookData.success === true &&
    bookData.appointment.status === "Scheduled" &&
    bookData.appointment.patientName &&
    bookData.appointment.doctorName,
    7,
    `Display success: Appointment #${bookedAppt.id} scheduled for ${bookedAppt.patientName} with ${bookedAppt.doctorName}`
  );

  // Step 8 & 9: Attempt to book the same doctor/date/time again & Display an unavailable-slot error
  const duplicateRes = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: patients[1].id,
      doctorId: selectedDoctor.id,
      date: targetDate,
      time: openSlot.time,
      reason: "Conflicting duplicate attempt"
    })
  });
  const duplicateData = await duplicateRes.json();
  assert(
    duplicateRes.status === 409,
    8,
    "Attempt to book the same doctor/date/time again triggers conflict (HTTP 409)"
  );
  assert(
    duplicateData.message === "Appointment slot is already booked. Please select another time.",
    9,
    `Display unavailable-slot error message: "${duplicateData.message}"`
  );

  // Step 10: Show the appointment in the patient's appointment list
  const patApptsRes = await fetch(`${API_BASE}/appointments?patientId=${patientUser.patientId}`);
  const patAppts = await patApptsRes.json();
  const foundInList = patAppts.find((a) => a.id === bookedAppt.id);
  assert(
    foundInList && foundInList.status === "Scheduled",
    10,
    `Show the appointment in the patient's appointment list (found ID #${bookedAppt.id})`
  );

  // Step 11: Cancel the appointment
  const cancelRes = await fetch(`${API_BASE}/appointments/${bookedAppt.id}`, {
    method: "DELETE"
  });
  const cancelData = await cancelRes.json();
  assert(cancelRes.status === 200, 11, "Cancel the appointment via DELETE /api/appointments/:id");

  // Step 12: Verify status becomes Cancelled
  const diskApptsAfterCancel = await readJson("appointments.json");
  const diskCancelled = diskApptsAfterCancel.find((a) => a.id === bookedAppt.id);
  assert(
    diskCancelled && diskCancelled.status === "Cancelled" && cancelData.appointment.status === "Cancelled",
    12,
    "Verify status becomes Cancelled in API response and in appointments.json persistence"
  );

  // Step 13: Verify the cancelled slot can be booked again
  const reavailRes = await fetch(`${API_BASE}/appointments/availability?doctorId=${selectedDoctor.id}&date=${targetDate}`);
  const reavailData = await reavailRes.json();
  const recheckSlot = reavailData.slots.find((s) => s.time === openSlot.time);
  assert(
    recheckSlot && recheckSlot.isAvailable === true && recheckSlot.status === "Available",
    13,
    `Verify the cancelled slot (${openSlot.time}) is marked Available again and can be booked`
  );

  // Book a replacement appointment to verify rescheduling
  const rebookRes = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: patientUser.patientId,
      doctorId: selectedDoctor.id,
      date: targetDate,
      time: openSlot.time,
      reason: "Rebooked consultation for rescheduling test"
    })
  });
  const rebookData = await rebookRes.json();
  const activeApptId = rebookData.appointment.id;

  // Step 14: Reschedule an active appointment
  // Pick an alternative slot
  const altSlot = reavailData.slots.find((s) => s.isAvailable && s.time !== openSlot.time);
  const rescheduleRes = await fetch(`${API_BASE}/appointments/${activeApptId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      time: altSlot.time,
      reason: "Rescheduled time slot"
    })
  });
  const rescheduleData = await rescheduleRes.json();
  assert(
    rescheduleRes.status === 200 && rescheduleData.appointment.time === altSlot.time,
    14,
    `Reschedule an active appointment (from ${openSlot.time} to ${altSlot.time})`
  );

  // Step 15: Prevent conflicting rescheduling
  // Attempt to reschedule to another occupied slot
  // Book a second appointment at openSlot.time
  const blockerRes = await fetch(`${API_BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: patients[2].id,
      doctorId: selectedDoctor.id,
      date: targetDate,
      time: openSlot.time,
      reason: "Occupying slot for conflict test"
    })
  });
  const blockerData = await blockerRes.json();
  const blockerId = blockerData.appointment.id;

  // Try to reschedule activeAppt to openSlot.time (which is now occupied)
  const conflictRescheduleRes = await fetch(`${API_BASE}/appointments/${activeApptId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      time: openSlot.time
    })
  });
  assert(
    conflictRescheduleRes.status === 409,
    15,
    "Prevent conflicting rescheduling (HTTP 409 Conflict returned when target slot is taken)"
  );

  // Clean up blocker
  await fetch(`${API_BASE}/appointments/${blockerId}?hard=true`, { method: "DELETE" });

  // Step 16: Select the doctor account
  const doctorUser = users.find((u) => u.role === "Doctor");
  assert(doctorUser && doctorUser.doctorId, 16, `Select Doctor (${doctorUser.name}, DoctorID: ${doctorUser.doctorId})`);

  // Step 17: Display that doctor's appointments
  const docApptsRes = await fetch(`${API_BASE}/appointments?doctorId=${doctorUser.doctorId}`);
  const docAppts = await docApptsRes.json();
  assert(
    Array.isArray(docAppts) && docAppts.length > 0 && docAppts.every((a) => a.doctorId === doctorUser.doctorId),
    17,
    `Display that doctor's appointments (${docAppts.length} appointments assigned to Doctor #${doctorUser.doctorId})`
  );

  // Step 18: Mark an appointment Completed
  const scheduledDocAppt = docAppts.find((a) => a.status === "Scheduled") || bookedAppt;
  const completeRes = await fetch(`${API_BASE}/appointments/${scheduledDocAppt.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Completed" })
  });
  const completeData = await completeRes.json();
  assert(
    completeRes.status === 200 && completeData.appointment.status === "Completed",
    18,
    `Mark appointment #${scheduledDocAppt.id} Completed (status updated to Completed in storage)`
  );

  // Step 19: Select the administrator account
  const adminUser = users.find((u) => u.role === "Admin");
  assert(adminUser, 19, `Select Administrator (${adminUser.name})`);

  // Step 20: Display dashboard statistics
  const adminStatsRes = await fetch(`${API_BASE}/dashboard/stats?role=Admin`);
  const adminStats = await adminStatsRes.json();
  assert(
    adminStatsRes.status === 200 &&
    adminStats.totalPatients > 0 &&
    adminStats.totalDoctors > 0 &&
    adminStats.totalAppointments > 0 &&
    typeof adminStats.scheduled === "number" &&
    typeof adminStats.completed === "number" &&
    typeof adminStats.cancelled === "number",
    20,
    `Display dashboard statistics (Patients: ${adminStats.totalPatients}, Doctors: ${adminStats.totalDoctors}, Total Appts: ${adminStats.totalAppointments}, Scheduled: ${adminStats.scheduled}, Completed: ${adminStats.completed}, Cancelled: ${adminStats.cancelled})`
  );

  // Step 21: Display all appointments
  const allApptsRes = await fetch(`${API_BASE}/appointments`);
  const allAppts = await allApptsRes.json();
  assert(
    Array.isArray(allAppts) && allAppts.length === adminStats.totalAppointments,
    21,
    `Display all appointments across the clinic (${allAppts.length} records verified)`
  );

  // Cleanup test appointment
  await fetch(`${API_BASE}/appointments/${activeApptId}?hard=true`, { method: "DELETE" });

  console.log("\n======================================================================");
  console.log("🎉 ALL CLINIC APPOINTMENT CHECKS PASSED!");
  console.log("======================================================================\n");
}

verifyClinicFlows().catch((err) => {
  console.error("Clinic verification error:", err);
  process.exit(1);
});
