# Modules

Modules group related controllers and providers and define the DI boundary.

```typescript
@Module({
  imports: [PrismaModule],        // modules whose exports we use
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],        // what other modules may inject
})
export class UsersModule {}
```

## Rules

- Import a module to reuse its exported providers. **Never** re-declare another module's provider in your own `providers`—that creates a second instance.
- Export the minimum. Usually just the service; keep controllers/repositories/DTOs private.
- Use `@Global()` only for genuine app-wide infrastructure (`PrismaModule`, config). Overuse hides dependencies.

## Dynamic modules

Use `ConfigurableModuleBuilder` for modules that take options:

```typescript
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<MailOptions>().build();

@Module({ providers: [MailService], exports: [MailService] })
export class MailModule extends ConfigurableModuleClass {}
// MailModule.register({...}) / MailModule.registerAsync({ useFactory })
```

Async factories read from `ConfigService`, not `process.env`.

## Circular dependencies

Prefer extracting a shared module. If unavoidable, `forwardRef(() => OtherModule)` (and `@Inject(forwardRef(...))` for providers) with a comment explaining why.

## App composition

`AppModule` is the composition root: imports config, prisma, and feature modules, and registers app-wide cross-cutting providers so they participate in DI:

```typescript
providers: [
  { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, transform: true }) },
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
  { provide: APP_GUARD, useClass: AuthGuard },
]
```
