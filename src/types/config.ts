/**
 * Configuration options and defaults for json-analyst traversal and formatters.
 */

export type OutputFormat = 'ascii' | 'mermaid' | 'dot' | 'html';

export interface AnalystConfig {
  /** Maximum traversal depth. Defaults to Infinity (unlimited). */
  maxDepth?: number;
  /** Max items to sample from large arrays when collapsed. Defaults to 5. */
  maxArraySample?: number;
  /** Target output format. Defaults to 'ascii'. */
  format?: OutputFormat;
  /** Whether to show JSON type labels. Defaults to true. */
  showTypes?: boolean;
  /** Whether to show child count badges ({n}, [n]). Defaults to true. */
  showCounts?: boolean;
  /** Whether to sample large arrays instead of listing every element. Defaults to true. */
  collapseArrays?: boolean;
  /** Whether to infer and display merged array schema archetypes. Defaults to true. */
  archetype?: boolean;
  /** Whether to use ANSI/HTML colors in outputs that support it. Defaults to true. */
  colors?: boolean;
  /** Whether to print structural metrics (depth, nodes, size). Defaults to false. */
  showMetrics?: boolean;
  /** Whether to highlight anomalies (mixed types, missing keys, cycles). Defaults to true. */
  showAnomalies?: boolean;
  /** Title for HTML viewer or diagram headers. Defaults to 'JSON Analyst'. */
  title?: string;
}

export const defaultConfig: Required<AnalystConfig> = {
  maxDepth: Infinity,
  maxArraySample: 5,
  format: 'ascii',
  showTypes: true,
  showCounts: true,
  collapseArrays: true,
  archetype: true,
  colors: true,
  showMetrics: false,
  showAnomalies: true,
  title: 'JSON Analyst',
};

/**
 * Merge user-supplied config with defaults and normalize constraints.
 */
export function resolveConfig(config?: AnalystConfig): Required<AnalystConfig> {
  const merged: Required<AnalystConfig> = { ...defaultConfig, ...config };
  if (merged.collapseArrays === false) {
    merged.maxArraySample = Infinity;
  }
  return merged;
}