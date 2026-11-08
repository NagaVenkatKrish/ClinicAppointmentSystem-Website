import { faker } from "@faker-js/faker";
import { readData, writeData } from "../services/dataService.js";

const TARGETS = { patients: 100, doctors: 24, appointments: 240 };
const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Pediatrics", "Neurology", "Orthopedics",
  "General Medicine", "ENT", "Gynecology", "Ophthalmology", "Endocrinology",
  "Gastroenterology", "Pulmonology"
];
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const REASONS = [
  "Routine wellness visit", "Follow-up consultation", "Preventive screening",
  "Medication review", "New patient consultation", "Annual health review",
  "Specialist consultation", "Diagnostic review"
];

const dateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const nextId = (records) => records.reduce((max, record) => Math.max(max, Number(record.id) || 0), 0) + 1;

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

const DOCTOR_HOSPITALS = [
  { hospital: "Mount Sinai Hospital, 1468 Madison Ave, New York, NY 10029, USA", phone: "+1 (212) 659-8555" },
  { hospital: "Apollo Hospitals, Jubilee Hills, Hyderabad, Telangana 500033, India", phone: "+91 98490 22334" },
  { hospital: "Great Ormond Street Hospital, London WC1N 3JH, United Kingdom", phone: "+44 20 7405 9200" },
  { hospital: "Charité - Universitätsmedizin Berlin, 10117 Berlin, Germany", phone: "+49 30 450 50" },
  { hospital: "The Royal Melbourne Hospital, Parkville VIC 3050, Australia", phone: "+61 3 9342 7000" },
  { hospital: "Toronto General Hospital, Toronto, ON M5G 2C4, Canada", phone: "+1 (416) 340-4800" },
  { hospital: "Singapore General Hospital, Outram Road, Singapore 169608", phone: "+65 6222 3322" },
  { hospital: "Hôpital Européen Georges-Pompidou, 75015 Paris, France", phone: "+33 1 56 09 20 00" },
  { hospital: "The University of Tokyo Hospital, Bunkyo City, Tokyo 113-8655, Japan", phone: "+81 3 3815 5411" },
  { hospital: "Fortis Memorial Research Institute, Gurugram, Haryana 122002, India", phone: "+91 98112 33445" }
];

export const expandDemoData = async () => {
  faker.seed(246810);
  const [patients, doctors, appointments, users] = await Promise.all([
    readData("patients"), readData("doctors"), readData("appointments"), readData("users")
  ]);

  // Keep realistic email and phone contacts
  patients.forEach((patient, idx) => {
    if (!patient.email || patient.email.includes(".invalid")) {
      const loc = SAMPLE_GLOBAL_ADDRESSES[idx % SAMPLE_GLOBAL_ADDRESSES.length];
      const domain = EMAIL_DOMAINS[idx % EMAIL_DOMAINS.length];
      const f = (patient.firstName || "patient").toLowerCase().replace(/[^a-z0-9]/g, "");
      const l = (patient.lastName || "user").toLowerCase().replace(/[^a-z0-9]/g, "");
      patient.email = `${f}.${l}@${domain}`;
      patient.phone = loc.phone;
      patient.address = loc.address;
    }
  });

  doctors.forEach((doctor, idx) => {
    if (!doctor.email || doctor.email.includes(".invalid") || doctor.email.includes("clinic-demo.com")) {
      const loc = DOCTOR_HOSPITALS[idx % DOCTOR_HOSPITALS.length];
      const domain = EMAIL_DOMAINS[idx % EMAIL_DOMAINS.length];
      const cleanName = doctor.name.replace(/^Dr\.\s*/i, "").trim();
      const parts = cleanName.split(/\s+/);
      const f = (parts[0] || "doc").toLowerCase().replace(/[^a-z0-9]/g, "");
      const l = (parts[parts.length - 1] || "care").toLowerCase().replace(/[^a-z0-9]/g, "");
      doctor.email = `dr.${f}.${l}@${domain}`;
      doctor.phone = loc.phone;
    }
  });

  users.forEach((user) => {
    if (user.role === "Patient") {
      user.email = patients.find((patient) => String(patient.id) === String(user.patientId))?.email || "patient.care@gmail.com";
    }
    if (user.role === "Doctor") {
      user.email = doctors.find((doctor) => String(doctor.id) === String(user.doctorId))?.email || "doctor.clinic@gmail.com";
    }
    if (user.role === "Admin") {
      user.email = "admin.cliniccare@gmail.com";
    }
  });

  for (let id = nextId(patients); patients.length < TARGETS.patients; id++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const loc = SAMPLE_GLOBAL_ADDRESSES[(id - 1) % SAMPLE_GLOBAL_ADDRESSES.length];
    const domain = EMAIL_DOMAINS[(id - 1) % EMAIL_DOMAINS.length];
    const f = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const l = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
    patients.push({
      id,
      firstName,
      lastName,
      email: `${f}.${l}@${domain}`,
      phone: loc.phone,
      age: 20 + ((id * 7) % 55),
      gender: id % 3 === 0 ? "Other" : id % 2 === 0 ? "Female" : "Male",
      address: loc.address
    });
  }

  for (let id = nextId(doctors); doctors.length < TARGETS.doctors; id++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const loc = DOCTOR_HOSPITALS[(id - 1) % DOCTOR_HOSPITALS.length];
    const domain = EMAIL_DOMAINS[(id - 1) % EMAIL_DOMAINS.length];
    const f = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const l = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
    doctors.push({
      id,
      name: `Dr. ${firstName} ${lastName}`,
      email: `dr.${f}.${l}@${domain}`,
      phone: loc.phone,
      specialization: SPECIALIZATIONS[(id - 1) % SPECIALIZATIONS.length],
      consultationFee: 500 + (id % 5) * 100
    });
  }

  const occupied = new Set(appointments
    .filter((appointment) => appointment.status !== "Cancelled")
    .map((appointment) => `${appointment.doctorId}|${appointment.date}|${appointment.time}`));
  let id = nextId(appointments);
  const today = new Date();
  const targetNewAppointments = Math.max(0, TARGETS.appointments - appointments.length);

  for (let offset = -45; offset <= 45 && id < nextId(appointments) + targetNewAppointments; offset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    const dateValue = dateString(date);

    for (let slotIndex = 0; slotIndex < 5 && appointments.length < TARGETS.appointments; slotIndex++) {
      const doctor = doctors[(Math.abs(offset * 3 + slotIndex * 7)) % doctors.length];
      const time = SLOTS[(Math.abs(offset + slotIndex * 2)) % SLOTS.length];
      const key = `${doctor.id}|${dateValue}|${time}`;
      if (occupied.has(key)) continue;
      occupied.add(key);

      const patient = patients[(id * 13 + slotIndex) % patients.length];
      const status = offset < 0
        ? (faker.number.int({ min: 1, max: 10 }) <= 8 ? "Completed" : "Cancelled")
        : (faker.number.int({ min: 1, max: 12 }) === 1 ? "Cancelled" : "Scheduled");
      appointments.push({
        id,
        patientId: patient.id,
        doctorId: doctor.id,
        date: dateValue,
        time,
        status,
        reason: faker.helpers.arrayElement(REASONS)
      });
      id++;
      if (appointments.length >= TARGETS.appointments) break;
    }
  }

  await Promise.all([
    writeData("patients", patients),
    writeData("doctors", doctors),
    writeData("appointments", appointments),
    writeData("users", users)
  ]);
  console.log(`Expanded synthetic demo data: ${patients.length} patients, ${doctors.length} doctors, ${appointments.length} appointments.`);
};

expandDemoData().catch((error) => {
  console.error("Demo data expansion failed:", error);
  process.exitCode = 1;
});
