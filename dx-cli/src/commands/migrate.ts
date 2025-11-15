import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { execStream } from "../core/exec";
import { resolveServicePath } from "../core/paths";

export const migrateCommand = new Command()
  .name("migrate")
  .description("Run database migrations")
  .argument("[service]", "Service name (omit for all)")
  .option("--env <env>", "Environment (dev, staging, prod)", "dev")
  .option("--single", "Run only this service")
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

        if (!svc.commands.migrate) {
          logger.warn(`${svc.name} has no migrate command configured`);
          return;
        }

        logger.info(`Migrating ${svc.name} for ${options.env}...`);
        const result = await execStream(svc.commands.migrate, [], {
          cwd: resolveServicePath(svc.path),
          serviceName: svc.name,
          env,
        });

        if (!result.success) {
          logger.error(`Migration failed for ${svc.name}`);
          process.exit(1);
        }

        logger.success(`✓ ${svc.name}`);
      } else {
        const services = registry.getAllServices().filter((s) => s.commands.migrate);

        logger.info(`Migrating ${services.length} service(s) for ${options.env}...`);

        for (const svc of services) {
          logger.info(`Migrating ${svc.name}...`);
          const result = await execStream(svc.commands.migrate!, [], {
            cwd: resolveServicePath(svc.path),
            serviceName: svc.name,
            env,
          });

          if (!result.success) {
            logger.error(`Migration failed for ${svc.name}`);
            process.exit(1);
          }

          logger.success(`✓ ${svc.name}`);
        }
      }

      logger.success("Migrations completed");
    } catch (err) {
      logger.error(`migrate command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
