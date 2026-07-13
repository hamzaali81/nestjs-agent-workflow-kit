---
name: nestjs-new-app
description: Scaffolds and bootstraps a new NestJS application with the project's baseline wiring. Use when creating a new Nest project, setting up a fresh API, or standing up the initial app skeleton (config, validation, Prisma, Swagger, global filters).
license: MIT
metadata:
  author: nestjs-agent-workflow-kit
  version: '1.0'
---

# New NestJS App

Stand up a new Nest app that already follows `docs/standards/`.

## 1. Scaffold

```bash
npx @nestjs/cli new <project-name>
```

Ask the user for a package manager only if it matters; otherwise accept the CLI default and stay consistent thereafter. Pin the CLI version (`@nestjs/cli@<v>`) only if the user requests a specific major.

## 2. Baseline dependencies

```bash
npm i @nestjs/config class-validator class-transformer
npm i @nestjs/swagger helmet @nestjs/throttler
npm i prisma @prisma/client && npx prisma init   # data layer (see prisma-data-layer skill)
```

Add Joi (or a validate function) for env validation.

## 3. TypeScript strictness

In `tsconfig.json` ensure `"strict": true`, `noImplicitAny`, `strictNullChecks`. Enable ESLint `no-floating-promises`.

## 4. Folder structure

Create the layout from [architecture.md](../../../docs/standards/architecture.md):

```
src/
  common/        guards, interceptors, filters, pipes, decorators
  config/        ConfigModule setup + namespaced config + env schema
  modules/       feature modules
  prisma/        PrismaModule + PrismaService
  app.module.ts
  main.ts
```

## 5. Bootstrap (`main.ts`)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({ origin: config.get('cors.origins') });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true,
    transform: true, transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swagger = new DocumentBuilder().setTitle('API').setVersion('1').addBearerAuth().build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
```

Prefer registering `ValidationPipe`, filters, and guards as `APP_*` providers in `AppModule` (so they're DI-aware) over `useGlobal*` where DI is needed. See [modules reference](../nestjs-developer/references/modules.md).

## 6. AppModule wiring

Import `ConfigModule.forRoot({ isGlobal: true, validationSchema, load: [...] })`, `PrismaModule`, `ThrottlerModule.forRoot(...)`, and feature modules. Register the global exception filter via `APP_FILTER`.

## 7. Verify

```bash
nest build && npm run lint && npm test
```

Then generate the first feature with `nest generate resource <name>` and confirm the standards (thin controller, DTO validation, service logic, Prisma in the data layer).

## Related

- [`prisma-data-layer`](../prisma-data-layer/SKILL.md) — data layer setup.
- [`openapi-swagger`](../openapi-swagger/SKILL.md) — API docs.
- [`nestjs-developer`](../nestjs-developer/SKILL.md) — day-to-day patterns.
