import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { DagResolver } from "../dag/resolver";
import { execStream, execParallel } from "../core/exec";
import { getExecutionConfig } from "../core/config";
import { resolveServicePath } from "../core/paths";

export const testCommand = new Command()
  .name("test")
  .description("Run tests for service(s)")
  .argument("[service]", "Service name (omit for all)")
  .option("--single", "Test only this service, skip dependencies")
  .action(async (service: string | undefined, options: any) => {
    try {
      const registry = getServiceRegistry();
      await registry.discover();

      if (service) {
        const resolver = new DagResolver(registry.getAllServices());
        const toRun = options.single
          ? [registry.getService(service)]
          : resolver.resolveDependencies(service, "test");

        if (!toRun.some((s) => s)) {
          logger.error(`Service '${service}' not found`);
          process.exit(1);
        }

        logger.info(`Testing ${options.single ? service : "service and dependencies"}`);

        for (const svc of toRun.filter((s) => s !== undefined)) {
          if (!svc.commands.test) {
            logger.warn(`${svc.name} has no test command configured`);
            continue;
          }

          logger.info(`Running ${svc.name}...`);
          const result = await execStream("bash", ["-c", svc.commands.test], {
            cwd: resolveServicePath(svc.path),
            serviceName: svc.name,
            useMise: false,
          });

          if (!result.success) {
            logger.error(`Tests failed for ${svc.name}`);
            process.exit(1);
          }

          logger.success(`✓ ${svc.name}`);
        }
      } else {
        const services = registry.getAllServices();
        const config = getExecutionConfig();

        logger.info(`Testing all ${services.length} service(s)...`);

        const commands = services
          .filter((s) => s.commands.test)
          .map((s) => ({
            cmd: "bash",
            args: ["-c", s.commands.test!],
            opts: {
              cwd: resolveServicePath(s.path),
              serviceName: s.name,
              useMise: false,
              ignoreErrors: false,
            },
          }));

        if (commands.length === 0) {
          logger.warn("No services with test commands found");
          return;
        }

        const results = await execParallel(commands, config.parallel_limit);

        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
          logger.error(`${failed.length} service(s) failed tests`);
          process.exit(1);
        }

        logger.success("All tests passed");
      }
    } catch (err) {
      logger.error(`test command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
