// child_process IPC bridge has been removed for security.
// Plugins should bundle their own child_process usage in the main process via onApp hooks.

const warnRemoved = (name: string) => () => {
  console.error(
    `child_process.${name}() is no longer available from the renderer process. ` +
      'Plugins that need to execute commands should use the onApp hook in the main process.'
  );
};

export const exec = warnRemoved('exec');
export const execSync = warnRemoved('execSync');
export const execFile = warnRemoved('execFile');
export const execFileSync = warnRemoved('execFileSync');
export const spawn = warnRemoved('spawn');
export const spawnSync = warnRemoved('spawnSync');
export const fork = warnRemoved('fork');

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
