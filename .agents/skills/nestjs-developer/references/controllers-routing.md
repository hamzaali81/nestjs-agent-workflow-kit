# Controllers and routing

```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(@Query() query: UsersQueryDto) {
    return this.users.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.remove(id);
  }
}
```

## Rules

- Handlers are 1–3 lines: extract typed input → call one service method → return.
- No data access, no business branching, no transactions in controllers.
- Bind params with pipes (`ParseUUIDPipe`, `ParseIntPipe`) so malformed IDs fail early.
- Use correct methods/status codes; `@HttpCode(204)` for empty bodies, `201` default for `@Post`.
- Resource-oriented plural paths (`/users/:id/orders`); no verbs in paths.

## Versioning

```typescript
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
// @Controller({ path: 'users', version: '1' })
```

Do not hand-roll `/v1` strings per route.

## Auth and current user

Protect with guards (`@UseGuards(JwtAuthGuard)`), read the user with a custom decorator:

```typescript
export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
// findMe(@CurrentUser() user: AuthUser) { ... }
```

## Raw req/res

Avoid `@Req()`/`@Res()` except for streaming/cookies; using `@Res()` disables Nest's response handling (interceptors/serialization). Prefer declarative decorators.
