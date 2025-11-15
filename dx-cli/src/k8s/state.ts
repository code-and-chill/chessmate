/**
 * K8s Environment State Management
 *
 * Persists and retrieves the currently active K8s environment.
 * Supports multiple backends: file-based and environment variables.
 */

import fs from "fs";
import path from "path";
import { logger } from "../core/logger";
import { resolveMonorepoPath } from "../core/paths";
import { loadK8sConfig } from "./environment";

const STATE_FILE = ".dx/.state";

/**
 * Get the state backend configuration
 */
function getStateConfig(): { backend: "file" | "env"; filePath?: string } {
  const k8sConfig = loadK8sConfig();
  const state = k8sConfig.state || { backend: "file", filePath: STATE_FILE };
  return state as any;
}

/**
 * Get the full path to the state file
 */
function getStateFilePath(): string {
  const stateConfig = getStateConfig();
  if (stateConfig.backend === "env") {
    return ""; // N/A for env backend
  }
  return resolveMonorepoPath(stateConfig.filePath || STATE_FILE);
}

/**
 * Read the currently active environment name
 *
 * - Checks DX_ENV environment variable first
 * - Falls back to .dx/.state file
 * - Returns null if not set
 */
export function readActiveEnvironment(): string | null {
  const stateConfig = getStateConfig();

  // Try environment variable first
  if (stateConfig.backend === "env" || process.env.DX_ENV) {
    return process.env.DX_ENV || null;
  }

  // Try file backend
  try {
    const stateFilePath = getStateFilePath();
    if (!fs.existsSync(stateFilePath)) {
      return null;
    }

    const content = fs.readFileSync(stateFilePath, "utf-8").trim();
    return content || null;
  } catch (err) {
    logger.debug(`Failed to read state file: ${(err as Error).message}`);
    return null;
  }
}

/**
 * Persist the currently active environment name
 *
 * - If backend is 'env', logs a message (env vars not writable)
 * - Otherwise, writes to .dx/.state file
 */
export function writeActiveEnvironment(envName: string): void {
  const stateConfig = getStateConfig();

  if (stateConfig.backend === "env") {
    logger.info(
      `State backend is 'env'. Set DX_ENV=${envName} to persist this choice.`
    );
    return;
  }

  try {
    const stateFilePath = getStateFilePath();

    // Ensure .dx directory exists
    const dirPath = path.dirname(stateFilePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(stateFilePath, envName, "utf-8");
  } catch (err) {
    logger.error(`Failed to write state file: ${(err as Error).message}`);
    throw err;
  }
}

/**
 * Clear the stored active environment
 */
export function clearActiveEnvironment(): void {
  const stateConfig = getStateConfig();

  if (stateConfig.backend === "env") {
    logger.info(`To clear, unset the DX_ENV environment variable.`);
    return;
  }

  try {
    const stateFilePath = getStateFilePath();
    if (fs.existsSync(stateFilePath)) {
      fs.unlinkSync(stateFilePath);
    }
  } catch (err) {
    logger.error(`Failed to clear state: ${(err as Error).message}`);
  }
}

/**
 * Get the state file path for display purposes
 */
export function getStateFilePath_ForDisplay(): string {
  return STATE_FILE;
}
