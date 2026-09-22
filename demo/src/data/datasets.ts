import type { RawNodeDatum } from 'react-d3-tree';
import type { DatasetId } from '../state/playground.js';
import flare from './flare.json';
import orgChart from './org-chart.json';
import reactRepo from './react-repo.json';

export interface Dataset {
  id: DatasetId;
  label: string;
  /** Identifier the JSX snippet uses for the `data` prop. */
  identifier: string;
  data: RawNodeDatum;
  nodeCount: number;
}

export function countNodes(node: RawNodeDatum): number {
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countNodes(child), 0);
}

const dataset = (
  id: DatasetId,
  label: string,
  identifier: string,
  data: RawNodeDatum
): Dataset => ({ id, label, identifier, data, nodeCount: countNodes(data) });

export const builtInDatasets: Dataset[] = [
  dataset('org-chart', 'Org chart', 'orgChart', orgChart),
  dataset('flare', 'flare.json from d3-hierarchy', 'flare', flare),
  dataset('react-repo', 'React repository', 'reactRepo', reactRepo),
];

export type ParseResult = { ok: true; dataset: Dataset } | { ok: false; error: string };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function validateNode(value: unknown, path: string): string | null {
  if (!isRecord(value)) return `${path} must be an object`;
  if (typeof value.name !== 'string') return `${path}.name must be a string`;
  if (value.attributes !== undefined) {
    if (!isRecord(value.attributes)) return `${path}.attributes must be an object`;
    for (const [key, attr] of Object.entries(value.attributes)) {
      if (!['string', 'number', 'boolean'].includes(typeof attr)) {
        return `${path}.attributes.${key} must be a string, number, or boolean`;
      }
    }
  }
  if (value.children !== undefined) {
    if (!Array.isArray(value.children)) return `${path}.children must be an array`;
    for (const [i, child] of value.children.entries()) {
      const problem = validateNode(child, `${path}.children[${i}]`);
      if (problem) return problem;
    }
  }
  return null;
}

/**
 * Parses pasted JSON into a dataset. Accepts a root node object or an array holding one, the two
 * shapes `Tree` takes for `data`.
 */
export function parseDatasetJson(text: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: `Not valid JSON: ${(error as SyntaxError).message}` };
  }
  let root = parsed;
  if (Array.isArray(parsed)) {
    if (parsed.length !== 1) {
      return {
        ok: false,
        error: `An array must hold exactly one root node, found ${parsed.length}`,
      };
    }
    root = parsed[0];
  }
  const problem = validateNode(root, 'root');
  if (problem) return { ok: false, error: problem };
  return {
    ok: true,
    dataset: dataset('custom', 'Pasted JSON', 'customData', root as RawNodeDatum),
  };
}
