import path from "path";
import fs from "fs";

/**
 * Central path resolution utility
 */

// Determine monorepo root by looking for AGENTS.md or dx-cli directory
function findMonorepoRoot(): string {
  let current = process.cwd();
  
  // If we're inside dx-cli/bin or dx-cli/dist, go up to find monorepo root
  if (current.includes("dx-cli")) {
    const parts = current.split(path.sep);
    const dxCliIndex = parts.lastIndexOf("dx-cli");
    if (dxCliIndex !== -1) {
      current = parts.slice(0, dxCliIndex).join(path.sep);
    }
  }

  // Look for AGENTS.md or dx-cli directory to confirm monorepo root
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, "AGENTS.md")) || 
        fs.existsSync(path.join(current, "dx-cli"))) {
      return current;
    }
    current = path.dirname(current);
  }

  return process.cwd();
}

export const MONOREPO_ROOT = findMonorepoRoot();

export function resolveMonorepoPath(...segments: string[]): string {
  return path.resolve(MONOREPO_ROOT, ...segments);
}

export function resolveDxCliPath(...segments: string[]): string {
  return resolveMonorepoPath("dx-cli", ...segments);
}

export function resolveServicePath(serviceName: string, ...segments: string[]): string {
  return resolveMonorepoPath(serviceName, ...segments);
}

export function resolveDxConfig(): string {
  return resolveDxCliPath("dx.config.yml");
}

export function serviceYamlExists(servicePath: string): boolean {
  const serviceYamlPath = path.resolve(servicePath, "service.yaml");
  return fs.existsSync(serviceYamlPath);
}

export function getServiceYamlPath(servicePath: string): string {
  return path.resolve(servicePath, "service.yaml");
}

export function getPackageJsonPath(servicePath: string): string {
  return path.resolve(servicePath, "package.json");
}

export function getPyprojectTomlPath(servicePath: string): string {
  return path.resolve(servicePath, "pyproject.toml");
}

export function findAllServiceYamls(): string[] {
  const serviceYamls: string[] = [];
  const excludePatterns = ["node_modules", "dist", ".git"];

  function scanDir(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (excludePatterns.some((p) => entry.name.includes(p))) {
          continue;
        }

        if (entry.isDirectory()) {
          scanDir(path.resolve(dir, entry.name));
        } else if (entry.name === "service.yaml") {
          serviceYamls.push(path.resolve(dir, entry.name));
        }
      }
    } catch {
      // Silently skip directories we can't read
    }
  }

  scanDir(MONOREPO_ROOT);
  return serviceYamls;
}
