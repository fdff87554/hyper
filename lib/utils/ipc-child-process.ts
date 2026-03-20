// child_process IPC bridge has been removed for security.
// Plugins should bundle their own child_process usage in the main process via onApp hooks.

const removedMessage = (name: string) =>
  `child_process.${name}() is no longer available from the renderer process. ` +
  'Plugins that need to execute commands should use the onApp hook in the main process.';

// Async stubs: find the last function argument and call it with an Error so callers fail fast
// instead of silently hanging.
const asyncStub = (name: string) =>
  ((...args: unknown[]) => {
    const msg = removedMessage(name);
    console.error(msg);
    const lastArg = args[args.length - 1];
    if (typeof lastArg === 'function') {
      lastArg(new Error(msg));
    }
  }) as (...args: unknown[]) => void;

// Sync stubs: throw immediately, matching Node.js sync behaviour.
const syncStub = (name: string) =>
  ((): never => {
    throw new Error(removedMessage(name));
  }) as () => never;

// spawn returns a ChildProcess object (no callback), so we log and return undefined.
// The caller will crash on the next property access (e.g. `.stdout.on(...)`) — fail-fast.
const spawnStub = () => {
  console.error(removedMessage('spawn'));
  return undefined;
};

export const exec = asyncStub('exec');
export const execFile = asyncStub('execFile');
export const fork = asyncStub('fork');
export const spawn = spawnStub;
export const execSync = syncStub('execSync');
export const execFileSync = syncStub('execFileSync');
export const spawnSync = syncStub('spawnSync');

const IPCChildProcess = {
  exec,
  execSync,
  execFile,
  execFileSync,
  spawn,
  spawnSync,
  fork
};

export default IPCChildProcess;
