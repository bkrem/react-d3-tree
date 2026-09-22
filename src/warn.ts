// `process` exists in Node and in bundled browser builds that define it; plain browser ESM has
// none. The declaration keeps the build free of Node types.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

const warned = new Set<string>();

/** Logs `message` once per message in development; production builds stay silent. */
export function warnOnce(message: string): void {
  if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production') return;
  if (warned.has(message)) return;
  warned.add(message);
  // oxlint-disable-next-line no-console
  console.warn(`react-d3-tree: ${message}`);
}
