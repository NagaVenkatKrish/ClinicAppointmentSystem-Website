import { faker } from "@faker-js/faker";
import { writeData } from "../services/dataService.js";

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "General Medicine",
  "ENT",
  "Gynecology"
];

const TIME_SLOTS = [
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

const REASONS = [
  "Routine general health checkup",
  "Persistent migraine and dizziness",
  "Annual cardiac screening",
  "Skin irritation and allergic rash",
  "Knee joint pain and stiffness",
  "Child immunization and wellness check",
  "Recurrent sore throat and sinus congestion",
  "Post-treatment follow-up consultation",
  "Hypertension and blood pressure review",
  "Mild chest discomfort assessment",
  "Dietary and metabolic consultation",
  "Ear ringing and hearing evaluation"
];

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "bing.com", "yahoo.co.in", "gmail.in", "yahoo.in"];

const SAMPLE_GLOBAL_ADDRESSES = [
  { address: "Flat 402, Sai Sagar Heights, Banjara Hills Road No. 12, Hyderabad, Telangana 500034, India", phone: "+91 98451 28934" },
  { address: "740 Park Avenue, Apt 11A, Upper East Side, New York, NY 10021, USA", phone: "+1 (212) 839-4412" },
  { address: "45 Marylebone High Street, Westminster, London W1U 5HG, United Kingdom", phone: "+44 20 7946 0831" },
  { address: "180 University Avenue, Apt 2802, Toronto, ON M5H 0A2, Canada", phone: "+1 (416) 723-5591" },
  { address: "180 George Street, The Rocks, Sydney NSW 2000, Australia", phone: "+61 2 9385 4120" },
  { address: "Kurfürstendamm 195, 10707 Berlin, Germany", phone: "+49 30 2312 8841" },
  { address: "42 Avenue Montaigne, 75008 Paris, France", phone: "+33 1 42 68 77 12" },
  { address: "3-14-1 Roppongi, Minato-ku, Tokyo 106-0032, Japan", phone: "+81 3 5555 4129" },
  { address: "10 Collyer Quay, #18-01 Ocean Financial Centre, Singapore 049315", phone: "+65 6789 4412" },
  { address: "Sheikh Zayed Road, Trade Centre 1, Dubai, United Arab Emirates", phone: "+971 4 324 8891" },
  { address: "14/A Marine Drive, Nariman Point, Mumbai, Maharashtra 400021, India", phone: "+91 98201 45612" },
  { address: "350 Sutter Street, Suite 400, San Francisco, CA 94108, USA", phone: "+1 (415) 672-8831" },
  { address: "18 Deansgate, Suite 3B, Manchester M3 2NW, United Kingdom", phone: "+44 161 832 4491" },
  { address: "1055 West Georgia Street, Vancouver, BC V6E 3P3, Canada", phone: "+1 (604) 829-4410" },
  { address: "35 Collins Street, Melbourne VIC 3000, Australia", phone: "+61 3 9820 6671" },
  { address: "Maximilianstraße 35, 80539 München, Bavaria, Germany", phone: "+49 89 6382 7710" },
  { address: "18 Rue de la République, 69002 Lyon, France", phone: "+33 4 72 10 44 20" },
  { address: "1-1-2 Umeda, Kita-ku, Osaka 530-0001, Japan", phone: "+81 6 6208 7710" },
  { address: "Av. Paulista 1578, Bela Vista, São Paulo - SP, 01310-200, Brazil", phone: "+55 11 3245-7789" },
  { address: "Grafton Street 42, Dublin 2, D02 F683, Ireland", phone: "+353 1 496 7712" }
];

export const seedDatabase = async () => {
  console.log("🌱 Preparing clinic records...");

  // Set seed for consistent realism
  faker.seed(12345);

  // 1. Generate 20 Patients
  const patients = [];
  for (let i = 1; i <= 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const loc = SAMPLE_GLOBAL_ADDRESSES[(i - 1) % SAMPLE_GLOBAL_ADDRESSES.length];
    const domain = EMAIL_DOMAINS[(i - 1) % EMAIL_DOMAINS.length];
    const emailHandle = `${firstName.toLowerCase().replace(/[^a-z0-9]/g, "")}.${lastName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    patients.push({
      id: i,
      firstName,
      lastName,
      email: `${emailHandle}@${domain}`,
      phone: loc.phone,
      age: 20 + ((i * 7) % 55),
      gender: i % 3 === 0 ? "Other" : i % 2 === 0 ? "Female" : "Male",
      address: loc.address
    });
  }

  // 2. Generate 10 Doctors
  const doctors = [];
  for (let i = 1; i <= 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const specialization = SPECIALIZATIONS[(i - 1) % SPECIALIZATIONS.length];
    const loc = SAMPLE_GLOBAL_ADDRESSES[(i + 4) % SAMPLE_GLOBAL_ADDRESSES.length];
    const domain = EMAIL_DOMAINS[(i - 1) % EMAIL_DOMAINS.length];
    doctors.push({
      id: i,
      name: `Dr. ${firstName} ${lastName}`,
      email: `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: loc.phone,
      specialization,
      consultationFee: 500 + (i % 5) * 100
    });
  }

  // 3. Generate 35 Appointments
  // Distribute between past (-7 to -1 days), today (0), and future (+1 to +10 days)
  const appointments = [];
  const occupiedSlots = new Set(); // key: `${doctorId}_${date}_${time}`

  const now = new Date();
  const todayStr = formatDate(now);

  let appointmentId = 1;
  const targetCount = 36;

  // Let's create some guaranteed appointments for today
  for (let i = 0; i < 6; i++) {
    const doctor = doctors[i % doctors.length];
    const patient = patients[i % patients.length];
    const time = TIME_SLOTS[i % TIME_SLOTS.length];
    const key = `${doctor.id}_${todayStr}_${time}`;

    if (!occupiedSlots.has(key)) {
      occupiedSlots.add(key);
      appointments.push({
        id: appointmentId++,
        patientId: patient.id,
        doctorId: doctor.id,
        date: todayStr,
        time,
        status: i === 0 ? "Completed" : "Scheduled",
        reason: REASONS[i % REASONS.length]
      });
    }
  }

  // Generate past appointments (Completed / Cancelled)
  for (let offset = -7; offset <= -1; offset++) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() + offset);
    const dateStr = formatDate(pastDate);

    for (let j = 0; j < 3; j++) {
      if (appointments.length >= targetCount - 12) break;
      const doctor = faker.helpers.arrayElement(doctors);
      const patient = faker.helpers.arrayElement(patients);
      const time = faker.helpers.arrayElement(TIME_SLOTS);
      const key = `${doctor.id}_${dateStr}_${time}`;

      if (!occupiedSlots.has(key)) {
        occupiedSlots.add(key);
        const status = faker.helpers.arrayElement([
          "Completed",
          "Completed",
          "Completed",
          "Cancelled"
        ]);
        appointments.push({
          id: appointmentId++,
          patientId: patient.id,
          doctorId: doctor.id,
          date: dateStr,
          time,
          status,
          reason: faker.helpers.arrayElement(REASONS)
        });
      }
    }
  }

  // Generate future appointments (Scheduled / Cancelled)
  for (let offset = 1; offset <= 10; offset++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + offset);
    const dateStr = formatDate(futureDate);

    for (let j = 0; j < 3; j++) {
      if (appointments.length >= targetCount) break;
      const doctor = faker.helpers.arrayElement(doctors);
      const patient = faker.helpers.arrayElement(patients);
      const time = faker.helpers.arrayElement(TIME_SLOTS);
      const key = `${doctor.id}_${dateStr}_${time}`;

      if (!occupiedSlots.has(key)) {
        occupiedSlots.add(key);
        const status = faker.helpers.arrayElement([
          "Scheduled",
          "Scheduled",
          "Scheduled",
          "Cancelled"
        ]);
        appointments.push({
          id: appointmentId++,
          patientId: patient.id,
          doctorId: doctor.id,
          date: dateStr,
          time,
          status,
          reason: faker.helpers.arrayElement(REASONS)
        });
      }
    }
  }

  // 4. Configure clinic role accounts
  const users = [
    {
      id: "demo-patient",
      role: "Patient",
      name: `${patients[0].firstName} ${patients[0].lastName}`,
      email: patients[0].email,
      patientId: patients[0].id,
      label: `Patient: ${patients[0].firstName} ${patients[0].lastName}`
    },
    {
      id: "demo-doctor",
      role: "Doctor",
      name: doctors[0].name,
      email: doctors[0].email,
      doctorId: doctors[0].id,
      specialization: doctors[0].specialization,
      label: `${doctors[0].name} (${doctors[0].specialization})`
    },
    {
      id: "demo-admin",
      role: "Admin",
      name: "Clinic Administrator",
      email: "admin.cliniccare@gmail.com",
      label: "System Administrator"
    }
  ];

  // Save to JSON files
  await writeData("patients", patients);
  await writeData("doctors", doctors);
  await writeData("appointments", appointments);
  await writeData("users", users);

  console.log(`✅ Seed complete:`);
  console.log(`   - ${patients.length} Patients generated`);
  console.log(`   - ${doctors.length} Doctors generated`);
  console.log(`   - ${appointments.length} Appointments generated`);
  console.log(`   - ${users.length} clinic role accounts configured`);
};

// Execute if run directly
seedDatabase().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
