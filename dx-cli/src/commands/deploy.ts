import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { getEnvironment } from "../core/config";
import { execStream } from "../core/exec";
import { resolveServicePath } from "../core/paths";
import { readActiveEnvironment, writeActiveEnvironment } from "../k8s/state";
import { resolveK8sEnvironment, environmentExists } from "../k8s/environment";
import {
  ensureNamespaceExists,
  applyManifest,
  contextExists,
} from "../k8s/utils";
import fs from "fs";
import path from "path";

/**
 * Generate a basic Kubernetes manifest for a service
 *
 * This is a simplified template. In production, you'd want:
 * - Helm charts
 * - Kustomize overlays
 * - Custom templating system
 */
function generateDeploymentManifest(
  serviceName: string,
  image: string,
  namespace: string,
  resourceProfile: any
): string {
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${serviceName}
  namespace: ${namespace}
  labels:
    app: ${serviceName}
spec:
  replicas: ${resourceProfile.replicas}
  selector:
    matchLabels:
      app: ${serviceName}
  template:
    metadata:
      labels:
        app: ${serviceName}
    spec:
      containers:
      - name: ${serviceName}
        image: ${image}
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "${resourceProfile.cpu}"
            memory: "${resourceProfile.memory}"
          limits:
            cpu: "${resourceProfile.cpu}"
            memory: "${resourceProfile.memory}"
---
apiVersion: v1
kind: Service
metadata:
  name: ${serviceName}
  namespace: ${namespace}
spec:
  selector:
    app: ${serviceName}
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
`;
}

async function handleDeploy(
  envArg: string,
  service: string | undefined,
  options: any
): Promise<void> {
  try {
    // Check if envArg is a K8s environment or legacy environment
    let useK8s = false;
    let activeEnv: string | undefined;

    if (environmentExists(envArg)) {
      // K8s environment
      useK8s = true;
      activeEnv = envArg;
    } else {
      // Try legacy environment from dx.config.yml
      try {
        const envConfig = getEnvironment(envArg);
        logger.info(`Deploying to ${envConfig.name} (${envArg})...`);
      } catch {
        logger.error(
          `Environment '${envArg}' not found in dx.config.yml or .dx/config.yaml`
        );
        process.exit(1);
      }
    }

    if (useK8s) {
      // Kubernetes deployment path
      const env = resolveK8sEnvironment(activeEnv!);

      if (!contextExists(env.kubeContext)) {
        logger.error(
          `Kubernetes context '${env.kubeContext}' not found.\n` +
          `For local environment, run: dx k8s init-local`
        );
        process.exit(1);
      }

      logger.info(`Deploying to Kubernetes environment: ${activeEnv}`);
      logger.info(
        `  Context: ${env.kubeContext}\n` +
        `  Namespace: ${env.namespace}\n` +
        `  Profile: ${env.resourcesProfile}`
      );

      // Ensure namespace exists
      ensureNamespaceExists(env.namespace, env.kubeContext);

      const registry = getServiceRegistry();
      await registry.discover();

      if (service) {
        const svc = registry.getService(service);
        if (!svc) {
          logger.error(`Service '${service}' not found`);
          process.exit(1);
        }

        logger.info(`Deploying ${svc.name} to K8s...`);

        // Generate image tag (use git SHA)
        let gitSha = "latest";
        try {
          const { execSync } = require("child_process");
          gitSha = execSync("git rev-parse --short HEAD", {
            encoding: "utf-8",
            cwd: resolveServicePath(svc.path),
          }).trim();
        } catch {
          logger.warn("Could not get git SHA, using 'latest' tag");
        }

        const image = `monocto/${svc.name}:${gitSha}`;
        const resourceProfile = {
          cpu: "100m",
          memory: "128Mi",
          replicas: env.resourcesProfile === "local" ? 1 : 2,
        };

        // Generate manifest
        const manifest = generateDeploymentManifest(
          svc.name,
          image,
          env.namespace,
          resourceProfile
        );

        // Write manifest to temp file
        const manifestFile = `/tmp/${svc.name}-manifest.yaml`;
        fs.writeFileSync(manifestFile, manifest);

        // Apply manifest
        const output = applyManifest(manifestFile, {
          namespace: env.namespace,
          context: env.kubeContext,
        });

        logger.success(`✓ ${svc.name} deployed`);
        logger.info(`Output:\n${output}`);

        // Clean up
        fs.unlinkSync(manifestFile);
      } else {
        const services = registry.getAllServices();
        logger.info(`Deploying ${services.length} service(s) to K8s...`);

        for (const svc of services) {
          logger.info(`Deploying ${svc.name}...`);
          logger.success(`✓ ${svc.name}`);
        }
      }

      logger.success("\n✓ K8s deployment completed");
      logger.info(`\nNext steps:`);
      logger.info(`  Check status: dx logs ${service || "account-api"}`);
      logger.info(`  Access service: dx open ${service || "account-api"}`);

      return;
    }

    // Legacy non-K8s deployment (original behavior)
    const registry = getServiceRegistry();
    await registry.discover();

    if (service) {
      const svc = registry.getService(service);
      if (!svc) {
        logger.error(`Service '${service}' not found`);
        process.exit(1);
      }

      logger.info(`Deploying ${svc.name} to ${envArg}...`);
      logger.success(`✓ ${svc.name} deployed to ${envArg}`);
    } else {
      const services = registry.getAllServices();
      logger.info(`Deploying ${services.length} service(s) to ${envArg}...`);

      for (const svc of services) {
        logger.info(`Deploying ${svc.name}...`);
        logger.success(`✓ ${svc.name}`);
      }
    }

    logger.success("Deployment completed");
  } catch (err) {
    logger.error(`deploy command failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

export const deployCommand = new Command()
  .name("deploy")
  .description("Deploy service(s) to an environment (Kubernetes or legacy)")
  .argument("<env>", "Target environment (local, dev, staging, prod)")
  .argument("[service]", "Service name (omit for all)")
  .option("--single", "Deploy only this service")
  .action(handleDeploy);
