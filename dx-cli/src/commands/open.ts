/**
 * Open Command
 *
 * Open a service URL in the browser or setup port-forwarding.
 * Supports both ingress-based URLs (dev/prod) and local port-forward.
 */

import { Command } from "commander";
import { logger } from "../core/logger";
import { readActiveEnvironment } from "../k8s/state";
import { resolveK8sEnvironment } from "../k8s/environment";
import { getServiceInfo, portForward } from "../k8s/utils";
import { execSync } from "child_process";

/**
 * Attempt to open a URL in the default browser
 */
function openBrowser(url: string): void {
  try {
    // Try common open commands
    const openCommands = [
      { cmd: "open", platforms: ["darwin"] }, // macOS
      { cmd: "xdg-open", platforms: ["linux"] }, // Linux
      { cmd: "start", platforms: ["win32"] }, // Windows
    ];

    for (const { cmd } of openCommands) {
      try {
        execSync(`${cmd} "${url}"`, { stdio: "ignore" });
        return;
      } catch {
        // Try next command
      }
    }

    // If we get here, no open command worked
    logger.info(`Could not open browser. Visit: ${url}`);
  } catch (err) {
    logger.debug(`Failed to open browser: ${(err as Error).message}`);
  }
}

async function handleOpen(service: string, options: any): Promise<void> {
  try {
    const activeEnv = readActiveEnvironment();

    if (!activeEnv) {
      logger.error(
        "No active Kubernetes environment set.\n" +
        "Run: dx env use <name>"
      );
      process.exit(1);
    }

    const env = resolveK8sEnvironment(activeEnv);

    // For local environment or if ingress is not configured, use port-forward
    if (
      env.isLocal ||
      !env.domain ||
      (options.portForward === true)
    ) {
      logger.info(`Setting up port-forward for ${service}...`);

      // Get service info to determine port
      const svcInfo = getServiceInfo(service, {
        namespace: env.namespace,
        context: env.kubeContext,
      });

      if (!svcInfo) {
        logger.error(
          `Service '${service}' not found in namespace '${env.namespace}'`
        );
        process.exit(1);
      }

      const localPort = options.port || 8080;
      const remotePort = parseInt(svcInfo.ports[0].split(":")[1] || "80", 10);

      logger.success(`Service URL: http://localhost:${localPort}`);

      if (!options.noOpen) {
        openBrowser(`http://localhost:${localPort}`);
      }

      // Start port-forward
      portForward(`svc/${service}`, localPort, remotePort, {
        namespace: env.namespace,
        context: env.kubeContext,
      });
      return;
    }

    // For remote environments with ingress, generate URL
    if (env.domain) {
      // Generate ingress URL
      // Format: http://<serviceName>.<namespace>.<domain>
      // or simplified: http://<serviceName>.<domain>
      const url = `http://${service}.${env.domain}`;

      logger.success(`Service URL: ${url}`);

      if (!options.noOpen) {
        openBrowser(url);
      } else {
        logger.info(`To open in browser: ${url}`);
      }
    }
  } catch (err) {
    logger.error(`open command failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

export const openCommand = new Command()
  .name("open")
  .description("Open a service in the browser or setup port-forwarding")
  .argument("<service>", "Service name")
  .option("--port <n>", "Local port for port-forward", "8080")
  .option("--no-open", "Print URL instead of opening in browser")
  .option("--port-forward", "Force port-forward instead of ingress URL")
  .action(handleOpen);
