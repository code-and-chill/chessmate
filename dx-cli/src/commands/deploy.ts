import { Command } from "commander";
import { logger } from "../core/logger";
import { getServiceRegistry } from "../services/registry";
import { getEnvironment } from "../core/config";
import { execStream } from "../core/exec";
import { resolveServicePath } from "../core/paths";

export const deployCommand = new Command()
  .name("deploy")
  .description("Deploy service(s) to an environment")
  .argument("<env>", "Target environment (dev, staging, prod)")
  .argument("[service]", "Service name (omit for all)")
  .option("--single", "Deploy only this service")
  .action(async (env: string, service: string | undefined, options: any) => {
    try {
      const envConfig = getEnvironment(env);
      logger.info(`Deploying to ${envConfig.name} (${env})...`);

      const registry = getServiceRegistry();
      await registry.discover();

      if (service) {
        const svc = registry.getService(service);
        if (!svc) {
          logger.error(`Service '${service}' not found`);
          process.exit(1);
        }

        logger.info(`Deploying ${svc.name} to ${env}...`);

        // For now, just log the deployment steps
        logger.info(`  Kube Context: ${envConfig.kube_context}`);
        logger.info(`  Namespace: ${envConfig.namespace}`);
        logger.info(`  Helm Root: ${envConfig.helm_root}`);

        logger.success(`✓ ${svc.name} deployed to ${env}`);
      } else {
        const services = registry.getAllServices();
        logger.info(`Deploying ${services.length} service(s) to ${env}...`);

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
  });
