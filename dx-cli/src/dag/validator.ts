import { DagValidator } from "./resolver";
import { ServiceRegistry } from "../services/registry";
import { logger } from "../core/logger";

/**
 * Validate service registry
 * Returns true if all validations pass
 */
export async function validateRegistry(registry: ServiceRegistry): Promise<boolean> {
  const services = registry.getAllServices();

  // Check for registry validation errors
  const registryErrors = registry.validate();
  if (registryErrors.size > 0) {
    logger.error("Registry validation failed:");
    for (const [service, errors] of registryErrors) {
      logger.error(`  ${service}:`);
      for (const error of errors) {
        logger.error(`    - ${error}`);
      }
    }
    return false;
  }

  // Check for DAG validation errors
  const validator = new DagValidator(services);
  const dagErrors = validator.validate();
  if (dagErrors.length > 0) {
    logger.error("DAG validation failed:");
    for (const error of dagErrors) {
      logger.error(`  - ${error}`);
    }
    return false;
  }

  logger.info("All validations passed");
  return true;
}

/**
 * Quick validation check
 */
export async function quickValidate(): Promise<boolean> {
  const registry = new ServiceRegistry();
  await registry.discover();
  return validateRegistry(registry);
}
