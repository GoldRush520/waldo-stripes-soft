import { describe, expect, it } from 'vitest';
import { debugParams, isLocalHost } from '../../src/dev/debugParams';

describe('isLocalHost', () => {
  it('recognises a developer machine', () => {
    for (const host of ['localhost', '127.0.0.1', '[::1]', '::1', 'app.localhost', 'LOCALHOST']) expect(isLocalHost(host)).toBe(true);
  });

  it('rejects every public or look-alike host', () => {
    for (const host of ['waldo.example.com', 'example.com', 'localhost.example.com', 'notlocalhost', '127.0.0.1.example.com', '192.168.1.20', '']) {
      expect(isLocalHost(host)).toBe(false);
    }
  });
});

describe('debugParams', () => {
  const search = '?dev&seed=abc&noStatics=1';

  it('passes the switches through on a developer machine', () => {
    const params = debugParams({ hostname: '127.0.0.1', search });
    expect(params.has('dev')).toBe(true);
    expect(params.get('seed')).toBe('abc');
    expect(params.get('noStatics')).toBe('1');
  });

  it('ignores every switch on a public host', () => {
    const params = debugParams({ hostname: 'waldo.example.com', search });
    expect([...params.keys()]).toEqual([]);
    expect(params.has('dev')).toBe(false);
    expect(params.get('seed')).toBeNull();
  });
});
