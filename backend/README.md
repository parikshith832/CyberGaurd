AI Assist (backend)

- To run the API server with a real Gemini model, set `GEMINI_API_KEY` in your environment (or `.env`) and start the server:

```pwsh
$env:GEMINI_API_KEY = "your_key_here"
node server.js
```

- For local testing without a Gemini key, enable the mock AI by setting `DEV_MOCK_AI=true` before starting the server. This returns a deterministic mock suggestion useful for integration tests.

```pwsh
$env:DEV_MOCK_AI = "true"
node server.js
```

- Run the included integration check (assumes the server is running on port `3001`):

```pwsh
cd backend
npm run test:ai
```

Notes:

- The mock is intentionally opt-in via `DEV_MOCK_AI` so production deployments without a Gemini key fail fast and surface a clear 503 with setup instructions.
- To add automated CI, configure environment variables appropriately (either provide a real `GEMINI_API_KEY` or enable `DEV_MOCK_AI` in CI for the test stage).
