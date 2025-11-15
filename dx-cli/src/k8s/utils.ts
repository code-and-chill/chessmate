/**
 * Kubernetes Utilities
 *
 * Low-level kubectl operations and K8s cluster interaction helpers.
 * Handles context validation, namespace creation, pod selection, etc.
 */

import { execSync } from "child_process";
import { logger } from "../core/logger";
import { K8sEnvironment } from "./types";

/**
 * Run a kubectl command with proper error handling
 */
export function kubectl(
  args: string[],
  options?: {
    context?: string;
    namespace?: string;
    ignoreErrors?: boolean;
  }
): string {
  const cmd = buildKubectlCommand(args, options);

  try {
    const result = execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim();
  } catch (err) {
    const errorMsg = (err as Error).message;
    
    if (options?.ignoreErrors) {
      logger.debug(`kubectl failed (ignoring): ${errorMsg}`);
      return "";
    }

    throw new Error(`kubectl command failed: ${errorMsg}\nCommand: ${cmd}`);
  }
}

/**
 * Build kubectl command string with context and namespace
 */
function buildKubectlCommand(
  args: string[],
  options?: {
    context?: string;
    namespace?: string;
  }
): string {
  const parts = ["kubectl"];

  if (options?.context) {
    parts.push(`--context=${options.context}`);
  }

  if (options?.namespace) {
    parts.push(`--namespace=${options.namespace}`);
  }

  parts.push(...args);

  return parts.join(" ");
}

/**
 * Check if a Kubernetes context exists
 */
export function contextExists(contextName: string): boolean {
  try {
    const contexts = kubectl(["config", "get-contexts", "-o", "name"]);
    return contexts.split("\n").includes(contextName);
  } catch {
    return false;
  }
}

/**
 * Get list of all available contexts
 */
export function listContexts(): string[] {
  try {
    const output = kubectl(["config", "get-contexts", "-o", "name"]);
    return output
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
  } catch {
    return [];
  }
}

/**
 * Switch to a Kubernetes context
 */
export function switchContext(contextName: string): void {
  try {
    kubectl(["config", "use-context", contextName]);
    logger.success(`Switched to context: ${contextName}`);
  } catch (err) {
    throw new Error(
      `Failed to switch to context '${contextName}': ${(err as Error).message}\n` +
      `Available contexts: ${listContexts().join(", ")}`
    );
  }
}

/**
 * Check if a cluster is reachable
 */
export function isClusterReachable(contextName: string): boolean {
  try {
    kubectl(["cluster-info"], { context: contextName });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a namespace exists
 */
export function namespaceExists(
  namespace: string,
  context: string
): boolean {
  try {
    kubectl(["get", "ns", namespace], { context });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a namespace if it doesn't exist
 */
export function ensureNamespaceExists(
  namespace: string,
  context: string,
  labels?: Record<string, string>
): void {
  if (namespaceExists(namespace, context)) {
    logger.debug(`Namespace '${namespace}' already exists`);
    return;
  }

  try {
    const args = ["create", "ns", namespace];

    // Add labels if provided
    if (labels) {
      const labelArgs = Object.entries(labels)
        .map(([k, v]) => `${k}=${v}`)
        .join(",");
      args.push("--dry-run=client", "-o", "yaml");
    }

    kubectl(args, { context });

    logger.success(`Created namespace: ${namespace}`);
  } catch (err) {
    throw new Error(
      `Failed to create namespace '${namespace}': ${(err as Error).message}`
    );
  }
}

/**
 * Get pods for a given deployment/service
 */
export function getPods(
  selector: string,
  options: {
    namespace: string;
    context: string;
  }
): Array<{ name: string; status: string; age: string }> {
  try {
    const output = kubectl(
      ["get", "pods", "-l", selector, "-o", "json"],
      {
        namespace: options.namespace,
        context: options.context,
      }
    );

    if (!output) {
      return [];
    }

    const parsed = JSON.parse(output);
    return (parsed.items || []).map((pod: any) => ({
      name: pod.metadata.name,
      status: pod.status.phase || "Unknown",
      age: pod.metadata.creationTimestamp,
    }));
  } catch (err) {
    logger.debug(`Failed to get pods: ${(err as Error).message}`);
    return [];
  }
}

/**
 * Get the most recent pod for a selector
 */
export function getLatestPod(
  selector: string,
  options: {
    namespace: string;
    context: string;
  }
): string | null {
  const pods = getPods(selector, options);

  if (pods.length === 0) {
    return null;
  }

  // Sort by creation time (descending)
  pods.sort(
    (a, b) =>
      new Date(b.age).getTime() - new Date(a.age).getTime()
  );

  return pods[0].name;
}

/**
 * Stream logs from a deployment or pod
 */
export function streamLogs(
  target: string, // deployment/name or pod/name
  options: {
    namespace: string;
    context: string;
    follow?: boolean;
    lines?: number;
  }
): void {
  const args = ["logs"];

  if (target.startsWith("deploy/") || target.startsWith("deployment/")) {
    args.push(target);
  } else {
    // Treat as pod name
    args.push(target);
  }

  if (options.follow) {
    args.push("-f");
  }

  if (options.lines) {
    args.push("--tail", options.lines.toString());
  }

  const cmd = buildKubectlCommand(args, {
    namespace: options.namespace,
    context: options.context,
  });

  logger.info(`Streaming logs: ${cmd}`);

  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    throw new Error(`Failed to stream logs: ${(err as Error).message}`);
  }
}

/**
 * Apply a manifest file
 */
export function applyManifest(
  manifestFile: string,
  options: {
    namespace: string;
    context: string;
  }
): string {
  try {
    const output = kubectl(
      ["apply", "-f", manifestFile],
      {
        namespace: options.namespace,
        context: options.context,
      }
    );
    return output;
  } catch (err) {
    throw new Error(
      `Failed to apply manifest '${manifestFile}': ${(err as Error).message}`
    );
  }
}

/**
 * Get service information
 */
export function getServiceInfo(
  serviceName: string,
  options: {
    namespace: string;
    context: string;
  }
): {
  name: string;
  type: string;
  clusterIP?: string;
  externalIP?: string;
  ports: string[];
} | null {
  try {
    const output = kubectl(
      ["get", "svc", serviceName, "-o", "json"],
      {
        namespace: options.namespace,
        context: options.context,
      }
    );

    if (!output) {
      return null;
    }

    const svc = JSON.parse(output);
    return {
      name: svc.metadata.name,
      type: svc.spec.type,
      clusterIP: svc.spec.clusterIP,
      externalIP: svc.status?.loadBalancer?.ingress?.[0]?.ip,
      ports: (svc.spec.ports || []).map((p: any) => `${p.port}:${p.targetPort}`),
    };
  } catch {
    return null;
  }
}

/**
 * Start a port-forward
 */
export function portForward(
  resource: string, // svc/name or pod/name
  localPort: number,
  remotePort: number,
  options: {
    namespace: string;
    context: string;
  }
): void {
  const cmd = buildKubectlCommand(
    ["port-forward", resource, `${localPort}:${remotePort}`],
    {
      namespace: options.namespace,
      context: options.context,
    }
  );

  logger.info(`Starting port-forward: ${cmd}`);
  logger.info(`Access service at: http://localhost:${localPort}`);
  logger.info(`Press Ctrl+C to stop`);

  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    // Exit code 130 is normal when user presses Ctrl+C
    const exitCode = (err as any).status;
    if (exitCode !== 130) {
      throw new Error(`Port-forward failed: ${(err as Error).message}`);
    }
  }
}

/**
 * Exec into a pod
 */
export function execPod(
  podName: string,
  cmd: string[],
  options: {
    namespace: string;
    context: string;
    interactive?: boolean;
  }
): void {
  const args = ["exec"];

  if (options.interactive) {
    args.push("-it");
  }

  args.push(podName, "--");
  args.push(...cmd);

  const cmdStr = buildKubectlCommand(args, {
    namespace: options.namespace,
    context: options.context,
  });

  logger.debug(`Executing: ${cmdStr}`);

  try {
    execSync(cmdStr, { stdio: "inherit" });
  } catch (err) {
    throw new Error(`Failed to exec into pod: ${(err as Error).message}`);
  }
}
