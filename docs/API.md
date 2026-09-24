# Student Dashboard API Reference

Base URL: `http://localhost:5000`

All API responses use JSON unless otherwise noted. Browser clients authenticate with the session cookie created by login. The backend also accepts an `Authorization: Bearer <jwt>` header for trusted non-browser integrations that already have a valid JWT.

## Authentication

### Student login

`POST /students/login`

Request:
```json
{
  "rollNumber": "DEMO-CSE-001",
  "password": "your-password"
}
```

On success, the API sets an HttpOnly authentication cookie and a signed CSRF cookie.

Response:
```json
{
  "message": "Login successful",
  "student": {
    "id": "student-id",
    "name": "Alex Carter",
    "rollNumber": "DEMO-CSE-001",
    "department": "CSE",
    "year": 3,
    "role": "student"
  }
}
```

### Faculty login

`POST /api/faculty/login`

Request:
```json
{
  "email": "faculty@example.com",
  "password": "your-password"
}
```

Response:
```json
{
  "message": "Login successful",
  "facultyId": "faculty-id",
  "role": "faculty"
}
```

### CSRF bootstrap

`GET /auth/csrf`

Issues a pre-authentication CSRF cookie for browser clients. The login requests must send that value in the `X-CSRF-Token` header.

### Logout

`POST /auth/logout`

Clears the browser authentication and CSRF cookies. Browser clients must send the CSRF header.

## Student endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/students/login` | Public | Student login |
| POST | `/students` | Faculty | Create a student |
| GET | `/students` | Faculty | List students |
| GET | `/students/:id` | Faculty | Get one student |
| PUT | `/students/:id` | Faculty | Update a student |
| DELETE | `/students/:id` | Faculty | Delete a student |
| GET | `/students/summary/:id` | Student (self) | Get academic summary |

### Create student

`POST /students`

Request:
```json
{
  "name": "Alex Carter",
  "rollNumber": "DEMO-CSE-011",
  "department": "CSE",
  "year": 3,
  "password": "strong-password"
}
```

Student passwords must satisfy the backend password policy.

## Attendance endpoints

All attendance endpoints require authentication.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/attendance` | Faculty | Record attendance |
| GET | `/attendance` | Faculty | List attendance |
| GET | `/attendance/student/:id` | Student (self) / Faculty | Student attendance |
| GET | `/attendance/history/:id` | Student (self) / Faculty | Attendance history |
| GET | `/attendance/report` | Faculty | Attendance report |

Example request:

```json
{
  "studentId": "student-id",
  "subject": "Computer Networks",
  "status": "present",
  "date": "2026-09-21"
}
```

The API rejects invalid dates and future attendance records.

## Marks endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/marks` | Faculty | Add marks |
| GET | `/marks/student/:id` | Student (self) / Faculty | Read student marks |

Example:

```json
{
  "studentId": "student-id",
  "subject": "Database Systems",
  "score": 87
}
```

Scores must be numeric values from 0 to 100. Duplicate student/subject mark records are rejected.

## Timetable endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/timetable` | Faculty | Add timetable entry |
| GET | `/timetable` | Authenticated | Read timetable |

## Faculty endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/faculty/login` | Public | Faculty login |
| POST | `/api/faculty/register` | Faculty | Register another faculty account |

## Health and service endpoints

| Method | Endpoint | Access | Response |
|---|---|---|---|
| GET | `/health` | Public | `{"status":"ok"}` |
| GET | `/health/ready` | Public | Database readiness; in production also requires the shared rate-limit store |
| GET | `/` | Public | Service status |
| GET | `/auth/csrf` | Public | CSRF bootstrap |

Unknown routes return:

```json
{
  "message": "Route not found"
}
```

## Authentication and CSRF behavior

Browser clients use an HttpOnly authentication cookie. JavaScript cannot read this cookie.

For state-changing browser requests (`POST`, `PUT`, `DELETE`), the frontend reads the non-HttpOnly CSRF cookie and sends the same value in:

```text
X-CSRF-Token: <csrf-token>
```

The backend verifies that the signed CSRF token is bound to the current session. Login uses a separate pre-authentication binding.

Trusted non-browser integrations that explicitly send:

```text
Authorization: Bearer <jwt>
```

can use the API without the browser CSRF mechanism. The browser login endpoints intentionally do not return the JWT; they establish the HttpOnly session cookie instead.

## Authorization model

- **Student:** can access their own summary, attendance, history, and marks.
- **Faculty:** can manage students, marks, attendance, timetable entries, and faculty registration.
- Requests for another student's protected data return `403`.
- Missing authentication returns `401`.
- Insufficient role permissions return `403`.

## Error responses

The API uses consistent JSON error responses.

Common statuses:

| Status | Meaning |
|---|---|
| 400 | Invalid request, validation failure, malformed JSON, or invalid resource ID |
| 401 | Authentication required or invalid/expired authentication |
| 403 | Insufficient permissions or invalid/missing CSRF token |
| 404 | Route not found |
| 409 | Duplicate resource |
| 429 | Login rate limit exceeded |
| 500 | Unexpected server error |

Example:

```json
{
  "message": "Authentication required"
}
```

Unexpected server errors do not expose stack traces to clients.

## Rate limiting

Student and faculty login endpoints are protected by a distributed Redis-backed rate limiter in production.

Current policy:

- 5 login attempts per IP
- 60-second window
- Excess attempts return `429`
- `Retry-After` is included when the limit is exceeded
- Redis operations use an atomic server-side Lua script
- Redis failures fail closed for the protected login endpoint with `503`
- Local development falls back to a process-local limiter when Redis credentials are not configured
- Production requires Redis credentials and does not use the local fallback

The production configuration uses a Redis REST endpoint such as Upstash Redis. The Redis URL and server-side token must never be exposed to the frontend or committed to Git.

## Environment configuration

Copy `backend/.env.example` to `.env`.

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT and CSRF signing secret; at least 32 characters |
| `PORT` | No | API port; defaults to 5000 |
| `CLIENT_ORIGIN` | No | Comma-separated allowed frontend origins |
| `TRUST_PROXY` | No | Enable only behind a trusted reverse proxy |
| `COOKIE_SECURE` | No | Enables Secure cookies |
| `COOKIE_SAMESITE` | No | Cookie SameSite policy; defaults to lax |
| `REDIS_REST_URL` | Production | Redis REST endpoint for distributed rate limiting |
| `REDIS_REST_TOKEN` | Production | Server-side Redis REST authentication token |

For production, use HTTPS, a strong random JWT secret, explicit frontend origins, and Secure cookies.

## Testing and CI

Backend:

```bash
cd backend
npm ci
npm run check
npm test
```

Frontend:

```bash
cd frontend
npm ci
npm test
npm run lint
npm run build
```

GitHub Actions runs backend tests against MongoDB and runs frontend tests, linting, and a production build on pushes and pull requests.

## Related documentation

- [Main project README](../README.md)
- [Environment example](../backend/.env.example)
- [CI workflow](../.github/workflows/quality.yml)
