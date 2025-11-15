import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { ServiceDefinition, ServiceDefinitionSchema } from "../config/schema";
import { logger, serviceLogger } from "../core/logger";
import { findAllServiceYamls, getServiceYamlPath, MONOREPO_ROOT } from "../core/paths";

/**
 * Service Registry - manages all discovered services
 */
export class ServiceRegistry {
  private services: Map<string, ServiceDefinition> = new Map();
  private loaded = false;

  /**
   * Load all services from service.yaml files
   */
  async discover(): Promise<ServiceDefinition[]> {
    if (this.loaded) {
      return Array.from(this.services.values());
    }

    const yamlPaths = findAllServiceYamls();
    logger.info(`Found ${yamlPaths.length} service.yaml file(s)`);

    for (const yamlPath of yamlPaths) {
      try {
        const service = this.loadServiceYaml(yamlPath);
        this.services.set(service.name, service);
        logger.debug(`Loaded service: ${service.name}`);
      } catch (err) {
        logger.warn(`Failed to load service from ${yamlPath}: ${(err as Error).message}`);
      }
    }

    this.loaded = true;
    logger.info(`Discovered ${this.services.size} service(s)`);
    return Array.from(this.services.values());
  }

  /**
   * Load a single service.yaml file
   */
  private loadServiceYaml(yamlPath: string): ServiceDefinition {
    const rawYaml = fs.readFileSync(yamlPath, "utf-8");
    const parsed = yaml.load(rawYaml) as any;

    // Validate service definition
    const service = ServiceDefinitionSchema.parse(parsed);

    // Normalize path to be relative to monorepo root
    const servicePath = path.dirname(yamlPath);
    const normalizedPath = path.relative(MONOREPO_ROOT, servicePath);

    return {
      ...service,
      path: normalizedPath || ".",
    };
  }

  /**
   * Get service by name
   */
  getService(name: string): ServiceDefinition | undefined {
    return this.services.get(name);
  }

  /**
   * Get all services
   */
  getAllServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  /**
   * Get services by kind
   */
  getServicesByKind(kind: string): ServiceDefinition[] {
    return Array.from(this.services.values()).filter((s) => s.kind === kind);
  }

  /**
   * Get services by tag
   */
  getServicesByTag(tag: string): ServiceDefinition[] {
    return Array.from(this.services.values()).filter((s) => s.tags?.includes(tag));
  }

  /**
   * Validate that all service references exist
   */
  validate(): Map<string, string[]> {
    const errors = new Map<string, string[]>();

    for (const [name, service] of this.services) {
      const serviceErrors: string[] = [];

      // Check dependencies exist
      const allDeps = [
        ...(service.dependencies?.dev || []),
        ...(service.dependencies?.test || []),
        ...(service.dependencies?.build || []),
        ...(service.dependencies?.deploy || []),
      ];

      const uniqueDeps = new Set(allDeps);
      for (const dep of uniqueDeps) {
        if (!this.services.has(dep)) {
          serviceErrors.push(`Dependency '${dep}' not found`);
        }
      }

      // Check infra requirements are valid (basic check)
      if (service.infra?.requires) {
        const validInfra = ["docker", "kubernetes", "database", "cache", "queue"];
        for (const req of service.infra.requires) {
          if (!validInfra.includes(req)) {
            serviceErrors.push(`Unknown infra requirement: ${req}`);
          }
        }
      }

      if (serviceErrors.length > 0) {
        errors.set(name, serviceErrors);
      }
    }

    return errors;
  }

  /**
   * Clear and reset registry
   */
  reset(): void {
    this.services.clear();
    this.loaded = false;
  }
}

// Singleton instance
let registry: ServiceRegistry | null = null;

export function getServiceRegistry(): ServiceRegistry {
  if (!registry) {
    registry = new ServiceRegistry();
  }
  return registry;
}

export async function discoverAllServices(): Promise<ServiceDefinition[]> {
  const registry = getServiceRegistry();
  return registry.discover();
}
