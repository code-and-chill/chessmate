import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry, discoverAllServices } from "../services/registry";
import { DagResolver } from "../dag/resolver";
import { execStream, execParallel } from "../core/exec";
import { getExecutionConfig } from "../core/config";
import { resolveServicePath } from "../core/paths";

export const devCommand = new Command()
  .name("dev")
  .description("Start development environment for service(s)")
  .argument("[service]", "Service name (omit for all)")
  .option("--single", "Run only this service, skip dependencies")
  .action(async (service: string | undefined, options: any) => {
    try {
      const registry = getServiceRegistry();
      await registry.discover();

      if (service) {
        // Single or with dependencies
        const resolver = new DagResolver(registry.getAllServices());
        const toRun = options.single
          ? [registry.getService(service)]
          : resolver.resolveDependencies(service, "dev");

        if (!toRun.some((s) => s)) {
          logger.error(`Service '${service}' not found`);
          process.exit(1);
        }

        logger.info(`Running ${options.single ? service : "service and dependencies"}`);

        for (const svc of toRun.filter((s) => s !== undefined)) {
          if (!svc.commands.dev) {
            logger.warn(`${svc.name} has no dev command configured`);
            continue;
          }

          logger.info(`Starting ${svc.name}...`);
          const result = await execStream(svc.commands.dev, [], {
            cwd: resolveServicePath(svc.path),
            serviceName: svc.name,
          });

          if (!result.success) {
            logger.error(`Failed to start ${svc.name}`);
            process.exit(1);
          }
        }
      } else {
        // Run all services
        const services = registry.getAllServices();
        const config = getExecutionConfig();

        logger.info(`Starting all ${services.length} service(s)...`);

        const commands = services
          .filter((s) => s.commands.dev)
          .map((s) => ({
            cmd: "bash",
            args: ["-c", s.commands.dev!],
            opts: {
              cwd: resolveServicePath(s.path),
              serviceName: s.name,
              ignoreErrors: false,
            },
          }));

        if (commands.length === 0) {
          logger.warn("No services with dev commands found");
          return;
        }

        // Execute in parallel with concurrency limit
        const results = await execParallel(commands, config.parallel_limit);

        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
          logger.error(`${failed.length} service(s) failed to start`);
          process.exit(1);
        }

        logger.success("All services started");
      }
    } catch (err) {
      logger.error(`dev command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
