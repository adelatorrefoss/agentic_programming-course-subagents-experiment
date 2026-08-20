# Demo
1. `docker compose up`
2. `npm run configure-rabbitmq`
3. `npm run publish-outbox`
4. `npm run consume-rabbitmq`
5. `npm run insert-duplicate-events -- 100`

## Harnesses

- Agent harness and agent configuration: [`docs/agent-harness.md`](docs/agent-harness.md).
- Test infrastructure and external test services: [`docs/test-infrastructure.md`](docs/test-infrastructure.md).
