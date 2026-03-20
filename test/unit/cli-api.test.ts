/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import test from 'ava';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const proxyquire = require('proxyquire').noCallThru();

test('existsOnNpm() builds the url for non-scoped packages', async (t) => {
  let fetchUrl: string;
  const {existsOnNpm} = proxyquire('../../cli/api', {
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  // Mock global fetch
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: string) => {
    fetchUrl = url;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({versions: {}})
    });
  }) as any;

  try {
    await existsOnNpm('pkg');
    t.is(fetchUrl!, 'https://registry.npmjs.org/pkg');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('existsOnNpm() builds the url for scoped packages', async (t) => {
  let fetchUrl: string;
  const {existsOnNpm} = proxyquire('../../cli/api', {
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((url: string) => {
    fetchUrl = url;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({versions: {}})
    });
  }) as any;

  try {
    await existsOnNpm('@scope/pkg');
    t.is(fetchUrl!, 'https://registry.npmjs.org/@scope%2fpkg');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('existsOnNpm() rejects on 404 response', async (t) => {
  const {existsOnNpm} = proxyquire('../../cli/api', {
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => Promise.resolve({ok: false, status: 404})) as any;

  try {
    await t.throwsAsync(() => existsOnNpm('nonexistent-pkg'), {
      message: /nonexistent-pkg not found on npm/
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('existsOnNpm() rejects when versions field is missing', async (t) => {
  const {existsOnNpm} = proxyquire('../../cli/api', {
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({error: 'Not found'})
    });
  }) as any;

  try {
    await t.throwsAsync(() => existsOnNpm('bad-pkg'), {
      message: /bad-pkg not found on npm/
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
