import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { resolveServicePath } from "../core/paths";
import * as fs from "fs";
import * as path from "path";

const SERVICES_WITH_APIS = [
  "account-api",
  "live-game-api",
  "matchmaking-api",
  "rating-api",
  "bot-orchestrator-api",
  "chess-knowledge-api",
  "engine-cluster-api",
];

const DEFAULT_PORTS: Record<string, number> = {
  "account-api": 8001,
  "live-game-api": 8002,
  "matchmaking-api": 8003,
  "rating-api": 8013,
  "bot-orchestrator-api": 8010,
  "chess-knowledge-api": 8011,
  "engine-cluster-api": 8012,
};

export const brunoCommand = new Command()
  .name("bruno")
  .description("Manage Bruno API collections");

// Generate subcommand
brunoCommand
  .command("generate [service]")
  .description("Generate Bruno API collections for services")
  .action(async (service: string | undefined) => {
    try {
      const registry = getServiceRegistry();
      await registry.discover();

      if (service) {
        await generateForService(service, registry);
      } else {
        logger.info("Generating Bruno collections for all services...\n");
        for (const svc of SERVICES_WITH_APIS) {
          const serviceObj = registry.getService(svc);
          if (serviceObj) {
            await generateForService(svc, registry);
          }
        }
        logger.success("\n✅ Bruno collection generation complete!");
      }
    } catch (err) {
      logger.error(`Failed to generate Bruno collections: ${(err as Error).message}`);
      process.exit(1);
    }
  });

// Validate subcommand
brunoCommand
  .command("validate [service]")
  .description("Validate Bruno API collections compliance")
  .action(async (service: string | undefined) => {
    try {
      const registry = getServiceRegistry();
      await registry.discover();

      let totalChecks = 0;
      let passedChecks = 0;
      let failedChecks = 0;

      if (service) {
        const result = await validateService(service, registry);
        totalChecks = result.total;
        passedChecks = result.passed;
        failedChecks = result.failed;
      } else {
        logger.info("🔍 Validating Bruno API Collections Standard Implementation\n");
        for (const svc of SERVICES_WITH_APIS) {
          const serviceObj = registry.getService(svc);
          if (serviceObj) {
            const result = await validateService(svc, registry);
            totalChecks += result.total;
            passedChecks += result.passed;
            failedChecks += result.failed;
          }
        }
      }

      // Summary
      logger.info("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info("📊 Validation Summary");
      logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      logger.info(`Total checks:  ${totalChecks}`);
      logger.success(`Passed:        ${passedChecks}`);
      if (failedChecks > 0) {
        logger.error(`Failed:        ${failedChecks}`);
      } else {
        logger.info(`Failed:        ${failedChecks}`);
      }

      const percentage = totalChecks > 0 ? Math.round((passedChecks * 100) / totalChecks) : 0;
      logger.info(`Success rate:  ${percentage}%`);

      if (failedChecks === 0) {
        logger.success("\n✅ All Bruno API Collections validation checks passed!");
        process.exit(0);
      } else {
        logger.warn("\n⚠️  Some validation checks failed. Review the output above.");
        process.exit(1);
      }
    } catch (err) {
      logger.error(`Failed to validate Bruno collections: ${(err as Error).message}`);
      process.exit(1);
    }
  });

async function generateForService(serviceName: string, registry: any): Promise<void> {
  logger.info(`\n📦 Processing ${serviceName}...`);

  const svc = registry.getService(serviceName);
  if (!svc) {
    logger.warn(`  ⚠ Service '${serviceName}' not found`);
    return;
  }

  const servicePath = resolveServicePath(svc.path);
  const brunoDir = path.join(servicePath, "bruno");

  // Create directory structure
  ensureDirectoryExists(brunoDir);
  ensureDirectoryExists(path.join(brunoDir, "environments"));
  ensureDirectoryExists(path.join(brunoDir, "collections"));
  ensureDirectoryExists(path.join(brunoDir, "tests"));

  // Generate environment files
  await createEnvironmentFiles(serviceName, brunoDir);

  // Generate collection metadata
  await createCollectionMetadata(serviceName, brunoDir);

  // Generate health check endpoint
  await createHealthCheck(serviceName, brunoDir);

  logger.success(`  ✓ Generated Bruno structure for ${serviceName}`);
}

async function createEnvironmentFiles(serviceName: string, brunoDir: string): Promise<void> {
  const port = DEFAULT_PORTS[serviceName] || 8000;
  const envDir = path.join(brunoDir, "environments");

  // Local environment
  const localEnv = `baseUrl=http://localhost:${port}
authToken=
`;
  fs.writeFileSync(path.join(envDir, "local.env"), localEnv);

  // Staging environment
  const stagingEnv = `baseUrl=https://staging-${serviceName}.chessmate.com
authToken=
`;
  fs.writeFileSync(path.join(envDir, "staging.env"), stagingEnv);

  // Production environment
  const productionEnv = `baseUrl=https://${serviceName}.chessmate.com
authToken=
`;
  fs.writeFileSync(path.join(envDir, "production.env"), productionEnv);

  logger.success(`  ✓ Created environment files for ${serviceName}`);
}

async function createCollectionMetadata(serviceName: string, brunoDir: string): Promise<void> {
  const serviceTitleCase = serviceName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const metadata = `meta {
  name: ${serviceTitleCase}
  type: collection
  version: 1.0.0
}

docs {
  # ${serviceTitleCase} Collection
  
  API endpoints for ${serviceName}
}
`;

  const collectionsDir = path.join(brunoDir, "collections");
  fs.writeFileSync(path.join(collectionsDir, `${serviceName}.bru`), metadata);

  logger.success(`  ✓ Created collection metadata for ${serviceName}`);
}

async function createHealthCheck(serviceName: string, brunoDir: string): Promise<void> {
  const healthCheck = `meta {
  name: Health Check
  type: http
  seq: 1
}

request {
  method: GET
  url: \${baseUrl}/health
}

headers {
  Content-Type: application/json
}

tests {
  test("status is 200", function() {
    expect(res.status).to.equal(200);
  });

  test("response has status", function() {
    expect(res.body.status).to.equal("ok");
  });

  test("response has service name", function() {
    expect(res.body.service).to.not.be.null;
  });
}
`;

  const collectionsDir = path.join(brunoDir, "collections");
  fs.writeFileSync(path.join(collectionsDir, "health.bru"), healthCheck);

  logger.success(`  ✓ Created health check for ${serviceName}`);
}

async function validateService(
  serviceName: string,
  registry: any
): Promise<{ total: number; passed: number; failed: number }> {
  logger.info(`\n📦 Validating ${serviceName}`);

  const svc = registry.getService(serviceName);
  if (!svc) {
    logger.warn(`  ⚠ Service '${serviceName}' not found`);
    return { total: 0, passed: 0, failed: 0 };
  }

  const servicePath = resolveServicePath(svc.path);
  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;

  const check = (description: string, condition: boolean): boolean => {
    totalChecks++;
    if (condition) {
      logger.success(`  ✓ ${description}`);
      passedChecks++;
      return true;
    } else {
      logger.error(`  ✗ ${description}`);
      failedChecks++;
      return false;
    }
  };

  // 1. Bruno directory exists
  check("bruno/ directory exists", fs.existsSync(path.join(servicePath, "bruno")));

  // 2. Environment files exist
  check(
    "environments/local.env exists",
    fs.existsSync(path.join(servicePath, "bruno/environments/local.env"))
  );
  check(
    "environments/staging.env exists",
    fs.existsSync(path.join(servicePath, "bruno/environments/staging.env"))
  );
  check(
    "environments/production.env exists",
    fs.existsSync(path.join(servicePath, "bruno/environments/production.env"))
  );

  // 3. Collections directory exists
  check(
    "collections/ directory exists",
    fs.existsSync(path.join(servicePath, "bruno/collections"))
  );

  // 4. Collection metadata exists
  check(
    `collections/${serviceName}.bru exists`,
    fs.existsSync(path.join(servicePath, `bruno/collections/${serviceName}.bru`))
  );

  // 5. Health check endpoint exists
  check(
    "collections/health.bru exists",
    fs.existsSync(path.join(servicePath, "bruno/collections/health.bru"))
  );

  // 6. Tests directory exists
  check("tests/ directory exists", fs.existsSync(path.join(servicePath, "bruno/tests")));

  // 7. At least one additional endpoint exists
  const collectionsDir = path.join(servicePath, "bruno/collections");
  let collectionCount = 0;
  if (fs.existsSync(collectionsDir)) {
    const files = fs.readdirSync(collectionsDir);
    collectionCount = files.filter((f) => f.endsWith(".bru")).length;
  }
  check(`has at least 2 collections (found ${collectionCount})`, collectionCount >= 2);

  // 8. service.yaml includes bruno commands
  const serviceYamlPath = path.join(servicePath, "service.yaml");
  if (fs.existsSync(serviceYamlPath)) {
    const serviceYaml = fs.readFileSync(serviceYamlPath, "utf-8");
    check("service.yaml has bruno command", serviceYaml.includes("bruno:"));
    check("service.yaml has bruno-test command", serviceYaml.includes("bruno-test:"));
  } else {
    logger.warn("  ⚠ service.yaml not found");
  }

  return { total: totalChecks, passed: passedChecks, failed: failedChecks };
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
