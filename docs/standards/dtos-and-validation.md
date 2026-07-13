# DTOs and validation

Input contracts and validation are enforced with **class-validator + class-transformer** DTOs and a global `ValidationPipe`.

## Global ValidationPipe (required)

Register once in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // strip unknown properties
    forbidNonWhitelisted: true,   // reject unknown properties
    transform: true,              // instantiate DTO classes, coerce types
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

Do **not** create per-controller `ValidationPipe` instances that duplicate this unless a route genuinely needs different options.

## DTO rules

- **Every** request body, query, and non-trivial param is a class DTO with `class-validator` decorators. No plain interfaces or inline object types for validated input (interfaces are erased at runtime and cannot be validated).
- One DTO per operation: `CreateXDto`, `UpdateXDto`, `XQueryDto`. Derive updates with mapped types: `class UpdateXDto extends PartialType(CreateXDto) {}`.
- Validate primitives precisely: `@IsUUID()`, `@IsEmail()`, `@IsInt()`, `@IsEnum()`, `@Min()/@Max()`, `@Length()`. Use `@IsOptional()` for optional fields; do not mark everything optional.
- Nested objects/arrays use `@ValidateNested({ each: true })` **with** `@Type(() => ChildDto)` from class-transformer, or validation silently passes.
- Use `@Transform` for normalization (trim, lowercase email) rather than doing it in the service.

## Response DTOs and serialization

- Do **not** return raw persistence models from controllers. Map to a response DTO, or use `ClassSerializerInterceptor` with `@Exclude()` on sensitive fields (`passwordHash`, internal flags) and `@Expose()` for the public shape.
- Sensitive fields must be excluded by default; opt them **in**, never out.

## Query and pagination

- Pagination/filter/sort params live in a `XQueryDto` with defaults and bounds (`@Min(1)`, a capped `@Max` on page size). Coerce numbers via `transform` + `@Type(() => Number)`.

## Project rules

- Do **not** call `class-validator` functions manually inside services for request input—the pipe already validated it. Manual validation is only for values that never passed through a DTO (e.g. data from a queue or third party), and then validate at that boundary.
- Keep DTOs free of business logic. They describe shape and constraints only.

See also: [controllers.md](controllers.md), [openapi-swagger skill](../../.agents/skills/openapi-swagger/SKILL.md) for `@ApiProperty` on DTOs.
