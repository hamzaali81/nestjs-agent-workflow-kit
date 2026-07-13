# Testing (Jest + Supertest)

## Unit test (service, mocked collaborators)

```typescript
describe('UsersService', () => {
  let service: UsersService;
  const repo = { findById: jest.fn(), create: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repo },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('throws NotFound when user is missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
  });
});
```

No real DB/network in unit tests—mock `PrismaService`/repositories. Assert error branches, not just happy paths.

## E2E test (Supertest, real request path)

```typescript
describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    // Apply the SAME globals as main.ts or validation/serialization differ from prod:
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('rejects invalid body with 400', () =>
    request(app.getHttpServer()).post('/users').send({}).expect(400));

  it('creates a user', () =>
    request(app.getHttpServer())
      .post('/users')
      .send({ email: 'a@b.com', name: 'Ann' })
      .expect(201));
});
```

Use a dedicated test database (or transactional rollback / fresh schema per run); reset state between tests. Cover success + at least one validation/authz failure per endpoint group.

## Tips

- `mockResolvedValue`/`mockRejectedValue` for async collaborators.
- `clearMocks: true` in jest config, or `jest.clearAllMocks()` in `afterEach`.
- Override providers in the testing module with `.overrideProvider(X).useValue(mock)` for E2E when you must stub an external dependency.
