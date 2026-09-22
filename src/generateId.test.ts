import { afterEach, describe, expect, it, vi } from 'vitest';

import generateId from './generateId.js';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type GetRandomValues = (bytes: Uint8Array) => Uint8Array;

// The tests swap `crypto` for partial fakes; the cast keeps the assignments terse.
const setCrypto = (value: unknown) => {
  globalThis.crypto = value as Crypto;
};

const removeCrypto = () => {
  Reflect.deleteProperty(globalThis, 'crypto');
};

describe('generateId', () => {
  const originalCrypto = globalThis.crypto;

  // jsdom defines `crypto` as a getter-only property; make it assignable for the tests below.
  Object.defineProperty(globalThis, 'crypto', {
    value: originalCrypto,
    writable: true,
    configurable: true,
  });

  afterEach(() => {
    if (originalCrypto === undefined) {
      removeCrypto();
    } else {
      setCrypto(originalCrypto);
    }
    vi.restoreAllMocks();
  });

  describe('when `crypto.randomUUID` is available', () => {
    it('returns the native UUID', () => {
      const randomUUID = vi.fn<() => string>(() => '3b241101-e2bb-4255-8caf-4136c566a962');
      const getRandomValues = vi.fn<GetRandomValues>();
      setCrypto({ randomUUID, getRandomValues });

      expect(generateId()).toBe('3b241101-e2bb-4255-8caf-4136c566a962');
      expect(randomUUID).toHaveBeenCalledTimes(1);
      expect(getRandomValues).not.toHaveBeenCalled();
    });

    it('calls `randomUUID` with `crypto` as the receiver', () => {
      setCrypto({
        randomUUID() {
          return this === globalThis.crypto ? '3b241101-e2bb-4255-8caf-4136c566a962' : 'unbound';
        },
      });

      expect(generateId()).toBe('3b241101-e2bb-4255-8caf-4136c566a962');
    });
  });

  describe('when only `crypto.getRandomValues` is available', () => {
    it('formats the random bytes as a v4 UUID', () => {
      const getRandomValues = vi.fn<GetRandomValues>(bytes => {
        bytes.forEach((_, i) => {
          bytes[i] = i * 17; // 0x00, 0x11, ... 0xff
        });
        return bytes;
      });
      setCrypto({ getRandomValues });

      // Bytes 6 (0x66) and 8 (0x88) carry the version and variant bits.
      expect(generateId()).toBe('00112233-4455-4677-8899-aabbccddeeff');
      expect(getRandomValues).toHaveBeenCalledTimes(1);
    });

    it('sets the version and variant bits regardless of the random bytes', () => {
      setCrypto({ getRandomValues: (bytes: Uint8Array) => bytes.fill(0xff) });
      expect(generateId()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');

      setCrypto({ getRandomValues: (bytes: Uint8Array) => bytes.fill(0x00) });
      expect(generateId()).toBe('00000000-0000-4000-8000-000000000000');
    });

    it('calls `getRandomValues` with `crypto` as the receiver', () => {
      setCrypto({
        getRandomValues(bytes: Uint8Array) {
          if (this !== globalThis.crypto) {
            throw new TypeError('Illegal invocation');
          }
          return bytes;
        },
      });

      expect(generateId()).toMatch(UUID_V4);
    });
  });

  describe('when `crypto` is unavailable', () => {
    it('falls back to `Math.random` if `crypto` is undefined', () => {
      removeCrypto();
      const random = vi.spyOn(Math, 'random');

      expect(generateId()).toMatch(UUID_V4);
      expect(random).toHaveBeenCalledTimes(16);
    });

    it('falls back to `Math.random` if `crypto` has no usable methods', () => {
      setCrypto({});
      const random = vi.spyOn(Math, 'random');

      expect(generateId()).toMatch(UUID_V4);
      expect(random).toHaveBeenCalledTimes(16);
    });

    it('pads single-digit hex bytes and stays within byte range', () => {
      removeCrypto();
      const random = vi.spyOn(Math, 'random');

      random.mockReturnValue(0);
      expect(generateId()).toBe('00000000-0000-4000-8000-000000000000');

      random.mockReturnValue(0.999999999);
      expect(generateId()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
    });

    it('generates unique IDs', () => {
      removeCrypto();
      const ids = new Set(Array.from({ length: 1000 }, () => generateId()));

      expect(ids.size).toBe(1000);
    });
  });
});
