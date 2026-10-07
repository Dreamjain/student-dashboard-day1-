# Portfolio Presentation

## Project title

**Student Dashboard — Production-Oriented Full-Stack Academic Platform**

## One-line description

A secure full-stack academic dashboard with student/faculty workflows, session-based authentication, distributed rate limiting, automated tests, API documentation, monitoring and containerized deployment.

## Technology

React · Vite · Node.js · Express · MongoDB · Mongoose · Redis · Docker · GitHub Actions

## Engineering highlights

- Implemented student and faculty authentication flows.
- Added role-based authorization for academic operations.
- Hardened browser sessions with rotating refresh tokens and replay detection.
- Added signed, session-bound CSRF protection.
- Added production Redis-backed login rate limiting.
- Built responsive student and faculty dashboard experiences.
- Added automated backend and frontend test coverage.
- Published an OpenAPI 3.0 contract and Swagger UI.
- Added structured JSON logging, request IDs and runtime metrics.
- Added Dockerfiles, Compose orchestration and container health checks.
- Added CI quality gates for tests, linting, builds, audits and Docker images.
- Added optional main-branch deployment automation through a Render deploy hook.

## Recruiter-facing summary

This project demonstrates more than CRUD development: authentication, authorization, security controls, session management, distributed rate limiting, testing, API design, observability, containerization and CI/CD.

## Recommended repository presentation

Keep the repository README focused on:
- what the application does
- architecture
- security
- engineering quality
- deployment
- project structure

Use the detailed documentation for implementation-specific material so the main README remains easy to scan.

## Demo status

Do not claim a live demo URL unless a production deployment is actually verified. The repository contains deployment configuration and a CI/CD path, but production hosting still requires valid infrastructure and secrets.