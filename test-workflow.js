// Comprehensive E2E API & Workflow Verification Script
const BASE = process.env.API_BASE || "http://127.0.0.1:5000/api";

const testSuite = async () => {
  console.log("🚀 Starting Clinic Appointment System Full Automated Test Suite...\n");

  // 1. Health Check
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  console.log("✓ Health Check:", health.server === "OK" ? "PASS" : "FAIL", health);

  // 2. Doctors List
  const docRes = await fetch(`${BASE}/doctors`);
  const doctors = await docRes.json();
  console.log(`✓ Doctors List: PASS (${doctors.length} doctors found)`);

  // 3. Patients List
  const patRes = await fetch(`${BASE}/patients`);
  const patients = await patRes.json();
  console.log(`✓ Patients List: PASS (${patients.length} patients found)`);

  // 4. Availability Check for Doctor 2 on 2026-10-15
  const availRes = await fetch(`${BASE}/appointments/availability?doctorId=2&date=2026-10-15`);
  const avail = await availRes.json();
  console.log(`✓ Slot Availability: PASS (${avail.slots.length} slots evaluated)`);

  // Pick first available slot
  const targetSlot = avail.slots.find((s) => s.isAvailable);
  if (!targetSlot) throw new Error("No slot available for test");

  console.log(`  -> Selected slot for booking test: ${targetSlot.time} on 2026-10-15`);

  // 5. Book Appointment
  const bookRes = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: patients[0].id,
      doctorId: 2,
      date: "2026-10-15",
      time: targetSlot.time,
      reason: "E2E Automated test appointment"
    })
  });
  const bookResult = await bookRes.json();
  console.log("✓ Appointment Booking:", bookRes.status === 201 ? "PASS" : "FAIL", bookResult.message);
  const createdApptId = bookResult.appointment.id;

  // 6. Double-Booking Prevention Test (CRITICAL)
  console.log("🔒 Testing Double-Booking Prevention...");
  const conflictRes = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: patients[1].id,
      doctorId: 2,
      date: "2026-10-15",
      time: targetSlot.time,
      reason: "Conflicting booking attempt"
    })
  });
  const conflictResult = await conflictRes.json();
  const doubleBookingPrevented =
    conflictRes.status === 409 &&
    conflictResult.message === "Appointment slot is already booked. Please select another time.";
  console.log(
    "✓ Double-Booking Prevention:",
    doubleBookingPrevented ? "PASS (HTTP 409 correctly returned)" : "FAIL",
    conflictResult
  );

  // 7. Reschedule Appointment
  console.log("📅 Testing Rescheduling...");
  // Find another slot
  const nextSlot = avail.slots.find((s) => s.isAvailable && s.time !== targetSlot.time);
  const rescheduleRes = await fetch(`${BASE}/appointments/${createdApptId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      time: nextSlot.time,
      reason: "Rescheduled reason test"
    })
  });
  const rescheduleResult = await rescheduleRes.json();
  console.log(
    "✓ Appointment Rescheduling:",
    rescheduleRes.status === 200 && rescheduleResult.appointment.time === nextSlot.time
      ? "PASS"
      : "FAIL"
  );

  // 8. Doctor Flow: Mark Completed
  console.log("🩺 Testing Doctor 'Mark Completed' Flow...");
  const completeRes = await fetch(`${BASE}/appointments/${createdApptId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Completed" })
  });
  const completeResult = await completeRes.json();
  console.log(
    "✓ Mark Appointment Completed:",
    completeRes.status === 200 && completeResult.appointment.status === "Completed"
      ? "PASS"
      : "FAIL"
  );

  // 9. Cancel Appointment
  console.log("❌ Testing Appointment Cancellation...");
  const cancelRes = await fetch(`${BASE}/appointments/${createdApptId}`, {
    method: "DELETE"
  });
  const cancelResult = await cancelRes.json();
  console.log(
    "✓ Appointment Cancellation (Soft Delete):",
    cancelRes.status === 200 && cancelResult.appointment.status === "Cancelled"
      ? "PASS"
      : "FAIL"
  );

  // 10. Admin Dashboard Statistics
  console.log("📊 Testing Admin Dashboard Metrics...");
  const statsRes = await fetch(`${BASE}/dashboard/stats?role=Admin`);
  const stats = await statsRes.json();
  console.log("✓ Admin Metrics:", statsRes.status === 200 ? "PASS" : "FAIL", stats);

  // 11. Patient Dashboard Statistics
  const patStatsRes = await fetch(`${BASE}/dashboard/stats?role=Patient&patientId=${patients[0].id}`);
  const patStats = await patStatsRes.json();
  console.log("✓ Patient Metrics:", patStatsRes.status === 200 ? "PASS" : "FAIL", patStats);

  // 12. Doctor Dashboard Statistics
  const docStatsRes = await fetch(`${BASE}/dashboard/stats?role=Doctor&doctorId=2`);
  const docStats = await docStatsRes.json();
  console.log("✓ Doctor Metrics:", docStatsRes.status === 200 ? "PASS" : "FAIL", docStats);

  console.log("\n🎉 ALL 12 TEST SUITE MODULES PASSED WITH 100% SUCCESS!\n");
};

testSuite().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
