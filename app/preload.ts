import {contextBridge, ipcRenderer} from 'electron';

import type {IpcRendererWithCommands} from '../typings/common';

const typedIpcRenderer = ipcRenderer as IpcRendererWithCommands;

const hyperAPI = {
  getLoadedPluginVersions: () => typedIpcRenderer.invoke('getLoadedPluginVersions'),
  getPaths: () => typedIpcRenderer.invoke('getPaths'),
  getBasePaths: () => typedIpcRenderer.invoke('getBasePaths'),
  getDeprecatedConfig: () => typedIpcRenderer.invoke('getDeprecatedConfig'),
  getDecoratedConfig: (profile: string) => typedIpcRenderer.invoke('getDecoratedConfig', profile),
  getDecoratedKeymaps: () => typedIpcRenderer.invoke('getDecoratedKeymaps'),
  getProfileName: () => typedIpcRenderer.invoke('getProfileName')
};

// When contextIsolation is enabled, expose via contextBridge.
// When disabled (current transitional state), attach directly to window.
try {
  contextBridge.exposeInMainWorld('hyper', hyperAPI);
} catch {
  (window as any).hyper = hyperAPI;
}
