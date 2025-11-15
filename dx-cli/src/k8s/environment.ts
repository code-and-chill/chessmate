/**
 * K8s Environment Management
 *
 * Handles loading, parsing, and resolving K8s environments from .dx/config.yaml.
 * Provides environment resolution and namespace derivation logic.
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import os from "os";
import { logger } from "../core/logger";
import { resolveMonorepoPath } from "../core/paths";
import {
  K8sConfig,
  K8sEnvironment,
  K8sEnvironmentConfig,
  NamespaceStrategy,
  ResourceProfile,
  K8sConfigSchema,
} from "./types";

const DX_K8S_CONFIG_PATH = ".dx/config.yaml";

let cachedK8sConfig: K8sConfig | null = null;

/**
 * Load and parse .dx/config.yaml
 */
export function loadK8sConfig(): K8sConfig {
  if (cachedK8sConfig) {
    return cachedK8sConfig;
  }

  try {
    const configPath = resolveMonorepoPath(DX_K8S_CONFIG_PATH);

    if (!fs.existsSync(configPath)) {
      throw new Error(
        `K8s configuration not found at ${configPath}\n` +
        `Please create .dx/config.yaml with environment definitions.\n` +
        `See documentation for example configuration.`
      );
    }

    const rawConfig = fs.readFileSync(configPath, "utf-8");
    const parsed = yaml.load(rawConfig) as any;

    const validated = K8sConfigSchema.parse(parsed);
    cachedK8sConfig = validated;
    return validated;
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Failed to load K8s configuration: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Clear the cached config (useful for testing)
 */
export function clearK8sConfigCache(): void {
  cachedK8sConfig = null;
}

/**
 * Get raw environment config from .dx/config.yaml
 */
function getEnvironmentConfig(envName: string): K8sEnvironmentConfig {
  const config = loadK8sConfig();
  const env = config.environments[envName];

  if (!env) {
    const available = Object.keys(config.environments).join(", ");
    throw new Error(
      `Environment '${envName}' not found in .dx/config.yaml\n` +
      `Available environments: ${available}`
    );
  }

  return env;
}

/**
 * Get resource profile configuration for a given profile name
 */
export function getResourceProfile(profileName: string): any {
  const config = loadK8sConfig();
  const profile = config.resourceProfiles?.[profileName];

  if (!profile) {
    throw new Error(`Resource profile '${profileName}' not configured`);
  }

  return profile;
}

/**
 * Derive namespace from strategy
 *
 * - fixed: use defaultNamespace
 * - per-user: derive from OS user or git config
 * - per-team: use defaultNamespace (future: lookup team)
 */
export function deriveNamespace(
  strategy: NamespaceStrategy,
  defaultNamespace?: string
): string {
  switch (strategy) {
    case NamespaceStrategy.FIXED: {
      if (!defaultNamespace) {
        throw new Error(
          `Namespace strategy is 'fixed' but no defaultNamespace configured`
        );
      }
      return defaultNamespace;
    }

    case NamespaceStrategy.PER_USER: {
      // Try git config first, fall back to OS user
      const gitUser = tryGetGitUser();
      const osUser = gitUser || process.env.USER || os.userInfo().username;
      
      if (!osUser) {
        throw new Error(
          `Unable to determine username for per-user namespace. Set $USER or git config user.name`
        );
      }

      // Sanitize to k8s namespace rules:
      // - lowercase
      // - alphanumeric + hyphens
      // - starts/ends with alphanumeric
      const sanitized = `dev-${osUser
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 248)}`;

      return sanitized;
    }

    case NamespaceStrategy.PER_TEAM: {
      // For now: fallback to defaultNamespace
      // Future: implement team lookup from git or config
      if (defaultNamespace) {
        return defaultNamespace;
      }
      throw new Error(
        `Namespace strategy is 'per-team' but no defaultNamespace configured`
      );
    }

    default:
      const _exhaustive: never = strategy;
      return _exhaustive;
  }
}

/**
 * Try to get git user.name
 */
function tryGetGitUser(): string | null {
  try {
    const { execSync } = require("child_process");
    const user = execSync("git config user.name", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    return user || null;
  } catch {
    return null;
  }
}

/**
 * Resolve a K8s environment to a fully populated K8sEnvironment object
 *
 * - Loads config
 * - Validates environment exists
 * - Derives namespace from strategy
 * - Returns fully resolved runtime environment
 */
export function resolveK8sEnvironment(envName: string): K8sEnvironment {
  const config = getEnvironmentConfig(envName);

  if (config.kind !== "kubernetes") {
    throw new Error(
      `Environment '${envName}' is not a Kubernetes environment (kind=${config.kind})`
    );
  }

  const strategy = config.namespaceStrategy as NamespaceStrategy;
  const namespace = deriveNamespace(strategy, config.defaultNamespace);

  const isLocal = envName === "local";

  return {
    name: envName,
    kind: "kubernetes",
    kubeContext: config.kubeContext,
    namespaceStrategy: strategy,
    defaultNamespace: config.defaultNamespace,
    domain: config.domain,
    resourcesProfile: config.resourcesProfile as ResourceProfile,
    description: config.description,
    kindCluster: config.kindCluster,
    namespace,
    isLocal,
  };
}

/**
 * Get all available environment names
 */
export function getAllEnvironmentNames(): string[] {
  const config = loadK8sConfig();
  return Object.keys(config.environments);
}

/**
 * Validate that an environment exists
 */
export function environmentExists(envName: string): boolean {
  const config = loadK8sConfig();
  return envName in config.environments;
}

/**
 * Get pretty-printed environment info for display
 */
export function formatEnvironmentInfo(env: K8sEnvironment): string {
  const lines = [
    `Environment: ${env.name}`,
    `  Kind: ${env.kind}`,
    `  Kube Context: ${env.kubeContext}`,
    `  Namespace: ${env.namespace}`,
    `  Namespace Strategy: ${env.namespaceStrategy}`,
    `  Resources Profile: ${env.resourcesProfile}`,
  ];

  if (env.domain) {
    lines.push(`  Domain: ${env.domain}`);
  }

  if (env.description) {
    lines.push(`  Description: ${env.description}`);
  }

  if (env.kindCluster && env.isLocal) {
    lines.push(`  Kind Cluster: ${env.kindCluster.name}`);
  }

  return lines.join("\n");
}
