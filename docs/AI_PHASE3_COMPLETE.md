# AI Academic Copilot — Phase 3

## Implemented

- AI performance analysis
- Attendance intelligence
- Personalized 7-day study planning
- Academic Copilot chat
- Deterministic academic trends
- Server-side API key protection
- Student-only authorization for student AI features
- Request rate limiting
- Chat input limits
- Academic context size limits
- Deterministic calculations remain outside the model

## Runtime architecture

React AI Assistant -> Express AI routes -> authorized academic context -> AI service -> OpenAI Responses API.

The browser never receives the provider API key.

## Safety and reliability

The application calculates authoritative attendance and marks metrics itself. The model receives those facts for interpretation and planning. AI requests are explicitly triggered by the user instead of running on every dashboard load.

Chat messages are bounded to 2,000 characters and the serialized academic context is bounded before it reaches the model.

## Configuration

Set these server-side:

OPENAI_API_KEY=your-server-side-secret
OPENAI_MODEL=gpt-6-luna

Do not commit secrets.

## Cost controls

AI calls use a bounded output budget and an application-level request limit. Deterministic trends do not call the model.

## Next production hardening

- Add provider usage telemetry and spend alerts.
- Add structured output schemas for machine-readable AI cards.
- Add an evaluation dataset with expected safe behavior.
- Add faculty-facing AI intervention insights behind faculty authorization.
- Add persistent conversation history only after retention requirements are defined.
