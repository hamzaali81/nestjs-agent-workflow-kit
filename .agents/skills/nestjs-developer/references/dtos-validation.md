# DTOs and validation

Global pipe in `main.ts`:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
}));
```

## Create DTO

```typescript
export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @Length(2, 80)
  name: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

## Update DTO (mapped type)

```typescript
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

`PartialType`, `PickType`, `OmitType`, `IntersectionType` from `@nestjs/swagger` (or `@nestjs/mapped-types`) keep validation + OpenAPI metadata.

## Nested objects

```typescript
export class CreateOrderDto {
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)   // REQUIRED or validation silently passes
  items: OrderItemDto[];
}
```

## Query DTO with pagination

```typescript
export class UsersQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 20;

  @IsOptional() @IsString()
  search?: string;
}
```

## Response serialization

Exclude sensitive fields by default:

```typescript
export class UserEntity {
  id: string;
  email: string;
  @Exclude() passwordHash: string;
  constructor(partial: Partial<UserEntity>) { Object.assign(this, partial); }
}
// app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

Or map to an explicit response DTO. Never return raw Prisma models that carry secrets.

## Rules

- Interfaces cannot be validated (erased at runtime)—use classes.
- Do not re-validate DTO input manually in services; validate only data that never passed a DTO (queue/third-party) at that boundary.
- DTOs describe shape/constraints only—no business logic.
