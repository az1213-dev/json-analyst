import type { AnalystTree } from './ast';
import type { AnalystConfig } from './config';

/**
 * Standard formatter contract: converts an AnalystTree into a formatted output string.
 */
export type FormatterFn = (tree: AnalystTree, config: Required<AnalystConfig>) => string;

export interface FormatterRegistry {
  [formatName: string]: FormatterFn;
}

/** Built-in formatters shipped with json-analyst */
export const BUILTIN_FORMATS = ['ascii', 'mermaid', 'dot', 'html'] as const;
export type BuiltinFormat = (typeof BUILTIN_FORMATS)[number];