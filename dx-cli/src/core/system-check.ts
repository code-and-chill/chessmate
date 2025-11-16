import { execSync as nodeExecSync } from "child_process";
import { logger } from "./logger";
import os from "os";

export interface SystemRequirement {
  name: string;
  command: string;
  versionArg: string;
  minVersion?: string;
  required: boolean;
  install?: string;
}

export interface CheckResult {
  name: string;
  installed: boolean;
  version?: string;
  required: boolean;
  message: string;
}

const SYSTEM_REQUIREMENTS: SystemRequirement[] = [
  {
    name: "Node.js",
    command: "node",
    versionArg: "--version",
    minVersion: "18.0.0",
    required: true,
    install: "https://nodejs.org/",
  },
  {
    name: "npm",
    command: "npm",
    versionArg: "--version",
    minVersion: "8.0.0",
    required: true,
    install: "npm install -g npm",
  },
  {
    name: "pnpm",
    command: "pnpm",
    versionArg: "--version",
    required: true,
    install: "npm install -g pnpm",
  },
  {
    name: "Python 3",
    command: "python3",
    versionArg: "--version",
    minVersion: "3.9.0",
    required: true,
    install: "https://www.python.org/downloads/",
  },
  {
    name: "Git",
    command: "git",
    versionArg: "--version",
    required: true,
    install: "https://git-scm.com/",
  },
  {
    name: "Poetry",
    command: "poetry",
    versionArg: "--version",
    required: true,
    install: "curl -sSL https://install.python-poetry.org | python3 -",
  },
  {
    name: "Docker",
    command: "docker",
    versionArg: "--version",
    required: false,
    install: "https://www.docker.com/",
  },
  {
    name: "mise",
    command: "mise",
    versionArg: "--version",
    required: false,
    install: "curl https://mise.jq.fn | sh",
  },
  {
    name: "Java",
    command: "java",
    versionArg: "--version",
    required: false,
    install: "https://adoptopenjdk.net/",
  },
];

/**
 * Parse semantic version string (e.g., "v18.2.0" -> "18.2.0")
 */
function parseVersion(versionString: string): string {
  const match = versionString.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : versionString;
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

/**
 * Check if a command is available and get its version
 */
function checkCommand(requirement: SystemRequirement): CheckResult {
  try {
    const output = nodeExecSync(`${requirement.command} ${requirement.versionArg}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    const version = parseVersion(output);

    // Check minimum version if specified
    if (requirement.minVersion) {
      const comparison = compareVersions(version, requirement.minVersion);
      if (comparison < 0) {
        return {
          name: requirement.name,
          installed: true,
          version,
          required: requirement.required,
          message: `❌ ${requirement.name} (v${version}) is installed but too old (need v${requirement.minVersion})`,
        };
      }
    }

    return {
      name: requirement.name,
      installed: true,
      version,
      required: requirement.required,
      message: `✓ ${requirement.name} (v${version})`,
    };
  } catch {
    return {
      name: requirement.name,
      installed: false,
      required: requirement.required,
      message: requirement.required
        ? `❌ ${requirement.name} is required but not installed`
        : `⚠ ${requirement.name} is optional but not installed`,
    };
  }
}

/**
 * Check all system requirements
 */
export async function checkSystemRequirements(): Promise<CheckResult[]> {
  logger.info("Checking system requirements...");
  logger.info("");

  const results: CheckResult[] = SYSTEM_REQUIREMENTS.map(checkCommand);

  return results;
}

/**
 * Print system check results with installation instructions
 */
export function printSystemCheckResults(results: CheckResult[]): void {
  const required = results.filter((r) => r.required);
  const optional = results.filter((r) => !r.required);

  logger.info("Required Tools:");
  for (const result of required) {
    if (result.installed) {
      logger.success(`  ${result.message}`);
    } else {
      logger.warn(`  ${result.message}`);
    }
  }

  logger.info("");
  logger.info("Optional Tools:");
  for (const result of optional) {
    if (result.installed) {
      logger.success(`  ${result.message}`);
    } else {
      logger.warn(`  ${result.message}`);
    }
  }

  logger.info("");

  // Check for failures
  const failedRequired = required.filter(
    (r) => !r.installed || r.message.includes("too old")
  );

  if (failedRequired.length > 0) {
    logger.error("Installation Instructions:");
    logger.error("");
    for (const req of SYSTEM_REQUIREMENTS) {
      const result = results.find((r) => r.name === req.name);
      if (result && (!result.installed || result.message.includes("too old"))) {
        logger.error(`${req.name}:`);
        logger.error(`  Install from: ${req.install}`);
        if (req.name === "Python 3") {
          logger.error(`  Or use brew: brew install python@3.11`);
        }
        if (req.name === "Node.js") {
          logger.error(`  Or use nvm: nvm install 18`);
        }
        if (req.name === "mise") {
          logger.error(`  Or use brew: brew install mise`);
        }
        logger.error("");
      }
    }
  }
}

/**
 * Verify OS compatibility
 */
export function checkOSCompatibility(): void {
  const platform = os.platform();
  const validPlatforms = ["darwin", "linux", "win32"];

  if (!validPlatforms.includes(platform)) {
    logger.warn(`Operating system '${platform}' may not be fully supported`);
    return;
  }

  const osNames: Record<string, string> = {
    darwin: "macOS",
    linux: "Linux",
    win32: "Windows",
  };

  logger.success(`✓ Operating System: ${osNames[platform] || platform}`);
}

/**
 * Check Node modules installation
 */
export function checkNodeModules(): boolean {
  try {
    const fs = require("fs");
    const path = require("path");

    // Check if commander can be required (indicates dependencies are installed)
    try {
      require.resolve("commander");
      logger.success("✓ dx-cli dependencies installed");
      return true;
    } catch {
      logger.warn("⚠ dx-cli dependencies not fully installed");
      logger.info("  Run: cd dx-cli && npm install");
      return false;
    }
  } catch (err) {
    logger.warn(`⚠ Could not verify dx-cli dependencies: ${(err as Error).message}`);
    return false;
  }
}

/**
 * Get installation instructions based on platform
 */
/**
 * Get installation instructions based on platform
 */
export function getInstallationInstructions(): string {
  const platform = os.platform();

  if (platform === "darwin") {
    return `
# On macOS with Homebrew (recommended):
brew install node pnpm python@3.11 git poetry

# Alternatively, install Node and Python first, then:
pip3 install poetry

# Then run dx setup again
`;
  } else if (platform === "linux") {
    return `
# On Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs python3 git

# For pnpm:
npm install -g pnpm

# For Poetry (recommended):
curl -sSL https://install.python-poetry.org | python3 -

# Or use pip:
pip3 install poetry

# Then run dx setup again
`;
  }

  return `
Please visit the installation pages for your platform:
- Node.js: https://nodejs.org/
- Python 3: https://www.python.org/
- Git: https://git-scm.com/
- Poetry: https://python-poetry.org/docs/#installation
- Docker: https://www.docker.com/

Run 'dx setup' again after installing the required tools.
`;
}
