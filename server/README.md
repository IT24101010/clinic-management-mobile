# Clinic Management System — Backend API

Backend RESTful API for the ML-Assisted Clinic Management System platform.

## Technologies
- Node.js & Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

## Setup
1. Clone the repository and `cd` into the `server` folder.
2. Run `npm install` to install dependencies.
3. Create a `.env` file (you can copy `.env.example` if available) and provide the following variables.
4. Run the development server with `npm run dev` (starts on nodemon) or standard `node server.js` using `npm start`.

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | Your complete MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens |
| `PORT` | API server port (default: 5000) |

## API Routes Overview

| Mounting Prefix | Module / Ownership |
|---|---|
| `/api/users` | Patient Profiles & Auth (Hiruna) |
| `/api/appointments` | Appointment Scheduling (Kavindi) |
| `/api/doctors` | Doctor Directory (Madusanka) |
| `/api/services` | Medical Services Catalog (Shehani) |
| `/api/feedback` | Feedback & Reviews (Dineth) |
| `/api/announcements` | Announcements Management (Athief) |

## How to add your module's routes
Each team member should:
1. Create your route file in `routes/` (e.g., `doctorRoutes.js`).
2. Create your controller in `controllers/`.
3. Create your schema models in `models/`.
4. Your routes are already mounted in the main `server.js` file to your target prefix, so you only need to define the endpoints inside your router file.
