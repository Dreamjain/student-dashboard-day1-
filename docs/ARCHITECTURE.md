# Student Dashboard Architecture

## 1. System overview

Student Dashboard is a full-stack application split into a React frontend and an Express/MongoDB API.

```text
Browser
  |
  | HTTPS + JSON + cookies
  v
+---------------------+
| React + Vite / Nginx|
+----------+----------+
           |
           | Axios / REST
           v
+---------------------+
| Express API         |
| Auth + CSRF         |
| Rate limiting       |
| Validation          |
| Logging + metrics   |
+----+-----------+----+
     |           |
     |           +------------------+
     v                              |
+-----------+                        |
| MongoDB   |                        |
+-----------+                        |
                                      |
                               +------+------+
                               | Redis REST  |
                               | production  |
                               +-------------+
```

## 2. Frontend

The frontend uses React 19 with Vite.

Responsibilities:
- Login and session-aware routing
- Student dashboard, marks, attendance, timetable
- Faculty management workflows
- Axios API communication
- CSRF header propagation
- Session refresh handling
- Error and loading states
- Responsive and accessible dashboard UI

The production frontend is compiled into static assets and served by Nginx.

## 3. Backend

The backend uses Node.js, Express 5 and Mongoose.

Major layers:
- `routes/` — HTTP route definitions
- `controllers/` — request/business handling
- `models/` — MongoDB schemas
- `middleware/` — security, auth, CSRF, rate limiting, errors
- `utils/` — sessions, cookies, logger and shared helpers
- `config/` — database configuration

The API exposes health, readiness, metrics and OpenAPI endpoints in addition to academic resources.

## 4. Authentication and security

Browser authentication uses HttpOnly session cookies. Refresh sessions rotate and revoked-token reuse can invalidate the session family.

State-changing browser requests use a signed CSRF token. Production cookies are Secure and the API uses an explicit frontend origin.

Login endpoints use distributed Redis-backed rate limiting in production.

Sensitive values are redacted from structured logs.

## 5. Observability

Each request receives an `X-Request-ID`.

Structured logs include:
- timestamp
- level
- service
- request ID
- method/path
- status
- duration

`GET /health/metrics` exposes lightweight counters and process memory data without request bodies or credentials.

## 6. Deployment topology

### Local Docker Compose

```text
Browser -> Nginx frontend :8080
                    |
                    v
             Express API :5000
                    |
                    v
              MongoDB :27017
```

### Production Render topology

```text
Browser
  |
  v
Render Static Site
  |
  v
Render Node Web Service
  |              |
  v              v
MongoDB Atlas   Upstash Redis REST
```

The production deployment uses environment variables for all secrets and infrastructure connection strings.

## 7. CI/CD

GitHub Actions validates:
1. Backend syntax and tests
2. Frontend tests, lint and production build
3. Runtime dependency audits
4. Docker Compose configuration
5. Backend and frontend container builds

After a successful main-branch quality workflow, the deployment workflow can trigger a Render deploy hook stored as the `RENDER_DEPLOY_HOOK` GitHub Actions secret.

## 8. Design decisions

- **React + Vite:** fast development and static production builds.
- **Express:** small REST API surface with clear middleware composition.
- **MongoDB:** document-oriented academic records with Mongoose validation.
- **Redis REST:** shared production login rate-limit state across API instances.
- **HttpOnly cookies:** keeps browser tokens inaccessible to JavaScript.
- **Nginx:** efficient static asset delivery and SPA fallback.
- **Docker Compose:** reproducible local multi-service development.
- **GitHub Actions:** repeatable quality gates before deployment.