# Error handling and cross-cutting concerns

Errors, serialization, auth, and logging are handled by the framework's cross-cutting building blocks—**pipes, guards, interceptors, and exception filters**—not by ad hoc code in controllers and services.

## Exceptions

- Throw built-in `HttpException` subclasses for expected failures: `NotFoundException`, `BadRequestException`, `ForbiddenException`, `ConflictException`, `UnauthorizedException`. Use the right status code.
- Do **not** return error-shaped objects (`{ error: '...' }`) with a `200`. Throw and let the filter shape the response.
- Domain/business errors can be custom `HttpException` subclasses; infrastructure errors (Prisma, HTTP client) are **mapped** to `HttpException`s—never leaked raw.

## Global exception filter

- Register a global exception filter (via `APP_FILTER`) that produces a **consistent error body** (e.g. `{ statusCode, message, error, timestamp, path }`) and logs unexpected (non-`HttpException`) errors with a correlation id.
- Map known Prisma errors here or in a dedicated `PrismaExceptionFilter` (`P2002` → `409`, `P2025` → `404`). See [database.md](database.md).
- Never expose stack traces, SQL, or internal messages to clients in production.

## Pipes

- Validation and transformation happen in **pipes**. The global `ValidationPipe` validates DTOs ([dtos-and-validation.md](dtos-and-validation.md)); param pipes (`ParseUUIDPipe`, `ParseIntPipe`) reject malformed identifiers before the handler runs.

## Guards

- Authentication and authorization are **guards** (`AuthGuard`, `RolesGuard`), applied with `@UseGuards` or globally via `APP_GUARD`. Do not put auth checks inside handlers or services.
- Use metadata decorators (`@Roles(...)`, `@Public()`) read via `Reflector`, rather than hard-coded role strings in the guard.

## Interceptors

- Use interceptors for cross-cutting response/request behavior: response shaping/`ClassSerializerInterceptor`, logging/timing, caching, timeout, and mapping. Register app-wide ones via `APP_INTERCEPTOR`.
- Serialization: exclude sensitive fields with `ClassSerializerInterceptor` + `@Exclude()`, or map to response DTOs. Sensitive fields are excluded by default ([dtos-and-validation.md](dtos-and-validation.md)).

## Logging

- Log at the boundary—an interceptor for request/response, the exception filter for errors—not scattered through business logic ([core-engineering.md](core-engineering.md)).
- Include a request/correlation id; never log secrets, tokens, or credential-bearing bodies.

**Audit:** Flag try/catch in controllers that could be a filter; flag inline auth checks that belong in a guard; flag raw Prisma/HTTP errors reaching the client; flag `console.*` in application code; flag manual per-handler response wrapping that duplicates an interceptor.

See also: [controllers.md](controllers.md), [dtos-and-validation.md](dtos-and-validation.md), [database.md](database.md).
