import { program as commanderProgram } from "commander";
import { logger } from "./core/logger";
import { devCommand } from "./commands/dev";
import { buildCommand } from "./commands/build";
import { testCommand } from "./commands/test";
import { lintCommand } from "./commands/lint";
import { setupCommand } from "./commands/setup";
import { doctorCommand } from "./commands/doctor";
import { migrateCommand } from "./commands/migrate";
import { seedCommand } from "./commands/seed";
import { logsCommand } from "./commands/logs";
import { deployCommand } from "./commands/deploy";
import { changelogCommand } from "./commands/changelog";
import { sandboxCommand } from "./commands/sandbox";

const program = commanderProgram;

program.name("dx").description("ChessMate Developer Experience CLI").version("1.0.0");

// Register all commands
program.addCommand(setupCommand);
program.addCommand(doctorCommand);
program.addCommand(devCommand);
program.addCommand(buildCommand);
program.addCommand(testCommand);
program.addCommand(lintCommand);
program.addCommand(migrateCommand);
program.addCommand(seedCommand);
program.addCommand(logsCommand);
program.addCommand(deployCommand);
program.addCommand(changelogCommand);
program.addCommand(sandboxCommand);

// Help command
program
  .command("help [command]")
  .description("Show help for a command")
  .action((command: string | undefined) => {
    if (command) {
      program.command(command).help();
    } else {
      program.help();
    }
  });

// Main entry point
async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    logger.error(`CLI error: ${(err as Error).message}`);
    process.exit(1);
  }
}

// Only run if this is the main module
if (require.main === module) {
  main();
}

export { program };
