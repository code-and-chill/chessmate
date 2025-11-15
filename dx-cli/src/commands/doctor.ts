import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { resolveServicePath } from "../core/paths";

export const doctorCommand = new Command()
  .name("doctor")
  .description("Check system health and configuration")
  .argument("[service]", "Optional service name to diagnose")
  .action(async (service: string | undefined) => {
    try {
      logger.info("Running system diagnostics...");

      const registry = getServiceRegistry();
      await registry.discover();

      const services = registry.getAllServices();
      logger.info(`✓ Found ${services.length} service(s)`);

      // Check validations
      const registryErrors = registry.validate();
      if (registryErrors.size > 0) {
        logger.warn("Registry validation issues detected:");
        for (const [name, errors] of registryErrors) {
          logger.warn(`  ${name}:`);
          for (const err of errors) {
            logger.warn(`    - ${err}`);
          }
        }
      } else {
        logger.success("✓ Registry validation passed");
      }

      if (service) {
        const svc = registry.getService(service);
        if (!svc) {
          logger.error(`Service '${service}' not found`);
          process.exit(1);
        }

        logger.info(`\nService: ${svc.name}`);
        logger.info(`  Path: ${svc.path}`);
        logger.info(`  Kind: ${svc.kind}`);
        logger.info(`  Language: ${svc.language}`);
        logger.info(`  Runtime: ${svc.runtime}`);

        if (svc.commands.dev) logger.info(`  dev: ${svc.commands.dev}`);
        if (svc.commands.test) logger.info(`  test: ${svc.commands.test}`);
        if (svc.commands.build) logger.info(`  build: ${svc.commands.build}`);

        if (svc.dependencies?.dev?.length) {
          logger.info(`  dev dependencies: ${svc.dependencies.dev.join(", ")}`);
        }
        if (svc.dependencies?.test?.length) {
          logger.info(`  test dependencies: ${svc.dependencies.test.join(", ")}`);
        }
        if (svc.dependencies?.build?.length) {
          logger.info(`  build dependencies: ${svc.dependencies.build.join(", ")}`);
        }
      }

      logger.success("\nDiagnostics complete");
    } catch (err) {
      logger.error(`doctor command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
