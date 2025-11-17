import { ServiceGraph } from '../src/core/service-graph';

describe('ServiceGraph', () => {
  let graph: ServiceGraph;

  beforeEach(() => {
    graph = new ServiceGraph();
    graph.addServiceNode({ name: 'A', dependencies: ['B'] });
    graph.addServiceNode({ name: 'B', dependencies: ['C'] });
    graph.addServiceNode({ name: 'C', dependencies: [] });
  });

  it('should get direct dependencies', () => {
    expect(graph.getDependencies('A')).toEqual(['B']);
  });

  it('should get transitive dependencies', () => {
    expect(graph.getTransitiveDependencies('A')).toEqual(['B', 'C']);
  });

  it('should get dependents', () => {
    expect(graph.getDependents('B')).toEqual(['A']);
    expect(graph.getDependents('C')).toEqual(['B']);
  });

  it('should validate graph with no cycles', () => {
    expect(() => graph.validateGraph()).not.toThrow();
  });

  it('should detect cycles', () => {
    graph.addServiceNode({ name: 'D', dependencies: ['A'] });
    graph.addServiceNode({ name: 'C', dependencies: ['D'] });
    expect(() => graph.validateGraph()).toThrow('Cycle detected involving service A.');
  });

  it('should throw error for unknown dependencies', () => {
    graph.addServiceNode({ name: 'E', dependencies: ['UnknownService'] });
    expect(() => graph.validateGraph()).toThrow('Service E depends on unknown service UnknownService.');
  });
});