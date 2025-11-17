import { Command } from 'commander';
import { ServiceGraph } from '../core/service-graph';

const program = new Command();

program
  .command('deps <service>')
  .description('Show dependencies of a service')
  .option('--reverse', 'Show services that depend on the given service')
  .option('--format <format>', 'Output format: tree, json, dot', 'tree')
  .action((service, options) => {
    const graph = new ServiceGraph();

    // Load the graph (this should be replaced with actual manifest loading logic)
    // Example:
    graph.addServiceNode({ name: 'booking-api', dependencies: ['account-api', 'payment-api'] });
    graph.addServiceNode({ name: 'account-api', dependencies: ['iam-auth-api'] });
    graph.addServiceNode({ name: 'payment-api', dependencies: [] });
    graph.addServiceNode({ name: 'iam-auth-api', dependencies: [] });

    if (options.reverse) {
      const dependents = graph.getDependents(service);
      if (options.format === 'json') {
        console.log(JSON.stringify(dependents, null, 2));
      } else if (options.format === 'dot') {
        console.log(`digraph G {\n  ${dependents.map(dep => `"${dep}" -> "${service}";`).join('\n')}\n}`);
      } else {
        console.log(`${service} is depended on by:`);
        dependents.forEach(dep => console.log(`- ${dep}`));
      }
    } else {
      const dependencies = graph.getTransitiveDependencies(service);
      if (options.format === 'json') {
        console.log(JSON.stringify(dependencies, null, 2));
      } else if (options.format === 'dot') {
        console.log(`digraph G {\n  ${dependencies.map(dep => `"${service}" -> "${dep}";`).join('\n')}\n}`);
      } else {
        console.log(`${service} depends on:`);
        dependencies.forEach(dep => console.log(`- ${dep}`));
      }
    }
  });

export default program;