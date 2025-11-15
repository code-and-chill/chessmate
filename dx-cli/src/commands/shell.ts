/**
 * Shell Command
 *
 * Execute an interactive shell session in a service pod running in Kubernetes.
 * Provides access for debugging, inspection, and manual operations.
 */

import { Command } from "commander";
import { logger } from "../core/logger";
import { readActiveEnvironment } from "../k8s/state";
import { resolveK8sEnvironment } from "../k8s/environment";
import { execPod, getLatestPod } from "../k8s/utils";

async function handleShell(service: string, options: any): Promise<void> {
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

    // Find a pod for this service
    const selector = `app=${service}`;
    const podName = getLatestPod(selector, {
      namespace: env.namespace,
      context: env.kubeContext,
    });

    if (!podName) {
      logger.error(
        `No pods found for service '${service}' in namespace '${env.namespace}'.\n` +
        `Make sure the service is deployed: dx deploy ${service}`
      );
      process.exit(1);
    }

    logger.info(`Connecting to pod: ${podName}`);

    const cmd = options.cmd || "/bin/sh";
    const cmdArray = cmd.split(" ");

    execPod(podName, cmdArray, {
      namespace: env.namespace,
      context: env.kubeContext,
      interactive: true,
    });
  } catch (err) {
    logger.error(`shell command failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

export const shellCommand = new Command()
  .name("shell")
  .description("Execute an interactive shell in a service pod (Kubernetes only)")
  .argument("<service>", "Service name")
  .option("--cmd <shell>", "Shell command to run", "/bin/sh")
  .action(handleShell);
