import generateId from './generateId.ts';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateId', () => {
  const originalCrypto = global.crypto;

  afterEach(() => {
    if (originalCrypto === undefined) {
      delete global.crypto;
    } else {
      global.crypto = originalCrypto;
    }
    jest.restoreAllMocks();
  });

  describe('when `crypto.randomUUID` is available', () => {
    it('returns the native UUID', () => {
      const randomUUID = jest.fn(() => '3b241101-e2bb-4255-8caf-4136c566a962');
      global.crypto = { randomUUID, getRandomValues: jest.fn() };

      expect(generateId()).toBe('3b241101-e2bb-4255-8caf-4136c566a962');
      expect(randomUUID).toHaveBeenCalledTimes(1);
      expect(global.crypto.getRandomValues).not.toHaveBeenCalled();
    });

    it('calls `randomUUID` with `crypto` as the receiver', () => {
      global.crypto = {
        randomUUID() {
          return this === global.crypto ? '3b241101-e2bb-4255-8caf-4136c566a962' : 'unbound';
        },
      };

      expect(generateId()).toBe('3b241101-e2bb-4255-8caf-4136c566a962');
    });
  });

  describe('when only `crypto.getRandomValues` is available', () => {
    it('formats the random bytes as a v4 UUID', () => {
      global.crypto = {
        getRandomValues: jest.fn(bytes => {
          bytes.forEach((_, i) => {
            bytes[i] = i * 17; // 0x00, 0x11, ... 0xff
          });
          return bytes;
        }),
      };

      // Bytes 6 (0x66) and 8 (0x88) carry the version and variant bits.
      expect(generateId()).toBe('00112233-4455-4677-8899-aabbccddeeff');
      expect(global.crypto.getRandomValues).toHaveBeenCalledTimes(1);
    });

    it('sets the version and variant bits regardless of the random bytes', () => {
      global.crypto = { getRandomValues: bytes => bytes.fill(0xff) };
      expect(generateId()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');

      global.crypto = { getRandomValues: bytes => bytes.fill(0x00) };
      expect(generateId()).toBe('00000000-0000-4000-8000-000000000000');
    });

    it('calls `getRandomValues` with `crypto` as the receiver', () => {
      global.crypto = {
        getRandomValues(bytes) {
          if (this !== global.crypto) {
            throw new TypeError('Illegal invocation');
          }
          return bytes;
        },
      };

      expect(generateId()).toMatch(UUID_V4);
    });
  });

  describe('when `crypto` is unavailable', () => {
    it('falls back to `Math.random` if `crypto` is undefined', () => {
      delete global.crypto;
      const random = jest.spyOn(Math, 'random');

      expect(generateId()).toMatch(UUID_V4);
      expect(random).toHaveBeenCalledTimes(16);
    });

    it('falls back to `Math.random` if `crypto` has no usable methods', () => {
      global.crypto = {};
      const random = jest.spyOn(Math, 'random');

      expect(generateId()).toMatch(UUID_V4);
      expect(random).toHaveBeenCalledTimes(16);
    });

    it('pads single-digit hex bytes and stays within byte range', () => {
      delete global.crypto;

      // The last four bytes also carry the uniqueness counter, so only the first twelve are exact.
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const zeros = generateId();
      expect(zeros.slice(0, 28)).toBe('00000000-0000-4000-8000-0000');
      expect(zeros).toMatch(UUID_V4);

      Math.random.mockReturnValue(0.999999999);
      const ones = generateId();
      expect(ones.slice(0, 28)).toBe('ffffffff-ffff-4fff-bfff-ffff');
      expect(ones).toMatch(UUID_V4);
    });

    it('generates unique IDs', () => {
      delete global.crypto;
      const ids = new Set(Array.from({ length: 1000 }, () => generateId()));

      expect(ids.size).toBe(1000);
    });

    it('generates unique IDs when `Math.random` is stubbed to a constant', () => {
      delete global.crypto;
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const ids = Array.from({ length: 1000 }, () => generateId());

      ids.forEach(id => expect(id).toMatch(UUID_V4));
      expect(new Set(ids).size).toBe(1000);
    });
  });
});
