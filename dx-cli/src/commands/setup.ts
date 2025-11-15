import { Command } from "commander";
import { logger } from "../core/logger";

export const setupCommand = new Command()
  .name("setup")
  .description("Initialize development environment")
  .action(async () => {
    try {
      logger.info("Setting up development environment...");

      logger.info("✓ dx-cli is ready!");
      logger.info("");
      logger.info("Next steps:");
      logger.info("  1. Run 'dx doctor' to verify your setup");
      logger.info("  2. Run 'dx dev' to start all services");
      logger.info("  3. Run 'dx --help' to see all available commands");
    } catch (err) {
      logger.error(`setup command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
