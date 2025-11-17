export type ServiceNode = {
  name: string;
  dependencies: string[]; // service names
};

export class ServiceGraph {
  private nodes: Map<string, ServiceNode> = new Map();

  addServiceNode(node: ServiceNode): void {
    if (this.nodes.has(node.name)) {
      throw new Error(`Service ${node.name} already exists in the graph.`);
    }
    this.nodes.set(node.name, node);
  }

  getServiceNode(name: string): ServiceNode | undefined {
    return this.nodes.get(name);
  }

  getDependencies(name: string): string[] {
    const node = this.getServiceNode(name);
    if (!node) {
      throw new Error(`Service ${name} not found in the graph.`);
    }
    return node.dependencies;
  }

  getTransitiveDependencies(name: string, visited = new Set<string>()): string[] {
    if (visited.has(name)) {
      return [];
    }
    visited.add(name);

    const node = this.getServiceNode(name);
    if (!node) {
      throw new Error(`Service ${name} not found in the graph.`);
    }

    const directDeps = node.dependencies;
    const transitiveDeps = directDeps.flatMap(dep => this.getTransitiveDependencies(dep, visited));

    return Array.from(new Set([...directDeps, ...transitiveDeps]));
  }

  getDependents(name: string): string[] {
    const dependents: string[] = [];

    for (const node of this.nodes.values()) {
      if (node.dependencies.includes(name)) {
        dependents.push(node.name);
      }
    }

    return dependents;
  }

  validateGraph(): void {
    // Validate no unknown service references
    for (const node of this.nodes.values()) {
      for (const dep of node.dependencies) {
        if (!this.nodes.has(dep)) {
          throw new Error(`Service ${node.name} depends on unknown service ${dep}.`);
        }
      }
    }

    // Validate no cycles
    const visited = new Set<string>();
    const stack = new Set<string>();

    const visit = (name: string) => {
      if (stack.has(name)) {
        throw new Error(`Cycle detected involving service ${name}.`);
      }
      if (visited.has(name)) {
        return;
      }

      visited.add(name);
      stack.add(name);

      const node = this.getServiceNode(name);
      if (node) {
        for (const dep of node.dependencies) {
          visit(dep);
        }
      }

      stack.delete(name);
    };

    for (const name of this.nodes.keys()) {
      visit(name);
    }
  }
}