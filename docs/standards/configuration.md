# Configuration

Environment and configuration are centralized, typed, and validated at boot.

## ConfigModule

- Load config once via `@nestjs/config` `ConfigModule.forRoot({ isGlobal: true, ... })` in `AppModule`.
- **Validate env at startup** with a schema (Joi or a class-validator/Zod validate function). The app must **fail fast** on missing or invalid variables—no silent defaults for required secrets.
- Group related settings into **namespaced config** with `registerAs`:

  ```typescript
  export default registerAs('database', () => ({
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DB_POOL_SIZE ?? '10', 10),
  }));
  ```

## Reading config

- Feature code reads values through the typed `ConfigService`, **never** `process.env` directly (outside the config layer and `registerAs` factories).

  ```typescript
  const url = this.config.get<string>('database.url', { infer: true });
  ```

- Use `get` with `infer: true` (or a typed `ConfigService<AppConfig, true>`) so keys and return types are checked.
- Do not scatter `parseInt`/boolean coercion across the app—coerce once in the config factory and expose typed values.

## Secrets

- Secrets come from the environment (or a secret manager), never from committed files. `.env` is for local development only and is git-ignored; provide a committed `.env.example` with placeholder values.
- Never log secret values. Redact tokens and connection strings in logs and error output.

## Precedence and environments

- Support per-environment files (`.env`, `.env.test`) but keep a single validation schema so every environment is checked the same way.
- Derive environment-specific behavior from a validated `NODE_ENV` enum, not ad hoc string comparisons sprinkled through the code.

**Audit:** Flag direct `process.env` reads outside `config/` and `registerAs` factories; flag required env vars missing from the validation schema; flag secrets with hard-coded fallbacks.

See also: [core-engineering.md](core-engineering.md), [modules.md](modules.md).
