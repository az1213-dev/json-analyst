'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { detectType, detectItemType, isUniformObjectArray } = require('../src/engine/detector');
const { inferArchetype } = require('../src/engine/archetype');
const { computeMetrics } = require('../src/engine/metrics');
const { buildTree, resolveConfig } = require('../src/engine/traverser');
const { renderAscii } = require('../src/formatters/ascii');
const { renderMermaid } = require('../src/formatters/mermaid');
const { renderDot } = require('../src/formatters/dot');
const { renderHtml } = require('../src/formatters/html');

test('engine/detector: correctly classifies all JSON types', () => {
  assert.equal(detectType('hello'), 'string');
  assert.equal(detectType(123), 'number');
  assert.equal(detectType(true), 'boolean');
  assert.equal(detectType(null), 'null');
  assert.equal(detectType([]), 'array');
  assert.equal(detectType({}), 'object');
  assert.equal(detectType(undefined), 'null'); // Safe fallback
});

test('engine/detector: detects uniform vs mixed array types', () => {
  assert.equal(detectItemType([1, 2, 3]), 'number');
  assert.equal(detectItemType(['a', 'b']), 'string');
  assert.equal(detectItemType([1, 'a']), 'mixed');
  assert.equal(detectItemType([]), undefined);

  assert.equal(isUniformObjectArray([{ a: 1 }, { a: 2 }]), true);
  assert.equal(isUniformObjectArray([{ a: 1 }, { b: 2 }]), false);
});

test('engine/archetype: infers schema properties and coverage', () => {
  const users = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob' },
  ];

  const archetype = inferArchetype(users);
  assert.ok(archetype);
  assert.equal(archetype.totalCount, 2);
  assert.equal(archetype.uniformKeys, false);

  assert.equal(archetype.properties.id.optional, false);
  assert.equal(archetype.properties.id.frequency, 1.0);
  assert.deepEqual(archetype.properties.id.types, ['number']);

  assert.equal(archetype.properties.role.optional, true);
  assert.equal(archetype.properties.role.frequency, 0.5);
  assert.deepEqual(archetype.properties.role.types, ['string']);
});

test('engine/traverser: builds AST from basic JSON with correct depth', () => {
  const data = {
    user: {
      name: 'Alice',
      roles: ['admin', 'editor'],
    },
  };

  const config = resolveConfig();
  const tree = buildTree(data, config);

  assert.equal(tree.root.type, 'object');
  assert.equal(tree.maxDepthReached, 3); // $ -> user -> roles -> [0]
  assert.equal(tree.totalNodes > 0, true);
  assert.equal(tree.truncated, false);
});

test('engine/traverser: safely detects circular references without recursion crash', () => {
  /** @type {any} */
  const circularObj = { name: 'cycleRoot' };
  circularObj.self = circularObj;

  const config = resolveConfig();
  const tree = buildTree(circularObj, config);

  assert.equal(tree.root.type, 'object');
  const selfChild = tree.root.children.find((c) => c.key === 'self');
  assert.ok(selfChild);
  assert.equal(selfChild.isCircular, true);
  assert.equal(selfChild.circularTarget, '$');
  assert.ok(tree.anomalies.some((a) => a.type === 'circular_reference'));
});

test('engine/metrics: computes structural metrics and branching factor', () => {
  const data = {
    a: 1,
    b: 2,
    nested: { c: 3, d: 4 },
  };

  const config = resolveConfig();
  const tree = buildTree(data, config);

  assert.ok(tree.metrics);
  assert.equal(tree.metrics.containerCount, 2); // root + nested
  assert.equal(tree.metrics.leafCount, 4); // a, b, c, d
  assert.equal(tree.metrics.maxDepth, 2);
  assert.ok(tree.metrics.avgBranchingFactor > 0);
  assert.ok(tree.metrics.estimatedBytes > 0);
});

test('formatters/ascii: renders tree structure, archetypes, and metrics', () => {
  const data = {
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
  };

  const config = resolveConfig({ showMetrics: true, archetype: true });
  const tree = buildTree(data, config);
  const output = renderAscii(tree, config);

  assert.ok(output.includes('root (object)'));
  assert.ok(output.includes('items (array)'));
  assert.ok(output.includes('~archetype:'));
  assert.ok(output.includes('─── Metrics ───'));
});

test('formatters/mermaid: renders valid graph TD flowchart with node classes', () => {
  const data = { count: 10, list: ['a', 'b'] };
  const config = resolveConfig({ colors: true });
  const tree = buildTree(data, config);
  const output = renderMermaid(tree, config);

  assert.ok(output.startsWith('graph TD'));
  assert.ok(output.includes('classDef xray-object'));
  assert.ok(output.includes('classDef xray-array'));
  assert.ok(output.includes('-->'));
});

test('formatters/dot: renders Graphviz digraph with colors and styling', () => {
  const data = { id: 123, status: 'active' };
  const config = resolveConfig({ colors: true });
  const tree = buildTree(data, config);
  const output = renderDot(tree, config);

  assert.ok(output.startsWith('digraph JsonXray {'));
  assert.ok(output.includes('rankdir=LR;'));
  assert.ok(output.includes('fillcolor='));
  assert.ok(output.endsWith('}'));
});

test('formatters/html: renders self-contained interactive viewer with lineage breadcrumbs', () => {
  const data = { users: [{ id: 1, name: 'Alice' }] };
  const config = resolveConfig({ title: 'Test Viewer' });
  const tree = buildTree(data, config);
  const output = renderHtml(tree, config);

  assert.ok(output.includes('<!DOCTYPE html>'));
  assert.ok(output.includes('Test Viewer'));
  assert.ok(output.includes('id="xray-tree-data"'));
  assert.ok(output.includes('Family Tree (Lineage & Relations)'));
  assert.ok(output.includes('Node Inspector'));
});

test('sdk: programmatic API wraps engine and all formatters', () => {
  const { buildTree } = require('../src/engine/traverser');
  const { renderAscii } = require('../src/formatters/ascii');
  const { renderMermaid } = require('../src/formatters/mermaid');
  const { renderDot } = require('../src/formatters/dot');
  const { renderHtml } = require('../src/formatters/html');

  const data = { app: 'json-xray', version: 1 };
  const tree = buildTree(data);

  assert.ok(renderAscii(tree, { showTypes: true, showCounts: true }));
  assert.ok(renderMermaid(tree, { colors: true }));
  assert.ok(renderDot(tree, { colors: true }));
  assert.ok(renderHtml(tree, { title: 'Test App' }));
});
