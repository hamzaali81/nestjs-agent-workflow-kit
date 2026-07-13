# Providers and dependency injection

## Constructor injection

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly users: UsersRepository,
    private readonly mail: MailService,
  ) {}
}
```

Always `private readonly`. Do not `new` DI-managed classes—let the container inject them.

## Custom providers

Use tokens when injecting non-class values or swapping implementations:

```typescript
// token
export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

// binding
{ provide: PAYMENT_GATEWAY, useClass: StripeGateway }
{ provide: 'CONFIG_OPTIONS', useValue: { retries: 3 } }
{ provide: CACHE, useFactory: (cfg: ConfigService) => new Cache(cfg.get('redis.url')), inject: [ConfigService] }

// injection
constructor(@Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway) {}
```

Bind an abstract class to a concrete implementation at the module boundary when it aids testing/swapping; do not over-abstract single-implementation services.

## Provider scope

- Default **singleton** (`Scope.DEFAULT`). Fast, shared.
- `Scope.REQUEST` only when per-request state is unavoidable—it makes the whole injection chain request-scoped (perf cost). Prefer passing request/user data as method arguments instead of storing it on a singleton.
- `Scope.TRANSIENT` for providers that must not be shared between consumers.

## Lifecycle hooks

`OnModuleInit`, `OnApplicationBootstrap`, `OnModuleDestroy`, `OnApplicationShutdown` for setup/teardown (connect clients, warm caches, flush). Call `app.enableShutdownHooks()` in `main.ts` so destroy hooks run.

## Boundaries

Controller → one service method. Service → repositories/other services. Repository → persistence only. Keep transport (`req`/`res`/status codes) out of services and business rules out of repositories.
