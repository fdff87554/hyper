/* eslint-disable eslint-comments/disable-enable-pair */

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

test('lsRemote() rejects on non-ok response', async (t) => {
  const {lsRemote} = proxyquire('../../cli/api', {
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => Promise.resolve({ok: false, status: 429})) as any;

  try {
    await t.throwsAsync(() => lsRemote(), {
      message: /429/
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('lsRemote() rejects when results field is missing', async (t) => {
  const {lsRemote} = proxyquire('../../cli/api', {
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({message: 'no results here'})
    });
  }) as any;

  try {
    await t.throwsAsync(() => lsRemote(), {
      message: /unexpected response/
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('lsRemote() returns plugin list on success', async (t) => {
  const {lsRemote} = proxyquire('../../cli/api', {
    'registry-url': () => 'https://registry.npmjs.org/'
  });

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() => {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {package: {name: 'hyper-awesome', description: 'An awesome plugin'}},
            {package: {name: 'hyper-theme', description: 'A theme'}}
          ]
        })
    });
  }) as any;

  try {
    const result = await lsRemote();
    t.deepEqual(result, [
      {name: 'hyper-awesome', description: 'An awesome plugin'},
      {name: 'hyper-theme', description: 'A theme'}
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
