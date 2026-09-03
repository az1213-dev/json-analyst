import { resolveConfig } from './types/config';
import type { XrayConfig, OutputFormat } from './types/config';
import type { XrayTree } from './types/ast';
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

export interface XrayResult {
  /** The structural AST built from the input value */
  tree: XrayTree;
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
 * import { xray } from 'json-xray';
 * const { output } = xray({ users: [{ id: 1 }, { id: 2 }] }, { format: 'ascii' });
 * console.log(output);
 * ```
 */
export function xray(data: unknown, options?: XrayConfig): XrayResult {
  const config = resolveConfig(options);
  const tree: XrayTree = buildTree(data, config);
  const renderer = renderers[config.format.toLowerCase()];

  if (!renderer) {
    throw new Error(
      `json-xray: unknown format "${config.format}". Available formats: ${Object.keys(renderers).join(', ')}`
    );
  }

  const output = renderer(tree, config);
  return { tree, output, format: config.format };
}

/** Convenience wrapper for ASCII rendering */
export function xrayAscii(data: unknown, options?: Omit<XrayConfig, 'format'>): string {
  return xray(data, { ...options, format: 'ascii' }).output;
}

/** Convenience wrapper for Mermaid flowchart rendering */
export function xrayMermaid(data: unknown, options?: Omit<XrayConfig, 'format'>): string {
  return xray(data, { ...options, format: 'mermaid' }).output;
}

/** Convenience wrapper for Graphviz DOT rendering */
export function xrayDot(data: unknown, options?: Omit<XrayConfig, 'format'>): string {
  return xray(data, { ...options, format: 'dot' }).output;
}

/** Convenience wrapper for interactive HTML rendering */
export function xrayHtml(data: unknown, options?: Omit<XrayConfig, 'format'>): string {
  return xray(data, { ...options, format: 'html' }).output;
}

export default xray;