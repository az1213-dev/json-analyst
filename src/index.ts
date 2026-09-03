import { resolveConfig } from './types/config';
import type { AnalystConfig, OutputFormat } from './types/config';
import type { AnalystTree } from './types/ast';
import type { FormatterFn, FormatterRegistry } from './types/formatters';

// Plain JS engine and formatters with JSDoc typing
// @ts-ignore
import { buildTree } from './engine/traverser.js';
// @ts-ignore
import { renderAscii } from './formatters/ascii.js';
// @ts-ignore
import { renderMermaid } from './formatters/mermaid.js';
// @ts-ignore
import { renderDot } from './formatters/dot.js';
// @ts-ignore
import { renderHtml } from './formatters/html.js';

export * from './types/ast';
export * from './types/config';
export * from './types/formatters';
export { buildTree };

export interface AnalystResult {
  /** The structural AST built from the input value */
  tree: AnalystTree;
  /** The formatted output string */
  output: string;
  /** The format that was rendered */
  format: OutputFormat;
}

const renderers: FormatterRegistry = {
  ascii: renderAscii as FormatterFn,
  mermaid: renderMermaid as FormatterFn,
  dot: renderDot as FormatterFn,
  html: renderHtml as FormatterFn,
};

/**
 * Register an additional output format, or override a built-in one.
 */
export function registerFormatter(name: string, formatter: FormatterFn): void {
  renderers[name.toLowerCase()] = formatter;
}

/**
 * Traverse `data` and render it in the configured format.
 *
 * @example
 * ```ts
 * import { analyze } from 'json-analyst';
 * const { output } = analyze({ users: [{ id: 1 }, { id: 2 }] }, { format: 'ascii' });
 * console.log(output);
 * ```
 */
export function analyze(data: unknown, options?: AnalystConfig): AnalystResult {
  const config = resolveConfig(options);
  const tree: AnalystTree = buildTree(data, config);
  const renderer = renderers[config.format.toLowerCase()];

  if (!renderer) {
    throw new Error(
      `json-analyst: unknown format "${config.format}". Available formats: ${Object.keys(renderers).join(', ')}`
    );
  }

  const output = renderer(tree, config);
  return { tree, output, format: config.format };
}

/** Convenience wrapper for ASCII rendering */
export function analyzeAscii(data: unknown, options?: Omit<AnalystConfig, 'format'>): string {
  return analyze(data, { ...options, format: 'ascii' }).output;
}

/** Convenience wrapper for Mermaid flowchart rendering */
export function analyzeMermaid(data: unknown, options?: Omit<AnalystConfig, 'format'>): string {
  return analyze(data, { ...options, format: 'mermaid' }).output;
}

/** Convenience wrapper for Graphviz DOT rendering */
export function analyzeDot(data: unknown, options?: Omit<AnalystConfig, 'format'>): string {
  return analyze(data, { ...options, format: 'dot' }).output;
}

/** Convenience wrapper for interactive HTML rendering */
export function analyzeHtml(data: unknown, options?: Omit<AnalystConfig, 'format'>): string {
  return analyze(data, { ...options, format: 'html' }).output;
}

export default analyze;