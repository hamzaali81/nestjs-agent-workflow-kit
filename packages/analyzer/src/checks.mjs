/**
 * Deterministic NestJS architecture checks, built on the TypeScript AST (ts-morph).
 * No LLM calls — every finding is reproducible and CI-safe.
 */
import path from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';

const ROUTE_DECORATORS = ['Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head', 'All'];
const FORBIDDEN_IN_CONTROLLER = /\b(prisma|PrismaService|PrismaClient|HttpService|\$queryRaw|\$executeRaw)\b|\bfetch\s*\(/;
const MAX_CONTROLLER_STATEMENTS = 15;
const PRIMITIVE_TYPES = new Set([
  'any', 'unknown', 'string', 'number', 'boolean', 'object', 'bigint', 'symbol', 'never',
]);
const VALIDATOR_DECORATORS = new Set([
  'IsString', 'IsEmail', 'IsInt', 'IsNumber', 'IsBoolean', 'IsEnum', 'IsOptional', 'IsUUID',
  'Length', 'MinLength', 'MaxLength', 'Min', 'Max', 'IsNotEmpty', 'ValidateNested', 'IsArray',
  'IsDate', 'Matches', 'IsPositive', 'IsNegative', 'IsDefined', 'IsObject', 'IsUrl', 'IsIn',
  'IsPhoneNumber', 'IsMongoId', 'ArrayMinSize', 'ArrayMaxSize', 'IsJSON', 'IsDateString',
]);

function createProject(dir) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: false },
  });
  project.addSourceFilesAtPaths([
    path.join(dir, '**/*.ts'),
    `!${path.join(dir, '**/*.d.ts')}`,
    `!${path.join(dir, '**/node_modules/**')}`,
  ]);
  return project;
}

function baseTypeName(typeText) {
  return (typeText ?? '').replace(/\[\]$/, '').replace(/<.*>$/, '').trim();
}

function findClass(project, name) {
  for (const sf of project.getSourceFiles()) {
    const c = sf.getClass(name);
    if (c) return c;
  }
  return null;
}

function findInterface(project, name) {
  for (const sf of project.getSourceFiles()) {
    const i = sf.getInterface(name);
    if (i) return i;
  }
  return null;
}

/** Check 1 — data access or heavy logic inside a controller handler. */
function checkControllers(project, issues) {
  for (const sf of project.getSourceFiles()) {
    if (!sf.getFilePath().endsWith('.controller.ts')) continue;
    for (const cls of sf.getClasses()) {
      if (!cls.getDecorator('Controller')) continue;
      for (const method of cls.getMethods()) {
        const isRoute = ROUTE_DECORATORS.some((d) => method.getDecorator(d));
        if (!isRoute) continue;

        const body = method.getBodyText() ?? '';
        if (FORBIDDEN_IN_CONTROLLER.test(body)) {
          issues.push({
            ruleId: 'controller-data-access',
            level: 'error',
            message: `Controller handler '${method.getName()}' performs data access or I/O (Prisma/HTTP). Move it into a service.`,
            file: sf.getFilePath(),
            line: method.getStartLineNumber(),
          });
        }
        const statements = method.getStatements().length;
        if (statements > MAX_CONTROLLER_STATEMENTS) {
          issues.push({
            ruleId: 'fat-controller-method',
            level: 'warning',
            message: `Controller handler '${method.getName()}' has ${statements} statements (> ${MAX_CONTROLLER_STATEMENTS}). Handlers should be thin; delegate to a service.`,
            file: sf.getFilePath(),
            line: method.getStartLineNumber(),
          });
        }
      }
    }
  }
}

/** Check 2 — @Body() parameters that are not validated class-validator DTOs. */
function checkDtoValidation(project, issues) {
  for (const sf of project.getSourceFiles()) {
    if (!sf.getFilePath().endsWith('.controller.ts')) continue;
    for (const param of sf.getDescendantsOfKind(SyntaxKind.Parameter)) {
      if (!param.getDecorator('Body')) continue;
      const typeText = param.getTypeNode()?.getText();
      const name = baseTypeName(typeText);
      const line = param.getStartLineNumber();
      const file = sf.getFilePath();

      if (!name || PRIMITIVE_TYPES.has(name) || name.startsWith('Record')) {
        issues.push({
          ruleId: 'body-not-dto',
          level: 'error',
          message: `@Body() typed as '${typeText ?? 'inferred'}' — use a class-validator DTO class so input is validated.`,
          file, line,
        });
        continue;
      }
      if (findInterface(project, name)) {
        issues.push({
          ruleId: 'body-is-interface',
          level: 'error',
          message: `@Body() type '${name}' is an interface. Interfaces are erased at runtime and cannot be validated — use a class DTO.`,
          file, line,
        });
        continue;
      }
      const cls = findClass(project, name);
      if (cls) {
        const hasValidator = cls
          .getProperties()
          .some((p) => p.getDecorators().some((d) => VALIDATOR_DECORATORS.has(d.getName())));
        if (!hasValidator) {
          issues.push({
            ruleId: 'dto-no-validation',
            level: 'warning',
            message: `DTO '${name}' has no class-validator decorators — its fields are not validated by ValidationPipe.`,
            file, line,
          });
        }
      }
    }
  }
}

/** Check 3 — circular dependencies among project source files. */
function checkCircularDeps(project, issues) {
  const files = project.getSourceFiles();
  const adj = new Map();
  for (const sf of files) {
    const from = sf.getFilePath();
    const targets = [];
    for (const imp of sf.getImportDeclarations()) {
      const target = imp.getModuleSpecifierSourceFile();
      if (target && !target.isDeclarationFile()) targets.push(target.getFilePath());
    }
    adj.set(from, targets);
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(files.map((f) => [f.getFilePath(), WHITE]));
  const stack = [];
  const seenCycles = new Set();

  const visit = (node) => {
    color.set(node, GRAY);
    stack.push(node);
    for (const next of adj.get(node) ?? []) {
      if (color.get(next) === GRAY) {
        const idx = stack.indexOf(next);
        const cycle = stack.slice(idx).concat(next);
        const key = [...cycle].sort().join('|');
        if (!seenCycles.has(key)) {
          seenCycles.add(key);
          issues.push({
            ruleId: 'circular-dependency',
            level: 'error',
            message: `Circular dependency: ${cycle.map((f) => path.basename(f)).join(' → ')}`,
            file: node,
            line: 1,
          });
        }
      } else if (color.get(next) === WHITE) {
        visit(next);
      }
    }
    stack.pop();
    color.set(node, BLACK);
  };

  for (const f of files) if (color.get(f.getFilePath()) === WHITE) visit(f.getFilePath());
}

export function runChecks(dir) {
  const project = createProject(dir);
  const fileCount = project.getSourceFiles().length;
  const issues = [];
  checkControllers(project, issues);
  checkDtoValidation(project, issues);
  checkCircularDeps(project, issues);
  return { issues, fileCount };
}

export const RULES = {
  'controller-data-access': 'Controllers must not access data or perform I/O directly.',
  'fat-controller-method': 'Controller handlers should be thin and delegate to services.',
  'body-not-dto': '@Body() must be a validated class-validator DTO class.',
  'body-is-interface': '@Body() must be a class, not an interface (interfaces are not validated).',
  'dto-no-validation': 'DTO classes should declare class-validator decorators.',
  'circular-dependency': 'Source files must not form import cycles.',
};
