import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { execStream } from "../core/exec";
import { resolveServicePath } from "../core/paths";

export const lintCommand = new Command()
  .name("lint")
  .description("Lint service(s)")
  .argument("[service]", "Service name (omit for all)")
  .option("--single", "Lint only this service")
  .action(async (service: string | undefined, options: any) => {
    try {
      const registry = getServiceRegistry();
      await registry.discover();

      if (service) {
        const svc = registry.getService(service);
        if (!svc) {
          logger.error(`Service '${service}' not found`);
          process.exit(1);
        }

        if (!svc.commands.lint) {
          logger.warn(`${svc.name} has no lint command configured`);
          return;
        }

        logger.info(`Linting ${svc.name}...`);
        const result = await execStream(svc.commands.lint, [], {
          cwd: resolveServicePath(svc.path),
          serviceName: svc.name,
        });

        if (!result.success) {
          logger.error(`Lint failed for ${svc.name}`);
          process.exit(1);
        }

        logger.success(`✓ ${svc.name}`);
      } else {
        const services = registry.getAllServices();
        let passed = 0;
        let failed = 0;

        for (const svc of services) {
          if (!svc.commands.lint) {
            logger.warn(`${svc.name} has no lint command configured`);
            continue;
          }

          logger.info(`Linting ${svc.name}...`);
          const result = await execStream(svc.commands.lint, [], {
            cwd: resolveServicePath(svc.path),
            serviceName: svc.name,
            ignoreErrors: true,
          });

          if (result.success) {
            passed++;
            logger.success(`✓ ${svc.name}`);
          } else {
            failed++;
            logger.error(`✗ ${svc.name}`);
          }
        }

        logger.info(`Lint summary: ${passed} passed, ${failed} failed`);
        if (failed > 0) {
          process.exit(1);
        }
      }
    } catch (err) {
      logger.error(`lint command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
