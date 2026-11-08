const BASE = process.env.API_BASE || "http://127.0.0.1:5000/api";

const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
};

async function testAll() {
  console.log("==================================================");
  console.log("🧪 TESTING REST APIS (PATIENT, DOCTOR, APPOINTMENT, AVAILABILITY, DASHBOARD)");
  console.log("==================================================\n");

  // ----------------------------------------------------------------
  // 1. PATIENT APIS
  // ----------------------------------------------------------------
  console.log("--- Testing Patient APIs ---");
  // GET all
  const pListRes = await fetch(`${BASE}/patients`);
  const patients = await pListRes.json();
  assert(pListRes.status === 200 && Array.isArray(patients) && patients.length > 0, "GET /api/patients returns list");

  // GET by ID
  const pId = patients[0].id;
  const pGetRes = await fetch(`${BASE}/patients/${pId}`);
  const patientObj = await pGetRes.json();
  assert(pGetRes.status === 200 && patientObj.id === pId, `GET /api/patients/${pId} returns patient`);

  // POST create patient
  const pCreateRes = await fetch(`${BASE}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "TestFirst",
      lastName: "TestLast",
      email: "test.unique@example.com",
      phone: "555-0101"
    })
  });
  const pCreated = await pCreateRes.json();
  assert(pCreateRes.status === 201 && pCreated.patient && pCreated.patient.firstName === "TestFirst", "POST /api/patients creates patient");
  const newPatientId = pCreated.patient.id;

  // PUT update patient
  const pUpdateRes = await fetch(`${BASE}/patients/${newPatientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "555-0999" })
  });
  const pUpdated = await pUpdateRes.json();
  assert(pUpdateRes.status === 200 && pUpdated.patient.phone === "555-0999", "PUT /api/patients/:id updates patient");

  // DELETE patient
  const pDelRes = await fetch(`${BASE}/patients/${newPatientId}`, { method: "DELETE" });
  const pDel = await pDelRes.json();
  assert(pDelRes.status === 200, "DELETE /api/patients/:id removes patient");

  // ----------------------------------------------------------------
  // 2. DOCTOR APIS
  // ----------------------------------------------------------------
  console.log("\n--- Testing Doctor APIs ---");
  // GET all
  const dListRes = await fetch(`${BASE}/doctors`);
  const doctors = await dListRes.json();
  assert(dListRes.status === 200 && Array.isArray(doctors) && doctors.length > 0, "GET /api/doctors returns list");

  // GET by ID
  const dId = doctors[0].id;
  const dGetRes = await fetch(`${BASE}/doctors/${dId}`);
  const docObj = await dGetRes.json();
  assert(dGetRes.status === 200 && docObj.id === dId, `GET /api/doctors/${dId} returns doctor`);

  // POST create doctor
  const dCreateRes = await fetch(`${BASE}/doctors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Gregory House",
      specialization: "Neurology",
      email: "dr.house.test@example.com",
      phone: "555-0188"
    })
  });
  const dCreated = await dCreateRes.json();
  assert(dCreateRes.status === 201 && dCreated.doctor && dCreated.doctor.name.includes("House"), "POST /api/doctors creates doctor");
  const newDoctorId = dCreated.doctor.id;

  // PUT update doctor
  const dUpdateRes = await fetch(`${BASE}/doctors/${newDoctorId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "555-0777" })
  });
  const dUpdated = await dUpdateRes.json();
  assert(dUpdateRes.status === 200 && dUpdated.doctor.phone === "555-0777", "PUT /api/doctors/:id updates doctor");

  // DELETE doctor
  const dDelRes = await fetch(`${BASE}/doctors/${newDoctorId}`, { method: "DELETE" });
  assert(dDelRes.status === 200, "DELETE /api/doctors/:id removes doctor");

  // ----------------------------------------------------------------
  // 3. APPOINTMENT CREATION REQUIREMENTS & DOUBLE-BOOKING
  // ----------------------------------------------------------------
  console.log("\n--- Testing Appointment APIs & Validation Logic ---");
  const testDoctorId = doctors[0].id;
  const testPatientId = patients[0].id;
  const testDate = "2026-11-20";
  const testTime = "10:30";

  // Requirement 1: Verify patient exists
  const invalidPatRes = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: 999999,
      doctorId: testDoctorId,
      date: testDate,
      time: testTime,
      reason: "Test"
    })
  });
  assert(invalidPatRes.status === 400, "POST /api/appointments rejects nonexistent patient");

  // Requirement 2: Verify doctor exists
  const invalidDocRes = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: testPatientId,
      doctorId: 999999,
      date: testDate,
      time: testTime,
      reason: "Test"
    })
  });
  assert(invalidDocRes.status === 400, "POST /api/appointments rejects nonexistent doctor");

  // Requirement 3: Validate date/time format
  const invalidDateRes = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: testPatientId,
      doctorId: testDoctorId,
      date: "invalid-date",
      time: testTime,
      reason: "Test"
    })
  });
  assert(invalidDateRes.status === 400, "POST /api/appointments rejects invalid date format");

  const invalidTimeRes = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: testPatientId,
      doctorId: testDoctorId,
      date: testDate,
      time: "99:99",
      reason: "Test"
    })
  });
  assert(invalidTimeRes.status === 400, "POST /api/appointments rejects invalid time format");

  // Requirement 6: Create a Scheduled appointment when available
  const validApptRes = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: testPatientId,
      doctorId: testDoctorId,
      date: testDate,
      time: testTime,
      reason: "Cardiology follow-up consultation"
    })
  });
  const validAppt = await validApptRes.json();
  assert(
    validApptRes.status === 201 && validAppt.appointment && validAppt.appointment.status === "Scheduled",
    "POST /api/appointments creates a Scheduled appointment when available"
  );
  const createdApptId = validAppt.appointment.id;

  // Requirement 4 & 5: Check whether same doctor already has active appointment & reject duplicate booking (409)
  const duplicateRes = await fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: patients[1].id,
      doctorId: testDoctorId,
      date: testDate,
      time: testTime,
      reason: "Duplicate attempt"
    })
  });
  const dupData = await duplicateRes.json();
  assert(
    duplicateRes.status === 409 && dupData.message === "Appointment slot is already booked. Please select another time.",
    "POST /api/appointments rejects duplicate booking with HTTP 409"
  );

  // ----------------------------------------------------------------
  // 4. AVAILABILITY API & CANCELLED APPOINTMENTS RULE
  // ----------------------------------------------------------------
  console.log("\n--- Testing Availability API & Cancellation Rule ---");
  // Check availability: testTime should be "Booked"
  const availRes1 = await fetch(`${BASE}/appointments/availability?doctorId=${testDoctorId}&date=${testDate}`);
  const avail1 = await availRes1.json();
  const slot1 = avail1.slots.find((s) => s.time === testTime);
  assert(availRes1.status === 200 && slot1 && slot1.status === "Booked" && !slot1.isAvailable, "Slot is marked as Booked when Scheduled");

  // Cancel appointment (DELETE /api/appointments/:id)
  const cancelRes = await fetch(`${BASE}/appointments/${createdApptId}`, { method: "DELETE" });
  const cancelData = await cancelRes.json();
  assert(cancelRes.status === 200 && cancelData.appointment.status === "Cancelled", "DELETE /api/appointments/:id cancels appointment (sets status Cancelled)");

  // Requirement: Cancelled appointments must not block availability
  const availRes2 = await fetch(`${BASE}/appointments/availability?doctorId=${testDoctorId}&date=${testDate}`);
  const avail2 = await availRes2.json();
  const slot2 = avail2.slots.find((s) => s.time === testTime);
  assert(
    availRes2.status === 200 && slot2 && slot2.status === "Available" && slot2.isAvailable,
    "Cancelled appointment does NOT block slot (slot is now Available again)"
  );

  // Clean up test appointment permanently
  await fetch(`${BASE}/appointments/${createdApptId}?hard=true`, { method: "DELETE" });

  // ----------------------------------------------------------------
  // 5. DASHBOARD STATISTICS API
  // ----------------------------------------------------------------
  console.log("\n--- Testing Dashboard Statistics API ---");
  const adminStatsRes = await fetch(`${BASE}/dashboard/stats?role=Admin`);
  const adminStats = await adminStatsRes.json();
  assert(
    adminStatsRes.status === 200 &&
    typeof adminStats.totalPatients === "number" &&
    typeof adminStats.totalDoctors === "number" &&
    typeof adminStats.totalAppointments === "number" &&
    typeof adminStats.scheduled === "number" &&
    typeof adminStats.completed === "number" &&
    typeof adminStats.cancelled === "number",
    "GET /api/dashboard/stats?role=Admin returns complete clinic statistics"
  );

  const docStatsRes = await fetch(`${BASE}/dashboard/stats?role=Doctor&doctorId=${doctors[0].id}`);
  const docStats = await docStatsRes.json();
  assert(
    docStatsRes.status === 200 &&
    typeof docStats.todayAppointmentsCount === "number" &&
    typeof docStats.upcomingCount === "number",
    "GET /api/dashboard/stats?role=Doctor returns doctor statistics"
  );

  const patStatsRes = await fetch(`${BASE}/dashboard/stats?role=Patient&patientId=${patients[0].id}`);
  const patStats = await patStatsRes.json();
  assert(
    patStatsRes.status === 200 &&
    typeof patStats.totalAppointments === "number",
    "GET /api/dashboard/stats?role=Patient returns patient statistics"
  );

  console.log("\n==================================================");
  console.log("🎉 ALL REST API ENDPOINTS & VALIDATION RULES VERIFIED SUCCESSFULLY!");
  console.log("==================================================");
}

testAll().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
