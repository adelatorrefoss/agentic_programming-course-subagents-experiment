# Test infrastructure

The integration and repository tests require PostgreSQL and Ollama.

## Prerequisites

- Node.js 20 or newer.
- Docker Compose.
- Ollama installed and running at `http://127.0.0.1:11434`.
- The pinned embedding model `qwen3-embedding:0.6b`.

Start PostgreSQL and Ollama before running the checks:

```bash
docker compose up -d --wait postgres
ollama serve
npm run harness:ollama:prepare
npm run harness:check
```

`harness:check` fails early when either PostgreSQL or the required Ollama model is unavailable. This avoids reporting an external dependency failure as an application test failure.

## Validation commands

```bash
npm run prep
```

`npm run prep` performs the service healthcheck, lint, build, regular tests,
and PostgreSQL `.ci` integration tests. Use `npm run test:ci` only when you need
to rerun the integration-test subset in isolation.

## Model cache policy

CI caches `~/.ollama` using a key containing the pinned model and cache version (`v1`). Increment the cache version in `.github/workflows/ci.yml` when changing the model, model tag, or cache layout. The exact model tag is intentionally shared by local development and CI.

To validate a clean model download and detect hidden cache dependencies:

```bash
npm run harness:ollama:prepare:no-cache
```

The no-cache command removes only the configured model, downloads it again, and verifies it through the Ollama API.
