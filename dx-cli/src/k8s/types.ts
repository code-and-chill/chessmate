/**
 * Kubernetes Environment Type Definitions
 *
 * Defines the schema for K8s configuration and runtime environment model.
 */

import { z } from "zod";

/**
 * Namespace strategy determines how namespaces are derived for deployments
 */
export enum NamespaceStrategy {
  FIXED = "fixed",
  PER_USER = "per-user",
  PER_TEAM = "per-team",
}

/**
 * Resource profile determines CPU/memory/replicas for deployments
 */
export enum ResourceProfile {
  LOCAL = "local",
  DEV = "dev",
  PROD = "prod",
}

/**
 * Kubernetes environment configuration (from .dx/config.yaml)
 */
export const K8sEnvironmentConfigSchema = z.object({
  kind: z.literal("kubernetes"),
  kubeContext: z.string().describe("kubectl context name"),
  namespaceStrategy: z
    .enum(["fixed", "per-user", "per-team"])
    .describe("Strategy for deriving namespace"),
  defaultNamespace: z.string().optional().describe("Default namespace if strategy=fixed"),
  domain: z.string().optional().describe("Base domain for ingress URLs"),
  resourcesProfile: z
    .enum(["local", "dev", "prod"])
    .describe("Resource profile for sizing"),
  description: z.string().optional(),
  kindCluster: z
    .object({
      name: z.string(),
      config: z.string().optional(),
    })
    .optional()
    .describe("Kind cluster configuration (only for local environments)"),
});

export type K8sEnvironmentConfig = z.infer<typeof K8sEnvironmentConfigSchema>;

/**
 * Resolved Kubernetes environment at runtime
 */
export interface K8sEnvironment {
  // From config
  name: string;
  kind: "kubernetes";
  kubeContext: string;
  namespaceStrategy: NamespaceStrategy;
  defaultNamespace?: string;
  domain?: string;
  resourcesProfile: ResourceProfile;
  description?: string;
  kindCluster?: {
    name: string;
    config?: string;
  };

  // Resolved at runtime
  namespace: string; // Derived from strategy
  isLocal: boolean; // true if local environment
}

/**
 * Resource profile configuration
 */
export interface ResourceProfileConfig {
  cpu: string;
  memory: string;
  replicas: number;
  hpa: {
    enabled: boolean;
    minReplicas?: number;
    maxReplicas?: number;
    targetCPUUtilization?: number;
  };
}

/**
 * Full K8s configuration from .dx/config.yaml
 */
export const K8sConfigSchema = z.object({
  version: z.string(),
  kind: z.literal("k8s-environments"),
  description: z.string().optional(),
  environments: z.record(z.string(), K8sEnvironmentConfigSchema),
  resourceProfiles: z
    .record(z.string(), z.object({
      cpu: z.string(),
      memory: z.string(),
      replicas: z.number(),
      hpa: z.object({
        enabled: z.boolean(),
        minReplicas: z.number().optional(),
        maxReplicas: z.number().optional(),
        targetCPUUtilization: z.number().optional(),
      }),
    }))
    .optional(),
  namespaceStrategies: z.record(z.string(), z.any()).optional(),
  imageRegistry: z
    .object({
      name: z.string(),
    })
    .optional(),
  ingress: z.record(z.string(), z.any()).optional(),
  storage: z.record(z.string(), z.any()).optional(),
  state: z
    .object({
      backend: z.enum(["file", "env"]),
      filePath: z.string().optional(),
    })
    .optional(),
  features: z.record(z.string(), z.boolean()).optional(),
});

export type K8sConfig = z.infer<typeof K8sConfigSchema>;
