import type { XrayTree } from './ast';
import type { XrayConfig } from './config';

/**
 * Standard formatter contract: converts an XrayTree into a formatted output string.
 */
export type FormatterFn = (tree: XrayTree, config: Required<XrayConfig>) => string;

export interface FormatterRegistry {
  [formatName: string]: FormatterFn;
}

/** Built-in formatters shipped with json-xray */
export const BUILTIN_FORMATS = ['ascii', 'mermaid', 'dot', 'html'] as const;
export type BuiltinFormat = (typeof BUILTIN_FORMATS)[number];