/**
 * Structural AST definitions and analysis types for json-xray.
 */

export type JsonPrimitiveType = 'string' | 'number' | 'boolean' | 'null';
export type JsonNodeType = 'object' | 'array' | JsonPrimitiveType;

export type AnomalyType =
  | 'mixed_array_types'
  | 'divergent_keys'
  | 'circular_reference'
  | 'empty_container';

export interface XrayAnomaly {
  type: AnomalyType;
  path: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ArchetypeProperty {
  key: string;
  types: JsonNodeType[];
  optional: boolean;
  frequency: number; // 0 to 1 ratio of appearance in the array items
}

export interface XrayArchetype {
  sampleCount: number;
  totalCount: number;
  properties: Record<string, ArchetypeProperty>;
  uniformKeys: boolean;
}

export interface XrayMetrics {
  totalNodes: number;
  maxDepth: number;
  leafCount: number;
  containerCount: number;
  avgBranchingFactor: number;
  estimatedBytes: number;
  primitiveRatio: number;
}

export interface XrayNodeBase {
  type: JsonNodeType;
  /** Property key, array index, or null for root */
  key: string | number | null;
  /** JSONPath locator string, e.g. "$.users[3].name" */
  path: string;
  /** Distance from the root node (root = 0) */
  depth: number;
  /** True if cut off by maxDepth */
  truncatedAtDepth?: boolean;
  /** True if this node points back to an ancestor creating a cycle */
  isCircular?: boolean;
  /** The path to the circular target ancestor if isCircular is true */
  circularTarget?: string;
  /** Anomalies identified at or within this node */
  anomalies?: XrayAnomaly[];
}

export interface XrayObjectNode extends XrayNodeBase {
  type: 'object';
  children: XrayNode[];
  /** Total number of keys on the original object */
  keyCount: number;
}

export interface XrayArrayNode extends XrayNodeBase {
  type: 'array';
  children: XrayNode[];
  /** Total length of the original array */
  length: number;
  /** True if children represent a sample rather than all elements */
  sampled: boolean;
  /** 'mixed' if element types differ, otherwise the uniform type */
  itemType?: JsonNodeType | 'mixed';
  /** Inferred schema archetype if array elements are objects/records */
  archetype?: XrayArchetype;
}

export interface XrayPrimitiveNode extends XrayNodeBase {
  type: JsonPrimitiveType;
  value: string | number | boolean | null;
}

export type XrayNode = XrayObjectNode | XrayArrayNode | XrayPrimitiveNode;

export interface XrayTree {
  root: XrayNode;
  /** Visited node count */
  totalNodes: number;
  /** Deepest depth reached during traversal */
  maxDepthReached: number;
  /** True if any part of tree was truncated (depth limit or array sampling) */
  truncated: boolean;
  /** Aggregated structural metrics */
  metrics: XrayMetrics;
  /** All anomalies detected across the tree */
  anomalies: XrayAnomaly[];
}