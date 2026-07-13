# Core engineering

Project-wide TypeScript, configuration, and security expectations. For NestJS API depth, use [`.agents/skills/nestjs-developer/SKILL.md`](../../.agents/skills/nestjs-developer/SKILL.md) and its `references/` folder.

## TypeScript

- Use **strict** type checking (`strict: true`, `noImplicitAny`, `strictNullChecks`). Do not relax compiler flags to silence errors.
- Prefer type inference when the type is obvious; annotate public method signatures and exported symbols explicitly.
- Avoid the `any` type; use `unknown` when the type is uncertain and narrow before use.
- Do **not** use non-null assertions (`!`) to bypass null checks—handle the null case.
- Prefer `readonly` for injected dependencies and fields that never reassign.

## Async and errors

- All I/O returns a `Promise`; always `await` it (do not leave floating promises). Enable `no-floating-promises` in ESLint.
- Throw NestJS `HttpException` subclasses (`NotFoundException`, `BadRequestException`, etc.) for expected failures; let the global exception filter shape the response. See [error-handling.md](error-handling.md).
- Do not swallow errors with empty `catch`. Log with context or rethrow.

## Configuration and secrets

- Read configuration through the typed `ConfigService`, never `process.env` directly in feature code. See [configuration.md](configuration.md).
- Never commit secrets. Env values must be validated at boot; the app should fail fast on missing/invalid config.

## Security baseline

- Validate and whitelist **all** external input with DTOs + `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`). See [dtos-and-validation.md](dtos-and-validation.md).
- Enable `helmet`, CORS with an explicit origin allowlist, and rate limiting (`@nestjs/throttler`) at the app level.
- Never log secrets, tokens, or full request bodies containing credentials.

## Logging

- Use the Nest `Logger` (or a structured logger like `pino` via `nestjs-pino`), not `console.log`, in application code.
- Log at the boundary (interceptor/filter) rather than sprinkling logs through business logic.
