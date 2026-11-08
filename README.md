# Clinic Appointment System

A web-based clinic appointment management system for patients, doctors, and clinic administrators. Patients can find doctors, check availability, and manage appointments. Doctors and administrators have role-specific workspaces for daily scheduling and clinic operations.

## Features

### Patient
- Browse doctors and filter by specialty or search.
- View available appointment times and book consultations.
- View, cancel, and reschedule appointments.
- Review upcoming and past appointment information.

### Doctor
- Review today's and upcoming appointments.
- View appointment and patient details.
- Mark scheduled appointments as completed.

### Administrator
- Review clinic appointment statistics.
- Create, update, and remove patient and doctor records.
- View and manage clinic appointments and their statuses.

The navigation provides a role selector to enter each workspace. This is workspace selection only; the application does not currently provide identity verification, sign-in, or access control backed by authenticated accounts.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Bootstrap, Bootstrap Icons |
| HTTP client | Axios |
| Backend | Node.js, Express.js, CORS |
| Current data storage | Persistent JSON files, accessed with Node.js filesystem APIs |
| Initial data | Faker.js, used by the optional seed command |

## Architecture

```text
React single-page application
          |
        Axios
          |
Express REST API (Node.js)
          |
Persistent JSON files (server/data/)
```

The Vite development server proxies `/api` requests to the Express server at `http://localhost:5000`. The Express API reads and writes the JSON collections in `server/data/`. Patient, doctor, appointment, and clinic-role records persist across application and server restarts.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Installation

Install dependencies separately for the frontend and backend:

```bash
cd server
npm install

cd ../client
npm install
```

## Initialize Data

The repository includes persistent JSON collections in `server/data/`. To replace them with a newly initialized set of synthetic demo records, run:

```bash
cd server
npm run seed
```

The seed command uses Faker.js to initialize **100 patients, 24 doctors, and 240 appointments**. It writes patients, doctors, appointments, and clinic-role records to JSON files. **Running the seed command replaces the current contents of those collections.**

To expand a smaller existing dataset while preserving its records, run `npm run seed:expand` from `server/`. This adds records up to those same totals and uses `.invalid` email addresses and reserved demo phone numbers. It is safe to run more than once.

## Run the Application

Start the backend in one terminal:

```bash
cd server
npm run dev
```

The Express API listens at `http://localhost:5000`.

Start the frontend in a separate terminal:

```bash
cd client
npm run dev
```

Open the Vite address printed in the terminal (by default, `http://localhost:5173`).

## REST API Overview

All application endpoints are under `/api`.

| Area | Endpoints | Purpose |
|---|---|---|
| Health | `GET /health` | API status, JSON storage status, and collection counts |
| Patients | `GET /patients`, `GET /patients/:id`, `POST /patients`, `PUT /patients/:id`, `DELETE /patients/:id` | Search, retrieve, create, update, and remove patient records |
| Doctors | `GET /doctors`, `GET /doctors/:id`, `POST /doctors`, `PUT /doctors/:id`, `DELETE /doctors/:id` | Search, retrieve, create, update, and remove doctor records |
| Appointments | `GET /appointments`, `GET /appointments/:id`, `POST /appointments`, `PUT /appointments/:id`, `DELETE /appointments/:id` | Retrieve, book, update, reschedule, cancel, or permanently remove appointments |
| Availability | `GET /appointments/availability?doctorId=:id&date=:date` | Retrieve appointment-slot availability for a doctor and date |
| Dashboard | `GET /dashboard/stats?role=Admin\|Doctor\|Patient` | Retrieve role-specific dashboard statistics |
| Clinic roles | `GET /users`, `GET /users/:id` | Retrieve the role records used by the workspace selector |

Appointment listing supports `doctorId`, `patientId`, `status`, and `date` query parameters. Patient and doctor listing support search filters; doctor listing also supports filtering by `specialization`. Appointment booking and rescheduling validate availability and reject conflicting active bookings with HTTP `409 Conflict`. Deleting an appointment normally marks it cancelled and preserves its history; `?hard=true` permanently removes it.

## Data Storage

The current application uses persistent JSON files as its operational data store; it does not connect to a relational or document database. The JSON collections are stored in `server/data/`:

- `patients.json`
- `doctors.json`
- `appointments.json`
- `users.json`

Faker.js is used by the seed scripts to initialize synthetic development records. Generated contact addresses use the reserved `.invalid` domain and demo phone numbers; they are not real contact channels. Existing imported records are preserved by `seed:expand`, while their contact values are normalized to demo-only values. Use suitable real contact information and a production-ready data-storage design before any live clinical deployment.

## Future Enhancements

The following capabilities are not currently implemented:

- Authentication and authorization for patient, doctor, and administrator accounts.
- Migration from JSON files to a production database.
- Appointment confirmation and reminder notifications.
- Payment processing.
- Production deployment and operational monitoring.
