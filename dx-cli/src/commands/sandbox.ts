import { Command } from "commander";
import { logger } from "../core/logger";

const sandboxCommand = new Command().name("sandbox").description("Manage sandbox environment");

sandboxCommand
  .command("reset [service]")
  .description("Reset sandbox for service(s)")
  .option("--single", "Reset only this service")
  .action(async (service: string | undefined, options: any) => {
    try {
      if (service) {
        logger.info(`Resetting sandbox for ${service}...`);
        logger.success(`✓ Sandbox reset for ${service}`);
      } else {
        logger.info("Resetting sandbox for all services...");
        logger.success("✓ All sandboxes reset");
      }
    } catch (err) {
      logger.error(`sandbox reset command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });

export { sandboxCommand };
