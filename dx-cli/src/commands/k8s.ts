/**
 * Kubernetes Management Command
 *
 * Manage Kubernetes cluster infrastructure and initialization.
 * Commands:
 *   - dx k8s init-local: bootstrap local kind cluster
 */

import { Command } from "commander";
import { execSync } from "child_process";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { logger } from "../core/logger";
import {
  resolveK8sEnvironment,
  getAllEnvironmentNames,
} from "../k8s/environment";
import { readActiveEnvironment } from "../k8s/state";
import {
  kubectl,
  contextExists,
  ensureNamespaceExists,
  isClusterReachable,
} from "../k8s/utils";
import { resolveMonorepoPath } from "../core/paths";

/**
 * Check if a command exists on PATH
 */
function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize local kind cluster
 */
async function handleInitLocal(): Promise<void> {
  try {
    // Check if we have an active environment
    let envName = readActiveEnvironment();

    if (!envName) {
      const envNames = getAllEnvironmentNames();
      const localEnv = envNames.find((e) => e === "local");

      if (!localEnv) {
        logger.error("No 'local' environment found in .dx/config.yaml");
        process.exit(1);
      }

      envName = "local";
    }

    // Resolve environment
    const env = resolveK8sEnvironment(envName);

    // Verify this is a local environment
    if (!env.isLocal) {
      logger.error(
        `dx k8s init-local only works with local environments.\n` +
        `Current environment '${envName}' is not local.`
      );
      process.exit(1);
    }

    if (!env.kindCluster) {
      logger.error(
        `Environment '${envName}' is not configured for kind.\n` +
        `Add kindCluster configuration to .dx/config.yaml`
      );
      process.exit(1);
    }

    logger.info("Initializing local kind cluster...\n");

    // Check prerequisites
    logger.info("Checking prerequisites:");

    if (!commandExists("kind")) {
      logger.error(`✗ 'kind' not found on PATH`);
      logger.info(`  Install from: https://kind.sigs.k8s.io/docs/user/quick-start/`);
      process.exit(1);
    }
    logger.success(`✓ kind is installed`);

    if (!commandExists("kubectl")) {
      logger.error(`✗ 'kubectl' not found on PATH`);
      logger.info(`  Install from: https://kubernetes.io/docs/tasks/tools/`);
      process.exit(1);
    }
    logger.success(`✓ kubectl is installed`);

    if (!commandExists("docker")) {
      logger.error(`✗ 'docker' not found on PATH or docker daemon not running`);
      logger.info(`  Install from: https://docs.docker.com/get-docker/`);
      process.exit(1);
    }
    logger.success(`✓ docker is running`);

    console.log();

    // Check if cluster already exists
    const clusterName = env.kindCluster.name;
    let clusterExists = false;

    try {
      const clusters = execSync("kind get clusters", { encoding: "utf-8" });
      clusterExists = clusters.includes(clusterName);
    } catch {
      // kind get clusters failed, cluster likely doesn't exist
    }

    if (clusterExists) {
      logger.success(`✓ Kind cluster '${clusterName}' already exists`);

      // Verify context is available
      if (contextExists(env.kubeContext)) {
        logger.success(`✓ Kubernetes context '${env.kubeContext}' is available`);
      } else {
        logger.warn(`⚠ Context '${env.kubeContext}' not found, creating...`);
        // Kind should have created it, but let's check
      }
    } else {
      logger.info(`Creating kind cluster '${clusterName}'...`);

      // Get kind config file
      const kindConfigPath = resolveMonorepoPath(`.dx/${env.kindCluster.config || "kind-config.yaml"}`);

      if (!fs.existsSync(kindConfigPath)) {
        logger.warn(
          `Kind config not found at ${kindConfigPath}.\n` +
          `Creating cluster with default configuration...`
        );
        // Create cluster without config file
        try {
          execSync(`kind create cluster --name ${clusterName}`, {
            stdio: "inherit",
          });
        } catch (err) {
          throw new Error(`Failed to create kind cluster: ${(err as Error).message}`);
        }
      } else {
        try {
          execSync(`kind create cluster --name ${clusterName} --config ${kindConfigPath}`, {
            stdio: "inherit",
          });
        } catch (err) {
          throw new Error(`Failed to create kind cluster: ${(err as Error).message}`);
        }
      }

      logger.success(`✓ Kind cluster '${clusterName}' created`);
    }

    console.log();

    // Verify context is reachable
    if (!isClusterReachable(env.kubeContext)) {
      logger.error(`Cluster context '${env.kubeContext}' is not reachable`);
      process.exit(1);
    }
    logger.success(`✓ Cluster is reachable`);

    // Create namespace
    logger.info(`Creating namespace '${env.namespace}'...`);
    try {
      ensureNamespaceExists(env.namespace, env.kubeContext, {
        "kind": "local",
        "purpose": "development",
      });
    } catch (err) {
      // If namespace already exists, that's OK
      if ((err as Error).message.includes("already exists")) {
        logger.success(`✓ Namespace '${env.namespace}' already exists`);
      } else {
        throw err;
      }
    }

    console.log();

    // Optional: Setup ingress controller
    logger.info("Setting up ingress controller...");
    try {
      // Check if nginx-ingress is already installed
      const output = kubectl(["get", "ns", "-o", "name"], {
        context: env.kubeContext,
      });

      if (!output.includes("ingress-nginx")) {
        logger.info("Installing ingress-nginx...");
        execSync(
          `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/kind/deploy.yaml`,
          {
            stdio: "inherit",
            env: {
              ...process.env,
              KUBECONFIG: process.env.KUBECONFIG,
            },
          }
        );
        logger.success("✓ ingress-nginx installed");

        // Wait for ingress to be ready
        logger.info("Waiting for ingress controller to be ready...");
        try {
          execSync(
            `kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s`,
            { stdio: "ignore" }
          );
          logger.success("✓ Ingress controller is ready");
        } catch {
          logger.warn("⚠ Ingress controller readiness check timed out");
        }
      } else {
        logger.success("✓ ingress-nginx already installed");
      }
    } catch (err) {
      logger.warn(
        `⚠ Failed to setup ingress: ${(err as Error).message}\n` +
        `You can install it manually or use port-forward for local development.`
      );
    }

    console.log();

    // Summary
    logger.success("✓ Local cluster initialization complete!\n");

    console.log(chalk.bold("Next steps:"));
    console.log(`  1. Deploy a service:`);
    console.log(`     ${chalk.cyan("dx deploy account-api")}`);
    console.log(`\n  2. Check service status:`);
    console.log(`     ${chalk.cyan("dx logs account-api -f")}`);
    console.log(`\n  3. Access services:`);
    console.log(`     ${chalk.cyan("dx open account-api")}`);
    console.log();
  } catch (err) {
    logger.error(`Failed to initialize local cluster: ${(err as Error).message}`);
    process.exit(1);
  }
}

/**
 * Create the k8s subcommand
 */
export const k8sCommand = new Command()
  .name("k8s")
  .description("Manage Kubernetes cluster infrastructure")
  .addCommand(
    new Command()
      .name("init-local")
      .description(
        "Bootstrap and configure a local kind-based Kubernetes cluster for development"
      )
      .action(handleInitLocal)
  );
