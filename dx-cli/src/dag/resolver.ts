import { ServiceDefinition } from "../config/schema";
import { logger } from "../core/logger";

export type Lifecycle = "dev" | "test" | "build" | "deploy" | "lint" | "migrate" | "seed";

interface DependencyNode {
  service: ServiceDefinition;
  dependencies: DependencyNode[];
}

/**
 * DAG Resolver - builds and resolves service dependency graphs
 */
export class DagResolver {
  private services: Map<string, ServiceDefinition>;

  constructor(services: ServiceDefinition[]) {
    this.services = new Map(services.map((s) => [s.name, s]));
  }

  /**
   * Get all dependencies for a service in a given lifecycle
   * Returns array in topological order (dependencies first)
   */
  resolveDependencies(serviceName: string, lifecycle: Lifecycle): ServiceDefinition[] {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    const visited = new Set<string>();
    const ordered: ServiceDefinition[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) {
        return;
      }
      visited.add(name);

      const svc = this.services.get(name);
      if (!svc) {
        throw new Error(`Service '${name}' not found`);
      }

      // Get dependencies for this lifecycle
      const deps = this.getDepsForLifecycle(svc, lifecycle) || [];

      // Recursively visit dependencies
      for (const dep of deps) {
        visit(dep);
      }

      // Add this service after its dependencies
      if (name !== serviceName) {
        ordered.push(svc);
      }
    };

    visit(serviceName);

    // Add the target service last
    ordered.push(service);

    return ordered;
  }

  /**
   * Get all services in topological order for a lifecycle
   * (useful for global dev/test/build)
   */
  resolveGlobal(lifecycle: Lifecycle): ServiceDefinition[] {
    const visited = new Set<string>();
    const ordered: ServiceDefinition[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) {
        return;
      }
      visited.add(name);

      const svc = this.services.get(name);
      if (!svc) {
        return;
      }

      const deps = this.getDepsForLifecycle(svc, lifecycle) || [];
      for (const dep of deps) {
        visit(dep);
      }

      ordered.push(svc);
    };

    // Visit all services
    for (const name of this.services.keys()) {
      visit(name);
    }

    return ordered;
  }

  /**
   * Group services by depth level in dependency tree
   * Services at the same depth can be executed in parallel
   */
  resolveByDepth(serviceName: string, lifecycle: Lifecycle): ServiceDefinition[][] {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    const depthMap = new Map<string, number>();

    const calculateDepth = (name: string): number => {
      if (depthMap.has(name)) {
        return depthMap.get(name)!;
      }

      const svc = this.services.get(name);
      if (!svc) {
        return 0;
      }

      const deps = this.getDepsForLifecycle(svc, lifecycle) || [];
      if (deps.length === 0) {
        depthMap.set(name, 0);
        return 0;
      }

      const maxDepth = Math.max(...deps.map((d) => calculateDepth(d)));
      const depth = maxDepth + 1;
      depthMap.set(name, depth);
      return depth;
    };

    // Calculate depths for service and all its dependencies
    const visited = new Set<string>();
    const gatherServices = (name: string) => {
      if (visited.has(name)) {
        return;
      }
      visited.add(name);

      const svc = this.services.get(name);
      if (!svc) {
        return;
      }

      const deps = this.getDepsForLifecycle(svc, lifecycle) || [];
      for (const dep of deps) {
        gatherServices(dep);
      }

      calculateDepth(name);
    };

    gatherServices(serviceName);

    // Group by depth
    const groups: ServiceDefinition[][] = [];
    for (const [name, depth] of depthMap) {
      if (!groups[depth]) {
        groups[depth] = [];
      }
      const svc = this.services.get(name);
      if (svc) {
        groups[depth].push(svc);
      }
    }

    return groups.filter((g) => g.length > 0);
  }

  /**
   * Get dependencies for a service in a specific lifecycle
   */
  private getDepsForLifecycle(service: ServiceDefinition, lifecycle: Lifecycle): string[] {
    if (!service.dependencies) {
      return [];
    }

    switch (lifecycle) {
      case "dev":
        return service.dependencies.dev || [];
      case "test":
        return service.dependencies.test || [];
      case "build":
        return service.dependencies.build || [];
      case "deploy":
        return service.dependencies.deploy || [];
      default:
        return [];
    }
  }
}

/**
 * DAG Validator - checks for cycles and invalid references
 */
export class DagValidator {
  private services: Map<string, ServiceDefinition>;

  constructor(services: ServiceDefinition[]) {
    this.services = new Map(services.map((s) => [s.name, s]));
  }

  /**
   * Validate entire DAG
   * Returns array of error messages
   */
  validate(): string[] {
    const errors: string[] = [];

    // Check for invalid references
    errors.push(...this.checkInvalidReferences());

    // Check for cycles
    errors.push(...this.detectCycles());

    return errors;
  }

  /**
   * Check for references to non-existent services
   */
  private checkInvalidReferences(): string[] {
    const errors: string[] = [];

    for (const [name, service] of this.services) {
      if (!service.dependencies) {
        continue;
      }

      const allDeps = [
        ...(service.dependencies.dev || []),
        ...(service.dependencies.test || []),
        ...(service.dependencies.build || []),
        ...(service.dependencies.deploy || []),
      ];

      const uniqueDeps = new Set(allDeps);
      for (const dep of uniqueDeps) {
        if (!this.services.has(dep)) {
          errors.push(`Service '${name}' references non-existent dependency '${dep}'`);
        }
      }
    }

    return errors;
  }

  /**
   * Detect cycles in dependency graph
   */
  private detectCycles(): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (name: string, path: string[] = []): boolean => {
      visited.add(name);
      recursionStack.add(name);
      path.push(name);

      const service = this.services.get(name);
      if (!service || !service.dependencies) {
        recursionStack.delete(name);
        return false;
      }

      const allDeps = [
        ...(service.dependencies.dev || []),
        ...(service.dependencies.test || []),
        ...(service.dependencies.build || []),
        ...(service.dependencies.deploy || []),
      ];

      const uniqueDeps = new Set(allDeps);
      for (const dep of uniqueDeps) {
        if (!visited.has(dep)) {
          if (hasCycle(dep, [...path])) {
            return true;
          }
        } else if (recursionStack.has(dep)) {
          const cycle = [...path, dep].join(" -> ");
          errors.push(`Dependency cycle detected: ${cycle}`);
          return true;
        }
      }

      recursionStack.delete(name);
      return false;
    };

    for (const name of this.services.keys()) {
      if (!visited.has(name)) {
        hasCycle(name);
      }
    }

    return errors;
  }
}
