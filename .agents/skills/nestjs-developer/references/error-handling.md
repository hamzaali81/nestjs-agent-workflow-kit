# Filters, guards, interceptors, pipes

Cross-cutting concerns are expressed as building blocks, registered per-handler, per-controller, or globally (`APP_FILTER`/`APP_GUARD`/`APP_INTERCEPTOR`/`APP_PIPE`).

## Exceptions

Throw `HttpException` subclasses; never return error objects with `200`:

```typescript
throw new NotFoundException(`User ${id} not found`);
throw new ConflictException('Email already registered');
```

## Global exception filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) this.logger.error(exception);

    res.status(status).json({
      statusCode: status,
      message: exception instanceof HttpException ? exception.getResponse() : 'Internal server error',
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
```

Map Prisma errors here or in a dedicated filter (`P2002` → 409, `P2025` → 404). Never leak stack traces/SQL to clients.

## Guards

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return roles.some((r) => user?.roles?.includes(r));
  }
}
```

Auth belongs in guards, not handlers.

## Interceptors

Response shaping, logging/timing, caching, timeout:

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const now = Date.now();
    return next.handle().pipe(tap(() => Logger.log(`${ctx.switchToHttp().getRequest().url} ${Date.now() - now}ms`)));
  }
}
```

## Pipes

`ValidationPipe` (DTOs) and param pipes (`ParseUUIDPipe`, `ParseIntPipe`) reject bad input before the handler. Write custom pipes for bespoke transforms only.
