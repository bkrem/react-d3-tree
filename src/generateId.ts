// Generates an RFC 4122 v4 UUID for DOM references and node IDs.
//
// `crypto` is resolved on every call, so the helper works wherever it is loaded:
// - `crypto.randomUUID` exists in secure browser contexts only.
// - `crypto.getRandomValues` covers insecure (plain HTTP) browser contexts.
// - `Math.random` covers runtimes without a global `crypto` (e.g. Node 18, jsdom 11).
//   The IDs are not secrets, so non-cryptographic randomness is sufficient.

// Mixed into the `Math.random` bytes so IDs stay unique when a test suite stubs `Math.random`
// to a constant. XOR with a uniformly random byte leaves the distribution unchanged.
let fallbackCounter = 0;

export default function generateId(): string {
  const hasCrypto = typeof crypto !== 'undefined';

  if (hasCrypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (hasCrypto && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    fallbackCounter = (fallbackCounter + 1) >>> 0;
    bytes[12] ^= fallbackCounter >>> 24;
    bytes[13] ^= fallbackCounter >>> 16;
    bytes[14] ^= fallbackCounter >>> 8;
    bytes[15] ^= fallbackCounter;
  }

  // Version 4, variant 10xx (RFC 4122, section 4.4).
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  let id = '';
  for (let i = 0; i < bytes.length; i++) {
    if (i === 4 || i === 6 || i === 8 || i === 10) {
      id += '-';
    }
    id += (bytes[i] + 0x100).toString(16).slice(1);
  }
  return id;
}
