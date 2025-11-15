import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { execStream } from "../core/exec";
import { resolveServicePath } from "../core/paths";

export const logsCommand = new Command()
  .name("logs")
  .description("View logs for service(s)")
  .argument("[service]", "Service name")
  .option("--follow", "Follow logs")
  .option("--lines <n>", "Number of lines to show", "50")
  .action(async (service: string | undefined, options: any) => {
    try {
      if (!service) {
        logger.error("Service name required for logs command");
        process.exit(1);
      }

      const registry = getServiceRegistry();
      await registry.discover();

      const svc = registry.getService(service);
      if (!svc) {
        logger.error(`Service '${service}' not found`);
        process.exit(1);
      }

      if (!svc.commands.logs) {
        logger.warn(`${svc.name} has no logs command configured`);
        return;
      }

      const cmd = options.follow ? svc.commands.logs.replace(/\$\{lines\}/g, "-f") : svc.commands.logs.replace(/\$\{lines\}/g, options.lines);

      logger.info(`Fetching logs for ${svc.name}...`);
      const result = await execStream(cmd, [], {
        cwd: resolveServicePath(svc.path),
        serviceName: svc.name,
        useMise: false,
      });

      if (!result.success && !options.follow) {
        process.exit(1);
      }
    } catch (err) {
      logger.error(`logs command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
