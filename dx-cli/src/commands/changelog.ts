import { Command } from "commander";
import { logger } from "../core/logger";

export const changelogCommand = new Command()
  .name("changelog")
  .description("View changelog for service(s)")
  .argument("[service]", "Service name (omit for all)")
  .action(async (service: string | undefined) => {
    try {
      if (service) {
        logger.info(`Changelog for ${service}:`);
        logger.info("  (Changelog integration coming soon)");
      } else {
        logger.info("Changelog:");
        logger.info("  (Changelog integration coming soon)");
      }
    } catch (err) {
      logger.error(`changelog command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
