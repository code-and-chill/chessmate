/**
 * Environment Management Command
 *
 * Manage active Kubernetes environment selection.
 * Commands:
 *   - dx env list: show all environments
 *   - dx env use <name>: set active environment
 *   - dx env current: show current environment
 */

import { Command } from "commander";
import chalk from "chalk";
import { logger } from "../core/logger";
import {
  getAllEnvironmentNames,
  resolveK8sEnvironment,
  formatEnvironmentInfo,
  environmentExists,
} from "../k8s/environment";
import {
  readActiveEnvironment,
  writeActiveEnvironment,
  getStateFilePath_ForDisplay,
} from "../k8s/state";
import { contextExists, isClusterReachable } from "../k8s/utils";

/**
 * List all available environments
 */
async function handleListEnvironments(): Promise<void> {
  try {
    const envNames = getAllEnvironmentNames();

    if (envNames.length === 0) {
      logger.warn("No environments configured in .dx/config.yaml");
      return;
    }

    const activeEnv = readActiveEnvironment();

    logger.info("Available Kubernetes Environments:\n");

    for (const envName of envNames) {
      const env = resolveK8sEnvironment(envName);
      const isActive = envName === activeEnv;

      // Check context availability
      const contextOk = contextExists(env.kubeContext);
      const contextStatus = contextOk
        ? chalk.green("✓")
        : chalk.yellow("?");

      // Format entry
      const prefix = isActive ? chalk.cyan("→") : " ";
      const marker = isActive ? chalk.cyan("[active]") : "";

      console.log(
        `${prefix} ${chalk.bold(envName.padEnd(12))} ` +
        `${contextStatus} context: ${env.kubeContext} ` +
        `namespace: ${env.namespace} ` +
        `${marker}`
      );
    }

    if (activeEnv) {
      console.log(
        `\nCurrent environment: ${chalk.cyan(activeEnv)} ` +
        `(stored in ${getStateFilePath_ForDisplay()})`
      );
    } else {
      console.log(`\nNo active environment. Run: ${chalk.yellow("dx env use <name>")}`);
    }
  } catch (err) {
    logger.error(`Failed to list environments: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Set active environment
 */
async function handleUseEnvironment(envName: string): Promise<void> {
  try {
    // Validate environment exists
    if (!environmentExists(envName)) {
      const available = getAllEnvironmentNames().join(", ");
      logger.error(
        `Environment '${envName}' not found.\n` +
        `Available: ${available}`
      );
      process.exit(1);
    }

    // Resolve to get full details
    const env = resolveK8sEnvironment(envName);

    // Validate context exists
    if (!contextExists(env.kubeContext)) {
      const available = ["(none)"].join(", ");
      logger.error(
        `Kubernetes context '${env.kubeContext}' not found on this system.\n` +
        `Available contexts: ${available}\n\n` +
        `Did you run ${chalk.yellow("dx k8s init-local")} for the local environment?`
      );
      process.exit(1);
    }

    // Validate cluster is reachable
    const isReachable = isClusterReachable(env.kubeContext);
    if (!isReachable) {
      logger.warn(
        `⚠ Kubernetes context '${env.kubeContext}' exists but is not reachable.\n` +
        `Make sure your cluster is running or your kubeconfig is valid.`
      );
    }

    // Persist the choice
    writeActiveEnvironment(envName);

    logger.success(`Active environment set to: ${chalk.cyan(envName)}`);
    console.log(`\n${formatEnvironmentInfo(env)}`);
  } catch (err) {
    logger.error(`Failed to set environment: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Show current environment
 */
async function handleCurrentEnvironment(): Promise<void> {
  try {
    const activeEnvName = readActiveEnvironment();

    if (!activeEnvName) {
      logger.info("No active environment set.");
      logger.info(`Run ${chalk.yellow("dx env use <name>")} to set one.`);
      process.exit(0);
    }

    const env = resolveK8sEnvironment(activeEnvName);

    console.log(`\n${formatEnvironmentInfo(env)}\n`);

    // Check connectivity
    const contextOk = contextExists(env.kubeContext);
    const clusterOk = isClusterReachable(env.kubeContext);

    if (contextOk && clusterOk) {
      logger.success("✓ Cluster is reachable");
    } else if (contextOk) {
      logger.warn("⚠ Context exists but cluster is not reachable");
    } else {
      logger.warn("✗ Context not found");
    }
  } catch (err) {
    logger.error(`Failed to get current environment: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Create the env subcommand
 */
export const envCommand = new Command()
  .name("env")
  .description("Manage Kubernetes environments")
  .addCommand(
    new Command()
      .name("list")
      .alias("ls")
      .description("List all available environments")
      .action(handleListEnvironments)
  )
  .addCommand(
    new Command()
      .name("use")
      .description("Set the active environment")
      .argument("<name>", "Environment name (e.g., local, dev, prod)")
      .action(handleUseEnvironment)
  )
  .addCommand(
    new Command()
      .name("current")
      .description("Show the current active environment")
      .action(handleCurrentEnvironment)
  );
