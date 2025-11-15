import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { execStream } from "../core/exec";
import { resolveServicePath } from "../core/paths";
import { getExecutionConfig } from "../core/config";

export const installCommand = new Command()
  .name("install")
  .description("Install service dependencies")
  .argument("[service]", "Service name (omit for all)")
  .option("--single", "Install only this service, skip dependencies")
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

        logger.info(`Installing dependencies for ${svc.name}...`);

        // Determine package manager based on language
        let installCmd = "";
        if (svc.language === "python" || svc.language.includes("python")) {
          installCmd = "poetry install";
        } else if (svc.language === "typescript" || svc.language === "javascript") {
          installCmd = "pnpm install";
        } else {
          logger.warn(`Unknown language: ${svc.language}, skipping install`);
          return;
        }

        const result = await execStream("bash", ["-c", installCmd], {
          cwd: resolveServicePath(svc.path),
          serviceName: svc.name,
          useMise: false,
        });

        if (!result.success) {
          logger.error(`Failed to install dependencies for ${svc.name}`);
          process.exit(1);
        }

        logger.success(`✓ ${svc.name} dependencies installed`);
      } else {
        const services = registry.getAllServices();
        const config = getExecutionConfig();

        logger.info(`Installing dependencies for all ${services.length} service(s)...`);

        const commands = services.map((s) => {
          let installCmd = "";
          if (s.language === "python" || s.language.includes("python")) {
            installCmd = "poetry install";
          } else if (s.language === "typescript" || s.language === "javascript") {
            installCmd = "pnpm install";
          } else {
            installCmd = "echo 'Unknown language, skipping'";
          }

          return {
            cmd: "bash",
            args: ["-c", installCmd],
            opts: {
              cwd: resolveServicePath(s.path),
              serviceName: s.name,
              useMise: false,
              ignoreErrors: false,
            },
          };
        });

        if (commands.length === 0) {
          logger.warn("No services found");
          return;
        }

        const { execParallel } = await import("../core/exec");
        const results = await execParallel(commands, config.parallel_limit);

        const failed = results.filter((r) => !r.success);
        if (failed.length > 0) {
          logger.error(`${failed.length} service(s) failed to install dependencies`);
          process.exit(1);
        }

        logger.success("All service dependencies installed");
      }
    } catch (err) {
      logger.error(`install command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
