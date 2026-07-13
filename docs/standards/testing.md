# Testing

Tests use **Jest** (unit) and **Supertest** (E2E) with Nest's `Test.createTestingModule` harness.

## Unit tests

- Test services and business logic in isolation. Build the module with `Test.createTestingModule({ providers: [...] })` and **mock collaborators** (repositories, other services, `PrismaService`) with `jest.fn()`-backed objects bound via `useValue`.
- Do **not** hit a real database or network in unit tests. Mock `PrismaService` (or the repository) so tests are fast and deterministic.
- Assert behavior and error paths: expected `HttpException`s (`await expect(fn()).rejects.toThrow(NotFoundException)`), not just happy paths.
- Prefer testing through the public method surface; do not reach into private methods.

## Controller tests

- Unit-test controllers with a mocked service to verify wiring (correct service method called with mapped args, response shape). Full request validation is better covered by E2E.

## E2E tests

- Spin up the app with `Test.createTestingModule({ imports: [AppModule] })` → `createNestApplication()`, apply the **same** global pipes/filters/interceptors as `main.ts` (otherwise validation/serialization differ from production), and drive it with **Supertest** (`request(app.getHttpServer())`).
- Cover the real request path: validation rejections (`400` on bad DTO), auth guards (`401/403`), not-found (`404`), and success shapes.
- Use a dedicated **test database** (or transactional rollback / a fresh schema per run); never run E2E against a shared or production DB. Reset state between tests.

## Mocks and fixtures

- Use `jest.fn()` for mocks and `mockResolvedValue`/`mockRejectedValue` for async collaborators.
- Keep fixtures/factories colocated and small; avoid giant shared fixture files that couple unrelated tests.
- Restore mocks between tests (`afterEach(() => jest.restoreAllMocks())` / `clearMocks: true`).

## Coverage expectations

- Every service with business logic has unit tests for its main flows and error cases.
- Every endpoint group has at least one E2E test covering success and one validation/authorization failure.

**Audit:** Flag tests that call a real DB/network in unit scope; E2E apps that skip the global pipes/filters; tests asserting only happy paths for logic with error branches.

See also: [providers-and-services.md](providers-and-services.md), [database.md](database.md), [`.agents/skills/nestjs-developer/SKILL.md`](../../.agents/skills/nestjs-developer/SKILL.md).
