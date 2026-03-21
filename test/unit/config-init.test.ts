/* eslint-disable eslint-comments/disable-enable-pair */

import test from 'ava';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const proxyquire = require('proxyquire').noCallThru();

const notifyStub = () => {};
const mapKeysStub = (keymaps: any) => keymaps;

const {_init, _extractDefault} = proxyquire('../../app/config/init', {
  '../notify': notifyStub,
  '../utils/map-keys': mapKeysStub
});

test('_extractDefault parses valid config', (t) => {
  const cfg = `module.exports = {
    config: {
      fontSize: 14
    }
  };`;

  const result = _extractDefault(cfg);
  t.is(result.config.fontSize, 14);
});

test('_extractDefault throws on missing module.exports', (t) => {
  const cfg = 'var x = 1;';
  t.throws(() => _extractDefault(cfg), {message: /module\.exports.*not set/});
});

test('_init provides defaults when config key is missing', (t) => {
  const defaultCfg = {
    config: {
      fontSize: 12,
      defaultProfile: 'default',
      profiles: [{name: 'default', config: {}}]
    },
    keymaps: {},
    plugins: [],
    localPlugins: []
  };

  const result = _init({}, defaultCfg);
  t.is(result.config.fontSize, 12);
});

test('_init merges user config over defaults', (t) => {
  const defaultCfg = {
    config: {
      fontSize: 12,
      fontFamily: 'Menlo',
      defaultProfile: 'default',
      profiles: [{name: 'default', config: {}}]
    },
    keymaps: {},
    plugins: [],
    localPlugins: []
  };

  const userCfg = {
    config: {
      fontSize: 16,
      defaultProfile: 'default',
      profiles: [{name: 'default', config: {}}]
    },
    keymaps: {},
    plugins: ['hyper-snazzy'],
    localPlugins: []
  };

  const result = _init(userCfg, defaultCfg);
  t.is(result.config.fontSize, 16);
  t.deepEqual(result.plugins, ['hyper-snazzy']);
});

test('_init filters out undefined plugins', (t) => {
  const defaultCfg = {
    config: {
      fontSize: 12,
      defaultProfile: 'default',
      profiles: [{name: 'default', config: {}}]
    },
    keymaps: {},
    plugins: [],
    localPlugins: []
  };

  const userCfg = {
    config: {
      defaultProfile: 'default',
      profiles: [{name: 'default', config: {}}]
    },
    keymaps: {},
    plugins: ['valid-plugin', undefined, 'another-plugin'],
    localPlugins: [undefined]
  };

  const result = _init(userCfg, defaultCfg);
  t.deepEqual(result.plugins, ['valid-plugin', 'another-plugin']);
  t.deepEqual(result.localPlugins, []);
});
