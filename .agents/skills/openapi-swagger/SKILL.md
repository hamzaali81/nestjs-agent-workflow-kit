---
name: openapi-swagger
description: Documents NestJS APIs with OpenAPI via @nestjs/swagger — DocumentBuilder setup, decorating controllers and DTOs, auth schemes, and response typing. Use when adding or reviewing API documentation, annotating endpoints/DTOs, or exposing a Swagger UI.
license: MIT
metadata:
  author: nestjs-agent-workflow-kit
  version: '1.0'
---

# OpenAPI / Swagger

Every public endpoint and DTO is documented so the generated OpenAPI spec is accurate and usable.

## Setup (`main.ts`)

```typescript
const config = new DocumentBuilder()
  .setTitle('My API')
  .setDescription('...')
  .setVersion('1')
  .addBearerAuth()
  .build();
SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
```

Consider the `@nestjs/swagger` CLI plugin (in `nest-cli.json`) to auto-infer `@ApiProperty` from DTO types and validation decorators—reduces boilerplate but still annotate anything non-obvious.

## Controllers

```typescript
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  create(@Body() dto: CreateUserDto) { /* ... */ }
}
```

- `@ApiTags` groups endpoints; one tag per resource.
- `@ApiOperation` gives a short summary.
- Use typed response decorators (`@ApiOkResponse`, `@ApiCreatedResponse`, `@ApiNotFoundResponse`) with a `type` so schemas are generated.
- `@ApiBearerAuth()` / `@ApiSecurity(...)` on protected routes to match the guard.

## DTOs

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'ann@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional() @IsEnum(UserRole)
  role?: UserRole;
}
```

- `@ApiProperty` / `@ApiPropertyOptional` on every field (or rely on the CLI plugin).
- Use mapped types (`PartialType`, `PickType`) from `@nestjs/swagger` so they carry both validation **and** Swagger metadata.
- Document response DTOs too—do not point Swagger at raw persistence models.

## Rules

- Keep the spec truthful: annotated status codes must match what the handler + filters actually return.
- Do not expose internal/admin routes in the public document—use multiple documents or `@ApiExcludeEndpoint()`.
- Auth scheme in the document must match the real guard (bearer/JWT/api-key).

See also: [dtos-and-validation.md](../../../docs/standards/dtos-and-validation.md), [controllers.md](../../../docs/standards/controllers.md).
