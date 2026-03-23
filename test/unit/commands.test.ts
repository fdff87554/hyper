import test from 'ava';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const proxyquire = require('proxyquire').noCallThru();

type RpcCall = [string, ...unknown[]];

function createMocks(profiles: {name: string}[]) {
  let subscribeFn: (() => void) | null = null;
  const rpcCalls: RpcCall[] = [];
  let createWindowCalls: unknown[][] = [];

  // BrowserWindow must be a class so `instanceof` check in execCommand passes
  class MockBrowserWindow {
    rpc = {
      emit: (...args: unknown[]) => {
        rpcCalls.push(args as RpcCall);
      }
    };
  }

  const mocks = {
    electron: {
      app: {
        createWindow: (...args: unknown[]) => {
          createWindowCalls.push(args);
        }
      },
      BrowserWindow: MockBrowserWindow,
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
    MockBrowserWindow,
    getSubscribeFn: () => subscribeFn,
    getRpcCalls: () => rpcCalls,
    clearRpcCalls: () => {
      rpcCalls.length = 0;
    },
    getCreateWindowCalls: () => createWindowCalls,
    clearCreateWindowCalls: () => {
      createWindowCalls = [];
    },
    setProfiles: (newProfiles: {name: string}[]) => {
      mocks['./config'].getConfig = () => ({profiles: newProfiles, showHamburgerMenu: false});
    }
  };
}

test('registers profile commands that dispatch correct RPC events', (t) => {
  const ctx = createMocks([{name: 'dev'}, {name: 'prod'}]);
  const {execCommand} = proxyquire('../../app/commands', ctx.mocks);
  const win = new ctx.MockBrowserWindow();

  execCommand('tab:new:dev', win);
  t.is(ctx.getRpcCalls().length, 1);
  t.deepEqual(ctx.getRpcCalls()[0], ['termgroup add req', {profile: 'dev'}]);

  ctx.clearRpcCalls();
  execCommand('pane:splitRight:prod', win);
  t.is(ctx.getRpcCalls().length, 1);
  t.deepEqual(ctx.getRpcCalls()[0], ['split request vertical', {profile: 'prod'}]);

  ctx.clearRpcCalls();
  execCommand('pane:splitDown:dev', win);
  t.is(ctx.getRpcCalls().length, 1);
  t.deepEqual(ctx.getRpcCalls()[0], ['split request horizontal', {profile: 'dev'}]);
});

test('does not dispatch RPC for unregistered profile commands', (t) => {
  const ctx = createMocks([{name: 'dev'}]);
  const {execCommand} = proxyquire('../../app/commands', ctx.mocks);
  const win = new ctx.MockBrowserWindow();

  execCommand('tab:new:nonexistent', win);
  t.is(ctx.getRpcCalls().length, 0, 'no RPC call for unregistered profile');

  execCommand('pane:splitRight:prod', win);
  t.is(ctx.getRpcCalls().length, 0, 'no RPC call for absent profile');
});

test('cleans up stale profile commands after config change', (t) => {
  const ctx = createMocks([{name: 'dev'}, {name: 'prod'}]);
  const {execCommand} = proxyquire('../../app/commands', ctx.mocks);
  const win = new ctx.MockBrowserWindow();

  // Verify 'prod' command works initially
  execCommand('tab:new:prod', win);
  t.is(ctx.getRpcCalls().length, 1, 'prod command works before config change');

  // Simulate config change: remove 'prod'
  ctx.clearRpcCalls();
  ctx.setProfiles([{name: 'dev'}]);
  const subscribeFn = ctx.getSubscribeFn();
  t.truthy(subscribeFn);
  subscribeFn!();

  // 'prod' command should no longer fire
  execCommand('tab:new:prod', win);
  t.is(ctx.getRpcCalls().length, 0, 'prod command removed after config change');

  // 'dev' command should still work
  execCommand('tab:new:dev', win);
  t.is(ctx.getRpcCalls().length, 1, 'dev command still works after config change');
  t.deepEqual(ctx.getRpcCalls()[0], ['termgroup add req', {profile: 'dev'}]);
});

test('subscribe is called during module initialization', (t) => {
  const ctx = createMocks([{name: 'default'}]);
  proxyquire('../../app/commands', ctx.mocks);

  t.truthy(ctx.getSubscribeFn(), 'subscribe callback captured during module load');
});

test('execCommand produces no side effects for unknown commands', (t) => {
  const ctx = createMocks([{name: 'default'}]);
  const {execCommand} = proxyquire('../../app/commands', ctx.mocks);
  const win = new ctx.MockBrowserWindow();

  execCommand('completely:unknown:command', win);
  t.is(ctx.getRpcCalls().length, 0, 'no RPC calls for unknown command');
});

test('registers all four command types per profile', (t) => {
  const ctx = createMocks([{name: 'test'}]);
  const {execCommand} = proxyquire('../../app/commands', ctx.mocks);
  const win = new ctx.MockBrowserWindow();

  // tab:new triggers rpc.emit
  execCommand('tab:new:test', win);
  t.is(ctx.getRpcCalls().length, 1);
  ctx.clearRpcCalls();

  // pane:splitRight triggers rpc.emit
  execCommand('pane:splitRight:test', win);
  t.is(ctx.getRpcCalls().length, 1);
  ctx.clearRpcCalls();

  // pane:splitDown triggers rpc.emit
  execCommand('pane:splitDown:test', win);
  t.is(ctx.getRpcCalls().length, 1);
  ctx.clearRpcCalls();

  // window:new:test uses setTimeout(app.createWindow), doesn't call rpc.emit
  execCommand('window:new:test', win);
  t.is(ctx.getRpcCalls().length, 0, 'window:new uses setTimeout, not rpc.emit');
});
