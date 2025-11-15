import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { z } from "zod";
import { resolveDxConfig } from "./paths";
import { logger } from "./logger";

/**
 * DX Config Schema
 */
const EnvironmentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  kube_context: z.string().optional(),
  namespace: z.string().optional(),
  helm_root: z.string().optional(),
  backing_services: z.array(z.string()).optional(),
});

const GlobalSchema = z.object({
  service_discovery: z.object({
    patterns: z.array(z.string()),
    root: z.string(),
  }),
  logging: z.object({
    level: z.enum(["debug", "info", "warn", "error"]),
    format: z.enum(["pretty", "json"]),
    prefix_logs: z.boolean(),
  }),
  execution: z.object({
    parallel_limit: z.number(),
    stream_logs: z.boolean(),
    exit_on_error: z.boolean(),
    timeout_ms: z.number(),
  }),
});

const DxConfigSchema = z.object({
  version: z.string(),
  title: z.string(),
  description: z.string().optional(),
  global: GlobalSchema,
  environments: z.record(z.string(), EnvironmentSchema),
  mise: z.object({
    enabled: z.boolean(),
    version_file: z.string().optional(),
    auto_install: z.boolean(),
  }),
  service_groups: z.record(z.string(), z.array(z.string())).optional(),
  hooks: z.record(z.string(), z.any()).optional(),
});

export type DxConfig = z.infer<typeof DxConfigSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;

let cachedConfig: DxConfig | null = null;

/**
 * Load and parse dx.config.yml
 */
export function loadDxConfig(): DxConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = resolveDxConfig();
    const rawConfig = fs.readFileSync(configPath, "utf-8");
    const parsed = yaml.load(rawConfig) as any;

    const validated = DxConfigSchema.parse(parsed);
    cachedConfig = validated;
    return validated;
  } catch (err) {
    logger.error(`Failed to load dx.config.yml: ${(err as Error).message}`);
    throw err;
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironment(envName: string): Environment {
  const config = loadDxConfig();
  const env = config.environments[envName];

  if (!env) {
    throw new Error(`Environment '${envName}' not found in dx.config.yml`);
  }

  return env;
}

/**
 * Get service group by name
 */
export function getServiceGroup(groupName: string): string[] {
  const config = loadDxConfig();
  const group = config.service_groups?.[groupName];

  if (!group) {
    throw new Error(`Service group '${groupName}' not found in dx.config.yml`);
  }

  return group;
}

/**
 * Get all environments
 */
export function getAllEnvironments(): Record<string, Environment> {
  const config = loadDxConfig();
  return config.environments;
}

/**
 * Check if mise is enabled
 */
export function isMiseEnabled(): boolean {
  const config = loadDxConfig();
  return config.mise.enabled;
}

/**
 * Get global execution config
 */
export function getExecutionConfig() {
  const config = loadDxConfig();
  return config.global.execution;
}

/**
 * Get global logging config
 */
export function getLoggingConfig() {
  const config = loadDxConfig();
  return config.global.logging;
}
