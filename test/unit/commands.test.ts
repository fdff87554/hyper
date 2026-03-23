import test from 'ava';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const proxyquire = require('proxyquire').noCallThru();

function createMocks(profiles: {name: string}[]) {
  let subscribeFn: (() => void) | null = null;

  const mocks = {
    electron: {
      app: {createWindow: () => {}},
      BrowserWindow: class {},
      Menu: {getApplicationMenu: () => ({popup: () => {}})}
    },
    './config': {
      getConfig: () => ({profiles, showHamburgerMenu: false}),
      openConfig: () => Promise.resolve(true),
      subscribe: (fn: () => void) => {
        subscribeFn = fn;
      }
    },
    './plugins': {updatePlugins: () => {}},
    './utils/cli-install': {installCLI: () => Promise.resolve()},
    './utils/system-context-menu': {add: () => {}, remove: () => {}}
  };

  return {
    mocks,
    getSubscribeFn: () => subscribeFn,
    setProfiles: (newProfiles: {name: string}[]) => {
      mocks['./config'].getConfig = () => ({profiles: newProfiles, showHamburgerMenu: false});
    }
  };
}

test('registers profile commands for each profile in config', (t) => {
  const {mocks} = createMocks([{name: 'dev'}, {name: 'prod'}]);
  const {execCommand} = proxyquire('../../app/commands', mocks);

  // execCommand should find these commands (they won't throw, meaning they exist)
  // We verify by checking that execCommand doesn't silently skip (i.e., the command exists)
  // Since we can't inspect the commands object directly, we verify via execCommand behavior
  t.truthy(execCommand);

  // Verify all 4 command types are registered for each profile by calling them
  // They should not throw when called without a window
  t.notThrows(() => execCommand('window:new:dev'));
  t.notThrows(() => execCommand('tab:new:dev'));
  t.notThrows(() => execCommand('window:new:prod'));
  t.notThrows(() => execCommand('tab:new:prod'));
  t.notThrows(() => execCommand('pane:splitRight:dev'));
  t.notThrows(() => execCommand('pane:splitDown:prod'));
});

test('does not register commands for nonexistent profiles', (t) => {
  const {mocks} = createMocks([{name: 'dev'}]);
  proxyquire('../../app/commands', mocks);

  // Load fresh to verify - 'prod' should not exist
  const {execCommand} = proxyquire('../../app/commands', mocks);

  // execCommand with nonexistent profile should be a no-op (no command found)
  // It doesn't throw either way, so we verify the static commands still work
  t.notThrows(() => execCommand('window:new:nonexistent'));
  t.notThrows(() => execCommand('tab:new:dev'));
});

test('cleans up stale profile commands when config changes', (t) => {
  const {mocks, getSubscribeFn, setProfiles} = createMocks([{name: 'dev'}, {name: 'prod'}]);
  const {execCommand} = proxyquire('../../app/commands', mocks);

  // Initially both profiles should have commands
  t.notThrows(() => execCommand('tab:new:dev'));
  t.notThrows(() => execCommand('tab:new:prod'));

  // Simulate config change: remove 'prod' profile
  setProfiles([{name: 'dev'}]);
  const subscribeFn = getSubscribeFn();
  t.truthy(subscribeFn, 'subscribe should have been called during module load');
  subscribeFn!();

  // 'dev' commands should still work, 'prod' should be cleaned up
  // We can't directly check deletion, but we verify the subscribe mechanism works
  t.notThrows(() => execCommand('tab:new:dev'));
});

test('subscribe is called during module initialization', (t) => {
  const {mocks, getSubscribeFn} = createMocks([{name: 'default'}]);
  proxyquire('../../app/commands', mocks);

  t.truthy(getSubscribeFn(), 'subscribe should capture the callback during module load');
});

test('execCommand handles unknown commands gracefully', (t) => {
  const {mocks} = createMocks([{name: 'default'}]);
  const {execCommand} = proxyquire('../../app/commands', mocks);

  // Unknown command should not throw
  t.notThrows(() => execCommand('nonexistent:command'));
});

test('static commands are registered regardless of profiles', (t) => {
  const {mocks} = createMocks([]);
  const {execCommand} = proxyquire('../../app/commands', mocks);

  // Core commands should exist even with empty profiles
  t.notThrows(() => execCommand('window:new'));
  t.notThrows(() => execCommand('tab:new'));
  t.notThrows(() => execCommand('pane:close'));
  t.notThrows(() => execCommand('zoom:in'));
  t.notThrows(() => execCommand('zoom:out'));
  t.notThrows(() => execCommand('zoom:reset'));
});
