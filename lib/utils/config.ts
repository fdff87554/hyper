import {ipcRenderer as _ipcRenderer} from 'electron';

import type {configOptions} from '../../typings/config';

Object.defineProperty(window, 'profileName', {
  get() {
    return _ipcRenderer.sendSync('getProfileNameSync') as string;
  },
  set() {
    throw new Error('profileName is readonly');
  }
});

export function getConfig(): configOptions {
  return _ipcRenderer.sendSync('getDecoratedConfigSync', window.profileName) as configOptions;
}

export function subscribe(fn: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
  _ipcRenderer.on('config change', fn);
  _ipcRenderer.on('plugins change', fn);
  return () => {
    _ipcRenderer.removeListener('config change', fn);
  };
}
