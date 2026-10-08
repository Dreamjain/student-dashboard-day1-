# AI Academic Copilot

Phase 3 starts with a deliberately narrow AI boundary.

## Architecture

```
React AIAssistant
      |
      | authenticated GET
      v
Express /api/ai/analysis
      |
      +--> MongoDB (authorized student's academic records)
      |
      +--> deterministic metrics
      |
      v
AI service boundary
      |
      v
OpenAI Responses API
```

The browser never receives or sends the OpenAI API key. The backend authenticates the current student, loads only that student's academic records, calculates exact metrics, and sends a bounded context to the model.

## Phase 3.1 foundation

- Server-side provider integration
- Environment-based API configuration
- Student-only authorization
- Dedicated AI rate limit: 10 requests/minute
- Fail-closed behavior when the provider is not configured
- Provider errors are returned as normal API errors without exposing provider details
- Automated provider-boundary tests

## Phase 3.2 first capability

The first user-facing capability is performance analysis. The backend supplies marks and attendance facts; the model explains patterns and produces prioritized actions.

Deterministic calculations such as attendance percentage stay in application code. The model is not trusted to calculate authoritative academic values.

## Configuration

```env
OPENAI_API_KEY=server-side-secret
OPENAI_MODEL=gpt-6-luna
```

Keep the key only in local environment configuration or the deployment platform's secret store. Never commit it.

## Next steps

1. Attendance intelligence
2. Personalized study planner
3. Academic Copilot chat
4. Trends/predictions with evaluation
5. Faculty insights
6. AI security, cost controls, and evaluation suite
