import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { buildTree, detectType, inferArchetype, computeMetrics } from '../assets/js/engine.js';
import { Icons, icon } from '../assets/js/icons.js';
import { SAMPLES } from '../assets/js/app.js';

test('web/icons: strictly zero emojis and valid SVG elements', () => {
  const emojiRegex = /\p{Extended_Pictographic}/u;

  for (const [name, svgHtml] of Object.entries(Icons)) {
    assert.ok(svgHtml.startsWith('<svg'), `Icon ${name} should start with <svg`);
    assert.ok(svgHtml.endsWith('</svg>'), `Icon ${name} should end with </svg>`);
    assert.equal(emojiRegex.test(svgHtml), false, `Icon ${name} must not contain any emojis!`);
  }

  const generated = icon('chart', 'test-class');
  assert.ok(generated.includes('class="test-class"'));
});

test('web/engine: builds AST, computes metrics, and detects cycles', () => {
  const sample = {
    app: "json-analyst",
    version: 1,
    active: true,
    tags: ["ast", "chart"],
    metadata: {
      clientSide: true
    }
  };

  const tree = buildTree(sample);
  assert.equal(tree.root.type, 'object');
  assert.equal(tree.totalNodes, 9);
  assert.equal(tree.maxDepthReached, 2);
  assert.ok(tree.metrics);
  assert.equal(tree.metrics.totalNodes, 9);
  assert.equal(tree.metrics.containerCount, 3);
  assert.equal(tree.metrics.leafCount, 6);

  // Cycle Safety
  const circularObj = { a: "start" };
  circularObj.self = circularObj;
  const cycleTree = buildTree(circularObj);
  assert.ok(cycleTree);
  assert.equal(cycleTree.anomalies.length, 1);
  assert.equal(cycleTree.anomalies[0].type, 'circular_reference');
});

test('web/engine: computes array schema archetype coverage', () => {
  const users = [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob" }
  ];

  const archetype = inferArchetype(users);
  assert.ok(archetype);
  assert.equal(archetype.totalCount, 2);
  assert.equal(archetype.properties.id.optional, false);
  assert.equal(archetype.properties.role.optional, true);
  assert.equal(archetype.properties.role.frequency, 0.5);
});

test('web/app: sample presets are all valid parseable JSON', () => {
  for (const [key, jsonString] of Object.entries(SAMPLES)) {
    assert.doesNotThrow(() => {
      const parsed = JSON.parse(jsonString);
      assert.ok(typeof parsed === 'object' && parsed !== null, `Preset ${key} must parse to an object`);
    }, `Preset ${key} must be valid JSON`);
  }
});

test('web/html: index.html references modular assets and contains required DOM IDs', () => {
  const htmlPath = path.resolve('index.html');
  assert.ok(fs.existsSync(htmlPath), 'index.html must exist at repository root');

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Modular assets check
  assert.ok(html.includes('href="assets/css/style.css"'), 'Must link assets/css/style.css');
  assert.ok(html.includes('src="assets/js/app.js"'), 'Must load assets/js/app.js as module');
  assert.ok(html.includes('type="module"'), 'Must load app.js as ES module');

  // Critical DOM elements check
  const requiredIds = [
    'json-code-input',
    'line-numbers-gutter',
    'btn-validate',
    'btn-format',
    'btn-compact',
    'btn-clear',
    'status-banner',
    'chart-canvas',
    'btn-export-png',
    'btn-export-svg',
    'tree-list',
    'tree-inspector',
    'preset-select'
  ];

  for (const id of requiredIds) {
    assert.ok(html.includes(`id="${id}"`), `index.html must contain element with id="${id}"`);
  }

  // Zero emojis check in index.html
  const emojiRegex = /\p{Extended_Pictographic}/u;
  assert.equal(emojiRegex.test(html), false, 'index.html must not contain any raw emojis!');
});
