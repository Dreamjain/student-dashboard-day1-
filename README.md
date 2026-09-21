# 🎓 Student Dashboard

A full-stack academic dashboard built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend. Students can view attendance, marks, timetable data, and academic summaries through a component-based dashboard.

## 🖼️ Project Preview

The repository includes a frontend-based preview that documents the implemented dashboard structure. It is explicitly a concept preview rather than a screenshot of a running deployment.

![Student Dashboard frontend preview](docs/student-dashboard-preview.svg)

## ✨ Features

- Student and faculty login flows
- Student academic summary
- Attendance and marks views
- Timetable view
- Recharts-based visualizations
- React component-based UI
- REST API communication with Axios
- MongoDB persistence with Mongoose
- Backend health endpoint for operational checks
- Automated frontend and backend CI validation
- Documented REST API, authentication, authorization, CSRF, errors, and environment configuration

## 🏗️ Architecture

```text
React + Vite
     │
     │ Axios / HTTP
     ▼
Express REST API
     │
     │ Mongoose
     ▼
MongoDB
```

## 🧩 Frontend

Reusable components are organized under `frontend/src/components/`, including:

- `Login` — student authentication entry point
- `FacultyLogin` — faculty authentication entry point
- `Dashboard` — academic overview
- `Marks` — marks information
- `Attendance` — attendance information
- `Timetable` — class schedule
- `Sidebar` — dashboard navigation
- `Charts` — academic visualizations

## ⚙️ Backend

The backend exposes REST endpoints for students, attendance, marks, timetable, and faculty data. MongoDB configuration is loaded from environment variables rather than being hard-coded in source code.

The complete endpoint reference, access rules, request examples, error codes, authentication flow, CSRF behavior, rate limiting, and environment configuration are documented in [`docs/API.md`](docs/API.md).

### Health check

Once the API is running, open:

```text
GET http://localhost:5000/health
```

Expected response:

```json
{"status":"ok"}
```

## 🛠️ Technology Stack

- React 19 + Vite
- Node.js + Express 5
- MongoDB + Mongoose
- Axios
- Recharts
- ESLint
- GitHub Actions

## 🚀 Run Locally

### 1. Start MongoDB

Make sure a MongoDB instance is available locally or use a hosted MongoDB connection string.

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` if your MongoDB connection differs from the example:

```env
MONGO_URI=mongodb://127.0.0.1:27017/student-dashboard
PORT=5000
```

Install dependencies and start the API:

```bash
npm install
npm run dev
```

### 3. Seed demo students (optional)

In a second terminal:

```bash
cd backend
npm run seed
```

The seed script replaces the existing `Student` collection with the fictional demo records in `students.json` and generates a unique cryptographically random password for each seeded student. The generated credentials are printed once to the seed command output and should be treated as local-development secrets.

### 4. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will print the local frontend URL in the terminal.

## 🔐 Security Notes

- Browser authentication uses an `HttpOnly`, `SameSite` session cookie instead of storing JWTs in `localStorage`.
- State-changing browser requests use a signed, session-bound CSRF token in a custom request header.
- Production cookies require HTTPS; configure `COOKIE_SECURE=true` and use an appropriate `COOKIE_SAMESITE` value.
- Set `CLIENT_ORIGIN` to explicit frontend origins when using the API from another origin.
- `TRUST_PROXY` should only be enabled when the API is actually behind a trusted reverse proxy.
- The in-memory login rate limiter is intended for a single-process deployment; a shared store is required if the API is horizontally scaled.

## 📚 API Documentation

See [`docs/API.md`](docs/API.md) for the complete API reference and security/authentication flow.

## 🧪 Quality Checks

Backend syntax validation:

```bash
cd backend
npm ci
npm run check
```

Frontend lint and production build:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

GitHub Actions runs these checks automatically on pushes and pull requests.

## 📁 Project Structure

```text
.
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── App.jsx
│       └── ...
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
├── docs/
│   ├── student-dashboard-preview.svg
│   └── API.md
└── README.md
```

## 🎯 Engineering Demonstrated

- Full-stack React/Node.js architecture
- REST API design and separation of concerns
- MongoDB schema validation with Mongoose
- Environment-based configuration
- Input and error handling
- Authentication and authorization flow with session cookies and CSRF protection
- API documentation and security configuration
- Production build and lint validation
- CI quality gates with GitHub Actions

## 📌 Status

Development / learning project with an actively maintained full-stack implementation.

## 👨‍💻 Author

**Dreamjain**
