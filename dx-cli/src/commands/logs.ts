import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { execStream } from "../core/exec";
import { resolveServicePath } from "../core/paths";
import { readActiveEnvironment, writeActiveEnvironment } from "../k8s/state";
import { resolveK8sEnvironment } from "../k8s/environment";
import { streamLogs, getLatestPod } from "../k8s/utils";

async function handleLogs(service: string | undefined, options: any): Promise<void> {
  try {
    if (!service) {
      logger.error("Service name required for logs command");
      process.exit(1);
    }

    // Check if we should use K8s or local logs
    const activeEnv = readActiveEnvironment();
    const useK8s = activeEnv && (options.k8s !== false);

    if (useK8s) {
      // Kubernetes mode
      try {
        const env = resolveK8sEnvironment(activeEnv!);
        const selector = `app=${service}`;
        const podName = getLatestPod(selector, {
          namespace: env.namespace,
          context: env.kubeContext,
        });

        if (!podName) {
          logger.error(
            `No pods found for service '${service}' in namespace '${env.namespace}'.\n` +
            `Make sure the service is deployed: ${logger.info.toString().includes("info") ? "" : ""}`
          );
          logger.info(`Try: dx deploy ${service}`);
          process.exit(1);
        }

        const lines = parseInt(options.lines, 10) || 50;
        streamLogs(`pod/${podName}`, {
          namespace: env.namespace,
          context: env.kubeContext,
          follow: options.follow,
          lines: options.follow ? undefined : lines,
        });
      } catch (err) {
        // Fall back to local logs
        logger.debug(`K8s logs failed, falling back to local: ${(err as Error).message}`);
      }
      return;
    }

    // Local development mode (original behavior)
    const registry = getServiceRegistry();
    await registry.discover();

    const svc = registry.getService(service);
    if (!svc) {
      logger.error(`Service '${service}' not found`);
      process.exit(1);
    }

    if (!svc.commands.logs) {
      logger.warn(`${svc.name} has no logs command configured`);
      return;
    }

    const cmd = options.follow
      ? svc.commands.logs.replace(/\$\{lines\}/g, "-f")
      : svc.commands.logs.replace(/\$\{lines\}/g, options.lines);

    logger.info(`Fetching logs for ${svc.name}...`);
    const result = await execStream(cmd, [], {
      cwd: resolveServicePath(svc.path),
      serviceName: svc.name,
      useMise: false,
    });

    if (!result.success && !options.follow) {
      process.exit(1);
    }
  } catch (err) {
    logger.error(`logs command failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

export const logsCommand = new Command()
  .name("logs")
  .description("View service logs (Kubernetes or local)")
  .argument("<service>", "Service name")
  .option("--follow, -f", "Follow logs in real-time")
  .option("--lines <n>", "Number of lines to show", "50")
  .option("--k8s", "Force Kubernetes mode (auto-detected by default)")
  .action(handleLogs);
