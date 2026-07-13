# Controllers

Project policy for controllers and the HTTP transport layer. Generic NestJS patterns: [`.agents/skills/nestjs-developer/SKILL.md`](../../.agents/skills/nestjs-developer/SKILL.md).

## Responsibilities

Controllers are the **transport layer only**. A controller method should:

1. Bind the route (`@Get`, `@Post`, …) and extract typed input (`@Param`, `@Query`, `@Body`) as **DTOs**.
2. Call **one** service method.
3. Return the result (or a mapped response DTO). Let interceptors/filters handle serialization and errors.

Controllers must **not** contain business logic, data access (Prisma/HTTP/queues), or transaction handling. Push all of that into a service ([providers-and-services.md](providers-and-services.md)).

**Audit:** Flag any Prisma client, `HttpService`, queue, or `fetch` call inside a controller; flag branching business rules in a handler. Expose a service method instead.

## Thin handlers

Handlers should be 1–3 lines: extract input, call the service, return. If a handler has try/catch, loading branches, and multiple service calls, move that orchestration into the service and return a result the controller passes through.

## Routing conventions

- Version the API with URI versioning (`app.enableVersioning({ type: VersioningType.URI })`) or an explicit prefix; do not hand-roll `/v1` strings per route.
- Use plural, resource-oriented paths (`/users`, `/users/:id/orders`). Keep controllers RESTful; avoid verbs in paths.
- Use the correct HTTP methods and status codes. Use `@HttpCode(204)` for empty responses; return `201` from `@Post` creators by default.
- Bind params with typed pipes (`@Param('id', ParseUUIDPipe)` / `ParseIntPipe`) so malformed IDs fail before the service runs.

## Input and output

- **Every** request body, query, and param object is a DTO validated by the global `ValidationPipe`. See [dtos-and-validation.md](dtos-and-validation.md).
- Do **not** return raw Prisma models that may leak fields (password hashes, internal flags). Return a response DTO or rely on `ClassSerializerInterceptor` with `@Exclude`/`@Expose`. See [error-handling.md](error-handling.md).
- Do **not** read `@Res()`/`@Req()` raw objects except when you truly need library-specific behavior (streaming, cookies). Prefer Nest's declarative decorators so interceptors still run.

## Auth and guards

- Protect routes with **guards** (`@UseGuards(AuthGuard)`) and role/permission decorators, not inline checks inside handlers.
- Read the authenticated user via a custom `@CurrentUser()` param decorator, not `req.user` scattered in handlers.

## Documentation

- Annotate every endpoint for OpenAPI (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) and DTOs with `@ApiProperty`. See [`.agents/skills/openapi-swagger/SKILL.md`](../../.agents/skills/openapi-swagger/SKILL.md).

See also: [dtos-and-validation.md](dtos-and-validation.md), [providers-and-services.md](providers-and-services.md), [error-handling.md](error-handling.md).
