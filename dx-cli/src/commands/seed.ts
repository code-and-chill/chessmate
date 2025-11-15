import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { execStream } from "../core/exec";
import { resolveServicePath } from "../core/paths";

export const seedCommand = new Command()
  .name("seed")
  .description("Seed database with initial data")
  .argument("[service]", "Service name (omit for all)")
  .option("--env <env>", "Environment (dev, staging, prod)", "dev")
  .option("--single", "Seed only this service")
  .action(async (service: string | undefined, options: any) => {
    try {
      const registry = getServiceRegistry();
      await registry.discover();

      const env = {
        DB_ENV: options.env,
        NODE_ENV: options.env,
      };

      if (service) {
        const svc = registry.getService(service);
        if (!svc) {
          logger.error(`Service '${service}' not found`);
          process.exit(1);
        }

        if (!svc.commands.seed) {
          logger.warn(`${svc.name} has no seed command configured`);
          return;
        }

        logger.info(`Seeding ${svc.name} for ${options.env}...`);
        const result = await execStream("bash", ["-c", svc.commands.seed], {
          cwd: resolveServicePath(svc.path),
          serviceName: svc.name,
          env,
          useMise: false,
        });

        if (!result.success) {
          logger.error(`Seeding failed for ${svc.name}`);
          process.exit(1);
        }

        logger.success(`✓ ${svc.name}`);
      } else {
        const services = registry.getAllServices().filter((s) => s.commands.seed);

        logger.info(`Seeding ${services.length} service(s) for ${options.env}...`);

        for (const svc of services) {
          logger.info(`Seeding ${svc.name}...`);
          const result = await execStream("bash", ["-c", svc.commands.seed!], {
            cwd: resolveServicePath(svc.path),
            serviceName: svc.name,
            env,
            useMise: false,
          });

          if (!result.success) {
            logger.error(`Seeding failed for ${svc.name}`);
            process.exit(1);
          }

          logger.success(`✓ ${svc.name}`);
        }
      }

      logger.success("Seeding completed");
    } catch (err) {
      logger.error(`seed command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
