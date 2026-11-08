import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");

// Email domain pools explicitly requested: gmail, yahoo, bing with .com and .in
const EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "bing.com",
  "yahoo.co.in",
  "gmail.in",
  "yahoo.in"
];

// 100 Real World Global Addresses across multiple continents and countries
const GLOBAL_LOCATIONS = [
  // India (15)
  { address: "Flat 402, Sai Sagar Heights, Banjara Hills Road No. 12, Hyderabad, Telangana 500034, India", phone: "+91 98451 28934" },
  { address: "14/A Marine Drive, Nariman Point, Mumbai, Maharashtra 400021, India", phone: "+91 98201 45612" },
  { address: "Tower 3, Apt 1102, Pebble Bay, RMV 2nd Stage, Bengaluru, Karnataka 560094, India", phone: "+91 98802 34567" },
  { address: "B-42 Greater Kailash Part 1, New Delhi, Delhi 110048, India", phone: "+91 98110 98765" },
  { address: "Flat 2B, Southern Avenue, Lake Gardens, Kolkata, West Bengal 700029, India", phone: "+91 98300 12345" },
  { address: "Plot 88, Anna Nagar West, Chennai, Tamil Nadu 600040, India", phone: "+91 98401 56789" },
  { address: "302 Clover Highlands, NIBM Road, Kondhwa, Pune, Maharashtra 411048, India", phone: "+91 98220 67890" },
  { address: "Apt 501, Iscon Elegance, Prahlad Nagar, Ahmedabad, Gujarat 380015, India", phone: "+91 98250 23456" },
  { address: "Villa 12, Skyline City, Panampilly Nagar, Kochi, Kerala 682036, India", phone: "+91 98460 34567" },
  { address: "House 245, Sector 18-B, Chandigarh, Punjab 160018, India", phone: "+91 98140 45678" },
  { address: "Flat 604, Godrej Platinum, Alipore, Kolkata, West Bengal 700027, India", phone: "+91 98311 56789" },
  { address: "C-15 Malviya Nagar, Jaipur, Rajasthan 302017, India", phone: "+91 98290 67890" },
  { address: "Plot 45, Jubilee Hills Check Post, Hyderabad, Telangana 500033, India", phone: "+91 98490 78901" },
  { address: "84 Defence Colony, Indiranagar 100ft Road, Bengaluru, Karnataka 560038, India", phone: "+91 98860 89012" },
  { address: "Flat 801, Lodha Bellissimo, NM Joshi Marg, Mahalaxmi, Mumbai, Maharashtra 400011, India", phone: "+91 98205 90123" },

  // United States (15)
  { address: "740 Park Avenue, Apt 11A, Upper East Side, New York, NY 10021, USA", phone: "+1 (212) 839-4412" },
  { address: "350 Sutter Street, Suite 400, San Francisco, CA 94108, USA", phone: "+1 (415) 672-8831" },
  { address: "1420 N Lake Shore Drive, Apt 18B, Chicago, IL 60610, USA", phone: "+1 (312) 459-2019" },
  { address: "5420 River Oaks Boulevard, Houston, TX 77019, USA", phone: "+1 (713) 521-8830" },
  { address: "2100 Ocean Avenue, Santa Monica, CA 90405, USA", phone: "+1 (310) 394-5512" },
  { address: "1250 1st Avenue, Apt 2201, Seattle, WA 98101, USA", phone: "+1 (206) 624-7719" },
  { address: "400 Commonwealth Avenue, Back Bay, Boston, MA 02215, USA", phone: "+1 (617) 267-3310" },
  { address: "1801 Biscayne Boulevard, Edgewater, Miami, FL 33132, USA", phone: "+1 (305) 576-9921" },
  { address: "3300 Peachtree Road NE, Buckhead, Atlanta, GA 30326, USA", phone: "+1 (404) 231-4412" },
  { address: "1600 Larimer Street, Apt 1404, LoDo, Denver, CO 80202, USA", phone: "+1 (303) 595-8810" },
  { address: "2800 Congress Avenue, Downtown, Austin, TX 78701, USA", phone: "+1 (512) 472-6619" },
  { address: "700 S Ocean Drive, Fort Lauderdale, FL 33316, USA", phone: "+1 (954) 463-5520" },
  { address: "1000 Wilshire Boulevard, Suite 1200, Los Angeles, CA 90017, USA", phone: "+1 (213) 688-4410" },
  { address: "2400 Pennsylvania Avenue NW, Washington, DC 20037, USA", phone: "+1 (202) 456-1111" },
  { address: "555 California Street, Financial District, San Francisco, CA 94104, USA", phone: "+1 (415) 986-7720" },

  // United Kingdom (10)
  { address: "45 Marylebone High Street, Westminster, London W1U 5HG, United Kingdom", phone: "+44 20 7946 0831" },
  { address: "18 Deansgate, Suite 3B, Manchester M3 2NW, United Kingdom", phone: "+44 161 832 4491" },
  { address: "72 George Street, Edinburgh EH2 2LR, Scotland, United Kingdom", phone: "+44 131 226 7710" },
  { address: "14 Colmore Row, Birmingham B3 2QD, United Kingdom", phone: "+44 121 236 5519" },
  { address: "88 Queens Road, Clifton, Bristol BS8 1QU, United Kingdom", phone: "+44 117 923 8812" },
  { address: "25 Castle Street, Cambridge CB3 0AJ, United Kingdom", phone: "+44 1223 354 661" },
  { address: "10 Oxford Road, Oxford OX1 3BE, United Kingdom", phone: "+44 1865 243 771" },
  { address: "33 Buchanan Street, Glasgow G1 3HL, Scotland, United Kingdom", phone: "+44 141 221 4490" },
  { address: "12 Royal Crescent, Bath BA1 2LR, United Kingdom", phone: "+44 1225 428 119" },
  { address: "16 Kensington High Street, London W8 4PE, United Kingdom", phone: "+44 20 7937 5521" },

  // Canada (8)
  { address: "180 University Avenue, Apt 2802, Toronto, ON M5H 0A2, Canada", phone: "+1 (416) 723-5591" },
  { address: "1055 West Georgia Street, Vancouver, BC V6E 3P3, Canada", phone: "+1 (604) 829-4410" },
  { address: "1250 René-Lévesque Blvd W, Montreal, QC H3B 4W8, Canada", phone: "+1 (514) 871-3320" },
  { address: "400 3rd Avenue SW, Calgary, AB T2P 4H2, Canada", phone: "+1 (403) 264-7719" },
  { address: "150 Elgin Street, Suite 800, Ottawa, ON K2P 1L4, Canada", phone: "+1 (613) 238-6612" },
  { address: "10180 101 Street NW, Edmonton, AB T5J 3S4, Canada", phone: "+1 (780) 423-5510" },
  { address: "201 Portage Avenue, Winnipeg, MB R3B 3K6, Canada", phone: "+1 (204) 942-8819" },
  { address: "500 Grande Allée E, Quebec City, QC G1R 2J7, Canada", phone: "+1 (418) 648-3310" },

  // Australia (8)
  { address: "180 George Street, The Rocks, Sydney NSW 2000, Australia", phone: "+61 2 9385 4120" },
  { address: "35 Collins Street, Melbourne VIC 3000, Australia", phone: "+61 3 9820 6671" },
  { address: "123 Eagle Street, Brisbane City QLD 4000, Australia", phone: "+61 7 3221 8819" },
  { address: "240 St Georges Terrace, Perth WA 6000, Australia", phone: "+61 8 9322 4410" },
  { address: "70 Hindley Street, Adelaide SA 5000, Australia", phone: "+61 8 8231 7720" },
  { address: "50 Cavill Avenue, Surfers Paradise QLD 4217, Australia", phone: "+61 7 5538 5512" },
  { address: "14 London Circuit, Canberra ACT 2601, Australia", phone: "+61 2 6248 3319" },
  { address: "100 Sandy Bay Road, Hobart TAS 7005, Australia", phone: "+61 3 6223 8810" },

  // Germany (6)
  { address: "Kurfürstendamm 195, 10707 Berlin, Germany", phone: "+49 30 2312 8841" },
  { address: "Maximilianstraße 35, 80539 München, Bavaria, Germany", phone: "+49 89 6382 7710" },
  { address: "Taunusanlage 8, 60329 Frankfurt am Main, Hesse, Germany", phone: "+49 69 7569 4412" },
  { address: "Jungfernstieg 22, 20354 Hamburg, Germany", phone: "+49 40 3410 5519" },
  { address: "Königsallee 60, 40212 Düsseldorf, Germany", phone: "+49 211 8649 3320" },
  { address: "Königstraße 26, 70173 Stuttgart, Germany", phone: "+49 711 2293 8810" },

  // France (6)
  { address: "42 Avenue Montaigne, 75008 Paris, France", phone: "+33 1 42 68 77 12" },
  { address: "18 Rue de la République, 69002 Lyon, France", phone: "+33 4 72 10 44 20" },
  { address: "25 La Canebière, 13001 Marseille, France", phone: "+33 4 91 90 88 19" },
  { address: "15 Place Wilson, 31000 Toulouse, France", phone: "+33 5 61 21 55 10" },
  { address: "8 Promenade des Anglais, 06000 Nice, France", phone: "+33 4 93 87 33 21" },
  { address: "12 Place Kléber, 67000 Strasbourg, France", phone: "+33 3 88 32 66 19" },

  // Japan (6)
  { address: "3-14-1 Roppongi, Minato-ku, Tokyo 106-0032, Japan", phone: "+81 3 5555 4129" },
  { address: "1-1-2 Umeda, Kita-ku, Osaka 530-0001, Japan", phone: "+81 6 6208 7710" },
  { address: "4-1-1 Meieki, Nakamura-ku, Nagoya, Aichi 450-0002, Japan", phone: "+81 52 581 8819" },
  { address: "1-1 Shijo-dori, Shimogyo-ku, Kyoto 600-8001, Japan", phone: "+81 75 221 4410" },
  { address: "2-1-1 Tenjin, Chuo-ku, Fukuoka 810-0001, Japan", phone: "+81 92 733 5512" },
  { address: "4-1 Odori Nishi, Chuo-ku, Sapporo, Hokkaido 060-0042, Japan", phone: "+81 11 231 6619" },

  // Singapore & UAE (6)
  { address: "10 Collyer Quay, #18-01 Ocean Financial Centre, Singapore 049315", phone: "+65 6789 4412" },
  { address: "250 North Bridge Road, #12-01 Raffles City, Singapore 179101", phone: "+65 6338 7719" },
  { address: "1 Orchard Boulevard, #08-02 Camden Medical, Singapore 248649", phone: "+65 6734 5510" },
  { address: "Sheikh Zayed Road, Trade Centre 1, PO Box 9292, Dubai, United Arab Emirates", phone: "+971 4 324 8891" },
  { address: "Downtown Dubai, Emaar Square, Building 4, Dubai, United Arab Emirates", phone: "+971 4 456 7720" },
  { address: "Corniche Road, Al Danah, PO Box 3412, Abu Dhabi, United Arab Emirates", phone: "+971 2 621 4419" },

  // Europe - Italy, Spain, Netherlands, Switzerland, Ireland, Sweden (12)
  { address: "Via Condotti 68, 00187 Roma RM, Italy", phone: "+39 06 6987 4410" },
  { address: "Via Montenapoleone 14, 20121 Milano MI, Italy", phone: "+39 02 7600 8819" },
  { address: "Gran Vía 48, 28013 Madrid, Spain", phone: "+34 91 555 7712" },
  { address: "Passeig de Gràcia 55, 08007 Barcelona, Spain", phone: "+34 93 487 3320" },
  { address: "Keizersgracht 421, 1016 EK Amsterdam, Netherlands", phone: "+31 20 555 8819" },
  { address: "Coolsingel 104, 3011 AG Rotterdam, Netherlands", phone: "+31 10 411 4410" },
  { address: "Bahnhofstrasse 45, 8001 Zürich, Switzerland", phone: "+41 44 211 4420" },
  { address: "Rue du Rhône 65, 1204 Genève, Switzerland", phone: "+41 22 819 8810" },
  { address: "Grafton Street 42, Dublin 2, D02 F683, Ireland", phone: "+353 1 496 7712" },
  { address: "Patrick Street 112, Cork, T12 X432, Ireland", phone: "+353 21 427 4419" },
  { address: "Biblioteksgatan 9, 111 46 Stockholm, Sweden", phone: "+46 8 123 4567" },
  { address: "Kungsportsavenyen 21, 411 36 Göteborg, Sweden", phone: "+46 31 711 8810" },

  // Rest of World - Brazil, South Africa, Mexico, New Zealand (8)
  { address: "Av. Paulista 1578, Bela Vista, São Paulo - SP, 01310-200, Brazil", phone: "+55 11 3245-7789" },
  { address: "Av. Atlântica 2600, Copacabana, Rio de Janeiro - RJ, 22041-001, Brazil", phone: "+55 21 2548-4412" },
  { address: "Paseo de la Reforma 342, Juárez, Cuauhtémoc, 06600 Ciudad de México, Mexico", phone: "+52 55 5280 4410" },
  { address: "Av. Vallarta 2440, Arcos Vallarta, 44130 Guadalajara, Jal., Mexico", phone: "+52 33 3615 8819" },
  { address: "Victoria & Alfred Waterfront, Cape Town 8001, South Africa", phone: "+27 21 408 7600" },
  { address: "Sandton City, 83 Rivonia Road, Sandhurst, Sandton 2196, South Africa", phone: "+27 11 784 4410" },
  { address: "188 Quay Street, Auckland CBD, Auckland 1010, New Zealand", phone: "+64 9 373 7599" },
  { address: "120 Lambton Quay, Wellington Central, Wellington 6011, New Zealand", phone: "+64 4 472 8812" }
];

// Helper to sanitize name into realistic email handle
const makeHandle = (first, last, index) => {
  const f = first.toLowerCase().replace(/[^a-z0-9]/g, "");
  const l = last.toLowerCase().replace(/[^a-z0-9]/g, "");
  const style = index % 4;
  if (style === 0) return `${f}.${l}`;
  if (style === 1) return `${f}${l[0] || ""}`;
  if (style === 2) return `${f}_${l}`;
  return `${f}.${l[0] || ""}`;
};

// 1. UPDATE PATIENTS
const updatePatients = () => {
  const filePath = path.join(DATA_DIR, "patients.json");
  const patients = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const updated = patients.map((patient, i) => {
    const loc = GLOBAL_LOCATIONS[i % GLOBAL_LOCATIONS.length];
    const domain = EMAIL_DOMAINS[i % EMAIL_DOMAINS.length];
    const handle = makeHandle(patient.firstName, patient.lastName, i);

    return {
      ...patient,
      email: `${handle}@${domain}`,
      phone: loc.phone,
      address: loc.address
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  console.log(`✓ Updated ${updated.length} patients with real emails and global addresses.`);
  return updated;
};

// 2. UPDATE DOCTORS
const DOCTOR_LOCATIONS = [
  { hospital: "Mount Sinai Hospital, 1468 Madison Ave, New York, NY 10029, USA", phone: "+1 (212) 659-8555" },
  { hospital: "Apollo Hospitals, Road No. 72, Jubilee Hills, Hyderabad, Telangana 500033, India", phone: "+91 98490 22334" },
  { hospital: "Great Ormond Street Hospital, Great Ormond St, London WC1N 3JH, United Kingdom", phone: "+44 20 7405 9200" },
  { hospital: "Charité - Universitätsmedizin Berlin, Charitéplatz 1, 10117 Berlin, Germany", phone: "+49 30 450 50" },
  { hospital: "The Royal Melbourne Hospital, 300 Grattan St, Parkville VIC 3050, Australia", phone: "+61 3 9342 7000" },
  { hospital: "Toronto General Hospital, 200 Elizabeth St, Toronto, ON M5G 2C4, Canada", phone: "+1 (416) 340-4800" },
  { hospital: "Singapore General Hospital, Outram Road, Singapore 169608", phone: "+65 6222 3322" },
  { hospital: "Hôpital Européen Georges-Pompidou, 20 Rue Leblanc, 75015 Paris, France", phone: "+33 1 56 09 20 00" },
  { hospital: "The University of Tokyo Hospital, 7-3-1 Hongo, Bunkyo City, Tokyo 113-8655, Japan", phone: "+81 3 3815 5411" },
  { hospital: "Fortis Memorial Research Institute, Sector 44, Gurugram, Haryana 122002, India", phone: "+91 98112 33445" },
  { hospital: "Cedars-Sinai Medical Center, 8700 Beverly Blvd, Los Angeles, CA 90048, USA", phone: "+1 (310) 423-3277" },
  { hospital: "King's College Hospital, Denmark Hill, London SE5 9RS, United Kingdom", phone: "+44 20 3299 9000" },
  { hospital: "Universitätsklinikum München, Marchioninistraße 15, 81377 München, Germany", phone: "+49 89 4400 0" },
  { hospital: "Royal Prince Alfred Hospital, Missenden Rd, Camperdown NSW 2050, Australia", phone: "+61 2 9515 6111" },
  { hospital: "McGill University Health Centre, 1001 Decarie Blvd, Montreal, QC H4A 3J1, Canada", phone: "+1 (514) 934-1934" },
  { hospital: "National University Hospital, 5 Lower Kent Ridge Rd, Singapore 119074", phone: "+65 6779 5555" },
  { hospital: "Cleveland Clinic Abu Dhabi, Al Maryah Island, Abu Dhabi, United Arab Emirates", phone: "+971 2 659 9999" },
  { hospital: "Hospital Clínic de Barcelona, Carrer de Villarroel, 170, 08036 Barcelona, Spain", phone: "+34 93 227 5400" },
  { hospital: "Policlinico Umberto I, Viale del Policlinico, 155, 00161 Roma RM, Italy", phone: "+39 06 49971" },
  { hospital: "Kyoto University Hospital, 54 Kawaharacho, Shogoin, Sakyo Ward, Kyoto 606-8507, Japan", phone: "+81 75 751 3111" },
  { hospital: "Manipal Hospital, 98 HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017, India", phone: "+91 98801 77889" },
  { hospital: "Johns Hopkins Hospital, 1800 Orleans St, Baltimore, MD 21287, USA", phone: "+1 (410) 955-5000" },
  { hospital: "St Bartholomew's Hospital, W Smithfield, London EC1A 7BE, United Kingdom", phone: "+44 20 7377 7000" },
  { hospital: "Max Super Speciality Hospital, 1, 2, Press Enclave Marg, Saket, New Delhi 110017, India", phone: "+91 98103 44556" }
];

const updateDoctors = () => {
  const filePath = path.join(DATA_DIR, "doctors.json");
  const doctors = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const updated = doctors.map((doctor, i) => {
    const loc = DOCTOR_LOCATIONS[i % DOCTOR_LOCATIONS.length];
    const domain = EMAIL_DOMAINS[i % EMAIL_DOMAINS.length];
    // Clean doctor name: remove 'Dr. '
    const cleanName = doctor.name.replace(/^Dr\.\s*/i, "").trim();
    const parts = cleanName.split(/\s+/);
    const first = parts[0] || "doc";
    const last = parts[parts.length - 1] || "care";
    const handle = `dr.${first.toLowerCase().replace(/[^a-z0-9]/g, "")}.${last.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    return {
      ...doctor,
      email: `${handle}@${domain}`,
      phone: loc.phone
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  console.log(`✓ Updated ${updated.length} doctors with real emails and clinic phone numbers.`);
  return updated;
};

// 3. UPDATE USERS
const updateUsers = (firstPatient, firstDoctor) => {
  const filePath = path.join(DATA_DIR, "users.json");
  const users = [
    {
      id: "demo-patient",
      role: "Patient",
      name: `${firstPatient.firstName} ${firstPatient.lastName}`,
      email: firstPatient.email,
      patientId: firstPatient.id,
      label: `Patient: ${firstPatient.firstName} ${firstPatient.lastName}`
    },
    {
      id: "demo-doctor",
      role: "Doctor",
      name: firstDoctor.name,
      email: firstDoctor.email,
      doctorId: firstDoctor.id,
      specialization: firstDoctor.specialization,
      label: `${firstDoctor.name} (${firstDoctor.specialization})`
    },
    {
      id: "demo-admin",
      role: "Admin",
      name: "Clinic Administrator",
      email: "admin.cliniccare@gmail.com",
      label: "System Administrator"
    }
  ];

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");
  console.log(`✓ Synchronized demo users in users.json.`);
};

// Run all updates
const updatedPatients = updatePatients();
const updatedDoctors = updateDoctors();
updateUsers(updatedPatients[0], updatedDoctors[0]);
console.log("\n🎉 ALL CLINIC DATA FILES SUCCESSFULLY UPDATED WITH REAL DATA!");

