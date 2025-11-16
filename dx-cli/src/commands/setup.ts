import { Command } from "commander";
import { logger } from "../core/logger";
import {
  checkSystemRequirements,
  printSystemCheckResults,
  checkOSCompatibility,
  checkNodeModules,
  getInstallationInstructions,
} from "../core/system-check";
import { execSync } from "../core/exec";
import path from "path";

export const setupCommand = new Command()
  .name("setup")
  .description("Initialize development environment")
  .option("--skip-deps", "Skip dependency installation")
  .action(async (options: any) => {
    try {
      logger.info("╔═══════════════════════════════════════════════════════════════╗");
      logger.info("║         ChessMate Developer Environment Setup                 ║");
      logger.info("╚═══════════════════════════════════════════════════════════════╝");
      logger.info("");

      // Check OS
      checkOSCompatibility();
      logger.info("");

      // Check system requirements
      const results = await checkSystemRequirements();
      printSystemCheckResults(results);

      // Check for failed required tools
      const failedRequired = results.filter(
        (r) => r.required && (!r.installed || r.message.includes("too old"))
      );

      if (failedRequired.length > 0) {
        logger.error("");
        logger.error("❌ Setup cannot continue - missing required tools:");
        for (const req of failedRequired) {
          logger.error(`   - ${req.name}`);
        }
        logger.error("");
        logger.info(getInstallationInstructions());
        logger.error("");
        logger.error("After installing missing tools, run 'dx setup' again");
        process.exit(1);
      }

      logger.info("");

      // Check node modules
      const modulesOk = checkNodeModules();
      if (!modulesOk) {
        logger.error("");
        logger.error("Run the setup command from the monorepo root:");
        logger.error("  cd chessmate");
        logger.error("  dx setup");
        process.exit(1);
      }

      logger.info("");

      // Install development dependencies if not skipped
      if (!options.skipDeps) {
        logger.info("Installing development dependencies...");
        logger.info("");

        // TODO: Implement automatic installation of missing tools
        // For now, provide manual installation instructions
        const missingTools = results.filter(
          (r) => r.required && (!r.installed || r.message.includes("too old"))
        );

        if (missingTools.length > 0) {
          logger.info("To install missing dependencies:");
          logger.info(getInstallationInstructions());
        }

        logger.info("");
      }

      logger.success("╔═══════════════════════════════════════════════════════════════╗");
      logger.success("║         ✓ Environment setup successful!                      ║");
      logger.success("╚═══════════════════════════════════════════════════════════════╝");
      logger.info("");
      logger.info("Next steps:");
      logger.info("  1. Verify your setup: dx doctor");
      logger.info("  2. Start development: dx dev");
      logger.info("  3. View all commands: dx --help");
      logger.info("");
      logger.info("For more information:");
      logger.info("  https://github.com/code-and-chill/chessmate");
    } catch (err) {
      logger.error(`setup command failed: ${(err as Error).message}`);
      process.exit(1);
    }
  });
