/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
