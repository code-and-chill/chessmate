import { z } from "zod";

/**
 * Service Definition Schema
 */
const LifecycleCommandsSchema = z.object({
  dev: z.string().optional(),
  test: z.string().optional(),
  build: z.string().optional(),
  lint: z.string().optional(),
  migrate: z.string().optional(),
  seed: z.string().optional(),
  logs: z.string().optional(),
});

const LifecycleDependenciesSchema = z.object({
  dev: z.array(z.string()).optional(),
  test: z.array(z.string()).optional(),
  build: z.array(z.string()).optional(),
  deploy: z.array(z.string()).optional(),
});

const InfraRequirementsSchema = z.object({
  requires: z.array(z.string()).optional(),
  optional: z.array(z.string()).optional(),
});

const ServiceDefinitionSchema = z.object({
  name: z.string(),
  path: z.string().optional(),  // Normalized by registry
  kind: z.enum(["api", "service", "worker", "engine", "app"]),
  language: z.string(),
  runtime: z.string(),
  description: z.string().optional(),
  commands: LifecycleCommandsSchema,
  dependencies: LifecycleDependenciesSchema.optional(),
  infra: InfraRequirementsSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export type LifecycleCommands = z.infer<typeof LifecycleCommandsSchema>;
export type LifecycleDependencies = z.infer<typeof LifecycleDependenciesSchema>;
export type ServiceDefinition = z.infer<typeof ServiceDefinitionSchema> & { path: string };
export type ServiceKind = z.infer<typeof ServiceDefinitionSchema>["kind"];

export { ServiceDefinitionSchema };
