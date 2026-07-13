# Configuration

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  load: [databaseConfig, authConfig],
  validationSchema: envValidationSchema,   // Joi or custom validate fn
  validationOptions: { abortEarly: false },
});
```

## Env validation (fail fast)

```typescript
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
});
```

The app must refuse to boot on missing/invalid required vars.

## Namespaced config

```typescript
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  poolSize: parseInt(process.env.DB_POOL_SIZE ?? '10', 10),
}));
```

Coerce/parse **once** here, expose typed values.

## Reading

```typescript
constructor(private readonly config: ConfigService<AppConfig, true>) {}
const url = this.config.get('database.url', { infer: true });
```

Never read `process.env` outside `config/` and `registerAs` factories.

## Secrets

- From env or a secret manager; never committed. `.env` is local-only and git-ignored; commit `.env.example` with placeholders.
- Redact secrets in logs and errors.
