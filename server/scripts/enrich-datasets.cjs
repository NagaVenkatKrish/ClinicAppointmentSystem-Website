const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

const patientsPath = path.join(DATA_DIR, "patients.json");
const doctorsPath = path.join(DATA_DIR, "doctors.json");

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

// Synthetic demo values only.
// These are not real patient details.
function enrichPatients(patients) {
    const genders = ["Male", "Female", "Other"];

    return patients.map((patient, index) => ({
        ...patient,

        age:
            patient.age ??
            20 + ((index * 7) % 45),

        gender:
            patient.gender ??
            genders[index % genders.length],

        address:
            patient.address ??
            `Demo Address ${index + 1}, Hyderabad, Telangana`
    }));
}

// Fee values are illustrative academic demo values.
function enrichDoctors(doctors) {
    const feeBySpecialization = {
        Cardiology: 800,
        Dermatology: 600,
        Neurology: 1000,
        Orthopedics: 700,
        Pediatrics: 500,
        General: 400
    };

    return doctors.map((doctor) => {
        const specialization =
            doctor.specialization || "General";

        const fee =
            feeBySpecialization[specialization] ?? 500;

        return {
            ...doctor,

            consultationFee:
                doctor.consultationFee ?? fee
        };
    });
}

function main() {
    if (
        !fs.existsSync(patientsPath) ||
        !fs.existsSync(doctorsPath)
    ) {
        throw new Error(
            "patients.json or doctors.json was not found."
        );
    }

    const patients = readJson(patientsPath);
    const doctors = readJson(doctorsPath);

    if (
        !Array.isArray(patients) ||
        !Array.isArray(doctors)
    ) {
        throw new Error(
            "Dataset files must contain JSON arrays."
        );
    }

    const enrichedPatients = enrichPatients(patients);
    const enrichedDoctors = enrichDoctors(doctors);

    writeJson(patientsPath, enrichedPatients);
    writeJson(doctorsPath, enrichedDoctors);

    console.log("Dataset enrichment completed.");
    console.log(`Patients updated: ${patients.length}`);
    console.log(`Doctors updated: ${doctors.length}`);
}

try {
    main();
} catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
}
