import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { DagResolver } from "../dag/resolver";
import { execStream, execParallel } from "../core/exec";
import { getExecutionConfig } from "../core/config";
import { resolveServicePath } from "../core/paths";

export const buildCommand = new Command()
  .name("build")
  .description("Build service(s)")
  .argument("[service]", "Service name (omit for all)")
  .option("--single", "Build only this service, skip dependencies")
  .action(async (service: string | undefined, options: any) => {
    try {
      const registry = getServiceRegistry();
      await registry.discover();

      if (service) {
        const resolver = new DagResolver(registry.getAllServices());
        const toRun = options.single
          ? [registry.getService(service)]
          : resolver.resolveDependencies(service, "build");

        if (!toRun.some((s) => s)) {
          logger.error(`Service '${service}' not found`);
          process.exit(1);
        }

        logger.info(`Building ${options.single ? service : "service and dependencies"}`);

        for (const svc of toRun.filter((s) => s !== undefined)) {
          if (!svc.commands.build) {
            logger.warn(`${svc.name} has no build command configured`);
            continue;
          }

          // Install service dependencies before building (if applicable)
          const installCmd = `if [ -f pyproject.toml ]; then poetry install --no-interaction; elif [ -f requirements.txt ]; then python3 -m pip install -r requirements.txt; elif [ -f package.json ]; then pnpm install; fi`;

          logger.info(`Installing dependencies for ${svc.name} (if needed)...`);
          const installResult = await execStream("bash", ["-c", installCmd], {
            cwd: resolveServicePath(svc.path),
            serviceName: svc.name,
            useMise: false,
          });

          if (!installResult.success) {
            logger.error(`Failed to install dependencies for ${svc.name}`);
            process.exit(1);
          }

          logger.info(`Building ${svc.name}...`);
          const result = await execStream("bash", ["-c", svc.commands.build], {
            cwd: resolveServicePath(svc.path),
            serviceName: svc.name,
            useMise: false,
          });

          if (!result.success) {
            logger.error(`Failed to build ${svc.name}`);
            process.exit(1);
          }

          logger.success(`✓ ${svc.name}`);
        }
      } else {
        const services = registry.getAllServices();
        const config = getExecutionConfig();

        logger.info(`Building all ${services.length} service(s)...`);

        const commands = services
          .filter((s) => s.commands.build)
          .map((s) => {
            // Combine dependency install and build into a single shell command
            const installSnippet = `if [ -f pyproject.toml ]; then poetry install --no-interaction; elif [ -f requirements.txt ]; then python3 -m pip install -r requirements.txt; elif [ -f package.json ]; then pnpm install; fi`;

            return {
              cmd: "bash",
              args: ["-c", `set -e; ${installSnippet} && ${s.commands.build!}`],
              opts: {
                cwd: resolveServicePath(s.path),
                serviceName: s.name,
                useMise: false,
                ignoreErrors: false,
              },
            };
          });

        if (commands.length === 0) {
          logger.warn("No services with build commands found");
          return;
        }

        const results = await execParallel(commands, config.parallel_limit);

        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
          logger.error(`${failed.length} service(s) failed to build`);
          process.exit(1);
        }

        logger.success("All services built successfully");
      }
    } catch (err) {
      logger.error(`build command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
