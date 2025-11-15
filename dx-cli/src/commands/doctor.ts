import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { resolveServicePath } from "../core/paths";
import { checkSystemRequirements } from "../core/system-check";
import os from "os";

export const doctorCommand = new Command()
  .name("doctor")
  .description("Check system health and configuration")
  .argument("[service]", "Optional service name to diagnose")
  .option("--verbose", "Show detailed diagnostic information")
  .action(async (service: string | undefined, options: any) => {
    try {
      logger.info("╔═══════════════════════════════════════════════════════════════╗");
      logger.info("║              ChessMate System Diagnostics                     ║");
      logger.info("╚═══════════════════════════════════════════════════════════════╝");
      logger.info("");

      if (options.verbose) {
        // Show system information
        logger.info("System Information:");
        logger.info(`  Platform: ${os.platform()}`);
        logger.info(`  Architecture: ${os.arch()}`);
        logger.info(`  Memory: ${Math.round(os.totalmem() / 1024 / 1024)} MB`);
        logger.info(`  CPUs: ${os.cpus().length}`);
        logger.info(`  Node.js: ${process.version}`);
        logger.info(`  Current Directory: ${process.cwd()}`);
        logger.info("");

        // Check system requirements
        logger.info("System Requirements:");
        const requirements = await checkSystemRequirements();
        for (const req of requirements) {
          if (req.installed) {
            logger.success(`  ✓ ${req.name} (${req.version})`);
          } else {
            logger.warn(`  ⚠ ${req.name} not installed`);
          }
        }
        logger.info("");
      }

      // Service discovery
      logger.info("Service Discovery:");
      const registry = getServiceRegistry();
      const services = await registry.discover();
      logger.info(`  Found ${services.length} service(s):`);

      for (const svc of services) {
        logger.info(`    - ${svc.name} (${svc.kind})`);
      }
      logger.info("");

      // Validate registry
      logger.info("Registry Validation:");
      const registryErrors = registry.validate();

      if (registryErrors.size > 0) {
        logger.warn("  ⚠ Registry validation issues detected:");
        for (const [name, errors] of registryErrors) {
          logger.warn(`    ${name}:`);
          for (const err of errors) {
            logger.warn(`      - ${err}`);
          }
        }
      } else {
        logger.success("  ✓ Registry validation passed");
      }
      logger.info("");

      // Service-specific diagnostics
      if (service) {
        logger.info("Service Diagnostics:");
        const svc = registry.getService(service);

        if (!svc) {
          logger.error(`✗ Service '${service}' not found`);
          logger.info("");
          logger.info("Available services:");
          for (const s of services) {
            logger.info(`  - ${s.name}`);
          }
          process.exit(1);
        }

        logger.info(`Service: ${svc.name}`);
        logger.info(`  Path: ${svc.path}`);
        logger.info(`  Kind: ${svc.kind}`);
        logger.info(`  Language: ${svc.language}`);
        logger.info(`  Runtime: ${svc.runtime}`);
        logger.info("");

        logger.info("Commands:");
        if (svc.commands.dev) logger.info(`  dev: ${svc.commands.dev}`);
        else logger.warn(`  dev: not configured`);
        if (svc.commands.test) logger.info(`  test: ${svc.commands.test}`);
        else logger.warn(`  test: not configured`);
        if (svc.commands.build) logger.info(`  build: ${svc.commands.build}`);
        else logger.warn(`  build: not configured`);
        logger.info("");

        logger.info("Dependencies:");
        if (svc.dependencies?.dev?.length) {
          logger.info(`  dev: ${svc.dependencies.dev.join(", ")}`);
        } else {
          logger.info(`  dev: none`);
        }
        if (svc.dependencies?.test?.length) {
          logger.info(`  test: ${svc.dependencies.test.join(", ")}`);
        } else {
          logger.info(`  test: none`);
        }
        if (svc.dependencies?.build?.length) {
          logger.info(`  build: ${svc.dependencies.build.join(", ")}`);
        } else {
          logger.info(`  build: none`);
        }
        if (svc.dependencies?.deploy?.length) {
          logger.info(`  deploy: ${svc.dependencies.deploy.join(", ")}`);
        } else {
          logger.info(`  deploy: none`);
        }
      }

      logger.info("");
      logger.success("╔═══════════════════════════════════════════════════════════════╗");
      logger.success("║                 ✓ Diagnostics complete                       ║");
      logger.success("╚═══════════════════════════════════════════════════════════════╝");
      logger.info("");
      logger.info("Tips:");
      logger.info("  • For more details, run: dx doctor --verbose");
      logger.info("  • To check a specific service: dx doctor <service-name>");
      logger.info("  • To see all commands: dx --help");
    } catch (err) {
      logger.error(`doctor command failed: ${(err as Error).message}`);
      if (options.verbose) {
        logger.error((err as Error).stack);
      }
      process.exit(1);
    }
  });
